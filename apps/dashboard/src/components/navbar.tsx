"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/50 bg-black/80 backdrop-blur-md"
    >
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold">
            <span className="text-white">Crowd</span>
            <span className="text-sky-500">Sense</span>
          </span>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/dashboard"
            className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium"
          >
            Dashboard
          </Link>
          <Link
            href="/live-map"
            className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium"
          >
            Live Map
          </Link>
          <Link
            href="/analytics"
            className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium"
          >
            Analytics
          </Link>
          <Link
            href="/alerts"
            className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium"
          >
            Alerts
          </Link>
          <Link
            href="/reports"
            className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium"
          >
            Reports
          </Link>
          <div className="text-sm text-sky-400 font-medium">
            <span className="text-green-500">●</span> 3 feeds live
          </div>
        </nav>

        {/* Right Side Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/auth"
            className="hidden sm:inline-flex px-5 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors duration-200 text-sm font-medium"
          >
            Sign in
          </Link>
          <Link
            href="/auth"
            className="inline-flex px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-colors duration-200 text-sm font-medium shadow-lg shadow-sky-600/25"
          >
            Get access
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
