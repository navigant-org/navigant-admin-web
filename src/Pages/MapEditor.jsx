import React, { useState, useEffect, useRef } from 'react';
import storage, { KEYS } from '../utils/storage';

export default function MapEditor() {
    // Data State - Initialize from Storage
    const [nodes, setNodes] = useState(() => storage.load(KEYS.NODES, []));
    const [edges, setEdges] = useState(() => storage.load(KEYS.EDGES, []));
    
    // UI State
    const [activeTool, setActiveTool] = useState('node'); // 'node', 'edge', 'select'
    const [mapImage, setMapImage] = useState(() => storage.load(KEYS.MAP_IMAGE, null));
    const canvasRef = useRef(null);

    // Interaction State
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [hoveredNodeId, setHoveredNodeId] = useState(null);
    
    // Node Creation Modal State
    const [showNodeCreationModal, setShowNodeCreationModal] = useState(false);
    const [tempNodePosition, setTempNodePosition] = useState(null);
    const [newNodeName, setNewNodeName] = useState('');

    // Calibration State
    const [scaleMode, setScaleMode] = useState(false);
    const [realDistance, setRealDistance] = useState('');
    const [scaleRatio, setScaleRatio] = useState(() => storage.load(KEYS.SCALE_RATIO, null)); // meters per pixel
    const [calibrationEdge, setCalibrationEdge] = useState(null); // The edge used for calibration

    // Persistence Effect
    useEffect(() => {
        storage.save(KEYS.NODES, nodes);
    }, [nodes]);

    useEffect(() => {
        storage.save(KEYS.EDGES, edges);
    }, [edges]);

    useEffect(() => {
        storage.save(KEYS.SCALE_RATIO, scaleRatio);
    }, [scaleRatio]);


    // --- Interaction Handlers ---

    const handleCanvasClick = (e) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (activeTool === 'node') {
            setTempNodePosition({ x, y });
            setNewNodeName(`N${nodes.length + 1}`);
            setShowNodeCreationModal(true);
        }
    };

    const confirmCreateNode = () => {
        if (tempNodePosition && newNodeName.trim()) {
            const newNode = {
                id: Date.now(),
                x: tempNodePosition.x,
                y: tempNodePosition.y,
                label: newNodeName.trim()
            };
            setNodes([...nodes, newNode]);
            setShowNodeCreationModal(false);
            setTempNodePosition(null);
            setNewNodeName('');
        }
    };

    const handleNodeClick = (e, nodeId) => {
        e.stopPropagation(); // Prevent canvas click

        if (activeTool === 'edge') {
            if (selectedNodeId === null) {
                // Start creating edge
                setSelectedNodeId(nodeId);
            } else if (selectedNodeId === nodeId) {
                // Deselect if same
                setSelectedNodeId(null);
            } else {
                // Finish creating edge
                const newEdge = {
                    id: Date.now(),
                    source: selectedNodeId,
                    target: nodeId,
                    distance: calculateDistance(selectedNodeId, nodeId)
                };
                
                // Prevent duplicate edges
                const exists = edges.some(edge => 
                    (edge.source === newEdge.source && edge.target === newEdge.target) ||
                    (edge.source === newEdge.target && edge.target === newEdge.source)
                );

                if (!exists) {
                    setEdges([...edges, newEdge]);
                }
                setSelectedNodeId(null);
            }
        } else if (activeTool === 'select' || scaleMode) {
             setSelectedNodeId(nodeId);
        }
    };
    
    const handleEdgeClick = (e, edge) => {
        e.stopPropagation();
        if (scaleMode) {
            setCalibrationEdge(edge);
        }
    }

    const calculateDistance = (sourceId, targetId) => {
        const source = nodes.find(n => n.id === sourceId);
        const target = nodes.find(n => n.id === targetId);
        if (!source || !target) return 0;
        return Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2));
    };

    const handleCalibrate = () => {
        if (!calibrationEdge || !realDistance || isNaN(realDistance)) return;
        
        const pixelDist = calibrationEdge.distance;
        if (pixelDist === 0) return;

        const ratio = parseFloat(realDistance) / pixelDist;
        setScaleRatio(ratio);
        alert(`Calibration Complete! 1 pixel = ${ratio.toFixed(4)} meters`);
        setScaleMode(false);
        setCalibrationEdge(null);
    };


    if (!mapImage) {
         return (
             <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                 <p className="text-gray-500 mb-4">No map selected.</p>
                 <a href="/upload-map" className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium">Upload One</a>
             </div>
         )
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-full min-h-[600px] flex flex-col relative overflow-hidden">
            
            {/* Toolbar Header */}
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Map Editor</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {scaleRatio 
                            ? `Current Scale: 1px = ${scaleRatio.toFixed(4)}m` 
                            : 'Map not calibrated. Please set a reference distance.'}
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Tool Selector */}
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button 
                            onClick={() => { setActiveTool('node'); setSelectedNodeId(null); }}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTool === 'node' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            + Add Nodes
                        </button>
                        <button 
                            onClick={() => { setActiveTool('edge'); setSelectedNodeId(null); }}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTool === 'edge' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Connect Path
                        </button>
                        <button 
                            onClick={() => { setActiveTool('select'); setSelectedNodeId(null); }}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTool === 'select' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Select
                        </button>
                    </div>

                    <div className="h-8 w-[1px] bg-gray-200"></div>

                    <button 
                        onClick={() => { setScaleMode(!scaleMode); setActiveTool('select'); }}
                        className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
                            scaleMode 
                                ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-200' 
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {scaleMode ? 'Calibrating...' : 'Calibrate Scale'}
                    </button>
                    
                    <button className="px-5 py-2.5 text-sm font-bold text-white bg-[var(--color-primary)] rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                        Save Map
                    </button>
                </div>
            </div>

            {/* Node Creation Modal */}
            {showNodeCreationModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in scale-95 duration-200">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-500">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Name New Node</h3>
                            <p className="text-sm text-gray-500">Enter a label for this location</p>
                        </div>
                        
                        <div className="space-y-3">
                            <input 
                                type="text" 
                                autoFocus
                                value={newNodeName}
                                onChange={(e) => setNewNodeName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && confirmCreateNode()}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all font-medium text-center"
                                placeholder="Node Label"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => { setShowNodeCreationModal(false); setTempNodePosition(null); }}
                                    className="px-4 py-2 bg-gray-100/50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmCreateNode}
                                    className="px-4 py-2 bg-[var(--color-primary)] text-white font-bold rounded-xl shadow-lg shadow-blue-900/10 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm"
                                >
                                    Create Node
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Calibration Overlay */}
            {scaleMode && (
                <div className="absolute top-28 right-8 z-20 w-80 bg-white/90 backdrop-blur-md border border-orange-100 shadow-2xl rounded-2xl p-6 ring-1 ring-black/5 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3 mb-4 text-orange-600">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-lg">Calibrate Scale</h3>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        1. Select an edge on the map (Click a line).<br/>
                        2. Enter its real-world distance below.
                    </p>

                    <div className="mb-4">
                        <div 
                            className={`w-full py-2 px-3 border-2 border-dashed rounded-xl text-sm font-medium transition-colors text-center ${
                                calibrationEdge 
                                    ? 'border-green-300 bg-green-50 text-green-700' 
                                    : 'border-gray-200 text-gray-400'
                            }`}
                        >
                            {calibrationEdge ? `Selected Edge: ${calibrationEdge.distance.toFixed(0)}px` : 'Please select a connected path'}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Real Life Distance (Meters)</label>
                            <input 
                                type="number" 
                                value={realDistance}
                                onChange={(e) => setRealDistance(e.target.value)}
                                placeholder="e.g. 5.0"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all font-mono font-medium"
                            />
                        </div>
                        <button 
                            onClick={handleCalibrate}
                            disabled={!calibrationEdge || !realDistance}
                            className="w-full py-3 bg-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-all hover:brightness-110 active:scale-95"
                        >
                            Apply Calibration
                        </button>
                    </div>
                </div>
            )}

            {/* Canvas Area */}
            <div 
                ref={canvasRef}
                className={`flex-1 bg-gray-50 rounded-2xl border border-dashed border-gray-300 relative group overflow-hidden select-none ${activeTool === 'node' ? 'cursor-crosshair' : 'cursor-default'}`}
                onClick={handleCanvasClick}
            >
                {mapImage ? (
                    <img src={mapImage} alt="Map Canvas" className="w-full h-full object-contain pointer-events-none" />
                ) : (
                    <div className="text-center text-gray-400 absolute inset-0 flex items-center justify-center">
                        <p>No Image</p>
                    </div>
                )}
                
                {/* SVG Overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                     {/* Edges */}
                     {edges.map(edge => {
                         const source = nodes.find(n => n.id === edge.source);
                         const target = nodes.find(n => n.id === edge.target);
                         if (!source || !target) return null;
                         
                         const isCalibrated = calibrationEdge && calibrationEdge.id === edge.id;
                         const midX = (source.x + target.x) / 2;
                         const midY = (source.y + target.y) / 2;
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
                                            x={midX - 20} 
                                            y={midY - 10} 
                                            width="40" 
                                            height="20" 
                                            rx="4" 
                                            fill="rgba(255, 255, 255, 0.9)" 
                                            stroke="#e5e7eb"
                                        />
                                        <text
                                            x={midX}
                                            y={midY}
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

                     {/* Drawing Line (Draft) */}
                     {activeTool === 'edge' && selectedNodeId && hoveredNodeId === null && (
                         // Note: This would require tracking mouse move for a real drag line. 
                         // For now, simpler implementation: just highlight the selected node.
                         null
                     )}

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
                                <g pointerEvents="none">
                                    <rect 
                                        x={node.x - ((node.label.length * 7) / 2) - 8}
                                        y={node.y - 30}
                                        width={(node.label.length * 7) + 16}
                                        height="22"
                                        rx="4"
                                        fill="rgba(0,0,0,0.7)"
                                        className="animate-in fade-in"
                                    />
                                    <text
                                        x={node.x}
                                        y={node.y - 19}
                                        textAnchor="middle"
                                        dy="0.3em"
                                        fill="white"
                                        fontSize="11"
                                        fontWeight="bold"
                                        className="animate-in fade-in"
                                    >
                                        {node.label}
                                    </text>
                                </g>
                            )}
                         </g>
                     ))}
                </svg>

                {/* Helpful floating hint */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-gray-900/80 backdrop-blur text-white text-xs font-medium rounded-full shadow-lg pointer-events-none">
                    {activeTool === 'node' && 'Click anywhere to add a node'}
                    {activeTool === 'edge' && (selectedNodeId ? 'Click another node to connect' : 'Click a node to start a path')}
                    {activeTool === 'select' && 'Select elements to edit (Coming Soon)'}
                </div>
            </div>
        </div>
    );
}
