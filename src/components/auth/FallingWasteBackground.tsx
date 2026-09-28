"use client";

import React, { useEffect, useState } from "react";

interface WasteItemConfig {
  id: number;
  type: number; // 0 to 7
  left: number; // percentage
  size: number; // px (20 - 55)
  duration: number; // seconds (8 - 18)
  delay: number; // seconds (0 - 12)
  sway: number; // px (-30 to 30)
  rotation: number; // deg (90 to 720)
  opacity: number; // 0.2 to 0.4
}

// 8 SVG icons in cartoon flat style
const WASTE_SVGS = [
  // 0: Botol Plastik (Blue/Teal Plastic Bottle)
  <svg key="bottle" viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <path d="M9 2H15V4H9V2Z" fill="#38BDF8" />
    <path d="M10 4H14V6L16 9V20C16 21.1 15.1 22 14 22H10C8.9 22 8 21.1 8 20V9L10 4Z" fill="#7DD3FC" />
    <path d="M10 11H14M10 15H14" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" />
  </svg>,

  // 1: Kaleng Minuman (Red Soda Can)
  <svg key="can" viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <ellipse cx="12" cy="4" rx="5" ry="2" fill="#F87171" />
    <path d="M7 4V20C7 21.1 9.24 22 12 22C14.76 22 17 21.1 17 20V4" fill="#EF4444" />
    <path d="M7 10C7 11.1 9.24 12 12 12C14.76 12 17 11.1 17 10" stroke="#FCA5A5" strokeWidth="1.5" />
    <circle cx="12" cy="4" r="1.5" fill="#DC2626" />
  </svg>,

  // 2: Kertas (Crumbled Paper)
  <svg key="paper" viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <path d="M6 2H14L18 6V20C18 21.1 17.1 22 16 22H6C4.9 22 4 21.1 4 20V4C4 2.9 4.9 2 6 2Z" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" />
    <path d="M14 2V6H18" fill="#E2E8F0" />
    <path d="M8 10H14M8 14H12" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
  </svg>,

  // 3: Kardus (Box)
  <svg key="box" viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <path d="M3 8L12 3L21 8V16L12 21L3 16V8Z" fill="#F59E0B" />
    <path d="M12 3V21M3 8L12 13L21 8" stroke="#D97706" strokeWidth="1.5" />
    <path d="M12 13L7 10.5M12 13L17 10.5" stroke="#B45309" strokeWidth="1.5" />
  </svg>,

  // 4: Daun (Green Leaf)
  <svg key="leaf" viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2Z" fill="#34D399" />
    <path d="M2 12C7.5 12 12 7.5 12 2C12 7.5 16.5 12 22 12" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 12L19 19" stroke="#047857" strokeWidth="1.5" strokeLinecap="round" />
  </svg>,

  // 5: Kantong Plastik (Plastic Shopping Bag)
  <svg key="plastic_bag" viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <path d="M6 8V3C6 2.45 6.45 2 7 2H10C10.55 2 11 2.45 11 3V8M13 8V3C13 2.45 13.45 2 14 2H17C17.55 2 18 2.45 18 3V8" stroke="#A7F3D0" strokeWidth="2" strokeLinecap="round" />
    <path d="M5 8H19L20 21C20 21.55 19.55 22 19 22H5C4.45 22 4 21.55 4 21L5 8Z" fill="#A7F3D0" stroke="#34D399" strokeWidth="1.5" />
  </svg>,

  // 6: Kulit Pisang (Yellow Banana Peel)
  <svg key="banana" viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <path d="M12 3C12 3 13 8 8 12C5 14.4 3 18 3 20C7 20 10 17 12 14C14 17 17 20 21 20C21 18 19 14.4 16 12C11 8 12 3 12 3Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="12" cy="4" r="1.5" fill="#78350F" />
  </svg>,

  // 7: Gelas Plastik (Plastic Cup with Straw)
  <svg key="cup" viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <path d="M15 2L18 8H16" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
    <path d="M6 7H18V9H6V7Z" fill="#E2E8F0" />
    <path d="M7 9L8.5 21C8.6 21.6 9.1 22 9.7 22H14.3C14.9 22 15.4 21.6 15.5 21L17 9H7Z" fill="#38BDF8" fillOpacity="0.8" stroke="#0284C7" strokeWidth="1.5" />
    <line x1="7" y1="13" x2="17" y2="13" stroke="#BAE6FD" strokeWidth="1.5" />
  </svg>,
];

export default function FallingWasteBackground() {
  const [items, setItems] = useState<WasteItemConfig[]>([]);

  useEffect(() => {
    // Generate 26 random items on client mount
    const generated: WasteItemConfig[] = Array.from({ length: 26 }, (_, i) => ({
      id: i,
      type: Math.floor(Math.random() * 8),
      left: Math.floor(Math.random() * 94) + 1, // 1% to 95%
      size: Math.floor(Math.random() * 35) + 22, // 22px to 57px
      duration: parseFloat((Math.random() * 9 + 8).toFixed(1)), // 8s to 17s
      delay: parseFloat((Math.random() * 12).toFixed(1)), // 0s to 12s
      sway: Math.floor(Math.random() * 60) - 30, // -30px to 30px
      rotation: Math.floor(Math.random() * 630) + 90, // 90deg to 720deg
      opacity: parseFloat((Math.random() * 0.2 + 0.2).toFixed(2)), // 0.20 to 0.40
    }));
    setItems(generated);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
      <style>{`
        @keyframes fallAndSway {
          0% {
            transform: translateY(-10vh) rotate(0deg) translateX(0px);
            opacity: 0;
          }
          10% {
            opacity: var(--item-opacity);
          }
          90% {
            opacity: var(--item-opacity);
          }
          100% {
            transform: translateY(115vh) rotate(var(--item-rot)) translateX(var(--item-sway));
            opacity: 0;
          }
        }

        .falling-waste-item {
          position: absolute;
          top: 0;
          will-change: transform, opacity;
          animation: fallAndSway var(--item-dur) linear infinite;
          animation-delay: var(--item-delay);
        }
      `}</style>

      {items.map((item) => (
        <div
          key={item.id}
          className="falling-waste-item"
          style={
            {
              left: `${item.left}%`,
              width: `${item.size}px`,
              height: `${item.size}px`,
              "--item-dur": `${item.duration}s`,
              "--item-delay": `${item.delay}s`,
              "--item-sway": `${item.sway}px`,
              "--item-rot": `${item.rotation}deg`,
              "--item-opacity": item.opacity,
            } as React.CSSProperties
          }
        >
          {WASTE_SVGS[item.type]}
        </div>
      ))}
    </div>
  );
}
