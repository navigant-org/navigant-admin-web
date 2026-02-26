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
    const [loading, setLoading] = useState(true);

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
    const [newNodeType, setNewNodeType] = useState('room'); // Default to room, but user can change
    const [tempNodePosition, setTempNodePosition] = useState(null);

    useEffect(() => {
        if (floorId) loadData();
    }, [floorId]);

    const loadData = async () => {
        try {
            setLoading(true);
            
            // Use the new graph endpoint - gets floor, nodes, edges, and scale in one call!
            const graphData = await floorService.getGraph(floorId);
            console.log("Graph data received:", graphData);
            
            // The response doesn't include full floor details, so we still need to fetch floor and building
            const floorData = await floorService.getById(floorId);
            setFloor(floorData);
            
            // Load building for breadcrumbs
            if (floorData.building_id) {
                const buildingData = await buildingService.getById(floorData.building_id);
                setBuilding(buildingData);
            }

            // Set scale from graph response
            if (graphData.scale) {
                setScaleRatio(graphData.scale);
            }
            
            // Map nodes from graph response
            const nodesList = graphData.nodes || [];
            setNodes(nodesList.map(n => ({
                ...n,
                id: n.node_id,
                x: n.x_coordinate,
                y: n.y_coordinate,
                label: n.name
            })));
            
            // Map edges from graph response
            const edgesList = graphData.edges || [];
            setEdges(edgesList.map(e => ({
                ...e,
                id: e.edge_id,
                source: e.start_node_id,
                target: e.end_node_id
            })));
            
        } catch (err) {
            console.error("Failed to load map data:", err);
        } finally {
            setLoading(false);
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
        setNewNodeType('room'); // Reset to default when opening
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
                node_type: newNodeType
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
            setNewNodeType('room');
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

    // Loading State
    if (loading || !floor) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 h-[calc(100vh-8rem)] flex flex-col">
                <div className="animate-pulse space-y-4">
                    {/* Breadcrumb skeleton */}
                    <div className="h-8 bg-gray-200 rounded w-64"></div>
                    
                    {/* Toolbar skeleton */}
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                        <div>
                            <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                            <div className="h-4 bg-gray-100 rounded w-32"></div>
                        </div>
                        <div className="flex gap-4">
                            <div className="h-9 bg-gray-200 rounded-xl w-48"></div>
                            <div className="h-9 bg-gray-200 rounded-xl w-24"></div>
                        </div>
                    </div>
                    
                    {/* Canvas skeleton */}
                    <div className="flex-1 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
                        <div className="text-center">
                            <div className="inline-block">
                                <svg className="animate-spin h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                            <p className="mt-4 text-gray-500 font-medium">Loading Map Editor...</p>
                            <p className="text-sm text-gray-400 mt-1">Fetching floor data, nodes, and edges</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
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
                                                x={node.x - Math.max((node.label?.length || 4) * 7, 60) / 2 - 8}
                                                y={node.y - 42}
                                                width={Math.max((node.label?.length || 4) * 7, 60) + 16}
                                                height="34"
                                                rx="6"
                                                fill="rgba(0,0,0,0.85)"
                                            />
                                            <text
                                                x={node.x}
                                                y={node.y - 30}
                                                textAnchor="middle"
                                                fill="white"
                                                fontSize="11"
                                                fontWeight="bold"
                                            >
                                                {node.label || 'Node'}
                                            </text>
                                            <text
                                                x={node.x}
                                                y={node.y - 18}
                                                textAnchor="middle"
                                                fill="rgba(255,255,255,0.7)"
                                                fontSize="9"
                                                fontWeight="bold"
                                                className="uppercase"
                                            >
                                                {node.node_type || 'room'}
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
                         <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 px-1">Node Name</label>
                                <input 
                                    type="text" 
                                    autoFocus
                                    value={newNodeName}
                                    onChange={(e) => setNewNodeName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && confirmCreateNode()}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                                    placeholder="e.g. Room 101, Lobby..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 px-1">Node Type</label>
                                <select 
                                    value={newNodeType}
                                    onChange={(e) => setNewNodeType(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="room">Room</option>
                                    <option value="stairs">Stairs</option>
                                    <option value="corridor">Corridor</option>
                                    <option value="junction">Junction</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => { setShowNodeCreationModal(false); setTempNodePosition(null); setNewNodeName(''); setNewNodeType('room'); }} className="flex-1 py-2.5 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
                            <button onClick={confirmCreateNode} disabled={!newNodeName.trim()} className="flex-1 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
