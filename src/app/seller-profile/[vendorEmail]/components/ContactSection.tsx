import React, { useState, FormEvent, ChangeEvent } from "react";
import Icon, { type LucideIconName } from "@/components/AppIcon";
import Button from "@/components/ui/new/Button";
import Input from "@/components/ui/new/Input";

interface Business {
  name: string;
  phone: string;
  address: string;
}

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface ContactSectionProps {
  business: Business | any;
  onSendMessage: (data: ContactFormData) => Promise<void>;
  isSent?: boolean;
}

const ContactSection: React.FC<ContactSectionProps> = ({
  business,
  onSendMessage,
  isSent = false,
}) => {
  const [message, setMessage] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);


  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSendMessage({
        name,
        email,
        phone,
        message,
      });

      // Reset form
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
    window.location.href = `tel:${business.phone}`;
  };

  const handleDirectionsClick = (): void => {
    const address = encodeURIComponent(business.address);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${address}`,
      "_blank"
    );
  };

  return (
    <div className="space-y-8">
      {/* Contact Information */}
      <div>
        <h2 className="mb-6 text-xl font-semibold text-text-primary">
          Get in Touch
        </h2>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Contact Details */}
          <div className="space-y-6">
            <div className="p-6 space-y-4 border-l-4 rounded-lg border-primary bg-gray-100/30">
              {/* Phone */}
              <div className="flex items-center space-x-2 rounded-lg bg-surface">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/5">
                  <Icon
                    name={"Phone" as LucideIconName}
                    size={14}
                    className="text-primary"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text-primary">Phone</p>
                  <p className="text-text-secondary">{business.phone}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCallClick}
                  iconName={"Phone" as LucideIconName}
                  iconSize={14}
                >
                  Call
                </Button>
              </div>

              {/* Address */}
              <div className="flex items-center space-x-2 rounded-lg bg-surface">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/5">
                  <Icon
                    name={"MapPin" as LucideIconName}
                    size={14}
                    className="text-primary"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text-primary">Address</p>
                  <p className="text-text-secondary">{business.address}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDirectionsClick}
                  iconName={"Navigation" as LucideIconName}
                  iconSize={14}
                >
                  Directions
                </Button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h3 className="mb-4 font-medium text-text-primary">
              Send a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Your Name"
                type="text"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                placeholder="Enter your full name"
                required
              />

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                required
              />

              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPhone(e.target.value)
                }
                placeholder="Enter your phone number"
              />

              <div>
                <label className="block mb-2 text-sm font-medium text-text-primary">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setMessage(e.target.value)
                  }
                  placeholder="Tell us how we can help you..."
                  rows={4}
                  required
                  className="w-full px-3 py-2 border rounded-md resize-none border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <Button
                type="submit"
                variant="default"
                fullWidth
                loading={isSubmitting}
                iconName={
                  isSent
                    ? ("CheckCircle" as LucideIconName)
                    : ("Send" as LucideIconName)
                }
                iconPosition="left"
                disabled={isSubmitting || isSent}
              >
                {isSent
                  ? "Message Sent!"
                  : isSubmitting
                  ? "Sending..."
                  : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
