import { DatabaseIcon, LayoutIcon, ShieldIcon } from "./icons";

export type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export type Step = {
  number: string;
  title: string;
  description: string;
};

export type PricingPlan = {
  title: string;
  price: string;
  features: string[];
  isPrimary?: boolean;
};

export type Testimonial = {
  name: string;
  role: string;
  content: string;
};

export const features: Feature[] = [
  {
    icon: <DatabaseIcon />,
    title: "No Backend Needed",
    description:
      "Forget about complex server setup. Our API handles all your portfolio data storage and retrieval seamlessly.",
  },
  {
    icon: <LayoutIcon />,
    title: "Visual Content Editor",
    description:
      "Edit and organize your projects, experiences, and skills using a structured table interface. Simple, fast, and fully editable no coding needed.",
  },
  {
    icon: <ShieldIcon />,
    title: "Secure & Private",
    description:
      "Generate secure API keys with one click. Your portfolio content is always protected.",
  },
];

export const steps: Step[] = [
  {
    number: "1",
    title: "Create Your Account",
    description:
      "Sign up in seconds with your email. No credit card required to get started.",
  },
  {
    number: "2",
    title: "Add Your Content",
    description:
      "Use our visual editor to add projects, experiences, skills, and other portfolio data.",
  },
  {
    number: "3",
    title: "Get Your API Key",
    description:
      "Generate a secure API key to access your portfolio data from anywhere.",
  },
  {
    number: "4",
    title: "Integrate Anywhere",
    description:
      "Use our REST API to display your portfolio content on any website or app.",
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    title: "Starter",
    price: "Free",
    features: [
      "Unlimited Portfolio Project",
      "100 API Requests/day",
      "Basic Content Types",
      "Community Support",
    ],
    isPrimary: false,
  },
];

export const testimonials: Testimonial[] = [
  {
    name: "Alex Chen",
    role: "Frontend Developer",
    content:
      "This CMS completely changed how I manage my portfolio. No more wrestling with databases or building admin panels. Just pure content management bliss.",
  },
  {
    name: "Sarah Johnson",
    role: "UI/UX Designer",
    content:
      "I can finally update my portfolio without strugling with databases. The API integration with my Next.js site was incredibly smooth.",
  },
  {
    name: "Michael Park",
    role: "Full Stack Developer",
    content:
      "The API is clean and well-documented. I integrated it with my portfolio in under an hour. Highly recommended for developers!",
  },
];
