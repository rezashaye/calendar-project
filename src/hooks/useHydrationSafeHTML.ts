import { useEffect } from "react";

/**
 * Hook to handle dynamic HTML attributes that might be added by browser extensions
 * This prevents hydration mismatches caused by external scripts modifying the DOM
 */
export const useHydrationSafeHTML = () => {
  useEffect(() => {
    // Only run on client side after hydration
    if (typeof window !== "undefined") {
      const handleHydrationMismatch = () => {
        // Handle any dynamic classes that might be added by browser extensions
        const htmlElement = document.documentElement;
        const bodyElement = document.body;

        // Common classes added by browser extensions that cause hydration issues
        const extensionClasses = [
          "mdl-js",
          "translated-ltr",
          "translated-rtl",
          "notranslate",
          "translated",
        ];

        // Remove these classes if they exist during hydration
        extensionClasses.forEach((className) => {
          if (htmlElement.classList.contains(className)) {
            htmlElement.classList.remove(className);
            console.log(
              `Removed extension-added class from html: ${className}`
            );
          }
          if (bodyElement.classList.contains(className)) {
            bodyElement.classList.remove(className);
            console.log(
              `Removed extension-added class from body: ${className}`
            );
          }
        });

        // Clean up any inline styles that might have been added
        const elementsWithInlineStyles = document.querySelectorAll(
          '[style*="transform"]'
        );
        elementsWithInlineStyles.forEach((element) => {
          if (element.getAttribute("style")?.includes("transform")) {
            element.removeAttribute("style");
          }
        });

        // Ensure proper RTL setup
        if (htmlElement.getAttribute("dir") !== "rtl") {
          htmlElement.setAttribute("dir", "rtl");
        }
        if (htmlElement.getAttribute("lang") !== "fa") {
          htmlElement.setAttribute("lang", "fa");
        }
      };

      // Run immediately and also after a short delay to catch late additions
      handleHydrationMismatch();

      const timeoutId = setTimeout(handleHydrationMismatch, 100);

      return () => clearTimeout(timeoutId);
    }
  }, []);
};
