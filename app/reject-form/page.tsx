import { Suspense } from 'react';
import RejectFormComponent from './RejectFormComponent';

function LoadingFallback() {
    return (
        <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-xl animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-24 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-300 rounded w-full mt-6"></div>
        </div>
    )
}

export default function RejectFormPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <Suspense fallback={<LoadingFallback />}>
        <RejectFormComponent />
      </Suspense>
    </main>
  );
}