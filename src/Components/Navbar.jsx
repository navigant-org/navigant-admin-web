import React, { useState } from 'react';

export default function Navbar({ onLogout }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Left: Logo & Name */}
                    {/* Left: Logo */}
                    <div className="flex items-center">
                        <img src="/logomark.svg" alt="Navigant" className="h-6 w-auto object-contain" />
                    </div>

                    {/* Right: User Profile & Logout - Desktop */}
                    <div className="hidden md:flex items-center gap-6">
                         <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900 leading-none">Admin User</p>
                                <p className="text-xs text-gray-500 mt-1">admin@gmail.com</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[var(--color-tertiary)]/30 border-2 border-white shadow-sm flex items-center justify-center text-[var(--color-primary)] font-bold text-lg ring-2 ring-[var(--color-background)]">
                                A
                            </div>
                        </div>
                        <div className="h-8 w-px bg-gray-200"></div>
                         <button 
                            onClick={onLogout}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                            </svg>
                            <span>Logout</span>
                        </button>
                    </div>

                     {/* Mobile Menu Button */}
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-gray-500 rounded-lg hover:bg-gray-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-100 px-4 py-4 bg-white/95 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-tertiary)]/30 flex items-center justify-center text-[var(--color-primary)] font-bold text-lg">
                            A
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Admin User</p>
                            <p className="text-xs text-gray-500">admin@gmail.com</p>
                        </div>
                    </div>
                     <button 
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg transition-colors"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    )
}