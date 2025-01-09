import React from 'react';

interface SubMenuItemProps {
  label: string;
  path: string;
  isExpanded: boolean;
  isActive?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export function SubMenuItem({
  label,
  path,
  isExpanded,
  isActive,
  onClick,
}: SubMenuItemProps) {
  return (
    <a
      href={path}
      onClick={onClick}
      className={`
        flex items-center gap-2 px-2 py-2 pl-9 mt-0 mb-1 mx-4
        text-sm text-gray-700 dark:text-gray-200 cursor-pointer
        hover:bg-gray-300/50 dark:hover:bg-slate-700 rounded-lg transition-colors
        ${isActive ? 'bg-gray-300/50 dark:bg-slate-700' : ''}
      `}
    >
      {isExpanded && <span>{label}</span>}
    </a>
  );
}
