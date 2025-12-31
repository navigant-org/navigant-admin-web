import React, { useState, useEffect } from 'react';
import { Outlet, useParams, NavLink, useNavigate } from 'react-router-dom';
import { buildingService } from '../api/services';
import Breadcrumbs from './Breadcrumbs';

export default function BuildingLayout() {
    const { buildingId } = useParams();
    const navigate = useNavigate();
    const [building, setBuilding] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBuilding();
    }, [buildingId]);

    const loadBuilding = async () => {
        try {
            setLoading(true);
            const data = await buildingService.getById(buildingId);
            setBuilding(data);
        } catch (err) {
            console.error("Failed to load building:", err);
            // Navigate back if building not found
            navigate('/buildings');
        } finally {
            setLoading(false);
        }
    };

    const breadcrumbItems = [
        { label: 'Buildings', path: '/buildings' },
        { label: building?.name || 'Loading...', path: null },
    ];

    if (loading) return <div className="p-8">Loading...</div>;
    if (!building) return null;

    return (
        <div className="space-y-6">
            <Breadcrumbs items={breadcrumbItems} />
            
            {/* Building Header */}
            <div>
                 <h2 className="text-3xl font-bold text-gray-900">{building.name}</h2>
                 <p className="text-gray-500 mt-1">Manage floors, nodes, and connections for this building</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200">
                <NavLink 
                    to="floors" 
                    className={({ isActive }) => `px-6 py-3 font-medium text-sm transition-all border-b-2 ${isActive ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Floors
                </NavLink>
                <NavLink 
                    to="nodes" 
                    className={({ isActive }) => `px-6 py-3 font-medium text-sm transition-all border-b-2 ${isActive ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Nodes
                </NavLink>
                <NavLink 
                    to="edges" 
                    className={({ isActive }) => `px-6 py-3 font-medium text-sm transition-all border-b-2 ${isActive ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Edges
                </NavLink>
            </div>

            {/* Content Area */}
            <div className="py-4">
                <Outlet context={{ building }} />
            </div>
        </div>
    );
}
