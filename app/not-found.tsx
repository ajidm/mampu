import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-6xl font-bold text-gray-200">404</p>
      <h1 className="mt-4 text-xl font-semibold text-gray-800">User not found</h1>
      <p className="mt-2 text-sm text-gray-500">
        The user you&apos;re looking for doesn&apos;t exist or the ID is invalid.
      </p>
      <Link
        href="/users"
        className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        ← Back to list
      </Link>
    </div>
  );
}
