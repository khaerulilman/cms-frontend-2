"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    window.location.href = "/login";
  };

  return (
    <nav className="bg-[#0a0f1a]/80 backdrop-blur-lg border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <span className="text-xl font-bold gradient-text">Your Dash</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="/#home"
              className="text-slate-300 text-sm font-medium transition-colors duration-300 hover:text-blue-400"
            >
              Home
            </a>
            <a
              href="/#features"
              className="text-slate-300 text-sm font-medium transition-colors duration-300 hover:text-blue-400"
            >
              Features
            </a>
            <a
              href="/#pricing"
              className="text-slate-300 text-sm font-medium transition-colors duration-300 hover:text-blue-400"
            >
              Pricing
            </a>
            {isAuthenticated && (
              <>
                <a
                  href="/projects"
                  className="text-slate-300 text-sm font-medium transition-colors"
                >
                  Projects
                </a>
                <a
                  href="/apikey"
                  className="text-slate-300 text-sm font-medium transition-colors"
                >
                  API Keys
                </a>
                <div className="flex items-center gap-4 pl-4 border-l border-slate-700">
                  <span className="text-sm text-slate-400">
                    {user?.email || user?.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm font-medium border border-slate-700 hover-glow"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
            {!isAuthenticated && (
              <a
                href="/login"
                className="px-5 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-lg text-sm font-medium btn-glow shadow-lg shadow-blue-500/25"
              >
                Get Started
              </a>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-300 bg-slate-800/50"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 pt-2">
            <div className="space-y-1">
              <a
                href="/#home"
                className="block px-4 py-3 rounded-lg text-slate-300 bg-slate-800/30 transition-colors duration-300 hover:bg-slate-700/50"
                onClick={() => setIsOpen(false)}
              >
                Home
              </a>
              <a
                href="/#features"
                className="block px-4 py-3 rounded-lg text-slate-300 bg-slate-800/30 transition-colors duration-300 hover:bg-slate-700/50"
                onClick={() => setIsOpen(false)}
              >
                Features
              </a>
              <a
                href="/#pricing"
                className="block px-4 py-3 rounded-lg text-slate-300 bg-slate-800/30 transition-colors duration-300 hover:bg-slate-700/50"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </a>
              {isAuthenticated && (
                <>
                  <a
                    href="/projects"
                    className="block px-4 py-3 rounded-lg text-slate-300 bg-slate-800/30"
                    onClick={() => setIsOpen(false)}
                  >
                    Projects
                  </a>
                  <a
                    href="/apikey"
                    className="block px-4 py-3 rounded-lg text-slate-300 bg-slate-800/30"
                    onClick={() => setIsOpen(false)}
                  >
                    API Keys
                  </a>
                  <div className="px-4 py-2 text-sm text-slate-400">
                    {user?.email || user?.name}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-lg bg-slate-800 text-slate-300 mt-2 border border-slate-700 hover-glow"
                  >
                    Logout
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <a
                  href="/login"
                  className="block px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-center font-medium mt-2 btn-glow shadow-lg shadow-blue-500/25"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
