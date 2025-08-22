// app/login/page.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';

// Komponen Ikon sederhana untuk ilustrasi
const IconLock = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const IconClipboard = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);


export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);

  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN') {
      router.refresh();
    }
  });

  return (
    <main className="flex w-full flex-col lg:flex-row bg-white">
      
      {/* Panel Kiri (Branding & Ilustrasi) */}
      <div className={`
        flex items-center justify-center p-12 text-white relative overflow-hidden
        bg-gradient-to-tr from-blue-800 to-indigo-600
        transition-all duration-700 ease-in-out
        w-full min-h-screen
        ${showLogin ? 'lg:w-1/2' : 'lg:w-full'}
      `}>
        <div className="z-10 w-full max-w-md text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                Work Order Management System
            </h1>
            <p className="text-lg text-blue-200 mb-8">
                Kelola dan lacak semua work order Anda dengan mudah, efisien, dan terstruktur.
            </p>
            
            <button
              onClick={() => setShowLogin(true)}
              className={`
                hidden lg:inline-flex items-center justify-center px-8 py-3 
                font-bold text-lg text-indigo-600 bg-white rounded-lg 
                hover:bg-gray-200 transition-all duration-300 transform hover:scale-105
                ${showLogin ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}
              `}
            >
              Ayo Login
            </button>
            
            <a
              href="#login-form"
              className="lg:hidden inline-flex items-center justify-center px-8 py-3 font-bold text-lg text-indigo-600 bg-white rounded-lg hover:bg-gray-200 transition-colors"
            >
              Lanjut Login
            </a>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/4 -translate-y-1/4"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/4 translate-y-1/4"></div>
      </div>

      {/* Panel Kanan (Form Login) */}
      <div 
        id="login-form" 
        className={`
          flex items-center justify-center transition-all duration-700 ease-in-out 
          w-full bg-white min-h-screen lg:min-h-0
          ${showLogin ? 'lg:w-1/2 p-6 sm:p-12' : 'lg:w-0 lg:p-0'}
        `}
      >
        {/*
          PERBAIKAN DI SINI:
          - `opacity-100` akan membuat form selalu terlihat di mobile.
          - `lg:opacity-0` akan menimpanya di desktop jika `showLogin` false.
        */}
        <div className={`w-full max-w-sm transition-opacity duration-300 opacity-100 ${showLogin ? 'lg:opacity-100 lg:delay-500' : 'lg:opacity-0'}`}>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Selamat Datang Kembali</h2>
            <p className="text-gray-600 mb-8">Silakan masuk untuk melanjutkan.</p>
            
            <Auth
                supabaseClient={supabase}
                appearance={{
                    theme: ThemeSupa,
                    variables: {
                        default: {
                            colors: { brand: '#2563eb', brandAccent: '#1d4ed8' },
                            radii: { buttonBorderRadius: '8px', inputBorderRadius: '8px' }
                        },
                    },
                }}
                providers={[]}
                redirectTo={`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`}
                localization={{
                    variables: {
                        sign_in: { email_label: 'Alamat Email', password_label: 'Kata Sandi', button_label: 'Masuk' },
                    },
                }}
            />
        </div>
      </div>
    </main>
  );
}