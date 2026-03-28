import { pricingPlans } from "../data";
import { CheckCircleIcon } from "../icons";

const PricingCard = ({
  title,
  price,
  features,
  isPrimary = false,
}: {
  title: string;
  price: string;
  features: string[];
  isPrimary?: boolean;
}) => (
  <div
    className={`rounded-2xl p-8 ${
      isPrimary ? "gradient-border bg-slate-900/50" : "glass-card"
    }`}
  >
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <div className="mb-6">
      <span className="text-4xl font-bold gradient-text">{price}</span>
      {price !== "Free" && <span className="text-slate-400">/month</span>}
    </div>
    <ul className="space-y-3 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center gap-3 text-slate-300">
          <CheckCircleIcon />
          {feature}
        </li>
      ))}
    </ul>
    <a href="/projects">
      <button
        className={`w-full py-3 rounded-xl font-medium btn-glow ${
          isPrimary
            ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white"
            : "bg-slate-800 text-white border border-slate-700 hover-glow"
        }`}
        type="button"
      >
        Get Started
      </button>
    </a>
  </div>
);

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Simple, <span className="gradient-text">Transparent Pricing</span>
          </h2>
        </div>

        <div
          className={`grid gap-6 ${
            pricingPlans.length === 1
              ? "grid-cols-1 place-items-center"
              : "grid-cols-1 md:grid-cols-3"
          }`}
        >
          {pricingPlans.map((plan, index) => (
            <PricingCard key={index} {...plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
