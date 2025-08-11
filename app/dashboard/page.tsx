'use client';

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client"; // Gunakan client dari ssr utils
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import Link from "next/link";

ChartJS.register(ArcElement, Tooltip, Legend);

type WorkOrderStatus = 'pending' | 'approved' | 'rejected';
type TimeRange = 'day' | 'week' | 'month' | 'year';

export default function DashboardPage() {
  // State untuk data pengguna
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // State untuk loading
  const [error, setError] = useState<string | null>(null); // State untuk error

  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [chartData, setChartData] = useState({
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [
      {
        label: '# of Work Orders',
        data: [0, 0, 0],
        backgroundColor: ['rgba(255, 159, 64, 0.5)', 'rgba(75, 192, 192, 0.5)', 'rgba(255, 99, 132, 0.5)'],
        borderColor: ['rgba(255, 159, 64, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  });

  const supabase = createClient(); // Buat instance supabase client

  const fetchWorkOrderStats = useCallback(async () => {
    // ... (logika fetchWorkOrderStats Anda tidak perlu diubah)
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        const firstDayOfWeek = now.getDate() - now.getDay();
        startDate = new Date(now.getFullYear(), now.getMonth(), firstDayOfWeek);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    const { data, error } = await supabase
      .from('work_orders')
      .select('status')
      .gte('created_at', startDate.toISOString());

    if (error) {
      console.error("Error fetching work order stats:", error);
      return;
    }

    const counts: { [key in WorkOrderStatus]: number } = { pending: 0, approved: 0, rejected: 0 };
    data.forEach(item => {
        if(item.status && counts.hasOwnProperty(item.status)) {
            counts[item.status as WorkOrderStatus]++;
        }
    });

    setChartData(prevData => ({
      ...prevData,
      datasets: [{ ...prevData.datasets[0], data: [counts.pending, counts.approved, counts.rejected] }],
    }));
  }, [timeRange, supabase]);

  // useEffect untuk mengambil data user dan statistik
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      // 1. Ambil data user yang sedang login
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Gagal mengambil data pengguna. Silakan coba login kembali.");
        setIsLoading(false);
        return;
      }

      // 2. Ambil nama dari tabel 'profiles'
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      
      if (profileError || !profileData) {
        setError("Gagal mengambil profil pengguna.");
        setIsLoading(false);
        return;
      }

      setUserName(profileData.full_name);
      
      // 3. Ambil statistik work order
      await fetchWorkOrderStats();

      setIsLoading(false);
    };

    fetchData();

    // Setup real-time subscription
    const channel = supabase.channel('work_orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'work_orders' },
        () => {
          console.log('Perubahan terdeteksi, mengambil ulang data...');
          fetchWorkOrderStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchWorkOrderStats, supabase]);

  // Tampilan saat loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Memuat Dashboard...</p>
      </div>
    );
  }

  // Tampilan jika ada error
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-100">
        <p className="text-xl text-red-700">{error}</p>
      </div>
    );
  }
  
  const filterButtons = [
      { label: 'Hari Ini', value: 'day' },
      { label: 'Minggu Ini', value: 'week' },
      { label: 'Bulan Ini', value: 'month' },
      { label: 'Tahun Ini', value: 'year' },
  ];

  return (
    <div className="w-full p-4 md:p-8 space-y-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="mt-2 text-lg text-gray-600">Selamat datang, <strong>{userName}</strong>!</p>
        <Link href="/create-work-order" className="mt-4 inline-block bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 transition-colors">
            Buat Work Order Baru
        </Link>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Ringkasan Work Order</h2>
        
        <div className="flex justify-center space-x-2 mb-6">
            {filterButtons.map(btn => (
                <button
                    key={btn.value}
                    onClick={() => setTimeRange(btn.value as TimeRange)}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                        timeRange === btn.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    {btn.label}
                </button>
            ))}
        </div>

        <div style={{ position: 'relative', height: '350px', width: '350px', margin: 'auto' }}>
            <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
}
