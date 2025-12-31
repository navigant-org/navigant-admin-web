import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { buildingService, nodeService } from '../api/services';

export default function BuildingNodes() {
    const { buildingId } = useParams();
    
    const [nodes, setNodes] = useState([]);
    const [floors, setFloors] = useState([]);
    const [filterFloorId, setFilterFloorId] = useState('all');

    // Selection & Details State
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedNodeFingerprint, setSelectedNodeFingerprint] = useState(null);
    const [activeTab, setActiveTab] = useState('fingerprint'); // 'fingerprint' or 'raw'
    const [loadingFingerprint, setLoadingFingerprint] = useState(false);

    // Edit State (Modal)
    const [editingNode, setEditingNode] = useState(null);
    const [editLabel, setEditLabel] = useState('');

    useEffect(() => {
        if (buildingId) {
            loadData();
        }
    }, [buildingId]);

    useEffect(() => {
        if (selectedNode) {
            fetchFingerprints(selectedNode.node_id);
        } else {
            setSelectedNodeFingerprint(null);
        }
    }, [selectedNode]);

    const loadData = async () => {
        try {
            // Load floors first for mapping names
            const floorsData = await buildingService.getFloors(buildingId);
            const floorsList = Array.isArray(floorsData) ? floorsData : (floorsData.floors || []);
            setFloors(floorsList.sort((a,b) => a.floor_number - b.floor_number));

            // Load nodes
            const nodesData = await buildingService.getNodes(buildingId);
             // API usually returns { nodes: [...] } or array
            const nodesList = Array.isArray(nodesData) ? nodesData : (nodesData.nodes || []);
            setNodes(nodesList);
        } catch (err) {
            console.error("Failed to load data:", err);
        }
    };

    const fetchFingerprints = async (nodeId) => {
        try {
            setLoadingFingerprint(true);
            const data = await nodeService.getFingerprints(nodeId);
            // Expected response: { fingerprint: { mean: {...}, std: {...}, raw: [...] } }
            // Adjust based on actual API
            setSelectedNodeFingerprint(data);
        } catch (err) {
            console.error("Failed to fetch fingerprints:", err);
            setSelectedNodeFingerprint(null);
        } finally {
            setLoadingFingerprint(false);
        }
    };

    const getFloorName = (floorId) => {
        const f = floors.find(fl => fl.floor_id === floorId);
        return f ? (f.name || `Level ${f.floor_number}`) : 'Unknown Floor';
    };

    const handleDelete = async (nodeId, e) => {
        if (e) e.stopPropagation();
        if (window.confirm('Delete this node? Associated edges will also be removed.')) {
            try {
                await nodeService.delete(nodeId);
                // Optimistic update
                setNodes(nodes.filter(n => n.node_id !== nodeId));
                
                if (selectedNode?.node_id === nodeId) setSelectedNode(null);
            } catch (err) {
                console.error("Failed to delete node:", err);
                alert("Failed to delete node.");
            }
        }
    };

    const handleEditClick = (node, e) => {
        if (e) e.stopPropagation();
        setEditingNode(node);
        setEditLabel(node.name || node.label || '');
    };

    const saveEdit = async () => {
        if (!editLabel.trim()) return;
        try {
            // The API expects whatever fields we want to update.
            await nodeService.update(editingNode.node_id, {
                name: editLabel
                // keep other fields same if needed, or API handles partial updates
            });

            // Refresh or update locally
            setNodes(nodes.map(n => n.node_id === editingNode.node_id ? { ...n, name: editLabel } : n));
            
            if (selectedNode?.node_id === editingNode?.node_id) {
                setSelectedNode({ ...selectedNode, name: editLabel });
            }

            setEditingNode(null);
        } catch (err) {
            console.error("Failed to update node:", err);
            alert("Failed to update node.");
        }
    };

    // Correct filtering based on floor ID type (string vs number)
    const filteredNodes = filterFloorId === 'all' 
        ? nodes 
        : nodes.filter(n => n.floor_id == filterFloorId); // loose equality for string/number match

    // Helper to safely access magnetic data
    // Assuming API structure. If flattened, adjust.
    const getMagData = () => selectedNodeFingerprint || {};

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
                                <option key={f.floor_id} value={f.floor_id}>{f.name || `Level ${f.floor_number}`}</option>
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
                                        key={node.node_id} 
                                        onClick={() => setSelectedNode(node)}
                                        className={`cursor-pointer transition-colors ${selectedNode?.node_id === node.node_id ? 'bg-blue-50 border-l-4 border-l-[var(--color-primary)]' : 'hover:bg-gray-50/50'}`}
                                    >
                                        <td className="px-6 py-4 font-bold text-gray-900">{node.name || node.label || 'Unnamed'}</td>
                                        <td className="px-6 py-4 text-gray-600">{getFloorName(node.floor_id)}</td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                            x: {Math.round(node.x_coordinate ?? node.x)}, y: {Math.round(node.y_coordinate ?? node.y)}
                                        </td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                            <button 
                                                onClick={(e) => handleEditClick(node, e)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2 py-1 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={(e) => handleDelete(node.node_id, e)}
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
                                <h4 className="text-lg font-bold text-gray-900">{selectedNode.name || selectedNode.label || 'Unnamed'}</h4>
                                <p className="text-xs text-gray-500 mt-1">{getFloorName(selectedNode.floor_id)}</p>
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
                            {loadingFingerprint ? (
                                <div className="text-center py-10 text-gray-400 text-sm">
                                    Loading data...
                                </div>
                            ) : (
                                <>
                            {activeTab === 'fingerprint' && (
                                <div className="space-y-4">
                                    {!getMagData().mean ? (
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
                                                    <td className="px-2 py-2 font-mono">{getMagData().mean?.x?.toFixed(2) ?? '-'}</td>
                                                    <td className="px-2 py-2 font-mono">{getMagData().std?.x?.toFixed(2) ?? '-'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-2 py-2 font-bold text-gray-700">Y</td>
                                                    <td className="px-2 py-2 font-mono">{getMagData().mean?.y?.toFixed(2) ?? '-'}</td>
                                                    <td className="px-2 py-2 font-mono">{getMagData().std?.y?.toFixed(2) ?? '-'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-2 py-2 font-bold text-gray-700">Z</td>
                                                    <td className="px-2 py-2 font-mono">{getMagData().mean?.z?.toFixed(2) ?? '-'}</td>
                                                    <td className="px-2 py-2 font-mono">{getMagData().std?.z?.toFixed(2) ?? '-'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}

                            {activeTab === 'raw' && (
                                <div className="space-y-4">
                                     {!getMagData().raw || getMagData().raw.length === 0 ? (
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
                                                {getMagData().raw.map((reading, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="px-2 py-1.5 text-gray-400">{idx + 1}</td>
                                                        <td className="px-2 py-1.5 font-mono">{reading.mag_x?.toFixed(2) ?? reading.x?.toFixed(2)}</td>
                                                        <td className="px-2 py-1.5 font-mono">{reading.mag_y?.toFixed(2) ?? reading.y?.toFixed(2)}</td>
                                                        <td className="px-2 py-1.5 font-mono">{reading.mag_z?.toFixed(2) ?? reading.z?.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}
                            </>
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
