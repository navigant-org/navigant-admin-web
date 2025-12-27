import React, { useState } from 'react';
import storage, { KEYS } from '../utils/storage';

export default function ManageNodes() {
    const nodes = storage.load(KEYS.NODES, []);
    const edges = storage.load(KEYS.EDGES, []);

    // Helper: count connections for a node
    const getConnections = (nodeId) => {
        return edges.filter(e => e.source === nodeId || e.target === nodeId).length;
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Manage Nodes & Paths</h2>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Node Label</th>
                            <th className="px-6 py-4">Coordinates</th>
                            <th className="px-6 py-4">Connections</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {nodes.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    No nodes found. Create some in the Map Editor.
                                </td>
                            </tr>
                        ) : (
                            nodes.map((node) => (
                                <tr key={node.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-bold text-gray-900">{node.label}</td>
                                    <td className="px-6 py-4 text-gray-500">x: {node.x.toFixed(0)}, y: {node.y.toFixed(0)}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                                            {getConnections(node.id)} Paths
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-green-600 font-medium flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-400">
                                        <button className="hover:text-[var(--color-primary)]">Edit</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
