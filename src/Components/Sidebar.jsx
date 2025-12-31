import React from 'react';
import { NavLink } from 'react-router-dom';

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);

const MapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
);

const NodeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
);

const ExportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
);

export default function Sidebar() {
    const navItems = [
        // { name: 'Dashboard', path: '/dashboard', icon: <HomeIcon /> },
        { name: 'Buildings', path: '/buildings', icon: <MapIcon /> },
        { name: 'Export Data', path: '/export-data', icon: <ExportIcon /> },
    ];

    return (
        <div className="hidden lg:flex flex-col w-72 bg-white/50 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl mx-4 my-6 min-h-[calc(100vh-8rem)] sticky top-24 overflow-hidden">
            {/* Header / Brand accent */}
            <div className="h-2 bg-gradient-to-r from-[var(--color-primary)] var(--color-secondary)] to-[var(--color-tertiary)] w-full"></div>
            
            <div className="p-6 space-y-4 flex-1">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">Menu</div>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-medium text-sm relative overflow-hidden ${
                                isActive
                                    ? 'text-white shadow-[0_8px_20px_-6px_rgba(6,81,237,0.4)]'
                                    : 'text-gray-500 hover:bg-white hover:shadow-lg hover:shadow-gray-100 hover:text-[var(--color-primary)]'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {/* Active Background with Gradient */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] opacity-100"></div>
                                )}
                                
                                {/* Icon & Text */}
                                <div className="relative z-10 flex items-center gap-4">
                                    <span className={`p-1 transition-transform group-hover:scale-110 duration-300 ${isActive ? 'bg-white/20 rounded-lg' : ''}`}>
                                        {item.icon}
                                    </span>
                                    <span className="tracking-wide">{item.name}</span>
                                </div>

                                {/* Active Indicator Dot */}
                                {isActive && (
                                    <div className="absolute right-4 w-2 h-2 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse"></div>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>

            {/* Bottom Card */}
            <div className="p-4 mt-auto">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-xl group-hover:bg-white/10 transition-colors duration-500"></div>
                     <div className="absolute bottom-0 left-0 w-24 h-24 bg-[var(--color-secondary)]/20 rounded-full -ml-12 -mb-12 blur-xl"></div>
                    
                    <div className="relative z-10">
                        <h4 className="font-bold text-lg mb-1">Documentation</h4>
                        <p className="text-xs text-gray-400 mb-4 leading-relaxed">Need help setting up your first map?</p>
                        <button className="w-full py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-xs font-bold transition-all border border-white/10 flex items-center justify-center gap-2">
                             <span>Read Guide</span>
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
