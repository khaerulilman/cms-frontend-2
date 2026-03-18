import { features } from "../data";

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="glass-card rounded-2xl p-6 group cursor-pointer">
    <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-5 icon-glow">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{description}</p>
  </div>
);

export default function Features() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything You Need,
            <br />
            <span className="gradient-text">Nothing You Don&apos;t</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Focus on building your portfolio website. Let us handle the
            backend complexity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
