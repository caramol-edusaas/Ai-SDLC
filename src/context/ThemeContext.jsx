import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchAppTheme } from "../services/themeService";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [themeData, setThemeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeTheme = async () => {
      try {
        const data = await fetchAppTheme();
        setThemeData(data);
        applyThemeToDOM(data);
      } catch (error) {
        console.error("Failed to fetch custom runtime theme config:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTheme();
  }, []);

  // Map API JSON keys directly to runtime CSS custom properties
  const applyThemeToDOM = (theme) => {
    const root = document.documentElement;

    // Helper function to format values (e.g. adding 'px' to pure numbers)
    const formatValue = (key, value) => {
      if (!value) return "";
      const pixelFields = [
        "borderRadius",
        "cardBorderRadius",
        "buttonBorderRadius",
        "inputBorderRadius",
        "modalBorderRadius",
        "navbarHeight",
        "sidebarWidth",
      ];
      if (
        pixelFields.includes(key) &&
        !value.toString().endsWith("px") &&
        !value.toString().endsWith("%")
      ) {
        return `${value}px`;
      }
      return value;
    };

    Object.keys(theme).forEach((key) => {
      // 1. Set the exact camelCase version used in your Login.jsx (e.g. --buttonBg)
      root.style.setProperty(`--${key}`, formatValue(key, theme[key]));

      // 2. Also set the kebab-case version for Tailwind v4 (e.g. --button-bg)
      const kebabKey = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
      root.style.setProperty(kebabKey, formatValue(key, theme[key]));
    });
  };

  return (
    <ThemeContext.Provider value={{ theme: themeData, isLoading }}>
      {isLoading ? (
        <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : (
        children
      )}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
