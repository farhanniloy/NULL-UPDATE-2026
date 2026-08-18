"use client";

import { useEffect, useRef } from "react";

const ComplexBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const ctx = canvas.getContext("2d");

    const setSize = () => {
      if (!canvas.isConnected || !parent.isConnected) return;
      const rect = parent.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, rect.width, rect.height);
      }
    };

    setSize();

    const resizeObserverInstance = new ResizeObserver(setSize);
    resizeObserverInstance.observe(parent);

    return () => {
      resizeObserverInstance.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="complexBackground" aria-hidden="true" />;
};

export default ComplexBackground;
