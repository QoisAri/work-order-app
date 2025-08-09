import { Suspense } from "react";
import WorkOrderDetail from "./WorkOrderDetail";

function LoadingSkeleton() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-40 bg-gray-200 rounded mt-4"></div>
            <div className="flex space-x-4 mt-6">
                <div className="h-10 w-24 bg-gray-300 rounded"></div>
                <div className="h-10 w-24 bg-gray-300 rounded"></div>
            </div>
        </div>
    );
}

export default function WorkOrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <WorkOrderDetail id={params.id} />
    </Suspense>
  );
}