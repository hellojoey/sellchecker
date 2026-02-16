import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">404</h1>
        <p className="text-lg text-gray-600 mb-6">
          This page doesn&apos;t exist — but your next best seller might.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/search"
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition text-center"
          >
            Start searching
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto text-sm text-gray-500 hover:text-gray-700 font-medium px-6 py-3 transition text-center"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
