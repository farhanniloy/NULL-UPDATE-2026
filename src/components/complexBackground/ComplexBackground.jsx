"use client";

import { useEffect, useRef } from "react";

const ComplexBackground = () => {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const resizeObserver = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isPageVisible = document.visibilityState === "visible";
    let isInViewport = true;
    let isScrolling = false;
    let scrollTimeout;

    const setSize = () => {
      if (!canvas.isConnected || !parent.isConnected) return;

      const rect = parent.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    setSize();

    const draw = (time) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const t = time * 0.00042;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const amplitude = Math.min(width, height) * 0.16;
      const detail = Math.max(80, Math.floor(width / 18));
      const baseHue = 142;

      // Layered wave motion, with shimmer and drift
      for (let layer = 0; layer < 4; layer += 1) {
        const layerRatio = layer / 3;
        const hue = baseHue + layerRatio * 28;
        const alpha = 0.08 + layerRatio * 0.14;
        const thickness = 1 + layerRatio * 1.2;
        const phase = t * (1 + layer * 0.24) + layer * Math.PI * 0.27;
        const freq = 0.011 + layerRatio * 0.007;
        const weave = 0.82 + layerRatio * 0.56;
        const centerOffset = Math.sin(t * 0.9 + layer) * 18 * layerRatio;

        ctx.beginPath();
        ctx.strokeStyle = `hsla(${hue}, 100%, 72%, ${alpha})`;
        ctx.lineWidth = thickness;

        for (let i = 0; i <= detail; i += 1) {
          const x = (i / detail) * width;
          const baseWave = Math.sin(x * freq + phase) * amplitude * 0.5 * weave;
          const pulse = Math.sin(x * freq * 1.7 - phase * 0.92) * amplitude * 0.08;
          const ripple = Math.cos((i / detail) * Math.PI * 8 + phase * 1.18) * amplitude * 0.03;
          const drift = Math.sin((i / detail) * Math.PI * 4 + phase * 1.08) * 6 * layerRatio;
          const y = centerY + centerOffset + baseWave + pulse + ripple + drift;
          const xShift = x + Math.sin((i / detail) * Math.PI * 6 + phase * 0.95) * 10 * layerRatio;
          const yShift = y + Math.cos((i / detail) * Math.PI * 4 - phase * 1.05) * 4;

          if (i === 0) ctx.moveTo(xShift, yShift);
          else ctx.lineTo(xShift, yShift);
        }

        ctx.stroke();
      }

      // Fractal expansion rings with complex-plane modulation
      const ringCount = 3;
      const ringPoints = 56;
      for (let ring = 0; ring < ringCount; ring += 1) {
        const ringRatio = ring / (ringCount - 1);
        const ringRadius = amplitude * (0.65 + ringRatio * 0.95) + Math.sin(t * (1.2 + ring * 0.3)) * 12;
        const hue = baseHue + ringRatio * 40;
        const alpha = 0.05 + ringRatio * 0.1;
        const thickness = 0.9 + ringRatio * 1.05;
        const ringPhase = t * (0.85 + ring * 0.15);

        ctx.beginPath();
        ctx.strokeStyle = `hsla(${hue}, 100%, 72%, ${alpha})`;
        ctx.lineWidth = thickness;

        for (let i = 0; i <= ringPoints; i += 1) {
          const angle = (i / ringPoints) * Math.PI * 2;
          const oscillation = Math.sin(angle * 4 + ringPhase * 1.7) * (ringRadius * 0.08);
          const detailPulse = Math.cos(angle * 7 - ringPhase * 1.15) * (ringRadius * 0.04);
          const radius = ringRadius + oscillation + detailPulse;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.stroke();
      }

      // Complex-analysis inspired sweep lines
      const sweepCount = 5;
      const sweepDetail = 44;
      for (let sweep = 0; sweep < sweepCount; sweep += 1) {
        const sweepRatio = sweep / (sweepCount - 1);
        const sweepPhase = t * 1.15 + sweep * Math.PI * 0.9;
        const hue = baseHue + 18 + sweepRatio * 20;
        const alpha = 0.04 + Math.sin(sweepPhase) * 0.03;
        const thickness = 0.8;
        const offset = (sweepRatio - 0.5) * Math.PI * 0.5;

        ctx.beginPath();
        ctx.strokeStyle = `hsla(${hue}, 100%, 78%, ${alpha})`;
        ctx.lineWidth = thickness;

        for (let i = 0; i <= sweepDetail; i += 1) {
          const progress = i / sweepDetail;
          const angle = progress * Math.PI * 2 + offset;
          const radius = amplitude * 0.45 + Math.sin(progress * 5 + sweepPhase) * 12 + Math.cos(angle * 2 + sweepPhase * 0.7) * 6;
          const x = centerX + Math.cos(angle + sweepPhase * 0.22) * radius;
          const y = centerY + Math.sin(angle + sweepPhase * 0.22) * radius * (0.85 + sweepRatio * 0.2);

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.stroke();
      }

      if (!reducedMotion.matches && isPageVisible && isInViewport && !isScrolling) {
        requestRef.current = window.requestAnimationFrame(draw);
      }
    };

    const resumeAfterScroll = () => {
      isScrolling = false;
      if (isPageVisible && isInViewport && !reducedMotion.matches) {
        requestRef.current = window.requestAnimationFrame(draw);
      }
    };

    const handleScroll = () => {
      isScrolling = true;
      window.cancelAnimationFrame(requestRef.current);
      window.clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(resumeAfterScroll, 120);
    };

    const handleVisibilityChange = () => {
      isPageVisible = document.visibilityState === "visible";
      if (isPageVisible && isInViewport && !reducedMotion.matches && !isScrolling) {
        window.cancelAnimationFrame(requestRef.current);
        requestRef.current = window.requestAnimationFrame(draw);
      }
    };
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isInViewport = entry.isIntersecting;
      if (isInViewport && isPageVisible && !reducedMotion.matches && !isScrolling) {
        window.cancelAnimationFrame(requestRef.current);
        requestRef.current = window.requestAnimationFrame(draw);
      }
    });

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("scroll", handleScroll, { passive: true });
    intersectionObserver.observe(canvas);
    requestRef.current = window.requestAnimationFrame(draw);
    resizeObserver.current = new ResizeObserver(setSize);
    resizeObserver.current.observe(parent);

    return () => {
      window.cancelAnimationFrame(requestRef.current);
      window.clearTimeout(scrollTimeout);
      resizeObserver.current?.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return <canvas ref={canvasRef} className="complexBackground" aria-hidden="true" />;
};

export default ComplexBackground;
