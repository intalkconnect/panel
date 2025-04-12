// src/components/layout/DarkWrapper.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Aplica classe `dark` no HTML <html> quando a rota ativa começa com /identity
 */
const DarkWrapper = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    if (location.pathname.startsWith("/identity")) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [location.pathname]);

  return children;
};

export default DarkWrapper;
