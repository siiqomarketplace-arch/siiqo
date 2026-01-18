"use client";

import React from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

const FloatingWhatsAppButton = () => {
  const WHATSAPP_NUMBER = "2349036437834"; // WhatsApp number without +
  const MESSAGE = encodeURIComponent(
    "Hello, I need customer support with my Siiqo account."
  );

  const handleWhatsAppClick = () => {
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${MESSAGE}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <motion.button
      onClick={handleWhatsAppClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring" }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-24 right-6 z-[900] w-14 h-14 md:w-16 md:h-16 bg-green-500 hover:bg-green-600 rounded-full shadow-xl flex items-center justify-center text-white transition-colors duration-300 group"
      title="Chat with Customer Support"
    >
      {/* Animated pulse background */}
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 bg-green-400 rounded-full opacity-25"
      />

      {/* Icon */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
        className="relative z-10"
      >
        <MessageCircle size={28} className="md:w-8 md:h-8" />
      </motion.div>

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        whileHover={{ opacity: 1, x: 0 }}
        className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg whitespace-nowrap pointer-events-none"
      >
        Customer Support
        <div className="absolute top-full right-2 w-2 h-2 bg-gray-900 transform rotate-45" />
      </motion.div>
    </motion.button>
  );
};

export default FloatingWhatsAppButton;
