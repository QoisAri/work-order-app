'use client';

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

type WorkOrderStatus = 'pending' | 'approved' | 'rejected';
type TimeRange = 'day' | 'week' | 'month' | 'year'; // Tipe data untuk filter waktu

export default function DashboardPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('month'); // State untuk filter, default 'Bulan Ini'
  
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

  // useCallback digunakan agar fungsi tidak dibuat ulang setiap render, kecuali timeRange berubah
  const fetchWorkOrderStats = useCallback(async () => {
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
    
    // Query ke Supabase dengan filter tanggal
    const { data, error } = await supabase
      .from('work_orders')
      .select('status')
      .gte('created_at', startDate.toISOString()); // Filter data yang dibuat setelah tanggal mulai

    if (error) {
      console.error("Error fetching work order stats:", error);
      return;
    }

    const counts = { pending: 0, approved: 0, rejected: 0 };
    data.forEach(item => {
        if(item.status && counts.hasOwnProperty(item.status)) {
            counts[item.status as WorkOrderStatus]++;
        }
    });

    setChartData(prevData => ({
      ...prevData,
      datasets: [{ ...prevData.datasets[0], data: [counts.pending, counts.approved, counts.rejected] }],
    }));
  }, [timeRange]); // Fungsi ini akan diperbarui jika timeRange berubah

  useEffect(() => {
    const storedUserInfo = sessionStorage.getItem('workOrderUserInfo');
    if (storedUserInfo) {
      setUserName(JSON.parse(storedUserInfo).nama);
    }

    // Panggil fungsi fetch saat komponen dimuat dan setiap kali filternya berubah
    fetchWorkOrderStats();

    const channel = supabase.channel('work_orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'work_orders' }, 
        () => {
          console.log('Perubahan terdeteksi, mengambil ulang data...');
          fetchWorkOrderStats(); // Ambil ulang data dengan filter yang sedang aktif
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchWorkOrderStats]); // useEffect ini bergantung pada fungsi fetchWorkOrderStats

  if (!userName) {
    return (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
            {/* ... fallback UI ... */}
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
    <div className="w-full space-y-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="mt-2 text-lg text-gray-600">Selamat datang, <strong>{userName}</strong>!</p>
        <p className="mt-4">Silakan lanjutkan proses pembuatan Work Order Anda.</p>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Ringkasan Work Order</h2>
        
        {/* Tombol Filter Waktu */}
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

        {/* Container Grafik */}
        <div style={{ position: 'relative', height: '350px', width: '350px', margin: 'auto' }}>
            <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
}