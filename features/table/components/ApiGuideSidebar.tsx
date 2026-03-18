"use client";

import { useState } from "react";

interface ApiGuideSidebarProps {
  projectId?: string;
  tableId?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function ApiGuideSidebar({
  projectId,
  tableId,
  isOpen = false,
  onClose,
}: ApiGuideSidebarProps) {
  const [apiKey] = useState("sk_XXXXXXXXXXX");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!isOpen) {
    return null;
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_MAIN_API}/api/v1/project/${
    projectId || ":projectId"
  }/table/${tableId || ":tableId"}/simplify`;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      )}

      {/* Sidebar Overlay */}
      <aside
        className="fixed top-16 right-0 h-[calc(100vh-64px)] w-80 bg-slate-900 text-white p-6 overflow-auto border-l border-slate-700 shadow-lg z-50 transform transition-transform duration-300"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300 hover:text-white"
          title="Close guide"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-1">API Guide</h2>
          <p className="text-xs text-slate-400">How to fetch table data</p>
        </div>

        {/* Guide Content */}
        <div className="space-y-6">
          {/* Method and Endpoint */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Endpoint
            </label>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="text-sm font-bold text-emerald-400 mb-1">
                    GET
                  </div>
                  <code className="text-xs text-slate-200 break-all leading-relaxed">
                    {apiUrl}
                  </code>
                </div>
                <button
                  onClick={() => handleCopy(apiUrl, "endpoint")}
                  className="px-2 py-1 rounded text-xs bg-slate-700 hover:bg-slate-600 transition-colors whitespace-nowrap"
                >
                  {copiedField === "endpoint" ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          {/* Headers */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Headers
            </label>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-3">
              {/* Content-Type */}
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-1">
                  Content-Type
                </div>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-xs text-slate-200">
                    application/json
                  </code>
                  <button
                    onClick={() =>
                      handleCopy("application/json", "content-type")
                    }
                    className="px-2 py-1 rounded text-xs bg-slate-700 hover:bg-slate-600 transition-colors"
                  >
                    {copiedField === "content-type" ? "✓" : "Copy"}
                  </button>
                </div>
              </div>

              {/* API Key */}
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-1">
                  x-api-key
                </div>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-xs text-slate-200 break-all">
                    {apiKey}
                  </code>
                  <button
                    onClick={() => handleCopy(apiKey, "api-key")}
                    className="px-2 py-1 rounded text-xs bg-slate-700 hover:bg-slate-600 transition-colors whitespace-nowrap"
                  >
                    {copiedField === "api-key" ? "✓" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Example Request */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Example Request
            </label>
            <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 overflow-x-auto">
              <pre className="text-xs text-slate-300 font-mono">
                {`curl -X GET "${apiUrl}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}"`}
              </pre>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
            <p className="text-xs text-blue-200 leading-relaxed">
              💡 Use this endpoint to fetch your table data in a simplified
              format.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
