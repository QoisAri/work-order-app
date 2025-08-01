import Sidebar from "./components/sidebar"; // Kita akan buat komponen ini selanjutnya

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar akan berada di sebelah kiri */}
      <Sidebar />
      
      {/* Konten utama (halaman dashboard) akan berada di sebelah kanan */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}