"use client";
import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm here to help you learn more about Roots and Squares Consulting. How can I assist you today?",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const botResponses = {
    "hello":
      "Hello! Welcome to Roots and Squares Consulting. We're experts in transforming ideas into successful products. What would you like to know about our services?  If you'd like to explore this further, send us an email at rootsnsquares@gmail.com describing your project needs.",
    services:
      "We offer a comprehensive range of services including AI & Machine Learning, Cloud Architecture, Mobile Innovation, Web Platforms, Data Engineering, and Cybersecurity. Each solution is tailored to help your business scale and succeed.  If you're interested in learning more about a specific service, please email rootsnsquares@gmail.com with the service name in the subject line.",
    pricing:
      "Our pricing varies based on project scope and requirements. We offer flexible engagement models from fixed-price projects to dedicated teams. Would you like to schedule a free consultation to discuss your specific needs? For a detailed estimate tailored to your project, please send a brief description of your requirements to rootsnsquares@gmail.com.",
    team: "Our team consists of 50+ expert developers, designers, and strategists with experience from companies like Google, Facebook, and Apple. We've successfully delivered 200+ projects across 25+ countries.  To learn more about our team's expertise in a particular area, please email rootsnsquares@gmail.com with your specific request.",
    contact:
      "You can reach us at hello@rootsandsquares.com or schedule a free consultation through our contact form. We typically respond within 2 hours during business hours. For urgent inquiries, please forward your concern to rootsnsquares@gmail.com with 'URGENT' in the subject line.",
    experience:
      "We have 10+ years of experience helping companies build products that scale. We've helped startups become unicorns and established companies innovate. Our portfolio includes projects serving 100M+ users worldwide.  For case studies related to your industry, please email rootsnsquares@gmail.com with details about your business.",
    consultation:
      "Absolutely! We offer free 30-minute consultations where we discuss your project requirements and provide initial recommendations. Would you like me to help you schedule one? To schedule, send us an email at rootsnsquares@gmail.com with your preferred dates and times.",
    default:
      "That's a great question! For detailed information about that topic, I'd recommend scheduling a free consultation with our team. They can provide personalized insights for your specific situation. Would you like me to help you get started?  To get started, please send your inquiry to rootsnsquares@gmail.com, and our team will be in touch shortly.",
    aiMl: "Our AI & Machine Learning services include predictive analytics, natural language processing, and computer vision solutions. We can help you automate tasks, improve decision-making, and create personalized experiences. To discuss your AI/ML needs, email us at rootsnsquares@gmail.com with a brief description of your project.",
    cloud: "We architect, deploy, and manage cloud solutions on AWS, Azure, and Google Cloud. Our cloud expertise ensures scalability, security, and cost-effectiveness. To explore cloud options for your business, send your requirements to rootsnsquares@gmail.com.",
    mobile: "We build native iOS and Android apps as well as cross-platform mobile solutions. Our mobile innovation services help you reach your customers on the go. To explore mobile app development possibilities, email your project details to rootsnsquares@gmail.com.",
    web: "We develop robust and scalable web platforms using modern technologies like React, Angular, and Node.js. Our web development services help you create engaging user experiences. To discuss your web platform vision, send your specifications to rootsnsquares@gmail.com.",
    data: "We provide data engineering services to help you collect, process, and analyze your data. Our data solutions empower you to make data-driven decisions. To discuss your data needs, email rootsnsquares@gmail.com with a description of your data challenges.",
    security: "We offer cybersecurity services to protect your business from cyber threats. Our security solutions include risk assessments, penetration testing, and security monitoring. To discuss your security concerns, send your inquiry to rootsnsquares@gmail.com.",
    success: "We're proud of the successes we've delivered for our clients. From startups to large enterprises, we've helped companies achieve their goals. If you're looking to join this growing list of successful companies, email us at rootsnsquares@gmail.com with a brief description of your goals.",
    innovate: "Innovation is at the core of what we do. We help companies innovate and disrupt their industries with our cutting-edge technology solutions.  If you're looking to innovate and disrupt, send us an email at rootsnsquares@gmail.com with your idea and our team will be in touch shortly.",
    vision: "From startups to global brands, we design, develop, and deliver digital solutions that make an impact. Turn your vision into reality with our world-class technical expertise. To turn your vision into reality, email us at rootsnsquares@gmail.com with a brief description of your project.",
  };


  const generateBotResponse = (userMessage: any) => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("greetings")) {
      return botResponses.hello;
    } else if (
      lowerMessage.includes("service") ||
      lowerMessage.includes("what do you do") ||
      lowerMessage.includes("offer")
    ) {
      return botResponses.services;
    } else if (
      lowerMessage.includes("price") ||
      lowerMessage.includes("cost") ||
      lowerMessage.includes("pricing") ||
      lowerMessage.includes("much")
    ) {
      return botResponses.pricing;
    } else if (
      lowerMessage.includes("team") ||
      lowerMessage.includes("who are you") ||
      lowerMessage.includes("staff")
    ) {
      return botResponses.team;
    } else if (
      lowerMessage.includes("contact") ||
      lowerMessage.includes("reach") ||
      lowerMessage.includes("phone") ||
      lowerMessage.includes("email")
    ) {
      return botResponses.contact;
    } else if (
      lowerMessage.includes("experience") ||
      lowerMessage.includes("portfolio") ||
      lowerMessage.includes("work") ||
      lowerMessage.includes("past projects")
    ) {
      return botResponses.experience;
    } else if (
      lowerMessage.includes("consultation") ||
      lowerMessage.includes("meeting") ||
      lowerMessage.includes("demo") ||
      lowerMessage.includes("schedule")
    ) {
      return botResponses.consultation;
    } else if (
      lowerMessage.includes("ai") && lowerMessage.includes("machine learning") ||
      lowerMessage.includes("artificial intelligence") ||
      lowerMessage.includes("predictive analytics")
    ) {
      return botResponses.aiMl;
    } else if (
      lowerMessage.includes("cloud") ||
      lowerMessage.includes("aws") ||
      lowerMessage.includes("azure") ||
      lowerMessage.includes("google cloud")
    ) {
      return botResponses.cloud;
    } else if (
      lowerMessage.includes("mobile") ||
      lowerMessage.includes("app") ||
      lowerMessage.includes("ios") ||
      lowerMessage.includes("android")
    ) {
      return botResponses.mobile;
    } else if (
      lowerMessage.includes("web") ||
      lowerMessage.includes("website") ||
      lowerMessage.includes("react") ||
      lowerMessage.includes("angular")
    ) {
      return botResponses.web;
    } else if (
      lowerMessage.includes("data") ||
      lowerMessage.includes("analytics") ||
      lowerMessage.includes("database")
    ) {
      return botResponses.data;
    } else if (
      lowerMessage.includes("security") ||
      lowerMessage.includes("cybersecurity") ||
      lowerMessage.includes("threat") ||
      lowerMessage.includes("penetration testing")
    ) {
      return botResponses.security;
    }
    else if (lowerMessage.includes("success") || lowerMessage.includes("successful")) {
      return botResponses.success;
    }
    else if (lowerMessage.includes("innovate") || lowerMessage.includes("innovation")) {
      return botResponses.innovate;
    }
    else if (lowerMessage.includes("vision") || lowerMessage.includes("future")) {
      return botResponses.vision;
    }
    else {
      return botResponses.default;
    }
  };

  const handleSendMessage = (e: any) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: message,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");

    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: generateBotResponse(message),
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  if (!isOpen) {
    return (
      <div className="fixed z-50 flex flex-col items-end space-y-3 bottom-6 right-6">
        <a
          href="https://wa.me/+2347035360986"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact us on WhatsApp"
          className="flex items-center justify-center w-12 h-12 transition-transform bg-green-500 rounded-full shadow-lg hover:bg-green-600 hover:scale-110"
        >
          <FaWhatsapp className="text-white w-7 h-7" />
        </a>

        <div className="relative">
          <Button
            onClick={() => setIsOpen(true)}
            aria-label="Open Contact Form"
            className="w-12 h-12 transition-all duration-300 rounded-full shadow-2xl bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-400 hover:to-orange-400 hover:scale-110"
          >
            <MessageCircle className="text-white w-7 h-7" />
          </Button>
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed z-50 bottom-6 right-6">
      <div
        className={`bg-slate-900 border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 ${isMinimized ? "w-80 h-16" : "w-80 h-96"
          }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-orange-500">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                Roots & Squares
              </div>
              <div className="flex items-center text-xs text-green-400">
                <div className="w-2 h-2 mr-1 bg-green-400 rounded-full"></div>
                Online
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-400 hover:text-white"
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            <div className="h-64 p-4 space-y-4 overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`max-w-[80%] ${msg.sender === "user" ? "order-2" : "order-1"
                      }`}
                  >
                    <div
                      className={`flex items-center space-x-2 mb-1 ${msg.sender === "user" ? "justify-end" : "justify-start"
                        }`}
                    >
                      {msg.sender === "bot" && (
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-orange-500">
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {msg.sender === "user" && (
                        <div className="flex items-center justify-center w-6 h-6 bg-gray-600 rounded-full">
                          <User className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <span className="text-xs text-gray-400">
                        {msg.timestamp}
                      </span>
                    </div>
                    <div
                      className={`p-3 rounded-2xl ${msg.sender === "user"
                        ? "bg-gradient-to-r from-blue-500 to-orange-500 text-white ml-8"
                        : "bg-white/10 text-gray-300 mr-8"
                        }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-white/10">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 text-white bg-white/5 border-white/10 placeholder:text-gray-400 focus:border-blue-400"
                />
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-400 hover:to-orange-400"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LiveChat;
