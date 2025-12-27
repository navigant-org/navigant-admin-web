import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import storage, { KEYS } from '../utils/storage';

export default function UploadMap() {
    const navigate = useNavigate();
    const [preview, setPreview] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        }
    };

    const handleContinue = () => {
        if (preview) {
            storage.save(KEYS.MAP_IMAGE, preview);
            // Also reset related data when a new map is uploaded
            storage.save(KEYS.NODES, []);
            storage.save(KEYS.EDGES, []);
            storage.save(KEYS.SCALE_RATIO, null);
            
            navigate('/map-editor');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full min-h-[500px] flex flex-col items-center justify-center text-center">
             {!preview ? (
                <>
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Floor Map</h2>
                    <p className="text-gray-500 max-w-md mb-8">
                        Upload your architectural floor plans here. Supported formats: .png, .jpg, .svg.
                    </p>
                    <label className="relative px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all cursor-pointer">
                        <span>Select File</span>
                        <input 
                            type="file" 
                            accept="image/*"
                            className="hidden" 
                            onChange={handleFileChange}
                        />
                    </label>
                </>
             ) : (
                 <div className="w-full h-full flex flex-col items-center">
                     <h2 className="text-xl font-bold text-gray-900 mb-4">Preview</h2>
                     <div className="relative flex-1 w-full max-w-3xl border rounded-xl overflow-hidden mb-6 bg-gray-50 flex items-center justify-center">
                         <img src={preview} alt="Map Preview" className="max-w-full max-h-full object-contain" />
                         <button 
                            onClick={() => setPreview(null)}
                            className="absolute top-4 right-4 p-2 bg-white/80 rounded-lg shadow hover:bg-white text-red-500"
                         >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                         </button>
                     </div>
                     <div className="flex gap-4">
                        <button 
                            onClick={() => setPreview(null)}
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                        >
                            Change File
                        </button>
                        <button 
                            onClick={handleContinue}
                            className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                        >
                            Continue to Editor
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </button>
                     </div>
                 </div>
             )}
        </div>
    );
}
