import { useState, useEffect } from 'react';

export function useMenuState() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(() => {
    const savedPin = localStorage.getItem('sidebarPinned');
    return savedPin === 'true';
  });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [openSubmenuIndex, setOpenSubmenuIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isPinned) {
      setIsExpanded(true);
    }
  }, [isPinned]);

  useEffect(() => {
    localStorage.setItem('sidebarPinned', isPinned.toString());
  }, [isPinned]);

  const handleMouseEnter = () => {
    if (!isPinned) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      setIsExpanded(false);
      setOpenSubmenuIndex(null);
      setHoveredIndex(null);
    }
  };

  const handleSubmenuMouseLeave = () => {
    if (!isPinned) {
      setOpenSubmenuIndex(null);
      setHoveredIndex(null);
    }
  };

  const handleItemHover = (index: number) => {
    setHoveredIndex(index);
    setOpenSubmenuIndex(index);
  };

  const togglePin = () => {
    setIsPinned(!isPinned);
  };

  return {
    isExpanded,
    isPinned,
    hoveredIndex,
    openSubmenuIndex,
    handleMouseEnter,
    handleMouseLeave,
    handleSubmenuMouseLeave,
    handleItemHover,
    togglePin
  };
}