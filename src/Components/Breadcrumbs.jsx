import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Breadcrumbs({ items }) {
    return (
        <nav className="flex items-center text-sm font-medium text-gray-500 mb-6 animate-in fade-in slide-in-from-left-4 duration-300">
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                return (
                    <div key={index} className="flex items-center">
                        {index > 0 && (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mx-2 text-gray-300">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        )}
                        {item.path && !isLast ? (
                            <Link 
                                to={item.path} 
                                className="hover:text-[var(--color-primary)] hover:underline transition-all"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className={isLast ? "text-gray-900 font-bold" : ""}>
                                {item.label}
                            </span>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
