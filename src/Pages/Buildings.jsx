import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildingService } from '../api/services';
import Breadcrumbs from '../Components/Breadcrumbs';

export default function Buildings() {
    const navigate = useNavigate();
    const [buildings, setBuildings] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newBuildingName, setNewBuildingName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingBuilding, setEditingBuilding] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const breadcrumbItems = [
        { label: 'Buildings', path: '/buildings' },
    ];

    const fetchBuildings = async () => {
        try {
            setLoading(true);
            const data = await buildingService.getAll();
            // The API returns { buildings: [...], count: ... }
            if (data.buildings) {
               setBuildings(data.buildings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
            } else {
               setBuildings([]);
            }
        } catch (err) {
            console.error("Failed to fetch buildings:", err);
            setError("Failed to load buildings.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBuildings();
    }, []);

    const handleSaveBuilding = async () => {
        if (!newBuildingName.trim()) return;

        try {
            if (editingBuilding) {
                // Edit Mode
                await buildingService.update(editingBuilding.building_id, { 
                    name: newBuildingName.trim(), 
                    description: editingBuilding.description 
                });
            } else {
                // Create Mode
                // Check for duplicates in the current list first (optional UI optimization)
                if (buildings.some(b => b.name.toLowerCase() === newBuildingName.trim().toLowerCase())) {
                    alert('A building with this name already exists.');
                    return;
                }
                
                await buildingService.create({
                    name: newBuildingName.trim(),
                    description: '' // Optional description
                });
            }
            
            // Refresh list
            fetchBuildings();
            setNewBuildingName('');
            setEditingBuilding(null);
            setShowModal(false);
            
        } catch (err) {
            console.error("Failed to save building:", err);
            alert("Failed to save building. Please try again.");
        }
    };

    const handleDeleteBuilding = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure? This will delete the building and all associated data.')) {
            try {
                await buildingService.delete(id);
                // Refresh list
                setBuildings(buildings.filter(b => b.building_id !== id));
            } catch (err) {
                 console.error("Failed to delete building:", err);
                 alert("Failed to delete building.");
            }
        }
    };

    const openEditModal = (e, building) => {
        e.stopPropagation();
        setEditingBuilding(building);
        setNewBuildingName(building.name);
        setShowModal(true);
    };

    const openCreateModal = () => {
        setEditingBuilding(null);
        setNewBuildingName('');
        setShowModal(true);
    };

    const filteredBuildings = buildings.filter(b => 
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <Breadcrumbs items={breadcrumbItems} />
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">All Buildings</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your facility structures</p>
                </div>
                <button 
                    onClick={openCreateModal}
                    className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Building
                </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                 <div className="flex-1 relative">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input 
                        type="text" 
                        placeholder="Search buildings..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                    />
                 </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading && buildings.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                         <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm animate-pulse h-48"></div>
                    ))}
                </div>
            ) : (
                /* Buildings Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBuildings.length > 0 ? (
                        filteredBuildings.map(building => (
                            <div 
                                key={building.building_id}
                                onClick={() => navigate(`/buildings/${building.building_id}/floors`)}
                                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-100 transition-colors"></div>
                                
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 text-gray-600 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{building.name}</h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        {building.created_at ? new Date(building.created_at).toLocaleDateString() : 'N/A'}
                                    </p>
                                    
                                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-50">
                                        <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                                            View Floors
                                        </span>
                                        
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={(e) => openEditModal(e, building)}
                                                className="text-gray-400 hover:text-blue-500 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                                                title="Edit Building"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.69 1.07l-3.214.801a.75.75 0 01-.928-.928l.8-3.214a4.5 4.5 0 011.07-1.691z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 0.225l-2.6 2.6" />
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={(e) => handleDeleteBuilding(building.building_id, e)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                                title="Delete Building"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                            <p className="mb-4">No buildings found.</p>
                            <button onClick={openCreateModal} className="text-[var(--color-primary)] font-bold hover:underline">
                                Create the first one
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in scale-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">{editingBuilding ? 'Edit Building' : 'Add New Building'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Building Name</label>
                                <input 
                                    type="text" 
                                    autoFocus
                                    value={newBuildingName}
                                    onChange={(e) => setNewBuildingName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveBuilding()}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                                    placeholder="e.g. Main Campus"
                                />
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-6">
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveBuilding}
                                    className="px-5 py-2.5 bg-[var(--color-primary)] text-white font-bold rounded-xl shadow-lg shadow-blue-900/10 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                >
                                    {editingBuilding ? 'Save Changes' : 'Create Building'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
