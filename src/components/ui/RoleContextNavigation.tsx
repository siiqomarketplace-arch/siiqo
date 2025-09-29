import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface RoleContextType {
  userRole: string;
  isAuthenticated: boolean;
  switchRole: (role: string) => void;
  login: (role?: string) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

interface RoleProviderProps {
  children: ReactNode;
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
  const [userRole, setUserRole] = useState<string>('customer');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check localStorage for saved user role and auth status
    const savedRole = localStorage.getItem('userRole');
    const savedAuth = localStorage.getItem('isAuthenticated');
    
    if (savedRole) {
      setUserRole(savedRole);
    }
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const switchRole = (role: string) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
  };

  const login = (role: string = 'customer') => {
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', role);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole('customer');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
  };

  const value = {
    userRole,
    isAuthenticated,
    switchRole,
    login,
    logout
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};

interface RoleContextNavigationProps {
  children: ReactNode;
}

const RoleContextNavigation: React.FC<RoleContextNavigationProps> = ({ children }) => {
  const { userRole, isAuthenticated } = useRole();

  // Render appropriate navigation based on user role
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  if (userRole === 'vendor') {
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

  // Customer role or default
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

export default RoleContextNavigation;