// app/dashboard/history/FormattedDate.tsx
'use client';

import { useState, useEffect } from 'react';

type Props = {
  dateString: string;
};

export default function FormattedDate({ dateString }: Props) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    // Formatting ini hanya akan berjalan di sisi klien setelah komponen dimuat
    const date = new Date(dateString);
    setFormattedDate(
      date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    );
  }, [dateString]); // Jalankan ulang jika dateString berubah

  // Tampilkan string kosong atau placeholder saat render di server atau render awal klien
  if (!formattedDate) {
    return null; // atau <span>Memuat...</span>
  }

  return <>{formattedDate}</>;
}