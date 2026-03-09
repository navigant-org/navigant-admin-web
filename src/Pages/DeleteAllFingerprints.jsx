import React, { useState } from 'react';
import { fingerprintService } from '../api/services';

export default function DeleteAllFingerprints() {
    const [isDeleting, setIsDeleting] = useState(false);
    const [message, setMessage] = useState('');

    const handleDeleteAll = async () => {
        if (!window.confirm('Are you sure you want to delete all fingerprints? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        setMessage('');

        try {
            await fingerprintService.deleteAll();
            setMessage('All fingerprints have been successfully deleted.');
        } catch (error) {
            console.error('Error deleting fingerprints:', error);
            setMessage('Failed to delete fingerprints. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-[500px] flex flex-col items-center justify-center text-center relative">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete All Fingerprints</h2>
            <p className="text-gray-500 max-w-md mb-8">
                This action will permanently delete all fingerprint data from the system. This cannot be undone.
            </p>
            {message && (
                <div className={`mb-6 p-4 rounded-xl ${message.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message}
                </div>
            )}
            <button
                onClick={handleDeleteAll}
                disabled={isDeleting}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isDeleting ? 'Deleting...' : 'Delete All Fingerprints'}
            </button>
        </div>
    );
}