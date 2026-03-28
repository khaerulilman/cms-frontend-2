"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { BACKEND_URL, api } from "@/lib/api";

function LoginContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, login } = useAuth();
  const [error, setError] = useState("");
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);

  // Handle Google OAuth callback
  useEffect(() => {
    const userParam = searchParams.get("user");
    const oauthSuccess = searchParams.get("oauth");
    const setupToken = searchParams.get("setup_token");

    if (userParam && oauthSuccess === "success" && !isProcessingOAuth) {
      setIsProcessingOAuth(true);

      // Immediately clear URL params to prevent double execution
      window.history.replaceState({}, "", "/login");

      const handleOAuthCallback = async () => {
        try {
          // Decode base64 user data
          const userData = JSON.parse(atob(userParam));

          // If setup_token is present, exchange it for cookies via proxy
          // This handles cross-origin scenarios (e.g., localhost frontend + cloud backend)
          if (setupToken) {
            await api.establishSession(setupToken);
          }

          // Store user data in state
          login(userData);

          // Redirect to projects (full page reload)
          window.location.href = "/projects";
        } catch (err) {
          console.error("Authentication error:", err);
          setError("Failed to complete authentication. Please try again.");
          setIsProcessingOAuth(false);
        }
      };

      handleOAuthCallback();
    }
  }, [searchParams, login, isProcessingOAuth]);

  // Redirect if already authenticated (but not during OAuth processing)
  useEffect(() => {
    if (!isLoading && isAuthenticated && !isProcessingOAuth) {
      const hasOAuthParams =
        searchParams.get("user") || searchParams.get("oauth");
      if (!hasOAuthParams) {
        window.location.href = "/projects";
      }
    }
  }, [isAuthenticated, isLoading, isProcessingOAuth, searchParams]);

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${BACKEND_URL}/api/v1/auth/google`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] bg-gradient-to-b from-[#0a0f1a] via-[#0d1421] to-[#0a0f1a] flex items-center justify-center px-4 py-8">
      {/* Background Effects */}
      <div className="fixed top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div
        className="fixed bottom-20 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"
        style={{ animationDelay: "1s" }}
      />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
              Welcome Back
            </span>
          </h1>
          <p className="text-slate-400">Sign in to your Your Dash account</p>
        </div>

        <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8">
          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <svg
                className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 border border-slate-700/50 bg-slate-800/30 text-white font-medium rounded-xl hover:bg-slate-800/50 hover:border-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <svg
              className="w-5 h-5 group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-400">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
