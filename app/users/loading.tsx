import SkeletonTable from "@/components/SkeletonTable";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
        <div className="mt-1 h-4 w-64 animate-pulse rounded bg-gray-100" />
      </div>
      <SkeletonTable />
    </div>
  );
}
