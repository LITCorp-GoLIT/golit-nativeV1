import React, { createContext, useContext, useState } from 'react';

interface NavCollapseContextValue {
  isCollapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const NavCollapseContext = createContext<NavCollapseContextValue>({
  isCollapsed: false,
  setCollapsed: () => {},
});

export const useNavCollapse = () => useContext(NavCollapseContext);

export const NavCollapseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <NavCollapseContext.Provider value={{ isCollapsed, setCollapsed: setIsCollapsed }}>
      {children}
    </NavCollapseContext.Provider>
  );
};
