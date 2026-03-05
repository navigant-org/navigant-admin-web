import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { buildingService, edgeService } from '../api/services';

export default function Stairs() {
    const { buildingId } = useParams();
    const [stairs, setStairs] = useState([]);
    const [stairNodes, setStairNodes] = useState([]);
    const [totalNodesMap, setTotalNodesMap] = useState({});
    const [floorsMap, setFloorsMap] = useState({});
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [sourceNodeId, setSourceNodeId] = useState('');
    const [targetNodeId, setTargetNodeId] = useState('');
    const [distance, setDistance] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (buildingId) {
            loadData();
        }
    }, [buildingId]);

    const loadData = async () => {
        try {
            setLoading(true);
            
            // Load floors first for mapping names
            const floorsData = await buildingService.getFloors(buildingId);
            const floorsList = Array.isArray(floorsData) ? floorsData : (floorsData.floors || []);
            const fMap = {};
            floorsList.forEach(f => fMap[f.floor_id] = f);
            setFloorsMap(fMap);

            // Load all nodes for the building
            const nodesData = await buildingService.getNodes(buildingId);
            const nodesList = Array.isArray(nodesData) ? nodesData : (nodesData.nodes || []);
            
            // Map for easy lookup
            const nMap = {};
            nodesList.forEach(n => nMap[n.node_id] = n);
            setTotalNodesMap(nMap);

            // Filter nodes by 'stairs' for the dropdowns
            const filteredStairNodes = nodesList.filter(n => n.node_type === 'stairs');
            setStairNodes(filteredStairNodes);

            // Load all edges and filter by 'Vertical' or connection between stair nodes
            const edgesData = await buildingService.getEdges(buildingId);
            const edgesList = Array.isArray(edgesData) ? edgesData : (edgesData.edges || []);
            
            const verticalEdges = edgesList.filter(e => {
                const sNode = nMap[e.start_node_id || e.start_id];
                const tNode = nMap[e.end_node_id || e.end_id];
                
                // Primary: check explicit edge_type
                const isVertical = e.edge_type?.toLowerCase() === 'vertical';
                
                // Secondary: fallback if edge_type is missing/unreliable (stair to stair connection)
                const isStairToStair = sNode?.node_type === 'stairs' && tNode?.node_type === 'stairs';
                
                return isVertical || isStairToStair;
            });
            setStairs(verticalEdges);

        } catch (err) {
            console.error("Failed to load stairs data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStair = async (e) => {
        e.preventDefault();
        if (!sourceNodeId || !targetNodeId || !distance) {
            alert("Please fill all fields");
            return;
        }

        if (sourceNodeId === targetNodeId) {
            alert("Source and Target nodes must be different");
            return;
        }

        try {
            setSubmitting(true);
            const sourceNode = stairNodes.find(n => n.node_id === parseInt(sourceNodeId));
            const edgePayload = {
                start_node_id: parseInt(sourceNodeId),
                end_node_id: parseInt(targetNodeId),
                distance: parseFloat(distance),
                edge_type: "Vertical",
                floor_id: sourceNode?.floor_id
            };

            const response = await edgeService.create(edgePayload);
            
            // Construct full object for immediate UI update, merging with API response
            const newStair = {
                ...edgePayload,
                ...response,
                edge_id: response.edge_id || response.id || `temp-${Date.now()}`
            };
            
            setStairs([...stairs, newStair]);
            
            // Reset form
            setSourceNodeId('');
            setTargetNodeId('');
            setDistance('');
        } catch (err) {
            console.error("Failed to create stair connection:", err);
            alert("Failed to create connection. Check console for details.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (edgeId) => {
        if (window.confirm('Delete this stair connection?')) {
            try {
                await edgeService.delete(edgeId);
                setStairs(stairs.filter(e => (e.edge_id || e.id) !== edgeId));
            } catch (err) {
                console.error("Failed to delete stair:", err);
                alert("Failed to delete connection.");
            }
        }
    };

    const getNodeName = (nodeId) => {
        if (!nodeId) return 'Unknown Node';
        const node = totalNodesMap[nodeId];
        if (!node) return `Node ${nodeId}`;
        const floor = floorsMap[node.floor_id];
        const floorName = floor ? (floor.name || `Floor ${floor.floor_number}`) : 'Unknown Floor';
        return `${node.name || node.label || 'Unnamed'} (${floorName})`;
    };

    // Group nodes by floor for better selection
    const nodesByFloor = {};
    stairNodes.forEach(node => {
        if (!nodesByFloor[node.floor_id]) nodesByFloor[node.floor_id] = [];
        nodesByFloor[node.floor_id].push(node);
    });

    return (
        <div className="space-y-6">
            {/* Creation Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Add New Stair Connection</h3>
                <form onSubmit={handleAddStair} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Source Node</label>
                        <select 
                            value={sourceNodeId} 
                            onChange={(e) => setSourceNodeId(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
                        >
                            <option value="">Select Source</option>
                            {Object.keys(nodesByFloor).map(floorId => (
                                <optgroup key={floorId} label={floorsMap[floorId]?.name || `Floor ${floorsMap[floorId]?.floor_number}`}>
                                    {nodesByFloor[floorId].map(node => (
                                        <option key={node.node_id} value={node.node_id}>{node.name || node.label}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Target Node</label>
                        <select 
                            value={targetNodeId} 
                            onChange={(e) => setTargetNodeId(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
                        >
                            <option value="">Select Target</option>
                            {Object.keys(nodesByFloor).map(floorId => (
                                <optgroup key={floorId} label={floorsMap[floorId]?.name || `Floor ${floorsMap[floorId]?.floor_number}`}>
                                    {nodesByFloor[floorId].map(node => (
                                        <option key={node.node_id} value={node.node_id}>{node.name || node.label}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Distance</label>
                        <input 
                            type="number" 
                            step="0.01"
                            value={distance}
                            onChange={(e) => setDistance(e.target.value)}
                            placeholder="e.g. 5.0"
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="bg-[var(--color-primary)] text-white py-2 px-6 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {submitting ? 'Adding...' : 'Add Connection'}
                    </button>
                </form>
            </div>

            {/* Stairs List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <h3 className="text-xl font-bold text-gray-800">Vertical Connections ({stairs.length})</h3>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Source Stair</th>
                                <th className="px-6 py-4">Target Stair</th>
                                <th className="px-6 py-4">Distance</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {loading ? (
                                <>
                                    {[1, 2, 3].map(i => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-40"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-40"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                                            <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded w-16 ml-auto"></div></td>
                                        </tr>
                                    ))}
                                </>
                            ) : stairs.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                        No vertical connections found. Add one above.
                                    </td>
                                </tr>
                            ) : (
                                stairs.map(edge => (
                                    <tr key={edge.edge_id || edge.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {getNodeName(edge.start_node_id || edge.start_id)}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {getNodeName(edge.end_node_id || edge.end_id)}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-600">
                                            {edge.distance ? `${parseFloat(edge.distance).toFixed(2)} units` : 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDelete(edge.edge_id || edge.id)}
                                                className="text-red-600 hover:text-red-800 font-medium text-xs px-3 py-1 bg-red-50 rounded-lg transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
