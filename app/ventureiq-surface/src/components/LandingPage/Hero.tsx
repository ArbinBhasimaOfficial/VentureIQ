"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTranslation } from "@/context/languageContext"; // Import Global Translator

interface HeroStatItem {
  id: string;
  labelKey: "statBrands" | "statTrends" | "statRetention"; // Bind strictly to dictionary keys
  numericValue: number;
  suffix: string;
}

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statsMapRef = useRef<Map<string, HTMLDivElement>>(new Map());

  // Connect the translation engine hook
  const { t } = useTranslation();

  const setStatRef = (el: HTMLDivElement | null, key: string) => {
    if (el) {
      statsMapRef.current.set(key, el);
    } else {
      statsMapRef.current.delete(key);
    }
  };

  const heroStats: HeroStatItem[] = [
    {
      id: "hero-brands",
      labelKey: "statBrands",
      numericValue: 12,
      suffix: "K+",
    },
    { id: "hero-trends", labelKey: "statTrends", numericValue: 86, suffix: "" },
    {
      id: "hero-retention",
      labelKey: "statRetention",
      numericValue: 98,
      suffix: "%",
    },
  ];

  // --- Three.js Wireframe Earth Loop Engine ---
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const geometry = new THREE.SphereGeometry(2.2, 32, 32);

    const material = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });

    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    const pointsMaterial = new THREE.PointsMaterial({
      color: 0x22d3ee,
      size: 0.03,
      transparent: true,
      opacity: 0.25,
    });
    const earthPoints = new THREE.Points(geometry, pointsMaterial);
    earth.add(earthPoints);

    earth.position.y = 0.2;

    let animationFrameId: number;

    // Instantiate the spec-compliant Timer object
    const timer = new THREE.Timer();

    const animate = () => {
      // 1. Advance the timer tracking internals for the current animation frame
      timer.update();

      // 2. Fetch the calculated elapsed runtime values safely
      const elapsedTime = timer.getElapsed();

      earth.rotation.y = elapsedTime * 0.06;
      earth.rotation.x = elapsedTime * 0.02;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      geometry.dispose();
      material.dispose();
      pointsMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  // --- GSAP Interface Entry Animations ---
  useGSAP(
    () => {
      gsap.from(".animate-hero-fade", {
        opacity: 0,
        y: 24,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      });

      heroStats.forEach((stat) => {
        const node = statsMapRef.current.get(stat.id);
        if (!node) return;

        const proxy = { value: 0 };

        gsap.to(proxy, {
          value: stat.numericValue,
          duration: 2.2,
          delay: 0.5,
          ease: "power2.out",
          onUpdate: () => {
            const currentVal = proxy.value;
            const isFinished = currentVal === stat.numericValue;

            node.innerText = isFinished
              ? `${stat.numericValue}${stat.suffix}`
              : `${currentVal.toFixed(1)}${stat.suffix}`;
          },
          onComplete: () => {
            node.innerText = `${stat.numericValue}${stat.suffix}`;
          },
        });
      });
    },
    { scope: containerRef },
  );

  return (
    <header
      ref={containerRef}
      className="bg-zinc-950 text-white relative overflow-hidden pt-24 pb-28 md:pt-36 md:pb-40 border-b border-zinc-900 w-full"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(#22d3ee 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10 pointer-events-auto">
        {/* Badge Indicator */}
        <div className="animate-hero-fade">
          <span className="inline-flex items-center gap-2 bg-cyan-950/40 text-cyan-400 text-xs font-semibold px-3.5 py-1.5 rounded-full border border-cyan-800/40 mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            {t("heroBadge")}
          </span>
        </div>

        {/* Hero Typography */}
        <h1 className="animate-hero-fade text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 leading-[1.15]">
          {t("heroHeadingMain")}
          <br />
          {t("heroHeadingSub")}{" "}
          <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.15)]">
            {t("heroMarket")}
          </span>
        </h1>

        {/* Sub-Paragraph */}
        <p className="animate-hero-fade text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-14 leading-relaxed font-medium">
          {t("heroDescription")}
        </p>

        {/* Metrics Grid Container */}
        <div className="animate-hero-fade flex flex-col sm:flex-row justify-center items-center gap-10 md:gap-16 bg-zinc-900/20 border border-zinc-800/40 rounded-2xl p-8 max-w-3xl mx-auto backdrop-blur-md shadow-2xl">
          {heroStats.map((s) => (
            <div key={s.id} className="text-center sm:text-left min-w-35">
              <div
                ref={(el) => setStatRef(el, s.id)}
                className="text-3xl sm:text-4xl font-black text-white tracking-tight tabular-nums"
              >
                0{s.suffix}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1.5 uppercase tracking-widest font-bold">
                {t(s.labelKey)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
