import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import storage, { KEYS } from '../utils/storage';
import Breadcrumbs from '../Components/Breadcrumbs';

export default function MapEditor() {
    const { floorId } = useParams();
    const navigate = useNavigate();
    
    // Data State
    const [floor, setFloor] = useState(null);
    const [building, setBuilding] = useState(null);

    // Editor State
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [scaleRatio, setScaleRatio] = useState(null); // Pixels to Meters ratio (Meters per Pixel)

    // UI Tools State
    const [activeTool, setActiveTool] = useState('select'); // 'select', 'node', 'edge'
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [hoveredNodeId, setHoveredNodeId] = useState(null);
    const [scaleMode, setScaleMode] = useState(false);
    
    // Calibration State
    const [calibrationEdge, setCalibrationEdge] = useState(null);
    const [realDistance, setRealDistance] = useState('');

    // Canvas/Image State
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const canvasRef = useRef(null);

    // Node Creation Modal State
    const [showNodeCreationModal, setShowNodeCreationModal] = useState(false);
    const [newNodeName, setNewNodeName] = useState('');
    const [tempNodePosition, setTempNodePosition] = useState(null);

    useEffect(() => {
        // Load Floor and Building
        const floors = storage.load(KEYS.FLOORS, []);
        const buildings = storage.load(KEYS.BUILDINGS, []);
        
        const currentFloor = floors.find(f => f.id === floorId);
        if (!currentFloor) {
             navigate('/buildings');
             return;
        }
        setFloor(currentFloor);
        if (currentFloor.scaleRatio) {
            setScaleRatio(currentFloor.scaleRatio);
        }
        
        const currentBuilding = buildings.find(b => b.id === currentFloor.buildingId);
        setBuilding(currentBuilding);

        // Load Nodes and Edges
        const allNodes = storage.load(KEYS.NODES, []);
        const allEdges = storage.load(KEYS.EDGES, []);

        const floorNodes = allNodes.filter(n => n.floorId === floorId);
        setNodes(floorNodes);

        // Filter edges that belong to this floor's nodes
        // We assume distinct ID spaces or just filter by presence of source/target in our node list
        const floorNodeIds = new Set(floorNodes.map(n => n.id));
        const floorEdges = allEdges.filter(e => floorNodeIds.has(e.source) && floorNodeIds.has(e.target));
        setEdges(floorEdges);

    }, [floorId, navigate]);

    // Helpers to save data back to global storage
    const saveNodes = (updatedNodes) => {
        setNodes(updatedNodes);
        const allNodes = storage.load(KEYS.NODES, []);
        // Remove current floor nodes from global list
        const otherNodes = allNodes.filter(n => n.floorId !== floorId);
        // Add updated current floor nodes
        storage.save(KEYS.NODES, [...otherNodes, ...updatedNodes]);
    };

    const saveEdges = (updatedEdges) => {
        setEdges(updatedEdges);
        const allEdges = storage.load(KEYS.EDGES, []);
        const currentFloorNodeIds = new Set(nodes.map(n => n.id));
        
        // Keep edges that DO NOT connect any node on this floor (conservative)
        // or just keep edges that are not in our current "active" set if we tracked IDs properly.
        // Since we filtered `floorEdges` based on nodes, let's reverse that.
        // We remove any edge where both source and target are in `currentFloorNodeIds`.
        
        const keptEdges = allEdges.filter(e => !(currentFloorNodeIds.has(e.source) && currentFloorNodeIds.has(e.target)));
        storage.save(KEYS.EDGES, [...keptEdges, ...updatedEdges]);
    };

    const updateFloorData = (updates) => {
        const floors = storage.load(KEYS.FLOORS, []);
        const updatedFloors = floors.map(f => f.id === floorId ? { ...f, ...updates } : f);
        storage.save(KEYS.FLOORS, updatedFloors);
        setFloor(prev => ({ ...prev, ...updates }));
    };

    const handleImageLoad = (e) => {
        setImageDimensions({
            width: e.target.naturalWidth,
            height: e.target.naturalHeight
        });
    };

    const handleCanvasClick = (e) => {
        if (activeTool !== 'node') return;

        // Use nativeEvent to get coordinates relative to the target element (the container/image)
        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;

        setTempNodePosition({ x, y });
        setNewNodeName('');
        setShowNodeCreationModal(true);
    };

    const confirmCreateNode = () => {
        if (!newNodeName.trim()) return;

        const newNode = {
            id: Date.now().toString(),
            floorId,
            label: newNodeName,
            x: tempNodePosition.x,
            y: tempNodePosition.y,
            magneticData: null 
        };

        saveNodes([...nodes, newNode]);
        setShowNodeCreationModal(false);
        setTempNodePosition(null);
        setActiveTool('select');
    };

    const calculateDistance = (id1, id2) => {
        const n1 = nodes.find(n => n.id === id1);
        const n2 = nodes.find(n => n.id === id2);
        if (!n1 || !n2) return 0;
        return Math.sqrt(Math.pow(n2.x - n1.x, 2) + Math.pow(n2.y - n1.y, 2));
    };

    const handleNodeClick = (e, nodeId) => {
        e.stopPropagation();
        if (activeTool === 'select') {
            setSelectedNodeId(nodeId);
        } else if (activeTool === 'edge') {
            if (selectedNodeId && selectedNodeId !== nodeId) {
                // Create Edge
                // Check if exists
                const existing = edges.find(ed => 
                    (ed.source === selectedNodeId && ed.target === nodeId) ||
                    (ed.source === nodeId && ed.target === selectedNodeId)
                );
                if (existing) {
                    alert('Edge already exists');
                    setSelectedNodeId(null);
                    return;
                }

                const newEdge = {
                    id: Date.now().toString(),
                    source: selectedNodeId,
                    target: nodeId,
                    distance: calculateDistance(selectedNodeId, nodeId)
                };
                saveEdges([...edges, newEdge]);
                setSelectedNodeId(null);
            } else {
                setSelectedNodeId(nodeId);
            }
        }
    };

    const handleEdgeClick = (e, edge) => {
        e.stopPropagation();
        if (scaleMode) {
            setCalibrationEdge(edge);
            setRealDistance('');
        } else if (activeTool === 'select') {
             // Future: Implement edge deletion
        }
    };

    const handleCalibrate = () => {
        if (!calibrationEdge || !realDistance) return;
        const distPx = calibrationEdge.distance;
        const distM = parseFloat(realDistance);
        if (distM <= 0) return;
        
        const ratio = distM / distPx; // Meters per Pixel
        setScaleRatio(ratio);
        updateFloorData({ scaleRatio: ratio });
        setScaleMode(false);
        setCalibrationEdge(null);
    };

    const breadcrumbItems = [
        { label: 'Buildings', path: '/buildings' },
        { label: building?.name || '...', path: building ? `/buildings/${building.id}/floors` : null },
        { label: floor?.name || 'Map Editor', path: null },
    ];

    if (!floor) return <div className="p-8 text-center text-gray-500">Loading Map Editor...</div>;
    // Note: We show editor even if mapImage is missing, but advise user
    if (!floor.mapImage) {
         return (
             <div className="p-8 space-y-4">
                 <Breadcrumbs items={breadcrumbItems} />
                 <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-500 mb-4">No map image found for this floor.</p>
                    <button onClick={() => navigate(`/buildings/${floor.buildingId}/floors`)} className="text-[var(--color-primary)] font-bold hover:underline">
                        Go back to Upload Map
                    </button>
                 </div>
             </div>
         );
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 h-[calc(100vh-8rem)] flex flex-col relative overflow-hidden">
             <div className="mb-2">
                 <Breadcrumbs items={breadcrumbItems} />
            </div>
            
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100 flex-shrink-0">
                <div>
                     <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold text-gray-900">{floor.name} Editor</h2>
                     </div>
                    <p className="text-xs text-gray-500">
                        {scaleRatio 
                            ? `Scale: 1px = ${scaleRatio.toFixed(4)}m` 
                            : 'Map not calibrated.'}
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button 
                            onClick={() => { setActiveTool('node'); setSelectedNodeId(null); }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTool === 'node' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            + Nodes
                        </button>
                        <button 
                            onClick={() => { setActiveTool('edge'); setSelectedNodeId(null); }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTool === 'edge' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Connect
                        </button>
                        <button 
                            onClick={() => { setActiveTool('select'); setSelectedNodeId(null); }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTool === 'select' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Select
                        </button>
                    </div>

                    <button 
                        onClick={() => { setScaleMode(!scaleMode); setActiveTool('select'); }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all border ${
                            scaleMode 
                                ? 'bg-orange-100 text-orange-700 border-orange-200' 
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        {scaleMode ? 'Calibrating...' : 'Calibrate'}
                    </button>
                </div>
            </div>

            {/* Canvas Container - Scrollable */}
            <div className="flex-1 overflow-auto bg-gray-50 rounded-xl border border-dashed border-gray-300 relative select-none">
                <div className="relative inline-block min-w-full min-h-full">
                     <div 
                        ref={canvasRef}
                        className={`relative inline-block ${activeTool === 'node' ? 'cursor-crosshair' : 'cursor-default'}`}
                        onClick={handleCanvasClick}
                     >
                        {/* Map Image */}
                        <img 
                            src={floor.mapImage} 
                            alt="Map Blueprint" 
                            className="block max-w-none pointer-events-none select-none"
                            onLoad={handleImageLoad}
                            draggable={false}
                        />

                        {/* SVG Layer */}
                         <svg 
                            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                            style={{ width: imageDimensions.width, height: imageDimensions.height }}
                         >
                            {/* Edges */}
                            {edges.map(edge => {
                                const source = nodes.find(n => n.id === edge.source);
                                const target = nodes.find(n => n.id === edge.target);
                                if (!source || !target) return null;
                                
                                const isCalibrated = calibrationEdge && calibrationEdge.id === edge.id;
                                const realLength = scaleRatio ? (edge.distance * scaleRatio).toFixed(2) : null;

                                return (
                                    <React.Fragment key={edge.id}>
                                        <line
                                            x1={source.x}
                                            y1={source.y}
                                            x2={target.x}
                                            y2={target.y}
                                            stroke={isCalibrated ? '#f97316' : '#3b82f6'} 
                                            strokeWidth={isCalibrated ? 4 : 2}
                                            className="pointer-events-auto cursor-pointer hover:stroke-blue-400 transition-colors"
                                            onClick={(e) => handleEdgeClick(e, edge)}
                                        />
                                        {realLength && (
                                            <g pointerEvents="none">
                                                <rect 
                                                    x={(source.x + target.x) / 2 - 20} 
                                                    y={(source.y + target.y) / 2 - 10} 
                                                    width="40" 
                                                    height="20" 
                                                    rx="4" 
                                                    fill="rgba(255, 255, 255, 0.9)" 
                                                    stroke="#e5e7eb"
                                                />
                                                <text
                                                    x={(source.x + target.x) / 2}
                                                    y={(source.y + target.y) / 2}
                                                    dy="0.3em"
                                                    textAnchor="middle"
                                                    fontSize="10"
                                                    fontWeight="bold"
                                                    fill="#1f2937"
                                                >
                                                    {realLength}m
                                                </text>
                                            </g>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                            
                            {/* Nodes */}
                            {nodes.map(node => (
                                <g key={node.id}>
                                    <circle 
                                        cx={node.x}
                                        cy={node.y}
                                        r={selectedNodeId === node.id ? 8 : 6}
                                        fill={selectedNodeId === node.id ? '#f97316' : '#ef4444'} 
                                        stroke="white"
                                        strokeWidth={2}
                                        className="pointer-events-auto cursor-pointer hover:fill-orange-500 transition-colors"
                                        onClick={(e) => handleNodeClick(e, node.id)}
                                        onMouseEnter={() => setHoveredNodeId(node.id)}
                                        onMouseLeave={() => setHoveredNodeId(null)}
                                    />
                                    {/* Hover Label */}
                                    {hoveredNodeId === node.id && (
                                        <g pointerEvents="none" style={{ zIndex: 50 }}>
                                            <rect 
                                                x={node.x - ((node.label.length * 7) / 2) - 8}
                                                y={node.y - 30}
                                                width={(node.label.length * 7) + 16}
                                                height="22"
                                                rx="4"
                                                fill="rgba(0,0,0,0.8)"
                                            />
                                            <text
                                                x={node.x}
                                                y={node.y - 19}
                                                textAnchor="middle"
                                                dy="0.3em"
                                                fill="white"
                                                fontSize="11"
                                                fontWeight="bold"
                                            >
                                                {node.label}
                                            </text>
                                        </g>
                                    )}
                                </g>
                            ))}
                         </svg>
                     </div>
                </div>
            </div>

            {/* Calibration Modal */}
            {scaleMode && (
                <div className="absolute top-24 right-8 z-20 w-72 bg-white/95 backdrop-blur shadow-2xl rounded-2xl p-5 border border-orange-100 ring-1 ring-black/5">
                     <h3 className="font-bold text-orange-700 mb-2">Calibrate Scale</h3>
                     <p className="text-xs text-gray-500 mb-3">Select a path line and enter real distance.</p>
                     
                     <div className="mb-3 p-2 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-xs text-center">
                        {calibrationEdge ? `Selected: ${calibrationEdge.distance.toFixed(0)}px` : 'Select a path...'}
                     </div>

                     <input 
                        type="number" 
                        value={realDistance}
                        onChange={(e) => setRealDistance(e.target.value)}
                        placeholder="Meters (e.g. 5)"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm mb-3"
                    />
                    <button 
                        onClick={handleCalibrate}
                        disabled={!calibrationEdge || !realDistance}
                        className="w-full py-2 bg-[var(--color-primary)] text-white text-sm font-bold rounded-lg disabled:opacity-50"
                    >
                        Apply
                    </button>
                </div>
            )}

            {/* Node Creation Modal */}
            {showNodeCreationModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
                         <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Name Node</h3>
                         <input 
                            type="text" 
                            autoFocus
                            value={newNodeName}
                            onChange={(e) => setNewNodeName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && confirmCreateNode()}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center font-bold mb-4"
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setShowNodeCreationModal(false)} className="flex-1 py-2 bg-gray-100 rounded-lg font-bold text-gray-600">Cancel</button>
                            <button onClick={confirmCreateNode} className="flex-1 py-2 bg-[var(--color-primary)] text-white rounded-lg font-bold">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
