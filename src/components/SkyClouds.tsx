"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Cloud = {
  id: string;
  variant: "cloud" | "cloud2" | "cloud3";
  top: number; // percentage [0, 100]
  width: number; // px
  duration: number; // seconds
  floatDuration: number; // seconds
  amplitude: number; // px
  direction: "ltr" | "rtl";
  opacity: number;
};

const variants = ["cloud", "cloud2", "cloud3"] as const;

function randomCloud(): Cloud {
  const id = Math.random().toString(36).slice(2);
  const variant = variants[Math.floor(Math.random() * variants.length)];
  const top = Math.random() * 70 + 10; // 10% - 80%
  const width = Math.random() * 220 + 120; // 120px - 340px
  const duration = Math.random() * 50 + 35; // 35s - 85s 横向漂移时长
  const floatDuration = Math.random() * 10 + 8; // 8s - 18s 轻微上下浮动
  const amplitude = Math.random() * 10 + 6; // 6px - 16px
  const direction = Math.random() < 0.5 ? "ltr" : "rtl";
  const opacity = Math.random() * 0.35 + 0.55; // 0.55 - 0.9
  return { id, variant, top, width, duration, floatDuration, amplitude, direction, opacity };
}

export default function SkyClouds() {
  const [clouds, setClouds] = useState<Cloud[]>([]);
  const [target, setTarget] = useState<number>(() => Math.floor(Math.random() * 5) + 6); // 初始 6-10 朵
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 每 25 秒随机改变目标云朵数量，呈现“不同时间不同数量”的感觉
  useEffect(() => {
    const t = setInterval(() => {
      setTarget(Math.floor(Math.random() * 6) + 5); // 5 - 10
    }, 25000);
    return () => clearInterval(t);
  }, []);

  // 逐步逼近目标数量：如果少则生成，如果多则在下一次动画结束时自然减少
  useEffect(() => {
    if (clouds.length < target) {
      const diff = target - clouds.length;
      const batch = Array.from({ length: diff }, () => randomCloud());
      // 分散插入，避免同一帧大量生成
      let i = 0;
      const tick = setInterval(() => {
        setClouds(prev => (i < batch.length ? [...prev, batch[i++]] : prev));
        if (i >= batch.length) clearInterval(tick);
      }, 600);
      return () => clearInterval(tick);
    }
  }, [target, clouds.length]);

  // 初始生成一些云朵
  useEffect(() => {
    setClouds(Array.from({ length: target }, () => randomCloud()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const srcMap = useMemo(() => ({
    cloud: "/cloud.svg",
    cloud2: "/cloud2.svg",
    cloud3: "/cloud3.svg",
  }), []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      {clouds.map(c => (
        <div
          key={c.id}
          className="absolute will-change-transform"
          style={{
            top: `${c.top}%`,
            left: c.direction === "ltr" ? "-40vw" : "140vw",
            opacity: c.opacity,
            animationName: c.direction === "ltr" ? "cloudMoveL" : "cloudMoveR",
            animationDuration: `${c.duration}s`,
            animationTimingFunction: "linear",
            animationIterationCount: 1,
          }}
          onAnimationEnd={() => {
            setClouds(prev => prev.filter(x => x.id !== c.id));
          }}
        >
          <div
            className="will-change-transform"
            style={{
              animationName: "cloudFloatY",
              animationDuration: `${c.floatDuration}s`,
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              ["--amp" as any]: `${c.amplitude}px`,
            }}
          >
            <img src={srcMap[c.variant]} alt="cloud" style={{ width: c.width }} />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes cloudMoveL {
          from { transform: translateX(0); }
          to { transform: translateX(180vw); }
        }
        @keyframes cloudMoveR {
          from { transform: translateX(0); }
          to { transform: translateX(-180vw); }
        }
        @keyframes cloudFloatY {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(var(--amp)); }
        }
      `}</style>
    </div>
  );
}

