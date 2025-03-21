"use client";

import { useState, useEffect, useMemo } from 'react';
import { format, isThisMonth, isThisWeek, parseISO, startOfWeek, endOfWeek, getDaysInMonth, addDays, parse, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
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
import { RunningActivity } from '@/app/actions/runningData';

// Props untuk komponen
type RunningChartProps = {
    runnerId: string | number;
    initialData?: RunningActivity[];
    className?: string;
};

export default function RunningActivityChart({ runnerId, initialData = [], className = '' }: RunningChartProps) {
    // State untuk menyimpan data aktivitas
    const [activities, setActivities] = useState<RunningActivity[]>(initialData);
    const [loading, setLoading] = useState(initialData.length === 0);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'week' | 'month'>('week');
    const [maxDistance, setMaxDistance] = useState(5); // Default max 5 km
    const [selectedActivity, setSelectedActivity] = useState<RunningActivity | null>(
        initialData.length > 0 ? initialData[initialData.length - 1] : null
    );
    const [dateRange, setDateRange] = useState<string>('');
    const [summaryData, setSummaryData] = useState<{
        totalDistance: number;
        totalDuration: number;
        totalElevation: number;
    }>({ totalDistance: 0, totalDuration: 0, totalElevation: 0 });
    const [isShowingSummary, setIsShowingSummary] = useState(true);

    // Fetch data dari API
    useEffect(() => {
        const fetchActivities = async () => {
            if (initialData.length > 0) {
                processData(initialData);
                return;
            }

            try {
                setLoading(true);

                // Fetch dari API endpoint
                const response = await fetch(`/api/running-activities?runnerId=${runnerId}&timeRange=${filter}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.error) {
                    throw new Error(result.error.message || 'Terjadi kesalahan saat mengambil data');
                }

                processData(result.data || []);
            } catch (err: any) {
                console.error('Error fetching activities:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [runnerId, filter, initialData]);

    // Fungsi untuk memproses data yang diterima
    const processData = (data: RunningActivity[]) => {
        // Cari jarak maksimum untuk skala sumbu Y
        if (data.length > 0) {
            const maxDist = Math.max(...data.map(a => a.distance_km));
            // Bulatkan ke atas ke nilai 5km terdekat (5, 10, 15, dll.)
            const roundedMax = Math.ceil(maxDist / 5) * 5;
            setMaxDistance(roundedMax > 0 ? roundedMax : 5);
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

        setActivities(data);
        calculateSummary(data);
        setIsShowingSummary(true);
    };

    // Hitung summary data
    const calculateSummary = (data: RunningActivity[]) => {
        const totalDistance = data.reduce((sum, activity) => sum + activity.distance_km, 0);
        const totalDuration = data.reduce((sum, activity) => sum + activity.duration_minutes, 0);
        const totalElevation = data.reduce((sum, activity) => sum + (activity.elevation_gain || 0), 0);

        setSummaryData({
            totalDistance,
            totalDuration,
            totalElevation
        });
    };

    // Generate chart data dengan tanggal lengkap
    const chartData = useMemo(() => {
        const today = new Date();
        let dateInterval: Date[];

        if (filter === 'week') {
            const weekStart = startOfWeek(today, { weekStartsOn: 1 });
            const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
            dateInterval = eachDayOfInterval({ start: weekStart, end: weekEnd });
        } else {
            const monthStart = startOfMonth(today);
            const monthEnd = endOfMonth(today);
            dateInterval = eachDayOfInterval({ start: monthStart, end: monthEnd });
        }

        // Generate data awal untuk semua tanggal
        const allDaysData = dateInterval.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const activity = activities.find(a => a.activity_date.startsWith(dateStr));

            // Untuk kedua mode, tampilkan hanya tanggal
            const dateDisplay = format(date, 'd', { locale: id });

            // Jika tidak ada aktivitas, tetap kembalikan data dengan distance 0
            return {
                date: dateDisplay,
                fullDate: dateStr,
                actualDate: date,
                // Tambahkan nama hari untuk tooltip
                dayName: format(date, 'EEE', { locale: id }),
                // Tambahkan label tanggal lengkap untuk X-axis tooltip
                fullDateLabel: format(date, 'd MMM', { locale: id }),
                month: format(date, 'MMM', { locale: id }).toUpperCase(),
                distance: activity ? activity.distance_km : 0,
                // Nilai khusus untuk menampilkan dot pada chart
                // Ini memungkinkan kita tetap menampilkan garis tapi tanpa dot untuk nilai 0
                displayDistance: activity ? activity.distance_km : null,
                runType: activity ? activity.run_type : null,
                duration: activity ? activity.duration_minutes : 0,
                elevation: activity ? (activity.elevation_gain || 0) : 0,
                pace: activity ? (activity.avg_pace || '0:00') : '0:00',
                steps: activity ? (activity.steps || 0) : 0,
                originalData: activity || null,
            };
        });

        // Jika dalam mode minggu, kembalikan data lengkap
        if (filter === 'week') {
            return allDaysData;
        }

        // Untuk mode bulan, optimasi titik data kosong
        // - Selalu tampilkan titik data dengan aktivitas
        // - Tampilkan tanggal 1 dan kelipatan 5 (1,5,10,15,20,25,30)
        // - Tampilkan tanggal terakhir bulan
        // - Untuk tanggal kosong yang berdekatan, tampilkan hanya 1 dari setiap 3
        const optimizedMonthData = [];

        for (let i = 0; i < allDaysData.length; i++) {
            const item = allDaysData[i];
            const date = item.actualDate.getDate();

            // Selalu tampilkan titik dengan aktivitas, tanggal 1, kelipatan 5, atau hari terakhir
            if (item.distance > 0 || date === 1 || date % 5 === 0 || i === allDaysData.length - 1) {
                optimizedMonthData.push(item);
                continue;
            }

            // Untuk tanggal kosong yang berurutan, tampilkan hanya 1 dari 3
            // Cek 3 hari ke depan (jika tersedia) untuk melihat apakah ada aktivitas
            const nextThreeDays = allDaysData.slice(i, i + 3);
            const hasActivityInNextThreeDays = nextThreeDays.some(day => day.distance > 0);

            if (!hasActivityInNextThreeDays && i % 3 === 0) {
                // Jika tidak ada aktivitas dalam 3 hari ke depan dan indeks bisa dibagi 3,
                // tampilkan titik ini sebagai representasi dari kelompok 3 hari
                optimizedMonthData.push(item);
            }
        }

        return optimizedMonthData;
    }, [activities, filter]);

    // Handle perubahan filter
    const handleFilterChange = (newFilter: 'week' | 'month') => {
        setFilter(newFilter);
        // Reset ke tampilan summary saat filter berubah
        setIsShowingSummary(true);
    };

    // Handle klik pada dot grafik
    const handleDotClick = (data: any) => {
        if (data && data.payload) {
            if (data.payload.originalData) {
                // Jika user mengklik dot dengan data aktivitas:
                // 1. Set aktivitas yang dipilih ke data yang diklik
                // 2. Ubah tampilan ke mode detail (bukan summary)
                setSelectedActivity(data.payload.originalData);
                setIsShowingSummary(false);
            } else {
                // Jika mengklik titik tanpa aktivitas:
                // Kembali ke tampilan summary (total dari filter aktif)
                setIsShowingSummary(true);
            }
        }
    };

    // Reset ke tampilan summary saat klik area kosong
    const handleChartClick = () => {
        // Kembali ke tampilan summary yang menunjukkan total
        // dalam rentang filter yang aktif (minggu/bulan)
        setIsShowingSummary(true);
    };

    // Fungsi untuk memformat durasi ke format jam:menit:detik
    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = Math.floor(minutes % 60);
        const secs = Math.floor((minutes % 1) * 60);

        return `${hours > 0 ? `${hours}j ` : ''}${mins}m ${secs}s`;
    };

    // Custom tooltip untuk grafik
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-black/80 p-2 rounded border border-[#333] text-xs">
                    <p className="text-white font-medium">{data.dayName}, {data.fullDateLabel}</p>
                    {data.distance > 0 ? (
                        <p className="text-[#cad96b]">{data.distance} km - {data.runType}</p>
                    ) : (
                        <p className="text-gray-400">Tidak ada aktivitas</p>
                    )}
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
                <p className="text-gray-400 text-sm">{dateRange}</p>
            </div>

            {/* 
                Statistik Utama:
                - Mode Summary: Menampilkan total dari semua aktivitas dalam rentang filter (minggu/bulan)
                - Mode Detail: Menampilkan data dari aktivitas spesifik yang diklik user
            */}
            <div className="grid grid-cols-3 mb-6">
                {/* Distance - Total atau Individual */}
                <div>
                    <p className="text-gray-400 text-sm">Distance</p>
                    <p className="text-white text-xl font-bold">
                        {isShowingSummary
                            ? `${summaryData.totalDistance.toFixed(2)} km` // Total jarak dari semua aktivitas dalam filter
                            : selectedActivity
                                ? `${selectedActivity.distance_km.toFixed(2)} km` // Jarak dari aktivitas yang dipilih
                                : '0.00 km'
                        }
                    </p>
                </div>
                {/* Time - Total atau Individual */}
                <div>
                    <p className="text-gray-400 text-sm">Time</p>
                    <p className="text-white text-xl font-bold">
                        {isShowingSummary
                            ? formatDuration(summaryData.totalDuration) // Total durasi dari semua aktivitas dalam filter
                            : selectedActivity
                                ? formatDuration(selectedActivity.duration_minutes) // Durasi dari aktivitas yang dipilih
                                : '0m 0s'
                        }
                    </p>
                </div>
                {/* Elevation Gain - Total atau Individual */}
                <div>
                    <p className="text-gray-400 text-sm">Elevation Gain</p>
                    <p className="text-white text-xl font-bold">
                        {isShowingSummary
                            ? `${summaryData.totalElevation} m` // Total elevasi dari semua aktivitas dalam filter
                            : selectedActivity
                                ? `${selectedActivity.elevation_gain} m` // Elevasi dari aktivitas yang dipilih
                                : '0 m'
                        }
                    </p>
                </div>
            </div>

            {chartData.length > 0 ? (
                <>
                    <div className="h-80 relative" onClick={handleChartClick}>
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
                                    dataKey="date"
                                    stroke="#fff"
                                    tick={{ fill: '#fff', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={{ stroke: '#444', strokeWidth: 4 }}
                                    interval={filter === 'week' ? 0 : 'equidistantPreserveStart'}
                                    orientation="bottom"
                                    padding={{ left: 10, right: 10 }}
                                    minTickGap={filter === 'week' ? 5 : 20}
                                    height={40}
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
                                    connectNulls
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