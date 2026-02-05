import React, { useEffect, useRef, useState } from "react";
import { Store, Package, Users } from "lucide-react";

const FeaturesSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const features = [
    {
      title: "Branded Online Storefronts",
      description:
        "Build a better customer experience with access to digital business tools.",
      icon: <Store className="w-8 h-8 text-blue-600" />,
      bgColor: "bg-blue-50",
    },
    {
      title: "Inventory & Order Management",
      description:
        "Create stores, manage inventory, track orders, manage sales, and more.",
      icon: <Package className="w-8 h-8 text-blue-500" />,
      bgColor: "bg-blue-50",
    },
    {
      title: "Neighborhood Community",
      description:
        "Anywhere views across communities, geared towards local commerce.",
      icon: <Users className="w-8 h-8 text-blue-700" />,
      bgColor: "bg-blue-50",
    },
  ];

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % features.length;
      const child = scroller.children[nextIndex] as HTMLElement | undefined;
      if (child) {
        scroller.scrollTo({
          left: child.offsetLeft,
          behavior: "smooth",
        });
      }
      setActiveIndex(nextIndex);
    }, 3500);

    return () => clearInterval(interval);
  }, [activeIndex, features.length]);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div
          ref={scrollerRef}
          className="flex overflow-x-auto pb-8 gap-6 snap-x snap-mandatory hide-scrollbar md:grid md:grid-cols-3 md:overflow-visible md:pb-0"
          onScroll={(e) => {
            const target = e.currentTarget;
            const children = Array.from(target.children) as HTMLElement[];
            const current = children.findIndex(
              (child) =>
                target.scrollLeft >= child.offsetLeft - child.offsetWidth / 2 &&
                target.scrollLeft < child.offsetLeft + child.offsetWidth / 2,
            );
            if (current >= 0 && current !== activeIndex) {
              setActiveIndex(current);
            }
          }}
        >
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="min-w-[85%] sm:min-w-[60%] snap-center flex flex-col items-center text-center p-6 md:min-w-full group relative"
            >
              <div
                className={`mb-6 p-5 rounded-2xl ${feature.bgColor} transition-transform group-hover:scale-110 duration-300`}
              >
                {feature.icon}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base max-w-[280px]">
                {feature.description}
              </p>

              {index !== features.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/4 h-1/2 w-[1px] bg-gray-200" />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-4 md:hidden">
          {features.map((feature, i) => (
            <div
              key={`${feature.title}-dot-${i}`}
              className={`w-2 h-2 rounded-full ${
                i === activeIndex ? "bg-blue-600" : "bg-blue-200"
              }`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default FeaturesSection;
