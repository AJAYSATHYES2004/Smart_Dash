import React from 'react';
import { motion } from 'framer-motion';

interface SpeedometerProps {
  speed: number;
  maxSpeed?: number;
  warningSpeed?: number;
}

const Speedometer: React.FC<SpeedometerProps> = ({ speed, maxSpeed = 240, warningSpeed }) => {
  const percentage = Math.min(speed / maxSpeed, 1);
  const rotation = (percentage * 270) - 45; // 0 speed = -45, 240 speed = 225

  const isWarning = warningSpeed && speed > warningSpeed * 0.8;
  const isDanger = warningSpeed && speed >= warningSpeed;

  // Generate tick marks
  const ticks = [];
  for (let i = 0; i <= 12; i++) {
    const angle = (i / 12) * 270 + 225; // 0 speed at 225 degrees (Top-Left)
    const speedValue = Math.round((i / 12) * maxSpeed);
    const isMajor = i % 2 === 0;
    ticks.push({ angle, speedValue, isMajor });
  }

  return (
    <div className="relative w-72 h-72 mx-auto">
      {/* Outer glow ring */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-300 ${isDanger ? 'danger-glow' : isWarning ? 'warning-glow' : 'neon-glow'
          }`}
      />

      {/* Background circle */}
      <svg viewBox="0 0 200 200" className="w-full h-full transform transition-transform duration-500">
        <defs>
          <linearGradient id="speedGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--success-green))" />
            <stop offset="40%" stopColor="hsl(var(--neon-cyan))" />
            <stop offset="70%" stopColor="hsl(var(--warning-amber))" />
            <stop offset="100%" stopColor="hsl(var(--emergency-red))" />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background track */}
        <path
          d="M 43.43 156.57 A 80 80 0 1 1 156.57 156.57"
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth="12"
          strokeLinecap="round"
          transform="rotate(90 100 100)"
        />

        {/* Speed arc */}
        <motion.path
          d="M 43.43 156.57 A 80 80 0 1 1 156.57 156.57"
          fill="none"
          stroke="url(#speedGradient)"
          strokeWidth="12"
          strokeDasharray="377"
          initial={{ strokeDashoffset: 377 }}
          animate={{ strokeDashoffset: 377 - (percentage * 377) }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          strokeLinecap="round"
          transform="rotate(90 100 100)"
          filter="url(#glow)"
        />

        {/* Tick marks and Labels */}
        {ticks.map((tick, i) => {
          const radians = (tick.angle * Math.PI) / 180;
          const outerRadius = 85;
          const innerRadius = tick.isMajor ? 75 : 80;
          const labelRadius = 60;

          const x1 = 100 + innerRadius * Math.cos(radians);
          const y1 = 100 + innerRadius * Math.sin(radians);
          const x2 = 100 + outerRadius * Math.cos(radians);
          const y2 = 100 + outerRadius * Math.sin(radians);

          return (
            <g key={i}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={tick.isMajor ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))"}
                strokeWidth={tick.isMajor ? 2 : 1}
              />
              {tick.isMajor && (
                <text
                  x={100 + labelRadius * Math.cos(radians)}
                  y={100 + labelRadius * Math.sin(radians)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="hsl(var(--muted-foreground))"
                  fontSize="8"
                  fontFamily="Orbitron"
                  className="font-bold"
                >
                  {tick.speedValue}
                </text>
              )}
            </g>
          );
        })}

        {/* Center plate */}
        <circle
          cx="100"
          cy="100"
          r="40"
          fill="hsl(var(--card))"
          stroke="hsl(var(--border))"
          strokeWidth="2"
        />
      </svg>

      {/* Digital speed display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={speed}
          initial={{ scale: 1.1, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`font-display text-5xl font-bold leading-none ${isDanger ? 'text-emergency' : isWarning ? 'text-warning' : 'text-primary'
            } neon-text`}
        >
          {speed}
        </motion.span>
        <span className="text-muted-foreground text-[10px] font-display mt-2 tracking-widest">km/h</span>
      </div>
    </div>
  );
};

export default Speedometer;
