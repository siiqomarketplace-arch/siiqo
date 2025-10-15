"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface CartModalContextType {
  openCart: (step?: number) => void;
  closeCart: () => void;
  isCartOpen: boolean;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const CartModalContext = createContext<CartModalContextType | undefined>(
  undefined
);

export const CartModalProvider = ({ children }: { children: ReactNode }) => {
  const [isCartOpen, setCartOpen] = useState(false);
  const [currentStep, setStep] = useState(0);

  const openCart = (step: number = 0) => {
    setStep(step);
    setCartOpen(true);
  };

  const closeCart = () => setCartOpen(false);

  return (
    <CartModalContext.Provider
      value={{
        openCart,
        closeCart,
        isCartOpen,
        currentStep,
        setCurrentStep: setStep,
      }}
    >
      {children}
    </CartModalContext.Provider>
  );
};

export const useCartModal = () => {
  const context = useContext(CartModalContext);
  if (!context)
    throw new Error("useCartModal must be used within CartModalProvider");
  return context;
};
