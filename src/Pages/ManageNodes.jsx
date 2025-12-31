import React, { useState, useEffect } from 'react';
import storage, { KEYS } from '../utils/storage';

import Breadcrumbs from '../Components/Breadcrumbs';

export default function ManageNodes() {
    // ...
    const breadcrumbItems = [
        { label: 'Manage Nodes', path: null },
    ];

    return (
        <div className="space-y-6">
             <Breadcrumbs items={breadcrumbItems} />
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">All Nodes</h2>
                {/* Creation is disabled here as requested */}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Node Label</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Connections</th>
                            <th className="px-6 py-4">Magnetic Fingerprint</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {nodes.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    No nodes found. Create nodes in the Map Editor.
                                </td>
                            </tr>
                        ) : (
                            nodes.map((node) => (
                                <tr key={node.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-bold text-gray-900">{node.label}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {getLocation(node.floorId)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                                            {getConnections(node.id)} Paths
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-mono bg-gray-50 p-1.5 rounded border border-gray-200 text-gray-500 max-w-[200px] truncate">
                                            {JSON.stringify(node.magneticFingerprint || {})}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => handleEditClick(node)}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2 py-1 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(node.id)}
                                            className="text-red-600 hover:text-red-800 font-medium text-xs px-2 py-1 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
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

            {/* Edit Modal */}
            {editingNode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Node</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Label</label>
                                <input 
                                    type="text" 
                                    value={editLabel}
                                    onChange={(e) => setEditLabel(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Magnetic Fingerprint</label>
                                <textarea 
                                    disabled
                                    value={JSON.stringify(editingNode.magneticFingerprint || {}, null, 2)}
                                    className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl font-mono text-xs text-gray-500 h-24 resize-none cursor-not-allowed"
                                />
                                <p className="text-[10px] text-gray-400 mt-1">Fingerprint data is read-only.</p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    onClick={() => setEditingNode(null)}
                                    className="flex-1 py-2 bg-gray-100 rounded-lg font-bold text-gray-600"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={saveEdit}
                                    className="flex-1 py-2 bg-[var(--color-primary)] text-white rounded-lg font-bold"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
