import ChatInterface from '@/components/ChatInterface';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              D
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">DiaVela</h1>
              <p className="text-xs text-gray-500">AI Diabetes Care Assistant</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors flex items-center gap-1"
            >
              📊 Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Chat area */}
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 py-6">
        <div
          className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden"
          style={{ minHeight: '600px', maxHeight: 'calc(100vh - 160px)' }}
        >
          <ChatInterface />
        </div>
      </main>
    </div>
  );
}
