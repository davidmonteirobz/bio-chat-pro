import { useState, useEffect } from "react";

export function useKeyboardOpen(threshold = 0.75) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;

    if (vv) {
      const handleResize = () => {
        const ratio = vv.height / window.screen.height;
        setIsOpen(ratio < threshold);
      };
      vv.addEventListener("resize", handleResize);
      handleResize();
      return () => vv.removeEventListener("resize", handleResize);
    }

    // Fallback: compare innerHeight to screen height
    const handleResize = () => {
      const ratio = window.innerHeight / window.screen.height;
      setIsOpen(ratio < threshold);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [threshold]);

  return isOpen;
}
