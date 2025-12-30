"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import Icon, { type LucideIconName } from "@/components/AppIcon";
import Button from "@/components/ui/alt/ButtonAlt"; // Updated to match your previous components
import Input from "@/components/ui/new/Input";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface ContactSectionProps {
  business: any; // Supporting the flexible LocalStorage object
  onSendMessage?: (data: ContactFormData) => Promise<void>;
}

const ContactSection: React.FC<ContactSectionProps> = ({
  business,
  onSendMessage,
}) => {
  const [message, setMessage] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Helper to safely get business data from either API or LocalStorage format
  const bizName = business?.business_name || business?.name || "Our Business";
  const bizPhone = business?.phone || business?.contact?.phone || "No phone provided";
  const bizEmail = business?.email || business?.contact?.email || "No email provided";
  const bizAddress = business?.address || business?.contact?.address || "Location not set";
  const bizWebsite = business?.website || business?.contact?.website;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (onSendMessage) {
        await onSendMessage({ name, email, phone, message });
      } else {
        // Fallback for preview mode
        console.log("Message sent in preview:", { name, email, phone, message });
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCallClick = (): void => {
    if (bizPhone !== "No phone provided") window.location.href = `tel:${bizPhone}`;
  };

  const handleDirectionsClick = (): void => {
    const address = encodeURIComponent(bizAddress);
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, "_blank");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="mb-6 text-xl font-black text-slate-900 flex items-center gap-2">
          <Icon name="MessageCircle" size={20} className="text-primary" />
          Get in Touch
        </h2>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Contact Details Cards */}
          <div className="space-y-4">
            {/* Phone Card */}
            <div className="flex items-center p-4 space-x-4 rounded-[1.5rem] bg-white border border-slate-100 shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-50 text-orange-600">
                <Icon name="Phone" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p>
                <p className="text-sm font-black text-slate-800">{bizPhone}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleCallClick}>
                Call
              </Button>
            </div>

            {/* Email Card */}
            <div className="flex items-center p-4 space-x-4 rounded-[1.5rem] bg-white border border-slate-100 shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600">
                <Icon name="Mail" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                <p className="text-sm font-black text-slate-800 truncate max-w-[150px]">{bizEmail}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.location.href = `mailto:${bizEmail}`}>
                Email
              </Button>
            </div>

            {/* Address Card */}
            <div className="flex items-center p-4 space-x-4 rounded-[1.5rem] bg-white border border-slate-100 shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-green-50 text-green-600">
                <Icon name="MapPin" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Address</p>
                <p className="text-sm font-black text-slate-800 line-clamp-1">{bizAddress}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleDirectionsClick}>
                Map
              </Button>
            </div>

            {/* Website Card */}
            {bizWebsite && (
              <div className="flex items-center p-4 space-x-4 rounded-[1.5rem] bg-white border border-slate-100 shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-50 text-purple-600">
                  <Icon name="Globe" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Website</p>
                  <p className="text-sm font-black text-slate-800">{bizWebsite}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.open(bizWebsite, "_blank")}>
                  Visit
                </Button>
              </div>
            )}
          </div>

          {/* Contact Form Container */}
          {/* <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="mb-6 font-black text-slate-900">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
              <div>
                <label className="block mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Your Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you?"
                  rows={4}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl resize-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={isSubmitting}
              >
                Send Message
              </Button>
            </form>
          </div> */}
        </div>
      </div>

      {/* Dynamic Map Section */}
      <div className="pb-10">
        <h3 className="mb-4 font-black text-slate-900 uppercase text-[10px] tracking-widest px-1">Find us here</h3>
        <div className="w-full h-64 overflow-hidden rounded-[2.5rem] border-4 border-white shadow-lg lg:h-80">
          <iframe
            width="100%"
            height="100%"
            loading="lazy"
            title={bizName}
            style={{ border: 0 }}
            src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(bizAddress)}`}
          />
        </div>
      </div>
    </div>
  );
};

export default ContactSection;