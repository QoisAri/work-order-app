// app/admin/components/AdminDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link'; // Impor Link
import { createClient } from '@/utils/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CheckCircle, Clock, XCircle, FileText } from 'lucide-react';

// Tipe data untuk statistik dan chart
type Stats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

type ChartData = {
  date: string;
  count: number;
};

const COLORS = ['#FFBB28', '#00C49F', '#FF8042']; // Pending, Approved, Rejected

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pieChartData = [
    { name: 'Pending', value: stats.pending },
    { name: 'Approved', value: stats.approved },
    { name: 'Rejected', value: stats.rejected },
  ];

  useEffect(() => {
    const supabase = createClient();

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      const { data: statsData, error: statsError } = await supabase.rpc('get_work_order_stats');
      const { data: dailyData, error: dailyError } = await supabase.rpc('get_daily_work_orders');

      if (statsError || dailyError) {
        console.error('Error fetching dashboard data:', statsError || dailyError);
        setError('Gagal memuat data dasbor.');
        setStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
        setChartData([]);
      } else {
        setStats(statsData[0]);
        setChartData(dailyData.map((d: any) => ({
          date: new Date(d.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
          count: d.count,
        })));
      }
      setIsLoading(false);
    };

    fetchData();

    const channel = supabase
      .channel('work_orders_dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'work_orders' }, (payload) => {
        console.log('Perubahan terdeteksi, memuat ulang data:', payload);
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading) {
    return <div className="text-center p-10">Memuat data dasbor...</div>;
  }
  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-8">
      {/* PERBAIKAN: Menambahkan query parameter ke href */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard href="/admin?status=pending" icon={FileText} title="Total Work Orders" value={stats.total} color="bg-blue-500" />
        <StatCard href="/admin?status=pending" icon={Clock} title="Pending" value={stats.pending} color="bg-yellow-500" />
        <StatCard href="/admin?status=approved" icon={CheckCircle} title="Approved" value={stats.approved} color="bg-green-500" />
        <StatCard href="/admin?status=rejected" icon={XCircle} title="Rejected" value={stats.rejected} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Work Orders Dibuat (7 Hari Terakhir)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#6B7280' }} />
              <YAxis allowDecimals={false} tick={{ fill: '#6B7280' }} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(5px)',
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.75rem',
                }}
              />
              <Legend />
              <Bar dataKey="count" name="Work Orders" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Distribusi Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }: { name: string, percent?: number }) => {
                  if (percent === undefined) return '';
                  return `${name} ${(percent * 100).toFixed(0)}%`;
                }}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Komponen StatCard sekarang menerima prop 'href'
function StatCard({ href, icon: Icon, title, value, color }: { href: string, icon: React.ElementType, title: string, value: number, color: string }) {
  return (
    <Link href={href}>
      <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center space-x-4 cursor-pointer">
        <div className={`p-3 rounded-full text-white ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </Link>
  );
}
