export default function ApprovalRejected() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="text-center bg-white p-10 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-red-600">Berhasil!</h1>
        <p className="mt-4 text-gray-700">Work Order telah berhasil ditolak dan notifikasi telah dikirim ke pemohon.</p>
      </div>
    </main>
  );
}