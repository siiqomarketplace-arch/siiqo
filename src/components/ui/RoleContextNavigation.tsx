import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface target_viewContextType {
  usertarget_view: string;
  isAuthenticated: boolean;
  switchtarget_view: (target_view: string) => void;
  login: (target_view?: string) => void;
  logout: () => void;
}

const target_viewContext = createContext<target_viewContextType | undefined>(undefined);

export const usetarget_view = (): target_viewContextType => {
  const context = useContext(target_viewContext);
  if (!context) {
    throw new Error('usetarget_view must be used within a target_viewProvider');
  }
  return context;
};

interface target_viewProviderProps {
  children: ReactNode;
}

export const target_viewProvider: React.FC<target_viewProviderProps> = ({ children }) => {
  const [usertarget_view, setUsertarget_view] = useState<string>('customer');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check localStorage for saved user target_view and auth status
    const savedtarget_view = localStorage.getItem('usertarget_view');
    const savedAuth = localStorage.getItem('isAuthenticated');
    
    if (savedtarget_view) {
      setUsertarget_view(savedtarget_view);
    }
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const switchtarget_view = (target_view: string) => {
    setUsertarget_view(target_view);
    localStorage.setItem('usertarget_view', target_view);
  };

  const login = (target_view: string = 'customer') => {
    setIsAuthenticated(true);
    setUsertarget_view(target_view);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('usertarget_view', target_view);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUsertarget_view('customer');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('usertarget_view');
  };

  const value = {
    usertarget_view,
    isAuthenticated,
    switchtarget_view,
    login,
    logout
  };

  return (
    <target_viewContext.Provider value={value}>
      {children}
    </target_viewContext.Provider>
  );
};

interface target_viewContextNavigationProps {
  children: ReactNode;
}

const target_viewContextNavigation: React.FC<target_viewContextNavigationProps> = ({ children }) => {
  const { usertarget_view, isAuthenticated } = usetarget_view();

  // Render appropriate navigation based on user target_view
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  if (usertarget_view === 'vendor') {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex">
          {/* <VendorSidebarNavigation /> */}
          <div className="flex-1 lg:ml-240">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Customer target_view or default
  return (
    <div className="min-h-screen bg-background">
      {/* <CustomerGlobalHeader /> */}
      <div className="pt-16">
        {children}
      </div>
    </div>
  );
};

// Import other navigation components
// import VendorSidebarNavigation from './VendorSidebarNavigation';
// import CustomerGlobalHeader from './CustomerGlobalHeader';

export default target_viewContextNavigation;