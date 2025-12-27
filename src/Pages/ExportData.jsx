import React, { useState } from 'react';
import storage, { KEYS } from '../utils/storage';

export default function ExportData() {
    const [showPreview, setShowPreview] = useState(false);

    const getExportData = () => {
        return {
            mapImage: storage.load(KEYS.MAP_IMAGE),
            scaleRatio: storage.load(KEYS.SCALE_RATIO),
            nodes: storage.load(KEYS.NODES, []),
            edges: storage.load(KEYS.EDGES, [])
        };
    };

    const handleDownload = () => {
        const data = getExportData();
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'navigant-map-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-[500px] flex flex-col items-center justify-center text-center relative">
             <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Export Data</h2>
            <p className="text-gray-500 max-w-md mb-8">
                Download the complete node graph and map configuration in JSON format for the mobile application.
            </p>
            <div className="flex gap-4">
                <button 
                    onClick={() => setShowPreview(true)}
                    className="px-6 py-3 bg-gray-100 text-gray-900 rounded-xl font-medium hover:bg-gray-200 transition-all"
                >
                    Preview JSON
                </button>
                <button 
                    onClick={handleDownload}
                    className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                >
                    Download .json
                </button>
            </div>

            {showPreview && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-bold text-gray-900">JSON Preview</h3>
                            <button 
                                onClick={() => setShowPreview(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-4 bg-gray-50">
                            <pre className="font-mono text-xs text-gray-800 whitespace-pre-wrap">
                                {JSON.stringify(getExportData(), null, 2)}
                            </pre>
                        </div>
                        <div className="p-4 border-t flex justify-end">
                            <button 
                                onClick={handleDownload}
                                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium shadow hover:shadow-lg transition-all text-sm"
                            >
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
