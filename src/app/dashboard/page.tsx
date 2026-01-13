'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AllotmentTable from '@/components/AllotmentTable';

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        } else if (status === 'authenticated') {
            fetchData();
        }
    }, [status, router]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/allotments');
            const json = await res.json();
            if (json.data) {
                setData(json.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        // Trigger sync endpoint
        try {
            await fetch('/api/sync', { method: 'POST' });
            await fetchData(); // Reload data after sync
            alert('Allotments synced from Sheet!');
        } catch (e) {
            alert('Sync failed!');
        } finally {
            setRefreshing(false);
        }
    };

    if (status === 'loading') return <div className="p-10 text-center">Loading session...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10 px-6 py-4 flex justify-between items-center shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">NEET Module VS Allotment</h1>
                    <div className="text-sm text-gray-500">Logged in as: <span className="font-semibold text-gray-700">{session?.user?.email}</span></div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-gray-100 px-3 py-1 rounded text-sm text-gray-600">
                        Rows allotted: <strong>{data.length}</strong>
                    </div>

                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-50 text-sm font-medium transition-colors"
                    >
                        {refreshing ? 'Refreshing...' : 'Please Refresh allotments'}
                    </button>

                    <button
                        onClick={() => signOut()}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {loading ? (
                    <div className="p-10 text-center text-gray-500">Loading entitlements...</div>
                ) : (
                    <AllotmentTable initialData={data} onDataChange={fetchData} />
                )}
            </main>
        </div>
    );
}
