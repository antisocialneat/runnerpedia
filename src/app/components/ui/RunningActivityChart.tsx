'use server';

import { getRunningActivities } from '@/app/actions/runningData';
import LineChart from './LineChart';

export async function fetchRunnerActivityData(runnerId: number, timeRange: 'week' | 'month' = 'week') {
    // Ambil data aktivitas berdasarkan runner ID
    const { data, error } = await getRunningActivities(runnerId, timeRange);

    // Jika ada error, kembalikan error
    if (error) {
        return { data: null, error };
    }

    // Jika tidak ada data, kembalikan array kosong
    if (!data || data.length === 0) {
        return { data: [], error: null };
    }

    // Kembalikan data
    return { data, error: null };
} 