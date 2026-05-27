import React, { createContext, useContext, useState, useCallback } from 'react';

interface NavCollapseContextType {
  isCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const NavCollapseContext = createContext<NavCollapseContextType>({
  isCollapsed: false,
  setCollapsed: () => {},
});

export const useNavCollapse = () => useContext(NavCollapseContext);

export const NavCollapseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const setCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
  }, []);

  return (
    <NavCollapseContext.Provider value={{ isCollapsed, setCollapsed }}>
      {children}
    </NavCollapseContext.Provider>
  );
};
