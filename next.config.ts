/** @type {import('next').NextConfig} */
const nextConfig = {
  // --- TAMBAHKAN BLOK INI UNTUK MENONAKTIFKAN ESLINT SAAT BUILD ---
  eslint: {
    // Warning: Ini akan membuat build berhasil meskipun proyek Anda punya error ESLint.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;