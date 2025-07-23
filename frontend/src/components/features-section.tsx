import {
  ShieldCheck,
  Clock,
  Lock,
  Users,
  Wrench,
  Laptop,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    name: "Verified Professionals",
    description: "All service providers are screened and reviewed by users.",
    icon: ShieldCheck,
  },
  {
    name: "Quick Booking",
    description: "Compare quotes and hire in just a few clicks.",
    icon: Clock,
  },
  {
    name: "Secure Payments",
    description: "We hold the payment until your job is done right.",
    icon: Lock,
  },
];

const categories = [
  {
    name: "Home Repairs",
    icon: Wrench,
  },
  {
    name: "Tech Help",
    icon: Laptop,
  },
  {
    name: "Tutoring",
    icon: GraduationCap,
  },
  {
    name: "Freelancers",
    icon: Users,
  },
];

export default function WhyChooseUsSection() {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="sm:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">
            Why choose our platform?
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Find help. Book services. Get things done.
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Whether it's fixing a faucet, building a website, or tutoring your child — we make hiring easy, fast, and safe.
          </p>
        </div>

        {/* Features */}
        <div className="mt-16 grid gap-10 sm:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <feature.icon className="h-10 w-10 text-indigo-600 dark:text-indigo-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {feature.name}
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Top Categories
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 text-center">
            {categories.map((category, index) => (
              <div
                key={index}
                className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 p-6 rounded-xl hover:shadow-md transition"
              >
                <category.icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-3" />
                <p className="text-lg font-medium text-gray-900 dark:text-white">{category.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
