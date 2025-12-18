'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold mb-4">Error</h1>
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-gray-400 mb-8">Please try again or go back home</p>
        
        <div className="flex flex-col gap-4">
          <button onClick={reset} className="px-8 py-3 bg-white text-black rounded-full font-bold">
            Try Again
          </button>
          <a href="/" className="px-8 py-3 bg-gray-800 text-white rounded-full font-bold">
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}