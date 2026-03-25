import { useState, useEffect } from "react";

const isMobileDevice = () =>
  typeof navigator !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export function useKeyboardOpen(threshold = 0.75) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isMobileDevice()) return;

    const vv = window.visualViewport;

    if (vv) {
      const initialHeight = vv.height;
      const handleResize = () => {
        setIsOpen(vv.height < initialHeight * threshold);
      };
      vv.addEventListener("resize", handleResize);
      return () => vv.removeEventListener("resize", handleResize);
    }
  }, [threshold]);

  return isOpen;
}
