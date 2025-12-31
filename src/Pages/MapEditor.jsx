import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buildingService, floorService, nodeService, edgeService } from '../api/services';
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
        if (floorId) loadData();
    }, [floorId]);

    const loadData = async () => {
        try {
            // Load floor
            const floorData = await floorService.getById(floorId);
            setFloor(floorData);
            if (floorData.scale) {
                setScaleRatio(floorData.scale);
            }
            
            // Load building
            if (floorData.building_id) {
                const buildingData = await buildingService.getById(floorData.building_id);
                setBuilding(buildingData);
            }

            // Load Nodes and Edges for this floor
            if (floorData.building_id) {
                const nodesData = await buildingService.getNodes(floorData.building_id);
                const nodesList = Array.isArray(nodesData) ? nodesData : (nodesData.nodes || []);
                const floorNodes = nodesList.filter(n => n.floor_id == floorId);
                
                // Map API fields to UI fields
                setNodes(floorNodes.map(n => ({
                    ...n,
                    id: n.node_id,
                    x: n.x_coordinate,
                    y: n.y_coordinate,
                    label: n.name
                })));
                
                // Load Edges
                const edgesData = await buildingService.getEdges(floorData.building_id);
                const edgesList = Array.isArray(edgesData) ? edgesData : (edgesData.edges || []);
                const floorEdges = edgesList.filter(e => e.floor_id == floorId);
                setEdges(floorEdges.map(e => ({
                     ...e,
                     id: e.edge_id,
                     source: e.start_node_id,
                     target: e.end_node_id
                })));
            }
        } catch (err) {
            console.error("Failed to load map data:", err);
        }
    };

    const handleImageLoad = (e) => {
        setImageDimensions({
            width: e.target.naturalWidth,
            height: e.target.naturalHeight
        });
    };

    const handleCanvasClick = (e) => {
        if (activeTool !== 'node') return;

        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;

        setTempNodePosition({ x, y });
        setNewNodeName('');
        setShowNodeCreationModal(true);
    };

    const confirmCreateNode = async () => {
        if (!newNodeName.trim()) return;

        try {
            const newNodeData = {
                floor_id: parseInt(floorId, 10),
                name: newNodeName.trim(),
                x_coordinate: tempNodePosition.x,
                y_coordinate: tempNodePosition.y,
                node_type: 'room'
            };

            const createdNode = await nodeService.create(newNodeData);
            console.log("Created node response:", createdNode);
            
            // Map the response to UI format
            const mappedNode = {
                ...createdNode,
                id: createdNode.node_id || createdNode.id || `temp-${Date.now()}`,
                x: createdNode.x_coordinate ?? tempNodePosition.x,
                y: createdNode.y_coordinate ?? tempNodePosition.y,
                label: createdNode.name || newNodeName.trim(),
                floor_id: createdNode.floor_id
            };

            console.log("Adding mapped node to state:", mappedNode);

            // Update state using functional update to ensure we get latest state
            setNodes(prevNodes => [...prevNodes, mappedNode]);
            
            // Clear modal
            setShowNodeCreationModal(false);
            setTempNodePosition(null);
            setNewNodeName('');
            setActiveTool('select');

        } catch (err) {
            console.error("Failed to create node:", err);
            alert("Failed to create node. Error: " + (err.response?.data?.message || err.message));
        }
    };

    const calculateDistance = (id1, id2) => {
        const n1 = nodes.find(n => n.id === id1);
        const n2 = nodes.find(n => n.id === id2);
        if (!n1 || !n2) return 0;
        return Math.sqrt(Math.pow(n2.x - n1.x, 2) + Math.pow(n2.y - n1.y, 2));
    };

    const handleNodeClick = async (e, nodeId) => {
        e.stopPropagation();
        if (activeTool === 'select') {
            setSelectedNodeId(nodeId);
        } else if (activeTool === 'edge') {
            if (selectedNodeId && selectedNodeId !== nodeId) {
                // Create Edge
                const existing = edges.find(ed => 
                    (ed.source === selectedNodeId && ed.target === nodeId) ||
                    (ed.source === nodeId && ed.target === selectedNodeId)
                );
                if (existing) {
                    alert('Edge already exists');
                    setSelectedNodeId(null);
                    return;
                }
                
                const dist = calculateDistance(selectedNodeId, nodeId);

                try {
                     const newEdgeData = {
                        start_node_id: selectedNodeId,
                        end_node_id: nodeId,
                        distance: dist,
                        floor_id: parseInt(floorId, 10)
                    };
                    
                    console.log("Creating edge:", newEdgeData);
                    const createdEdge = await edgeService.create(newEdgeData);
                    console.log("Created edge response:", createdEdge);
                    
                    const mappedEdge = {
                        ...createdEdge,
                        id: createdEdge.edge_id || createdEdge.id || `temp-${Date.now()}`,
                        source: createdEdge.start_node_id || selectedNodeId,
                        target: createdEdge.end_node_id || nodeId,
                        distance: createdEdge.distance || dist
                    };
                    
                    console.log("Adding mapped edge to state:", mappedEdge);
                    setEdges(prevEdges => {
                        const newEdges = [...prevEdges, mappedEdge];
                        console.log("Updated edges array:", newEdges);
                        return newEdges;
                    });
                    setSelectedNodeId(null);

                } catch (err) {
                     console.error("Failed to create edge:", err);
                     alert("Failed to connect nodes. Error: " + (err.response?.data?.message || err.message));
                }
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
             if (window.confirm('Delete this edge?')) {
                 edgeService.delete(edge.id).then(() => {
                     setEdges(edges.filter(ed => ed.id !== edge.id));
                 }).catch(err => {
                     console.error("Failed to delete edge", err);
                 });
             }
        }
    };

    const handleCalibrate = async () => {
        if (!calibrationEdge || !realDistance) return;
        const distPx = calibrationEdge.distance;
        const distM = parseFloat(realDistance);
        if (distM <= 0) return;
        
        const ratio = distM / distPx;
        
        try {
            await floorService.update(floorId, { 
                scale: ratio,
                building_id: floor.building_id,
                floor_number: floor.floor_number
            });

            setScaleRatio(ratio);
            setFloor(prev => ({ ...prev, scale: ratio }));
            setScaleMode(false);
            setCalibrationEdge(null);
            
        } catch (err) {
            console.error("Failed to update calibration:", err);
            alert("Failed to save scale.");
        }
    };

    const breadcrumbItems = [
        { label: 'Buildings', path: '/buildings' },
        { label: building?.name || '...', path: building ? `/buildings/${building.building_id}/floors` : null },
        { label: floor?.name || `Floor ${floor?.floor_number || ''}`, path: null },
    ];

    if (!floor) return <div className="p-8 text-center text-gray-500">Loading Map Editor...</div>;
    
    if (!floor.map_img_url) {
         return (
             <div className="p-8 space-y-4">
                 <Breadcrumbs items={breadcrumbItems} />
                 <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-500 mb-4">No map image found for this floor.</p>
                    <button onClick={() => navigate(`/buildings/${floor.building_id}/floors`)} className="text-[var(--color-primary)] font-bold hover:underline">
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
                        <h2 className="text-xl font-bold text-gray-900">Floor {floor.floor_number} Editor</h2>
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

            {/* Canvas Container */}
            <div className="flex-1 overflow-auto bg-gray-50 rounded-xl border border-dashed border-gray-300 relative select-none">
                <div className="relative inline-block min-w-full min-h-full">
                     <div 
                        ref={canvasRef}
                        className={`relative inline-block ${activeTool === 'node' ? 'cursor-crosshair' : 'cursor-default'}`}
                        onClick={handleCanvasClick}
                     >
                        <img 
                            src={floor.map_img_url} 
                            alt="Map Blueprint" 
                            className="block max-w-none pointer-events-none select-none"
                            onLoad={handleImageLoad}
                            draggable={false}
                        />

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
                                    {hoveredNodeId === node.id && (
                                        <g pointerEvents="none" style={{ zIndex: 50 }}>
                                            <rect 
                                                x={node.x - ((node.label?.length || 4) * 7) / 2 - 8}
                                                y={node.y - 30}
                                                width={(node.label?.length || 4) * 7 + 16}
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
                                                {node.label || 'Node'}
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
                            placeholder="Enter node name..."
                        />
                        <div className="flex gap-3">
                            <button onClick={() => { setShowNodeCreationModal(false); setTempNodePosition(null); setNewNodeName(''); }} className="flex-1 py-2 bg-gray-100 rounded-lg font-bold text-gray-600">Cancel</button>
                            <button onClick={confirmCreateNode} disabled={!newNodeName.trim()} className="flex-1 py-2 bg-[var(--color-primary)] text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
