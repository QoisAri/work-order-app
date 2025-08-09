/** @type {import('tailwindcss').Config} */

// Pilih sintaks yang sesuai dengan proyek Anda:

// OPSI A: Untuk file .js (dengan "type": "module") atau .mjs
export default {
  darkMode: "class", // Mengaktifkan mode gelap berbasis class
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
      },
      fontFamily: {
        // Asumsi Anda mendefinisikan --font-geist-sans di layout.tsx
        sans: ['var(--font-geist-sans)'], 
        mono: ['var(--font-geist-mono)'],
      },
    },
  },
  plugins: [],
};

// OPSI B: Untuk file .cjs
// module.exports = {
//   ... (isi yang sama seperti di atas) ...
// };