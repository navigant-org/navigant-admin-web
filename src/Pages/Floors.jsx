import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buildingService, floorService } from '../api/services';

export default function Floors() {
    const { buildingId } = useParams();
    const navigate = useNavigate();
    const [floors, setFloors] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Form & Edit State
    const [newFloorLevel, setNewFloorLevel] = useState('');
    const [mapPreview, setMapPreview] = useState(null);
    const [editingFloor, setEditingFloor] = useState(null);

    const fetchFloors = async () => {
        try {
            setLoading(true);
            const data = await buildingService.getFloors(buildingId);
            const floorsList = Array.isArray(data) ? data : (data.floors || []);
            setFloors(floorsList.sort((a, b) => a.floor_number - b.floor_number));
        } catch (err) {
            console.error("Failed to fetch floors:", err);
            setFloors([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (buildingId) {
            fetchFloors();
        }
    }, [buildingId]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMapPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveFloor = async () => {
        if (!newFloorLevel) return;

        try {
            if (editingFloor) {
                // Edit Mode
                await floorService.update(editingFloor.floor_id, {
                    floor_number: parseInt(newFloorLevel, 10),
                    map_img_url: mapPreview || editingFloor.map_img_url,
                    building_id: parseInt(buildingId, 10)
                });
            } else {
                // Create Mode
                await floorService.create({
                    building_id: parseInt(buildingId, 10),
                    floor_number: parseInt(newFloorLevel, 10),
                    map_img_url: mapPreview || ""
                });
            }
            fetchFloors();
            
            setNewFloorLevel('');
            setMapPreview(null);
            setEditingFloor(null);
            setShowModal(false);

        } catch (err) {
            console.error("Failed to save floor:", err);
            alert("Failed to save floor. Please check inputs.");
        }
    };

    const handleDeleteFloor = async (id, e) => {
         e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this floor?')) {
            try {
                await floorService.delete(id);
                setFloors(floors.filter(f => f.floor_id !== id));
            } catch (err) {
                console.error("Failed to delete floor:", err);
                alert("Failed to delete floor.");
            }
        }
    };

    const openCreateModal = () => {
        setEditingFloor(null);
        setNewFloorLevel('');
        setMapPreview(null);
        setShowModal(true);
    };

    const openEditModal = (e, floor) => {
        e.stopPropagation();
        setEditingFloor(floor);
        setNewFloorLevel(floor.floor_number);
        setMapPreview(floor.map_img_url);
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            {/* Header / Actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Floors ({floors.length})</h3>
                </div>
                <button 
                    onClick={openCreateModal}
                    className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Floor
                </button>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {loading && floors.length === 0 ? (
                     // Shimmer loading skeleton
                     <>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6 flex-1">
                                        <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                                        <div className="flex-1">
                                            <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
                                            <div className="h-4 bg-gray-100 rounded w-32"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
                                        <div className="flex gap-1">
                                            <div className="w-9 h-9 bg-gray-200 rounded-xl"></div>
                                            <div className="w-9 h-9 bg-gray-200 rounded-xl"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                ) : floors.length > 0 ? (
                    floors.map(floor => (
                        <div key={floor.floor_id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-[var(--color-primary)] transition-all">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 relative group/image">
                                    {floor.map_img_url ? (
                                        <img src={floor.map_img_url} alt="Map" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Floor {floor.floor_number}</h3>
                                    <p className="text-sm text-gray-500">{floor.created_at ? new Date(floor.created_at).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {floor.map_img_url ? (
                                    <button 
                                        onClick={() => navigate(`/floors/${floor.floor_id}/map`)}
                                        className="px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-all text-sm"
                                    >
                                        Open Map Editor
                                    </button>
                                ) : (
                                     <button 
                                        onClick={(e) => openEditModal(e, floor)}
                                        className="px-4 py-2 bg-yellow-50 text-yellow-700 font-bold rounded-xl hover:bg-yellow-100 transition-all text-sm flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                        </svg>
                                        Upload Map
                                    </button>
                                )}
                                
                                <div className="flex items-center gap-1">
                                    <button 
                                        onClick={(e) => openEditModal(e, floor)}
                                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                        title="Edit Floor"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.69 1.07l-3.214.801a.75.75 0 01-.928-.928l.8-3.214a4.5 4.5 0 011.07-1.691z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 0.225l-2.6 2.6" />
                                        </svg>
                                    </button>
                                    <button 
                                        onClick={(e) => handleDeleteFloor(floor.floor_id, e)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        title="Delete Floor"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-12 text-center text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <p className="mb-4">No floors found for this building.</p>
                        <button onClick={openCreateModal} className="text-[var(--color-primary)] font-bold hover:underline">
                            Add a Floor
                        </button>
                    </div>
                )}
            </div>

             {/* Create/Edit Modal */}
             {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg animate-in scale-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">{editingFloor ? 'Edit Floor' : 'Add New Floor'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Floor Number <span className="text-red-500">*</span></label>
                                <input 
                                    type="number" 
                                    autoFocus
                                    value={newFloorLevel}
                                    onChange={(e) => setNewFloorLevel(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Floor Map Image</label>
                                <div 
                                    className={`relative w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${mapPreview ? 'border-[var(--color-primary)] bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
                                >
                                    {mapPreview ? (
                                        <>
                                            <img src={mapPreview} alt="Preview" className="absolute inset-0 w-full h-full object-contain opacity-50" />
                                            <div className="relative z-10 bg-white/80 px-3 py-1 rounded-full text-xs font-bold text-[var(--color-primary)] shadow-sm">Change Image</div>
                                        </>
                                    ) : (
                                        <div className="text-gray-400 text-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mx-auto mb-2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                            </svg>
                                            <span className="text-sm font-medium">Click to upload map</span>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer" 
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-6">
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveFloor}
                                    disabled={!newFloorLevel}
                                    className="px-5 py-2.5 bg-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blue-900/10 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                >
                                    {editingFloor ? 'Save Changes' : 'Create Floor'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
