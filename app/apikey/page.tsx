"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ProtectedRoute } from "@/components/ProtectedRoute";

interface ApiKey {
  id: string;
  apiKey: string;
  createdAt: string;
  updatedAt: string;
}

function ApikeyPageContent() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState<string>("");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string>("");

  // Fetch API keys saat component mount
  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.getApiKeys();
      setApiKeys(response.data?.apiKeys || []);
    } catch (err) {
      setError("Gagal memuat API keys");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateApiKey = async () => {
    try {
      setIsGenerating(true);
      setError("");
      setSuccess("");
      const response = await api.generateApiKey();

      if (response.data) {
        setNewApiKey(response.data.apiKey);
        setShowApiKeyModal(true);
      }
    } catch (err) {
      setError("Gagal membuat API Key");
      console.error(err);
      setIsGenerating(false);
    }
  };

  const handleDeleteApiKey = async (apiId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus API Key ini?")) {
      return;
    }

    try {
      setDeletingId(apiId);
      setError("");
      setSuccess("");
      await api.deleteApiKey(apiId);

      setApiKeys(apiKeys.filter((key) => key.id !== apiId));
      setSuccess("API Key berhasil dihapus!");
    } catch (err) {
      setError("Gagal menghapus API Key");
      console.error(err);
    } finally {
      setDeletingId("");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(newApiKey);
    setSuccess("API Key berhasil di-copy!");
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] bg-gradient-to-b from-[#0a0f1a] via-[#0d1421] to-[#0a0f1a]">
      {/* Background Effects */}
      <div className="fixed top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div
        className="fixed top-40 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"
        style={{ animationDelay: "1s" }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Manajemen{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
              API Key
            </span>
          </h1>
          <p className="text-lg text-slate-400">
            Kelola API keys Anda untuk mengakses PortfolioCMS API
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
            <p className="text-red-400 flex items-center gap-2">
              <svg
                className="w-5 h-5"
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
              {error}
            </p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
            <p className="text-blue-400 flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {success}
            </p>
          </div>
        )}

        {/* Modal Overlay */}
        {showApiKeyModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900/95 border border-slate-700/50 rounded-2xl p-8 max-w-2xl w-full shadow-2xl shadow-blue-500/20">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">
                API Key Berhasil Dibuat!
              </h2>
              <p className="text-slate-400 text-center mb-8">
                Simpan API Key ini sekarang. Anda tidak akan bisa melihatnya
                lagi setelah ditutup.
              </p>

              {/* API Key Display */}
              <div className="relative mb-8">
                <div className="bg-slate-800/50 border-2 border-blue-500/30 rounded-xl p-4 font-mono text-sm text-white break-all backdrop-blur-sm">
                  {newApiKey}
                </div>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-ping" />
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCopyApiKey}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy ke Clipboard
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-6 py-3 bg-slate-800 text-white rounded-xl font-semibold border border-slate-700 hover:bg-slate-700 transition-all duration-300"
                >
                  Tutup
                </button>
              </div>

              <p className="mt-6 text-xs text-slate-500 text-center">
                Klik tombol Tutup untuk menutup modal dan refresh halaman
              </p>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="mb-8">
          <button
            onClick={handleGenerateApiKey}
            disabled={isGenerating}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              isGenerating
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:shadow-lg hover:shadow-blue-500/25"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {isGenerating ? "Membuat..." : "Buat API Key Baru"}
          </button>
        </div>

        {/* API Keys List */}
        <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <svg
              className="w-6 h-6 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            API Keys Anda
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
              <p className="text-slate-400">Memuat API Keys...</p>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <p className="text-slate-500 text-lg">
                Belum ada API Key. Buat yang pertama dengan tombol di atas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-blue-500/30 transition-all duration-300 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* API Key Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm text-slate-300 break-all mb-3 bg-slate-900/50 p-3 rounded-lg border border-slate-700/30">
                        {apiKey.apiKey}
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>Dibuat: {formatDate(apiKey.createdAt)}</span>
                        </div>
                        {apiKey.updatedAt && (
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            <span>
                              Diupdate: {formatDate(apiKey.updatedAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteApiKey(apiKey.id)}
                      disabled={deletingId === apiKey.id}
                      className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                        deletingId === apiKey.id
                          ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                          : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      {deletingId === apiKey.id ? "Menghapus..." : "Hapus"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ApikeyPage() {
  return (
    <ProtectedRoute>
      <ApikeyPageContent />
    </ProtectedRoute>
  );
}
