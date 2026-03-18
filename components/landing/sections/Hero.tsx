import Link from "next/link";
import CountUpNumber from "@/components/CountUpNumber";
import { ArrowRightIcon } from "../icons";
import HeroBackground from "../HeroBackground";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-[100vh] flex items-center overflow-hidden"
    >
      {/* Interactive Canvas Background */}
      <div className="absolute inset-0 z-0">
        <HeroBackground />
      </div>

      {/* Top fade from navbar */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0a0f1a] to-transparent z-[1] pointer-events-none" />
      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a0f1a] to-transparent z-[1] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          {/* Left — Copy (takes 3 cols) */}
          <div className="lg:col-span-3 text-left text-center lg:text-left">
            {/* Tag */}

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              Build Your Dynamic
              <br />
              Portfolio,{" "}
              <span className="gradient-text">Without the Backend Hassle</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 mt-6 mb-10 max-w-xl leading-relaxed font-body">
              A headless CMS built for developers. Manage portfolio content
              through an intuitive dashboard and access it via REST APIs — no
              server setup required.
            </p>
            {/* CTA */}
            <div className="flex flex-wrap gap-4 mb-14">
              <Link
                href="/login"
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-white text-[#0a0f1a] rounded-full font-semibold text-sm tracking-wide hero-btn-primary"
              >
                Start Free Now
                <ArrowRightIcon />
              </Link>
              {/* <a
                href="#features"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-medium text-sm text-slate-300 border border-slate-700/60 hover:border-blue-500/40 transition-all duration-300 bg-white/[0.03] backdrop-blur-sm"
              >
                Explore Features
              </a> */}
            </div>
            {/* Stats — compact horizontal */}
            <div className="flex items-center gap-8 sm:gap-10">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white font-heading">
                  <CountUpNumber to={100} suffix="+" />
                </div>
                <div className="text-slate-500 text-xs mt-1 uppercase tracking-wider font-medium">
                  Active Users
                </div>
              </div>
              <div className="w-px h-10 bg-slate-800" />
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white font-heading">
                  <CountUpNumber to={1} suffix="k+" />
                </div>
                <div className="text-slate-500 text-xs mt-1 uppercase tracking-wider font-medium">
                  API Calls / Mo
                </div>
              </div>
              <div className="w-px h-10 bg-slate-800" />
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white font-heading">
                  <CountUpNumber to={99.9} decimals={1} suffix="%" />
                </div>
                <div className="text-slate-500 text-xs mt-1 uppercase tracking-wider font-medium">
                  Uptime SLA
                </div>
              </div>
            </div>
          </div>

          {/* Right — 3D Image (takes 2 cols) */}
          <div className="hidden lg:flex lg:col-span-2 justify-center items-center relative">
            {/* Side glow effects */}
            <div className="absolute -left-10 top-1/4 w-32 h-32 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute -right-10 bottom-1/4 w-40 h-40 bg-emerald-500/25 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            />
            <div
              className="absolute -top-5 right-1/4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl animate-pulse"
              style={{ animationDelay: "2s" }}
            />

            <div className="relative w-full max-w-lg">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 to-emerald-500/30 rounded-full blur-3xl -z-10 animate-pulse-glow" />
              <img
                src="/Web devices-pana.png"
                alt="Web Devices Dashboard"
                className="w-full h-auto drop-shadow-2xl animate-float"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
