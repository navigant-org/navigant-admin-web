import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { buildingService, edgeService } from '../api/services';

export default function BuildingEdges() {
    const { buildingId } = useParams();
    const [edges, setEdges] = useState([]);
    const [nodesMap, setNodesMap] = useState({});
    const [floorsMap, setFloorsMap] = useState({});
    const [loading, setLoading] = useState(false);

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

            // Load nodes
            const nodesData = await buildingService.getNodes(buildingId);
            const nodesList = Array.isArray(nodesData) ? nodesData : (nodesData.nodes || []);
            const nMap = {};
            nodesList.forEach(n => nMap[n.node_id] = n);
            setNodesMap(nMap);

            // Load edges
            const edgesData = await buildingService.getEdges(buildingId);
             // API typical response
            const edgesList = Array.isArray(edgesData) ? edgesData : (edgesData.edges || []);
            setEdges(edgesList);

        } catch (err) {
            console.error("Failed to load data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (edgeId) => {
        if (window.confirm('Delete this connection?')) {
            try {
                await edgeService.delete(edgeId);
                setEdges(edges.filter(e => e.edge_id !== edgeId));
            } catch (err) {
                console.error("Failed to delete edge:", err);
                alert("Failed to delete edge.");
            }
        }
    };

    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Edges ({edges.length})</h3>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Source Node</th>
                            <th className="px-6 py-4">Target Node</th>
                            <th className="px-6 py-4">Distance (px)</th>
                             <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {loading ? (
                            // Shimmer loading skeleton
                            <>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                                            <div className="h-3 bg-gray-100 rounded w-24"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                                            <div className="h-3 bg-gray-100 rounded w-24"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end">
                                                <div className="h-6 bg-gray-200 rounded w-14"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </>
                        ) : edges.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                    No edges found. Connect nodes in the Map Editor.
                                </td>
                            </tr>
                        ) : (
                            edges.map(edge => {
                                const source = nodesMap[edge.start_node_id];
                                const target = nodesMap[edge.end_node_id];
                                return (
                                    <tr key={edge.edge_id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{source?.name || source?.label || `Node ${edge.start_node_id}`}</div>
                                            <div className="text-xs text-gray-500">{floorsMap[source?.floor_id]?.name || floorsMap[source?.floor_id]?.floor_number}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{target?.name || target?.label || `Node ${edge.end_node_id}`}</div>
                                            <div className="text-xs text-gray-500">{floorsMap[target?.floor_id]?.name || floorsMap[target?.floor_id]?.floor_number}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-mono">
                                            {edge.distance?.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                             <button 
                                                onClick={() => handleDelete(edge.edge_id)}
                                                className="text-red-600 hover:text-red-800 font-medium text-xs px-2 py-1 bg-red-50 rounded-lg"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
