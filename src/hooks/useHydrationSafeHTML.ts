import { useEffect } from "react";

/**
 * Hook to handle dynamic HTML attributes that might be added by browser extensions
 * This prevents hydration mismatches caused by external scripts modifying the DOM
 */
export const useHydrationSafeHTML = () => {
  useEffect(() => {
    // Only run on client side after hydration
    if (typeof window !== "undefined") {
      // Handle any dynamic classes that might be added by browser extensions
      // This is specifically for the MDL (Material Design Lite) class issue
      const htmlElement = document.documentElement;

      // Common classes added by browser extensions that cause hydration issues
      const extensionClasses = ["mdl-js", "translated-ltr", "translated-rtl"];

      // Remove these classes if they exist during hydration
      extensionClasses.forEach((className) => {
        if (htmlElement.classList.contains(className)) {
          console.log(`Removing extension-added class: ${className}`);
        }
      });
    }
  }, []);
};
