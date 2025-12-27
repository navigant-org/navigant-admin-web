import React from 'react';

// Icons for Stat Cards (kept as is)
const BuildingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
);

const LayersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
    </svg>
);

const NodesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
);

const PathIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.159.69.159 1.006 0z" />
    </svg>
);


import { useNavigate } from 'react-router-dom';
import storage, { KEYS } from '../utils/storage';

export default function Dashboard() {
    const navigate = useNavigate();
    
    // Load Data
    const nodes = storage.load(KEYS.NODES, []);
    const edges = storage.load(KEYS.EDGES, []);
    const mapImage = storage.load(KEYS.MAP_IMAGE, null);
    const scaleRatio = storage.load(KEYS.SCALE_RATIO, null);

    const stats = [
        { title: 'Buildings', value: '1', icon: <BuildingIcon />, color: 'text-blue-600', bg: 'bg-blue-50' }, // Hardcoded for now
        { title: 'Floors', value: '1', icon: <LayersIcon />, color: 'text-purple-600', bg: 'bg-purple-50' }, // Hardcoded for now
        { title: 'Nodes', value: nodes.length.toString(), icon: <NodesIcon />, color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'Paths', value: edges.length.toString(), icon: <PathIcon />, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];


    return (
        <div className="space-y-8">
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 transition-transform hover:-translate-y-1 duration-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-1">{stat.title}</p>
                                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                {stat.icon}
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-gray-400">
                            <span className="text-green-500 font-medium flex items-center gap-1 mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 16.586 5H12z" clipRule="evenodd" />
                                </svg>
                                +2.5%
                            </span>
                            from last month
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Mapping Status Section */}
            <div className="grid grid-cols-1 gap-8">
                {/* Status Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Current Mapping Status</h2>
                        <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold uppercase tracking-wider rounded-full">In Progress</span>
                    </div>

                    <div className="space-y-4">
                        {/* 1. Map Uploaded */}
                        <div className={`flex items-center p-4 rounded-xl border ${mapImage ? 'bg-green-50/50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${mapImage ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h4 className={`font-bold ${mapImage ? 'text-gray-900' : 'text-gray-500'}`}>Map Uploaded</h4>
                                <p className="text-sm text-gray-500">{mapImage ? 'Floor map file verified' : 'Upload a floor plan to start'}</p>
                            </div>
                            {!mapImage && <button onClick={() => navigate('/upload-map')} className="ml-auto text-xs font-bold text-[var(--color-primary)] hover:underline">Upload</button>}
                        </div>

                        {/* 2. Nodes Created */}
                        <div className={`flex items-center p-4 rounded-xl border ${nodes.length > 0 ? 'bg-green-50/50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${nodes.length > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h4 className={`font-bold ${nodes.length > 0 ? 'text-gray-900' : 'text-gray-500'}`}>{nodes.length > 0 ? `${nodes.length} Nodes Created` : 'Nodes Created'}</h4>
                                <p className="text-sm text-gray-500">{nodes.length > 0 ? 'Navigation points defined' : 'Add nodes in Map Editor'}</p>
                            </div>
                            {nodes.length === 0 && <button onClick={() => navigate('/map-editor')} className="ml-auto text-xs font-bold text-[var(--color-primary)] hover:underline">Edit Map</button>}
                        </div>

                        {/* 3. Paths Connected */}
                        <div className={`flex items-center p-4 rounded-xl border ${edges.length > 0 ? 'bg-green-50/50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${edges.length > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h4 className={`font-bold ${edges.length > 0 ? 'text-gray-900' : 'text-gray-500'}`}>{edges.length > 0 ? `${edges.length} Paths Connected` : 'Paths Connected'}</h4>
                                <p className="text-sm text-gray-500">{edges.length > 0 ? 'Routing network established' : 'Connect nodes in Map Editor'}</p>
                            </div>
                        </div>

                        {/* 4. Calibration */}
                        <div className={`flex items-center p-4 rounded-xl border ${scaleRatio ? 'bg-green-50/50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${scaleRatio ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className={`font-bold ${scaleRatio ? 'text-gray-900' : 'text-gray-500'}`}>{scaleRatio ? 'Map Calibrated' : 'Calibration Pending'}</h4>
                                <p className="text-sm text-gray-500">{scaleRatio ? 'Real-world scale defined' : 'Set scale in Map Editor'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}