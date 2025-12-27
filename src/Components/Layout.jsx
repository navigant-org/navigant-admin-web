import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout({ onLogout }) {
    return (
        <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
            <Navbar onLogout={onLogout} />
            
            <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                <Sidebar />
                <main className="flex-1 py-4 sm:py-8 lg:pl-8 overflow-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
