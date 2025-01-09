import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export function AnimatedBackground() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-0">
      {/* Base gradient */}
      <div
        className={`absolute inset-0 transition-colors duration-300
          ${
            isDark
              ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950'
              : 'bg-gradient-to-br from-blue-50 via-white to-blue-50'
          }`}
      />

      {/* Animated grid */}
      <div
        className={`absolute inset-0 
          ${isDark ? 'opacity-20' : 'opacity-30'}`}
        style={{
          backgroundImage: `linear-gradient(${
            isDark ? '#ffffff20' : '#00000015'
          } 1px, transparent 1px),
                           linear-gradient(90deg, ${
                             isDark ? '#ffffff20' : '#00000015'
                           } 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite',
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'center 0',
        }}
      />

      {/* Glow effect */}
      <div
        className={`absolute inset-0 
          ${
            isDark
              ? 'bg-gradient-to-t from-transparent via-blue-950/30 to-transparent'
              : 'bg-gradient-to-t from-transparent via-blue-500/20 to-transparent'
          }`}
      />
    </div>
  );
}
