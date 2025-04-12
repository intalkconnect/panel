import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [modoDark, setModoDark] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (modoDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [modoDark]);

  return (
    <ThemeContext.Provider value={{ modoDark, setModoDark }}>
      {children}
    </ThemeContext.Provider>
  );
};
