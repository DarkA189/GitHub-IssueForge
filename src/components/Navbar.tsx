// src/components/Navbar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, BarChart3, CircleDot, Zap, Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function Navbar() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-gray-900 dark:bg-gray-950 sticky top-0 z-50 border-b border-gray-800 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center space-x-6">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-white hover:text-gray-300 transition"
            >
              <Zap size={20} className="text-yellow-400" />
              <span className="font-bold text-base">IssueForge</span>
            </Link>
            {session && (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-1.5 text-gray-300 hover:text-white text-sm font-medium transition"
                >
                  <CircleDot size={14} />
                  <span>Issues</span>
                </Link>
                <Link
                  href="/analytics"
                  className="flex items-center space-x-1.5 text-gray-300 hover:text-white text-sm font-medium transition"
                >
                  <BarChart3 size={14} />
                  <span>Analytics</span>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {session ? (
              <>
                {session.user?.image && (
                  <img
                    src={session.user.image}
                    alt=""
                    className="w-7 h-7 rounded-full border border-gray-600"
                  />
                )}
                <span className="hidden md:block text-sm text-gray-300">
                  {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 transition text-sm"
                >
                  <LogOut size={14} />
                  <span className="hidden md:inline">Sign out</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 transition text-sm font-medium"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
