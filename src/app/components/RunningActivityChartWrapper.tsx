"use client";

import { Suspense, useEffect, useState } from 'react';
import RunningActivityChart from './ui/LineChart';
import { RunningActivity } from '@/app/actions/runningData';

// Komponen loading untuk chart
function ChartSkeleton() {
    return (
        <div className="p-2 bg-black bg-opacity-90 backdrop-blur-sm rounded-xl animate-pulse">
            <div className="h-60 bg-gray-800 rounded"></div>
        </div>
    );
}

// Wrapper component (Client) untuk RunningActivityChart
export default function RunningActivityChartWrapper({
    runnerId,
    timeRange = 'week'
}: {
    runnerId: number;
    timeRange?: 'week' | 'month';
}) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<RunningActivity[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                // Fetch dari API endpoint
                const response = await fetch(`/api/running-activities?runnerId=${runnerId}&timeRange=${timeRange}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.error) {
                    throw new Error(result.error.message || 'Terjadi kesalahan saat mengambil data');
                }

                setData(result.data || []);
            } catch (err: any) {
                console.error('Error fetching activities:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [runnerId, timeRange]);

    if (loading) {
        return <ChartSkeleton />;
    }

    if (error) {
        return (
            <div className="text-red-500 p-4 bg-red-900/20 rounded-lg">
                Terjadi kesalahan saat mengambil data: {error}
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="p-4 bg-black bg-opacity-80 text-white rounded-lg">
                Tidak ada data aktivitas pada periode {timeRange === 'week' ? 'minggu' : 'bulan'} ini.
            </div>
        );
    }

    return (
        <RunningActivityChart
            runnerId={runnerId}
            initialData={data}
        />
    );
} 