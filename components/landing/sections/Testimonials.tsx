import { testimonials } from "../data";
import { StarIcon } from "../icons";

const TestimonialCard = ({
  name,
  role,
  content,
}: {
  name: string;
  role: string;
  content: string;
}) => (
  <div className="glass-card rounded-2xl p-6 cursor-pointer">
    <div className="flex gap-1 mb-4">
      <StarIcon />
      <StarIcon />
      <StarIcon />
      <StarIcon />
      <StarIcon />
    </div>
    <p className="text-slate-300 mb-6 leading-relaxed">&quot;{content}&quot;</p>
    <div className="flex items-center gap-4">
      <div>
        <h4 className="text-white font-medium">{name}</h4>
        <p className="text-slate-400 text-sm">{role}</p>
      </div>
    </div>
  </div>
);

export default function Testimonials() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Loved by <span className="gradient-text">Developers</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            See what developers are saying about Your Dash.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
