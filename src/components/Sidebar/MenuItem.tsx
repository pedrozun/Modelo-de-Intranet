import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MenuItemProps {
  icon: React.ComponentType<any>;
  label: string;
  path?: string;
  isExpanded: boolean;
  hasSubmenu?: boolean;
  isSubmenuOpen?: boolean;
  isActive?: boolean;
  onMouseEnter?: () => void;
  onClick?: (e: React.MouseEvent) => void;
}

export function MenuItem({
  icon: Icon,
  label,
  path,
  isExpanded,
  hasSubmenu,
  isSubmenuOpen,
  isActive,
  onMouseEnter,
  onClick,
}: MenuItemProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsAnimating(true);
    onMouseEnter?.(e);
  };

  const handleAnimationEnd = () => {
    setIsAnimating(false);
  };

  return (
    <a
      href={path}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      className={`
        flex items-center gap-2 py-3 rounded-lg cursor-pointer
        mx-2 transition-all duration-200
        ${isExpanded ? 'px-4' : 'justify-center px-2'}
        ${hasSubmenu && isSubmenuOpen ? 'bg-gray-300/50 dark:bg-slate-700' : ''}
        ${isActive ? 'bg-gray-300/50 dark:bg-slate-700' : ''}
        hover:bg-gray-300/50 dark:hover:bg-slate-700
      `}
    >
      <div
        className={isAnimating ? 'animate-bell' : ''}
        onAnimationEnd={handleAnimationEnd}
      >
        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400 min-w-5" />
      </div>
      {isExpanded && (
        <span className="whitespace-nowrap overflow-hidden transition-opacity duration-200 text-gray-700 dark:text-gray-200">
          {label}
        </span>
      )}
      {hasSubmenu && isExpanded && (
        <span className="ml-auto transition-transform duration-200 text-gray-600 dark:text-gray-400">
          {isSubmenuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      )}
    </a>
  );
}
