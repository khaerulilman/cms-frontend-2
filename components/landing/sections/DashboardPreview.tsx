export default function DashboardPreview() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Powerful <span className="gradient-text">Dashboard</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Manage all your portfolio content from one intuitive interface.
          </p>
        </div>

        {/* Dashboard Mockup */}
        <div className="glass-card rounded-2xl overflow-hidden glow-blue">
          {/* Browser Chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/80 border-b border-slate-700/50">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-4 text-sm text-slate-400">
              {process.env.NEXT_PUBLIC_FRONTEND}/projects/tableId
            </span>
          </div>

          <div className="flex bg-[#0a0f1a] min-h-[420px]">
            {/* Sidebar */}
            <div className="w-48 bg-[#111828] border-r border-slate-800/50 p-4 flex flex-col">
              <h3 className="text-sm font-semibold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
                Tables
              </h3>
              <div className="flex flex-col gap-2 flex-1">
                {["Projects", "Certificates"].map((name, i) => (
                  <div
                    key={i}
                    className={`px-3 py-2 rounded-xl text-sm border-2 transition-all ${
                      i === 0
                        ? "border-blue-500/30 bg-slate-800/50 text-white shadow-lg shadow-blue-500/10"
                        : "border-slate-700/30 text-slate-400"
                    }`}
                  >
                    {name}
                  </div>
                ))}
              </div>
              <div className="mt-4 py-2 rounded-xl border border-dashed border-slate-700/50 text-slate-400 text-sm text-center">
                + Add Table
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-hidden">
              <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl">
                {/* Table Header */}
                <div className="flex justify-between items-center px-5 py-3 border-b border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
                      Projects
                    </span>
                    <span className="text-slate-500 text-sm cursor-pointer">
                      ✎
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-xs font-medium">
                      Get Data
                    </span>
                    <span className="px-3 py-1.5 rounded-xl border border-dashed border-slate-700/50 text-slate-400 text-xs">
                      + Add Column
                    </span>
                  </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-700/50">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-5 py-2.5 text-center text-[11px] font-semibold text-slate-300 uppercase tracking-wider border-r border-slate-700/50">
                          No
                        </th>
                        <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                          <div className="flex items-center justify-between">
                            <span>Image</span>
                            <span className="text-red-500 text-[10px]">✕</span>
                          </div>
                        </th>
                        <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                          <div className="flex items-center justify-between">
                            <span>Description</span>
                            <span className="text-red-500 text-[10px]">✕</span>
                          </div>
                        </th>
                        <th className="px-5 py-2.5 text-center text-[11px] font-semibold text-slate-300 uppercase tracking-wider border-l border-slate-700/50">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-slate-900/20 divide-y divide-slate-700/50">
                      {[
                        {
                          img: (
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              className="w-6 h-6"
                            >
                              <path
                                d="M12 2L2 7l10 5 10-5-10-5z"
                                fill="#68A063"
                              />
                              <path
                                d="M2 17l10 5 10-5M2 12l10 5 10-5"
                                stroke="#68A063"
                                strokeWidth="2"
                              />
                            </svg>
                          ),
                          desc: "node js, rest api",
                        },
                        {
                          img: (
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              className="w-6 h-6"
                            >
                              <path
                                d="M5 6a3 3 0 015 0v4a3 3 0 01-5 0V6z"
                                fill="#0db7ed"
                              />
                              <path
                                d="M14 6a3 3 0 015 0v4a3 3 0 01-5 0V6z"
                                fill="#0db7ed"
                              />
                              <rect
                                x="3"
                                y="5"
                                width="18"
                                height="14"
                                rx="2"
                                stroke="#0db7ed"
                                strokeWidth="2"
                                fill="none"
                              />
                              <path
                                d="M6 10h12M6 14h8"
                                stroke="#0db7ed"
                                strokeWidth="2"
                              />
                            </svg>
                          ),
                          desc: "postgre sql, docker",
                        },
                        {
                          img: (
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              className="w-6 h-6"
                            >
                              <path
                                d="M12 2L2 7v10l10 5 10-5V7L12 2z"
                                stroke="#00ADD8"
                                strokeWidth="2"
                                fill="none"
                              />
                              <path
                                d="M12 7l-5 3v4l5 3 5-3v-4l-5-3z"
                                fill="#00ADD8"
                              />
                            </svg>
                          ),
                          desc: "golang, vue",
                        },
                      ].map((row, i) => (
                        <tr
                          key={i}
                          className="hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-5 py-3 text-sm text-slate-300 text-center border-r border-slate-700/50">
                            {i + 1}
                          </td>
                          <td className="px-5 py-3">
                            <div className="h-10 w-10 rounded border border-slate-700/50 bg-slate-700/30 flex items-center justify-center">
                              {row.img}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-sm text-slate-300">
                            {row.desc}
                          </td>
                          <td className="px-5 py-3 text-center border-l border-slate-700/50">
                            <span className="text-red-500 text-xs font-medium">
                              DELETE
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Row Footer */}
                <div className="px-5 py-3 border-t border-slate-700/50 bg-slate-800/30">
                  <span className="py-1.5 px-3 rounded-xl border border-dashed border-slate-700/50 text-slate-400 text-xs">
                    + Add Row
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
