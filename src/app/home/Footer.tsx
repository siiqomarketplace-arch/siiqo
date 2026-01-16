import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Smartphone,
  ShieldCheck,
  Clock,
  Users,
  ArrowRight,
  Globe,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0B1120] w-full text-gray-300 font-sans border-t border-gray-800 pb-24">
      {/* Top Wave/Gradient Border (Optional Visual Flair) */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-purple-500 to-orange-500"></div>

      <div className="container px-4 mx-auto pt-16 pb-8">
        {/* --- Newsletter Section --- */}
        <div className="relative overflow-hidden rounded-3xl bg-gray-900 border border-gray-800 p-8 md:p-12 mb-20 text-center shadow-2xl">
          {/* Decorative background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-3xl bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="relative z-10">
            <h3 className="mb-4 text-2xl md:text-4xl font-extrabold text-white tracking-tight">
              Don't Miss Out on Local Deals
            </h3>
            <p className="max-w-2xl mx-auto mb-8 text-gray-400 text-lg">
              Join 50,000+ community members getting the best local offers
              delivered straight to their inbox. No spam, ever.
            </p>

            <form className="flex flex-col sm:flex-row max-w-lg mx-auto gap-3">
              <div className="relative flex-grow">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  placeholder="Enter your email address"
                  className="pl-10 h-12 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl transition-all"
                />
              </div>
              <Button
                size="lg"
                className="h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl px-8 shadow-lg shadow-orange-900/20 transition-all hover:scale-105"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* --- Main Links Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="inline-block">
              {/* Replace with your actual Logo Component or Image */}
              <img
                src="/images/siiqo.png"
                alt="Siiqo Logo"
                className="h-10 w-auto brightness-200 contrast-100"
              />
            </Link>
            <p className="text-gray-400 leading-relaxed max-w-sm">
              Siiqo is Nigeria's most trusted local marketplace. We connect
              neighborhoods, empower small businesses, and make trading safe and
              simple for everyone.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-orange-600 hover:text-white transition-all duration-300 group"
                >
                  <Icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Marketplace</h4>
            <ul className="space-y-4">
              {[
                "Browse Categories",
                "Featured Listings",
                "Trending",
                "New Arrivals",
                "Clearance",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-orange-500 transition-colors flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-[2px] bg-orange-500 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Company</h4>
            <ul className="space-y-4">
              {["About Us", "Careers", "Press", "Affiliates", "Partners"].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-orange-500 transition-colors flex items-center group"
                    >
                      <span className="w-0 group-hover:w-2 h-[2px] bg-orange-500 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                <span>
               Nelocap Estate 
                  <br />
                  Lokogama, Abuja.
                </span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Phone className="h-5 w-5 text-orange-500 shrink-0" />
                <span>+234 703 536 9086</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Mail className="h-5 w-5 text-orange-500 shrink-0" />
                <span>support@siiqo.com</span>
              </li>
            </ul>

            {/* App Store Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-800">
              <p className="text-sm font-medium text-white mb-3">Get the App</p>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="h-10 justify-start bg-gray-900 border-gray-700 hover:bg-gray-800 hover:text-white text-gray-300"
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  <span>App Store</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-10 justify-start bg-gray-900 border-gray-700 hover:bg-gray-800 hover:text-white text-gray-300"
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  <span>Google Play</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-gray-800 mb-12" />

        {/* --- Trust Indicators --- */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {[
            {
              icon: ShieldCheck,
              title: "Secure Payments",
              desc: "100% Protected transactions",
              color: "text-green-500",
            },
            {
              icon: Users,
              title: "Verified Sellers",
              desc: "ID Verified community",
              color: "text-blue-500",
            },
            {
              icon: Clock,
              title: "24/7 Support",
              desc: "We're here anytime",
              color: "text-purple-500",
            },
            {
              icon: Globe,
              title: "Nationwide",
              desc: "Delivery across Nigeria",
              color: "text-orange-500",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center p-4 rounded-2xl bg-gray-900/50 hover:bg-gray-900 transition-colors"
            >
              <div
                className={`p-3 rounded-full bg-gray-800 mb-3 ${feature.color}`}
              >
                <feature.icon className="h-6 w-6" />
              </div>
              <h5 className="text-white font-bold mb-1">{feature.title}</h5>
              <p className="text-sm text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div> */}

        <Separator className="bg-gray-800 mb-8" />

        {/* --- Bottom Bar --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500">
          <p>© {currentYear} Siiqo. All rights reserved.</p>

          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Cookie Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Sitemap
            </a>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>System Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
