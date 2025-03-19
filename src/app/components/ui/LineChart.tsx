"use client";

import { useState, useEffect } from 'react';
import { format, isThisMonth, isThisWeek, subDays, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { id } from 'date-fns/locale';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';

// Definisi tipe untuk aktivitas lari
type RunningActivity = {
    id: number;
    activity_date: string;
    distance_km: number;
    run_type: string;
    duration_minutes: number;
    elevation_gain?: number;
    avg_pace?: string;
    steps?: number;
};

// Props untuk komponen
type RunningChartProps = {
    runnerId: string;
    className?: string;
};

export default function RunningActivityChart({ runnerId, className = '' }: RunningChartProps) {
    // State untuk menyimpan data aktivitas
    const [activities, setActivities] = useState<RunningActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'week' | 'month'>('week');
    const [maxDistance, setMaxDistance] = useState(5); // Default max 5 km
    const [selectedActivity, setSelectedActivity] = useState<RunningActivity | null>(null);
    const [dateRange, setDateRange] = useState<string>('');

    // Data dummy untuk simulasi
    const dummyActivities: RunningActivity[] = [
        {
            id: 1,
            activity_date: subDays(new Date(), 6).toISOString(),
            distance_km: 3.5,
            run_type: 'Easy Run',
            duration_minutes: 25,
            elevation_gain: 45,
            avg_pace: '7:10',
            steps: 4500,
        },
        {
            id: 2,
            activity_date: subDays(new Date(), 5).toISOString(),
            distance_km: 5.2,
            run_type: 'Tempo Run',
            duration_minutes: 35,
            elevation_gain: 78,
            avg_pace: '6:45',
            steps: 6700,
        },
        {
            id: 3,
            activity_date: subDays(new Date(), 3).toISOString(),
            distance_km: 2.1,
            run_type: 'Recovery Run',
            duration_minutes: 15,
            elevation_gain: 15,
            avg_pace: '7:30',
            steps: 2700,
        },
        {
            id: 4,
            activity_date: subDays(new Date(), 2).toISOString(),
            distance_km: 8.4,
            run_type: 'Long Run',
            duration_minutes: 55,
            elevation_gain: 120,
            avg_pace: '6:35',
            steps: 10800,
        },
        {
            id: 5,
            activity_date: subDays(new Date(), 1).toISOString(),
            distance_km: 4.7,
            run_type: 'Easy Run',
            duration_minutes: 30,
            elevation_gain: 65,
            avg_pace: '6:25',
            steps: 6000,
        },
        {
            id: 6,
            activity_date: new Date().toISOString(),
            distance_km: 10.5,
            run_type: 'Long Run',
            duration_minutes: 70,
            elevation_gain: 156,
            avg_pace: '6:40',
            steps: 13500,
        },
    ];

    // Simulasi pengambilan data dari backend
    useEffect(() => {
        const fetchActivities = async () => {
            try {
                setLoading(true);

                // Dalam implementasi nyata, ini akan mengambil data dari Supabase
                // const { data, error } = await supabase
                //   .from('running_activities')
                //   .select('*')
                //   .eq('runner_id', runnerId)
                //   .order('activity_date', { ascending: true });

                // Simulasi delay network
                await new Promise(resolve => setTimeout(resolve, 500));

                // Gunakan data dummy
                const data = dummyActivities;

                // Filter data berdasarkan week/month
                const filteredData = data.filter(activity => {
                    const activityDate = parseISO(activity.activity_date);
                    return filter === 'week'
                        ? isThisWeek(activityDate)
                        : isThisMonth(activityDate);
                });

                // Cari jarak maksimum untuk skala sumbu X
                const maxDist = Math.max(...filteredData.map(a => a.distance_km));
                // Bulatkan ke atas ke nilai 5km terdekat (5, 10, 15, dll.)
                const roundedMax = Math.ceil(maxDist / 5) * 5;
                setMaxDistance(roundedMax > 0 ? roundedMax : 5);

                // Set aktivitas terbaru sebagai yang terpilih secara default
                if (filteredData.length > 0) {
                    setSelectedActivity(filteredData[filteredData.length - 1]);
                } else {
                    setSelectedActivity(null);
                }

                // Set date range
                if (filter === 'week') {
                    const today = new Date();
                    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
                    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
                    setDateRange(`${format(weekStart, 'MMM d', { locale: id })} - ${format(weekEnd, 'MMM d, yyyy', { locale: id })}`);
                } else {
                    setDateRange(format(new Date(), 'MMMM yyyy', { locale: id }));
                }

                setActivities(filteredData);
            } catch (err: any) {
                console.error('Error fetching activities:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [runnerId, filter]);

    // Data untuk grafik dengan format yang sesuai
    const chartData = activities.map(activity => ({
        date: format(parseISO(activity.activity_date), 'dd MMM', { locale: id }),
        month: format(parseISO(activity.activity_date), 'MMM', { locale: id }).toUpperCase(),
        distance: activity.distance_km,
        runType: activity.run_type,
        duration: activity.duration_minutes,
        elevation: activity.elevation_gain || 0,
        pace: activity.avg_pace || '0:00',
        steps: activity.steps || 0,
        originalData: activity, // Menyimpan data asli untuk digunakan saat klik
    }));

    // Handle perubahan filter
    const handleFilterChange = (newFilter: 'week' | 'month') => {
        setFilter(newFilter);
    };

    // Handle klik pada dot grafik
    const handleDotClick = (data: any) => {
        if (data && data.payload) {
            setSelectedActivity(data.payload.originalData);
        }
    };

    // Fungsi untuk memformat durasi ke format jam:menit:detik
    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const secs = Math.floor(Math.random() * 60); // Simulasi detik

        return `${hours > 0 ? `${hours}j ` : ''}${mins}m ${secs}s`;
    };

    // Custom tooltip untuk grafik
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-black/80 p-2 rounded border border-[#333] text-xs">
                    <p className="text-white font-medium">{data.date}</p>
                    <p className="text-[#cad96b]">{data.distance} km - {data.runType}</p>
                </div>
            );
        }
        return null;
    };

    // Fungsi bantu untuk menghasilkan label sumbu Y
    const renderYAxisTicks = () => {
        const ticks = [];
        const step = maxDistance / 2;

        for (let i = 0; i <= 2; i++) {
            ticks.push(i * step);
        }

        return ticks;
    };

    // Tampilan loading
    if (loading) {
        return <div className="flex justify-center items-center h-60">Loading chart data...</div>;
    }

    // Tampilan error
    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    return (
        <div className={`p-2 bg-black bg-opacity-90 backdrop-blur-sm rounded-xl ${className}`}>
            {/* Rangkuman & Rentang Tanggal */}
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-white">Running Activity Chart</h2>
            </div>

            {/* Statistik Utama */}
            {selectedActivity && (
                <div className="grid grid-cols-3 mb-6">
                    <div>
                        <p className="text-gray-400 text-sm">Distance</p>
                        <p className="text-white text-xl font-bold">{selectedActivity.distance_km.toFixed(2)} km</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Time</p>
                        <p className="text-white text-xl font-bold">{formatDuration(selectedActivity.duration_minutes)}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Elevation Gain</p>
                        <p className="text-white text-xl font-bold">{selectedActivity.elevation_gain} m</p>
                    </div>
                </div>
            )}

            {chartData.length > 0 ? (
                <>
                    <div className="h-80 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{ top: 5, right: -5, left: 0, bottom: 5 }}
                                onClick={handleDotClick}
                            >
                                <defs>
                                    <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#cad96b" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#cad96b" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                {/* Grid horizontal lines */}
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    strokeWidth={2}
                                    stroke="#444"
                                    horizontal={true}
                                    vertical={false}
                                />
                                {/* Month labels at the bottom */}
                                <XAxis
                                    dataKey="month"
                                    stroke="#fff"
                                    tick={{ fill: '#fff', fontSize: 16 }}
                                    tickLine={false}
                                    axisLine={{ stroke: '#444', strokeWidth: 4 }}
                                    interval={0}
                                    orientation="bottom"
                                    padding={{ left: 10, right: 10 }}
                                />
                                {/* Distance units on the right */}
                                <YAxis
                                    domain={[0, maxDistance]}
                                    stroke="#fff"
                                    tick={{ fill: '#fff', fontSize: 14 }}
                                    ticks={renderYAxisTicks()}
                                    tickFormatter={(value) => `${value} km`}
                                    tickLine={false}
                                    orientation="right"
                                    axisLine={false}
                                    minTickGap={20}
                                    width={60}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="distance"
                                    stroke="#cad96b"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorDistance)"
                                    activeDot={{
                                        r: 8,
                                        fill: '#cad96b',
                                        stroke: '#fff',
                                        strokeWidth: 2,
                                        onClick: handleDotClick
                                    }}
                                    dot={{
                                        r: 5,
                                        fill: '#cad96b',
                                        stroke: '#000',
                                        strokeWidth: 1
                                    }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex justify-center mt-2">
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleFilterChange('week')}
                                className={`px-3 py-1 rounded-full text-sm ${filter === 'week'
                                    ? 'bg-[#cad96b] text-black font-medium'
                                    : 'bg-gray-700 text-white'
                                    }`}
                            >
                                Minggu Ini
                            </button>
                            <button
                                onClick={() => handleFilterChange('month')}
                                className={`px-3 py-1 rounded-full text-sm ${filter === 'month'
                                    ? 'bg-[#cad96b] text-black font-medium'
                                    : 'bg-gray-700 text-white'
                                    }`}
                            >
                                Bulan Ini
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex justify-center items-center h-60 text-gray-400">
                    Tidak ada data aktivitas untuk periode ini
                </div>
            )}
        </div>
    );
} 