"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  User,
  ShieldCheck,
  LogIn,
  Store,
  ShoppingBag,
  Zap,
} from "lucide-react";

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  details: string[];
  icon: React.ReactNode;
  color: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    title: "Sign Up",
    description: "Create your Siiqo account",
    details: [
      "Click on 'Get Started' in the top right",
      "Enter your email address",
      "Create a strong password",
      "Fill in your basic profile information",
    ],
    icon: <User size={32} />,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: 2,
    title: "Email Verification",
    description: "Verify your email via OTP",
    details: [
      "An OTP code will be sent to your email",
      "Enter the 6-digit code in the verification field",
      "If you don't see it, check your spam folder",
      "You have 10 minutes to verify",
    ],
    icon: <ShieldCheck size={32} />,
    color: "from-green-500 to-green-600",
  },
  {
    id: 3,
    title: "Log In",
    description: "Access your Siiqo account",
    details: [
      "Go to the login page",
      "Enter your registered email",
      "Enter your password",
      "You're now logged in as a buyer",
    ],
    icon: <LogIn size={32} />,
    color: "from-purple-500 to-purple-600",
  },
  {
    id: 4,
    title: "Become a Vendor",
    description: "Set up your store on Siiqo",
    details: [
      "Go to your profile menu",
      "Select 'Become a Vendor'",
      "Fill in your business details (name, description, address)",
      "Upload your store logo and banner",
      "Add bank details for payouts",
      "Submit for admin approval",
    ],
    icon: <Store size={32} />,
    color: "from-orange-500 to-orange-600",
  },
  {
    id: 5,
    title: "Create Categories",
    description: "Organize your products",
    details: [
      "Go to your vendor dashboard",
      "Navigate to 'Catalogs' or 'Categories'",
      "Click 'Create New Category'",
      "Give it a name and description",
      "Add a category image (optional)",
      "Save your category",
    ],
    icon: <ShoppingBag size={32} />,
    color: "from-cyan-500 to-cyan-600",
  },
  {
    id: 6,
    title: "List & Publish Products",
    description: "Add products to your store",
    details: [
      "In your vendor dashboard, click 'Add Product'",
      "Fill in product details (name, price, description)",
      "Upload product images (at least 1)",
      "Select the category",
      "Set quantity and shipping info",
      "Review and publish your product",
      "Your product is now live for buyers to see!",
    ],
    icon: <Zap size={32} />,
    color: "from-rose-500 to-rose-600",
  },
];

interface TutorialGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const TutorialGuide: React.FC<TutorialGuideProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const step = TUTORIAL_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
          >
            <div className="w-full max-w-sm sm:max-w-2xl md:max-w-3xl bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div
                className={`bg-gradient-to-r ${step.color} p-4 sm:p-6 md:p-8 text-white relative`}
              >
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 hover:bg-white/20 rounded-full transition"
                >
                  <X size={20} className="sm:w-6 sm:h-6" />
                </button>

                <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-white/20 rounded-full flex-shrink-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                      {step.icon}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-3xl font-bold truncate">
                      {step.title}
                    </h2>
                    <p className="text-white/80 text-xs sm:text-base line-clamp-1">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Step Progress */}
                <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-4">
                  <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
                    Step {currentStep + 1} of {TUTORIAL_STEPS.length}
                  </span>
                  <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-300"
                      style={{
                        width: `${
                          ((currentStep + 1) / TUTORIAL_STEPS.length) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-3 sm:p-4 md:p-8">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-2 sm:space-y-3">
                    {step.details.map((detail, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                      >
                        <CheckCircle2
                          size={16}
                          className="flex-shrink-0 mt-0.5 sm:w-5 sm:h-5"
                          style={{ color: step.color.split(" ")[1] }}
                        />
                        <p className="text-gray-700 text-xs sm:text-sm md:text-base leading-relaxed">
                          {detail}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Step Indicators */}
                <div className="mt-4 sm:mt-8 flex justify-center gap-1.5 sm:gap-2 flex-wrap">
                  {TUTORIAL_STEPS.map((_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleStepClick(index)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-semibold transition ${
                        index === currentStep
                          ? `bg-gradient-to-r ${step.color} text-white`
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                    >
                      {index + 1}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-3 sm:p-4 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="w-full sm:w-auto flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm sm:text-base font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="text-xs sm:text-sm text-gray-600 font-medium text-center whitespace-nowrap">
                  {currentStep === TUTORIAL_STEPS.length - 1 ? (
                    <span className="text-green-600 font-bold text-xs sm:text-sm">
                      ✓ You're all set!
                    </span>
                  ) : (
                    <span className="text-xs sm:text-sm">{`${
                      TUTORIAL_STEPS.length - currentStep - 1
                    } steps left`}</span>
                  )}
                </div>

                {currentStep === TUTORIAL_STEPS.length - 1 ? (
                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg bg-green-600 text-white text-sm sm:text-base font-semibold hover:bg-green-700 transition"
                  >
                    Done
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="w-full sm:w-auto flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm sm:text-base font-semibold hover:shadow-lg transition"
                  >
                    <span className="hidden sm:inline">Next</span>
                    {/* <span className="sm:hidden">→</span> */}
                    <ChevronRight size={16} className="sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TutorialGuide;
