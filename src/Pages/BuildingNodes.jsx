import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import storage, { KEYS } from '../utils/storage';

export default function BuildingNodes() {
    const { buildingId } = useParams();
    
    const [nodes, setNodes] = useState([]);
    const [floors, setFloors] = useState([]);
    const [filterFloorId, setFilterFloorId] = useState('all');

    // Selection & Details State
    const [selectedNode, setSelectedNode] = useState(null);
    const [activeTab, setActiveTab] = useState('fingerprint'); // 'fingerprint' or 'raw'

    // Edit State (Modal)
    const [editingNode, setEditingNode] = useState(null);
    const [editLabel, setEditLabel] = useState('');

    useEffect(() => {
        loadData();
    }, [buildingId]);

    const loadData = () => {
        const allFloors = storage.load(KEYS.FLOORS, []);
        const buildingFloors = allFloors.filter(f => f.buildingId === buildingId).sort((a,b) => a.level - b.level);
        setFloors(buildingFloors);

        const allNodes = storage.load(KEYS.NODES, []);
        // Get IDs of floors in this building
        const buildingFloorIds = new Set(buildingFloors.map(f => f.id));
        const buildingNodes = allNodes.filter(n => buildingFloorIds.has(n.floorId));
        setNodes(buildingNodes);
    };

    const getFloorName = (floorId) => {
        const f = floors.find(fl => fl.id === floorId);
        return f ? f.name : 'Unknown Floor';
    };

    const handleDelete = (nodeId, e) => {
        if (e) e.stopPropagation();
        if (window.confirm('Delete this node? Associated edges will also be removed.')) {
            const allNodes = storage.load(KEYS.NODES, []);
            const updatedNodes = allNodes.filter(n => n.id !== nodeId);
            storage.save(KEYS.NODES, updatedNodes);

            // Also delete edges
            const allEdges = storage.load(KEYS.EDGES, []);
            const updatedEdges = allEdges.filter(e => e.source !== nodeId && e.target !== nodeId);
            storage.save(KEYS.EDGES, updatedEdges);
            
            if (selectedNode?.id === nodeId) setSelectedNode(null);
            loadData();
        }
    };

    const handleEditClick = (node, e) => {
        if (e) e.stopPropagation();
        setEditingNode(node);
        setEditLabel(node.label);
    };

    const saveEdit = () => {
        if (!editLabel.trim()) return;
        const allNodes = storage.load(KEYS.NODES, []);
        const updatedNodes = allNodes.map(n => n.id === editingNode.id ? { ...n, label: editLabel } : n);
        storage.save(KEYS.NODES, updatedNodes);
        
        // Update selected node if it's the one being edited
        if (selectedNode?.id === editingNode?.id) {
            setSelectedNode({ ...selectedNode, label: editLabel });
        }

        setEditingNode(null);
        loadData();
    };

    const filteredNodes = filterFloorId === 'all' 
        ? nodes 
        : nodes.filter(n => n.floorId === filterFloorId);

    // Helper to safely access magnetic data
    const getMagData = (node) => node?.magneticFingerprint || {};

    return (
        <div className="flex relative h-[calc(100vh-12rem)]">
            {/* Main List Area */}
            <div className={`flex-1 flex flex-col space-y-4 transition-all duration-300 ${selectedNode ? 'mr-96' : ''}`}>
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">Nodes ({filteredNodes.length})</h3>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-600">Filter by Floor:</label>
                        <select 
                            value={filterFloorId} 
                            onChange={(e) => setFilterFloorId(e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[var(--color-primary)]"
                        >
                            <option value="all">All Floors</option>
                            {floors.map(f => (
                                <option key={f.id} value={f.id}>{f.name} (Lvl {f.level})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-auto flex-1">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4">Label</th>
                                <th className="px-6 py-4">Floor</th>
                                <th className="px-6 py-4">Position</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredNodes.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        No nodes found. Go to Floors &gt; Map Editor to create nodes.
                                    </td>
                                </tr>
                            ) : (
                                filteredNodes.map(node => (
                                    <tr 
                                        key={node.id} 
                                        onClick={() => setSelectedNode(node)}
                                        className={`cursor-pointer transition-colors ${selectedNode?.id === node.id ? 'bg-blue-50 border-l-4 border-l-[var(--color-primary)]' : 'hover:bg-gray-50/50'}`}
                                    >
                                        <td className="px-6 py-4 font-bold text-gray-900">{node.label}</td>
                                        <td className="px-6 py-4 text-gray-600">{getFloorName(node.floorId)}</td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                            x: {Math.round(node.x)}, y: {Math.round(node.y)}
                                        </td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                            <button 
                                                onClick={(e) => handleEditClick(node, e)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2 py-1 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={(e) => handleDelete(node.id, e)}
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
            </div>

            {/* Side Panel for Details */}
            <div 
                className={`fixed top-32 bottom-4 right-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 transform transition-transform duration-300 flex flex-col overflow-hidden ${selectedNode ? 'translate-x-0' : 'translate-x-[120%]'}`}
                style={{ zIndex: 40 }}
            >
                {selectedNode ? (
                    <>
                        <div className="p-4 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                            <div>
                                <h4 className="text-lg font-bold text-gray-900">{selectedNode.label}</h4>
                                <p className="text-xs text-gray-500 mt-1">{getFloorName(selectedNode.floorId)}</p>
                            </div>
                            <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200">
                            <button 
                                onClick={() => setActiveTab('fingerprint')}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'fingerprint' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Fingerprint
                            </button>
                            <button 
                                onClick={() => setActiveTab('raw')}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'raw' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Raw Data
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-auto p-4">
                            {activeTab === 'fingerprint' && (
                                <div className="space-y-4">
                                    {!getMagData(selectedNode).mean ? (
                                        <div className="text-center py-10 text-gray-400 text-sm">
                                            No processed fingerprint data available.
                                        </div>
                                    ) : (
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-gray-50 text-gray-500 font-semibold">
                                                <tr>
                                                    <th className="px-2 py-2">Axis</th>
                                                    <th className="px-2 py-2">Mean (μT)</th>
                                                    <th className="px-2 py-2">Std Dev</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                <tr>
                                                    <td className="px-2 py-2 font-bold text-gray-700">X</td>
                                                    <td className="px-2 py-2 font-mono">{getMagData(selectedNode).mean?.x?.toFixed(2) ?? '-'}</td>
                                                    <td className="px-2 py-2 font-mono">{getMagData(selectedNode).std?.x?.toFixed(2) ?? '-'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-2 py-2 font-bold text-gray-700">Y</td>
                                                    <td className="px-2 py-2 font-mono">{getMagData(selectedNode).mean?.y?.toFixed(2) ?? '-'}</td>
                                                    <td className="px-2 py-2 font-mono">{getMagData(selectedNode).std?.y?.toFixed(2) ?? '-'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-2 py-2 font-bold text-gray-700">Z</td>
                                                    <td className="px-2 py-2 font-mono">{getMagData(selectedNode).mean?.z?.toFixed(2) ?? '-'}</td>
                                                    <td className="px-2 py-2 font-mono">{getMagData(selectedNode).std?.z?.toFixed(2) ?? '-'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}

                            {activeTab === 'raw' && (
                                <div className="space-y-4">
                                     {!getMagData(selectedNode).raw || getMagData(selectedNode).raw.length === 0 ? (
                                        <div className="text-center py-10 text-gray-400 text-sm">
                                            No raw readings available.
                                        </div>
                                    ) : (
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-gray-50 text-gray-500 font-semibold">
                                                <tr>
                                                    <th className="px-2 py-2">#</th>
                                                    <th className="px-2 py-2">Mag X</th>
                                                    <th className="px-2 py-2">Mag Y</th>
                                                    <th className="px-2 py-2">Mag Z</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {getMagData(selectedNode).raw.map((reading, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="px-2 py-1.5 text-gray-400">{idx + 1}</td>
                                                        <td className="px-2 py-1.5 font-mono">{reading.x?.toFixed(2)}</td>
                                                        <td className="px-2 py-1.5 font-mono">{reading.y?.toFixed(2)}</td>
                                                        <td className="px-2 py-1.5 font-mono">{reading.z?.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                        Select a node to view details
                    </div>
                )}
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
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setEditingNode(null)} className="flex-1 py-2 bg-gray-100 rounded-lg font-bold text-gray-600">Cancel</button>
                                <button onClick={saveEdit} className="flex-1 py-2 bg-[var(--color-primary)] text-white rounded-lg font-bold">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
