import { useState, useEffect } from "react";

interface WindowDimensions {
  width?: number;
  height?: number;
}
export default function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      const { innerWidth: width, innerHeight: height } = window;
      setWindowDimensions({
        width,
        height,
      });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}
