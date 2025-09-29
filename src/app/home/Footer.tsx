import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Smartphone,
  Shield,
  Clock,
  Users,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="pt-16 pb-8 bg-gradient-to-b from-background to-muted/20">
      <div className="container px-4 mx-auto">
        {/* Newsletter Section */}
        <div className="bg-[#001d3b] rounded-2xl p-8 mb-16 text-center">
          <h3 className="mb-4 text-2xl font-bold md:text-3xl text-primary-foreground">
            Stay Updated with Local Deals
          </h3>
          <p className="max-w-xl mx-auto mb-6 text-primary-foreground/90">
            Get notified about the best products and services in your area. No
            spam, just great local finds.
          </p>
          <div className="flex flex-col max-w-md gap-3 mx-auto sm:flex-row">
            <Input
              placeholder="Enter your email"
              className="border-0 bg-background/90 text-foreground placeholder:text-muted-foreground"
            />
            <Button variant="secondary" className="shrink-0">
              Subscribe
            </Button>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 mb-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="block">
              <div className="flex items-center mb-5 space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold md:text-xl font-heading text-text-primary">
                  LocalMarket
                </h1>
              </div>
            </Link>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              Your trusted local marketplace connecting buyers and sellers in
              communities across Nigeria.
            </p>
            <div className="flex space-x-3">
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-primary hover:text-primary-foreground"
              >
                <Facebook className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-primary hover:text-primary-foreground"
              >
                <Twitter className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-primary hover:text-primary-foreground"
              >
                <Instagram className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-primary hover:text-primary-foreground"
              >
                <Linkedin className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Browse Categories
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Featured Listings
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Become a Seller
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Safety Tips
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Success Stories
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 font-semibold text-foreground">Support</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Report an Issue
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Community Guidelines
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="mb-4 font-semibold text-foreground">Get in Touch</h4>
            <div className="space-y-3 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>support@localmarket.ng</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+234 800 123 4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Lagos, Nigeria</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>24/7 Support Available</span>
              </div>
            </div>

            {/* App Download */}
            <div className="mt-6">
              <p className="mb-3 text-sm font-medium text-foreground">
                Download Our App
              </p>
              <div className="flex flex-col space-y-2">
                <Button variant="outline" size="sm" className="justify-start">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Download for Android
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Download for iOS
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 gap-6 mb-12 md:grid-cols-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10">
              <Shield className="w-6 h-6 text-success" />
            </div>
            <div className="font-semibold text-foreground">Secure Payments</div>
            <div className="text-sm text-muted-foreground">
              Protected transactions
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div className="font-semibold text-foreground">
              Verified Sellers
            </div>
            <div className="text-sm text-muted-foreground">
              Trusted community
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div className="font-semibold text-foreground">24/7 Support</div>
            <div className="text-sm text-muted-foreground">
              Always here to help
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10">
              <MapPin className="w-6 h-6 text-warning" />
            </div>
            <div className="font-semibold text-foreground">Local Focus</div>
            <div className="text-sm text-muted-foreground">
              Community-driven
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2024 LocalMarket. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">Version 1.0</Badge>
            <span className="text-sm text-muted-foreground">•</span>
            <a
              href="#"
              className="text-sm transition-colors text-muted-foreground hover:text-primary"
            >
              Status Page
            </a>
            <span className="text-sm text-muted-foreground">•</span>
            <a
              href="#"
              className="text-sm transition-colors text-muted-foreground hover:text-primary"
            >
              API Docs
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
