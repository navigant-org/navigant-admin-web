import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import storage, { KEYS } from '../utils/storage';

export default function BuildingEdges() {
    const { buildingId } = useParams();
    const [edges, setEdges] = useState([]);
    const [nodesMap, setNodesMap] = useState({});
    const [floorsMap, setFloorsMap] = useState({});

    useEffect(() => {
        loadData();
    }, [buildingId]);

    const loadData = () => {
        const allFloors = storage.load(KEYS.FLOORS, []);
        const buildingFloors = allFloors.filter(f => f.buildingId === buildingId);
        const fMap = {};
        buildingFloors.forEach(f => fMap[f.id] = f);
        setFloorsMap(fMap);

        const allNodes = storage.load(KEYS.NODES, []);
        const floorIds = new Set(buildingFloors.map(f => f.id));
        const buildingNodes = allNodes.filter(n => floorIds.has(n.floorId));
        
        const nMap = {};
        buildingNodes.forEach(n => nMap[n.id] = n);
        setNodesMap(nMap);

        const allEdges = storage.load(KEYS.EDGES, []);
        // Check both source and target are in our buildingNodes map
        // (Assuming edges are mostly intra-building, or at least one end should be here)
        // strict check: both ends in this building
        const buildingEdges = allEdges.filter(e => nMap[e.source] && nMap[e.target]);
        setEdges(buildingEdges);
    };

    const handleDelete = (edgeId) => {
        if (window.confirm('Delete this connection?')) {
            const allEdges = storage.load(KEYS.EDGES, []);
            const updatedEdges = allEdges.filter(e => e.id !== edgeId);
            storage.save(KEYS.EDGES, updatedEdges);
            loadData();
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
                        {edges.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                    No edges found. Connect nodes in the Map Editor.
                                </td>
                            </tr>
                        ) : (
                            edges.map(edge => {
                                const source = nodesMap[edge.source];
                                const target = nodesMap[edge.target];
                                return (
                                    <tr key={edge.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{source?.label}</div>
                                            <div className="text-xs text-gray-500">{floorsMap[source?.floorId]?.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{target?.label}</div>
                                            <div className="text-xs text-gray-500">{floorsMap[target?.floorId]?.name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-mono">
                                            {edge.distance.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                             <button 
                                                onClick={() => handleDelete(edge.id)}
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
