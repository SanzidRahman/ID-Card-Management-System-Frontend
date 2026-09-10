'use client';

import Link from 'next/link';
import { useAuth } from '../providers/AuthProvider';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
              ID
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              IDPass Manager
            </span>
          </div>
          <nav className="flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500 hover:shadow-blue-500/35 transition-all"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all"
                >
                  Create Account
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-300 backdrop-blur-md mb-8">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Production-Ready ID Card Creator
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent leading-tight">
          Manage Organizations & Generate ID Cards Dynamically
        </h1>
        
        <p className="text-lg text-slate-400 mb-10 max-w-2xl leading-relaxed">
          Create custom ID card templates, define dynamic field schemas, import member list databases via CSV, and export high-resolution PDFs or print in bulk.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm mb-16">
          {user ? (
            <Link
              href="/dashboard"
              className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500 hover:shadow-blue-500/35 hover:-translate-y-0.5 transition-all text-center"
            >
              Access Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500 hover:shadow-blue-500/35 hover:-translate-y-0.5 transition-all text-center"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="flex-1 rounded-xl bg-slate-900 border border-slate-800 py-3 font-semibold text-slate-300 hover:bg-slate-800 hover:text-white hover:-translate-y-0.5 transition-all text-center"
              >
                Sign In Admin
              </Link>
            </>
          )}
        </div>

        {/* Feature Grid */}
        <div className="grid sm:grid-cols-3 gap-6 w-full text-left">
          <div className="rounded-2xl border border-slate-900 bg-slate-900/30 p-6 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 font-bold text-lg">📁</div>
            <h3 className="font-semibold text-slate-100 mb-2">Dynamic Field Schemas</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Define custom properties dynamically per catalog without modifying code or schemas.</p>
          </div>
          <div className="rounded-2xl border border-slate-900 bg-slate-900/30 p-6 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 font-bold text-lg">🎨</div>
            <h3 className="font-semibold text-slate-100 mb-2">Visual Card Designer</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Drag-and-drop coordinates, fonts, shapes, and barcodes on a front & back canvas layout editor.</p>
          </div>
          <div className="rounded-2xl border border-slate-900 bg-slate-900/30 p-6 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 font-bold text-lg">⚙️</div>
            <h3 className="font-semibold text-slate-100 mb-2">Bulk Generating & Export</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Select records, replace dynamic tags, print instantly, or download a bulk PDF bundle.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} IDPass Manager. All rights reserved.
      </footer>
    </div>
  );
}
