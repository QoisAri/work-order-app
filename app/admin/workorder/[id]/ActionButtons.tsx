'use client';

import { useState } from "react";

export function ActionButtons({ workOrderId, status }: { workOrderId: string, status: string }) {
    const [isLoading, setIsLoading] = useState(false);
    
    const handleAction = async (action: 'approved' | 'rejected') => {
        setIsLoading(true);
        // Panggil API Route baru untuk update status
        await fetch('/api/admin/update-status', {
            method: 'POST',
            body: JSON.stringify({ workOrderId, action }),
        });
        setIsLoading(false);
        // Refresh halaman untuk melihat status terbaru
        window.location.reload();
    };

    if (status !== 'pending') {
        return <div className="mt-4 p-4 bg-yellow-100 rounded">Status: {status}</div>;
    }

    return (
        <div className="flex space-x-4 mt-6">
            <button onClick={() => handleAction('approved')} disabled={isLoading} className="bg-green-500 text-white px-4 py-2 rounded">
                {isLoading ? 'Processing...' : 'Setujui'}
            </button>
            <button onClick={() => handleAction('rejected')} disabled={isLoading} className="bg-red-500 text-white px-4 py-2 rounded">
                {isLoading ? 'Processing...' : 'Tolak'}
            </button>
        </div>
    );
}