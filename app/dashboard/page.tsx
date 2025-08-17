// app/dashboard/page.tsx

// Komponen ini sekarang akan menjadi halaman "landing" untuk dashboard.
// Kita akan membuatnya menampilkan pesan sederhana.
export default function DashboardPage() {
  return (
    <div className="flex items-center justify-center h-full bg-white p-8 rounded-lg shadow-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">Selamat Datang!</h1>
        <p className="mt-2 text-gray-600">
          Silakan memebuat work order baru di samping untuk melanjutkan
        </p>
      </div>
    </div>
  );
}
