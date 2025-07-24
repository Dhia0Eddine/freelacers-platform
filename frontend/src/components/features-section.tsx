import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { serviceService } from "@/services/api";
import api from "@/services/api";
import {
  Home,
  Hammer,
  Tv,
  Paintbrush,
  Plug,
  Droplet,
  Lightbulb,
  AirVent,
  Sofa,
  Laptop,
  GraduationCap,
  Users,
  Briefcase,
  Globe,
  Wrench,
  ShieldCheck,
  Clock,
  Lock,
  CarIcon as Car,
  Pen,
  Heart
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

// Function to get icon by category name
function getCategoryIcon(name: string) {
  switch (name) {
    case "Home Services":
      return Home;
    case "Repair and technical support":
      return Wrench;
    case "Tech & IT":
      return Laptop;
    case "Tutoring & Education":
      return GraduationCap;
    case "Health & Wellness":
      return Heart;
    case "Events & Lifestyle":
      return Users;
    case "Writing & Translation":
      return Pen;
    case "Moving & Delivery":
      return Briefcase;
    case "Clothing & Tailoring":
      return Sofa;
    case "Automotive Services":
      return Car;
    default:
      return Globe;
  }
}

export default function FeaturesSection() {
  const [categories, setCategories] = useState<{ id: number; name: string; description?: string }[]>([]);
  const [services, setServices] = useState<{ id: number; name: string; category_id: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [trendingCategories, setTrendingCategories] = useState<string[]>(["Home Services", "Tech Help", "Tutoring"]);
  const navigate = useNavigate();

  // Fetch categories and services from backend
  useEffect(() => {
    const fetchData = async () => {
      const catRes = await api.get("/categories/");
      setCategories(catRes.data || []);
      const servRes = await serviceService.getAllServices();
      setServices(servRes || []);
      // Default select "Home Services" if present
      const homeCat = catRes.data?.find((c: any) => c.name === "Home Services");
      setSelectedCategory(homeCat ? homeCat.id : (catRes.data?.[0]?.id ?? null));
    };
    fetchData();
  }, []);

  // Get selected category object
  const selectedCatObj = categories.find(c => c.id === selectedCategory);

  // Get sub-services for selected category
  const subServices = services.filter(s => s.category_id === selectedCategory);

  // Compose navigation categories (database + trending)
  const navCategories = [
    ...trendingCategories
      .map(name => categories.find(c => c.name === name))
      .filter(Boolean),
    ...categories.filter(c => !trendingCategories.includes(c.name)),
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Headline & Subheadline */}
        <div className="sm:text-center mb-10">
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

        {/* Category Navigation */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-4 justify-center items-center pb-2 border-b border-gray-200 dark:border-gray-700">
            {navCategories.map(cat => {
              if (!cat) return null;
              const Icon = getCategoryIcon(cat.name);
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "flex flex-col items-center px-4 py-2 transition-all duration-200",
                    isSelected
                      ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "text-gray-600 dark:text-gray-300 hover:text-indigo-500"
                  )}
                  style={{
                    borderBottom: isSelected ? "3px solid #6366f1" : "3px solid transparent",
                  }}
                >
                  <span
                    className={cn(
                      "rounded-full p-2 mb-1 transition-all",
                      isSelected
                        ? "bg-indigo-100 dark:bg-indigo-900/30"
                        : "bg-gray-100 dark:bg-gray-800"
                    )}
                  >
                    <Icon className={cn("h-7 w-7", isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400")} />
                  </span>
                  <span className="text-sm">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-services pill buttons */}
        {selectedCatObj && (
          <div className="mb-12 flex flex-wrap gap-3 justify-center">
            {subServices.length > 0 ? (
              subServices.map(s => (
                <button
                  key={s.id}
                  className="px-5 py-2 rounded-full border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-900 text-indigo-700 dark:text-indigo-300 font-semibold text-sm transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-indigo-800 hover:border-indigo-400"
                  onClick={() => navigate(`/listings/service/${s.id}`)}
                >
                  {s.name}
                </button>
              ))
            ) : (
              <span className="text-gray-500 dark:text-gray-400 text-sm">No services found for this category.</span>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-8 grid gap-10 sm:grid-cols-3">
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
      </div>
    </section>
  );
}
