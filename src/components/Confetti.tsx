import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface Particle {
  id: number;
  x: number; // Left start %
  y: number; // Top start %
  targetX: number; // translate px
  targetY: number; // translate px
  rotation: number;
  color: string;
  size: number;
  shape: 'circle' | 'square' | 'triangle';
}

const CONFETTI_COLORS = [
  '#f472b6', // Pink
  '#38bdf8', // Blue
  '#facc15', // Yellow
  '#4ade80', // Green
  '#c084fc', // Purple
  '#fb923c'  // Orange
];

export const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const newParticles: Particle[] = Array.from({ length: 60 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 80 + Math.random() * 250;
      return {
        id: i,
        x: 40 + Math.random() * 20, // start near center
        y: 40 + Math.random() * 20,
        targetX: Math.cos(angle) * distance,
        targetY: Math.sin(angle) * distance + 200, // fall downwards slightly
        rotation: Math.random() * 360 + 360,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 8 + Math.random() * 14,
        shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as any
      };
    });

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
    }, 3000);

    return () => clearTimeout(timer);
  }, [active]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            scale: 0,
            rotate: 0,
            opacity: 1
          }}
          animate={{
            x: p.targetX,
            y: p.targetY,
            scale: [1, 1.2, 0.5],
            rotate: p.rotation,
            opacity: [1, 1, 0]
          }}
          transition={{
            duration: 2 + Math.random() * 1.5,
            ease: 'easeOut'
          }}
          className="absolute"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.shape !== 'triangle' ? p.color : undefined,
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'square' ? '4px' : undefined,
            borderLeft: p.shape === 'triangle' ? `${p.size / 2}px solid transparent` : undefined,
            borderRight: p.shape === 'triangle' ? `${p.size / 2}px solid transparent` : undefined,
            borderBottom: p.shape === 'triangle' ? `${p.size}px solid ${p.color}` : undefined
          }}
        />
      ))}
    </div>
  );
};
