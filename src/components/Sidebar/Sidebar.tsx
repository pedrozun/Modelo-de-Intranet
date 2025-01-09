import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, Pin, PinOff } from 'lucide-react';
import { MenuItem } from './MenuItem';
import { SubMenuItem } from './SubMenuItem';
import { useMenuState } from './hooks/useMenuState';
import { useAuth } from '../../contexts/AuthContext';
import { menuItems } from './config/menuItems';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const {
    isExpanded,
    isPinned,
    openSubmenuIndex,
    handleMouseEnter,
    handleMouseLeave,
    handleSubmenuMouseLeave,
    handleItemHover,
    togglePin,
  } = useMenuState();

  // Função para verificar se algum item do submenu está ativo
  const isSubmenuActive = (submenu: { path?: string }[]) =>
    submenu.some((subItem) => location.pathname === subItem.path);

  // Função que determina se o submenu deve estar aberto com base no item ativo
  const getSubmenuOpenState = (submenu: { path?: string }[], index: number) => {
    return openSubmenuIndex === index || isSubmenuActive(submenu);
  };

  const handleClick =
    (path: string, isExternal?: boolean) => (e: React.MouseEvent) => {
      e.preventDefault();
      if (isExternal) {
        window.open(path, '_blank', 'noopener,noreferrer');
      } else {
        navigate(path);
      }
    };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  return (
    <aside
      className="bg-gray-100/80 dark:bg-white/5 backdrop-blur-lg border-r border-gray-200 dark:border-white/10 
    text-gray-900 dark:text-white min-h-screen transition-all duration-300 ease-in-out flex-shrink-0 z-10"
      style={{ width: isExpanded ? '14rem' : '4rem' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative w-full flex justify-center items-center">
          {/* Menu icon for collapsed state */}
          <div
            className={`absolute transition-all duration-300 ease-in-out ${
              isExpanded ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
            }`}
          >
            <Menu size={32} className="text-gray-800 dark:text-gray-200" />
          </div>

          {/* Logo for expanded state */}
          <div
            className={`transition-all duration-300 ease-in-out ${
              isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`}
          >
            <img
              src="/logo.png"
              alt="K&M Logo"
              className="w-30 h-30 object-contain"
            />
          </div>
        </div>
        <h1
          className={`text-3xl font-bold mt-2 transition-all duration-300 text-gray-700 dark:text-gray-200
                      ${
                        isExpanded
                          ? 'opacity-100 h-auto'
                          : 'opacity-0 h-0 overflow-hidden'
                      }`}
        >
          Intranet
        </h1>

        {/* Pin button */}
        <button
          onClick={togglePin}
          className={`mt-2 p-2 rounded-lg transition-all duration-200
                     ${isExpanded ? 'opacity-100' : 'opacity-0'}
                     ${
                       isPinned
                         ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                         : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-200'
                     }
                     hover:bg-blue-100 dark:hover:bg-blue-900/30
                     hover:text-blue-600 dark:hover:text-blue-400`}
        >
          {isPinned ? (
            <Pin className="h-5 w-5" />
          ) : (
            <PinOff className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item, index) => (
          <div
            key={item.label}
            onMouseLeave={() => item.submenu && handleSubmenuMouseLeave()}
          >
            <MenuItem
              icon={item.icon}
              label={item.label}
              path={item.externalPath || (item.submenu ? undefined : item.path)}
              isExpanded={isExpanded}
              hasSubmenu={!!item.submenu}
              isSubmenuOpen={getSubmenuOpenState(item.submenu || [], index)}
              onMouseEnter={() => item.submenu && handleItemHover(index)}
              onClick={
                item.externalPath
                  ? handleClick(item.externalPath, true)
                  : item.path
                  ? handleClick(item.path)
                  : undefined
              }
              isActive={
                location.pathname === item.path ||
                (item.submenu && isSubmenuActive(item.submenu))
              }
            />

            {item.submenu && (
              <div
                className={`overflow-hidden transition-all duration-200 ease-in-out
                            ${
                              getSubmenuOpenState(item.submenu, index) &&
                              isExpanded
                                ? 'max-h-96 opacity-100 mt-1'
                                : 'max-h-0 opacity-0'
                            }`}
              >
                {item.submenu.map((subItem) => (
                  <SubMenuItem
                    key={subItem.label}
                    label={subItem.label}
                    path={subItem.externalPath || subItem.path}
                    isExpanded={isExpanded}
                    onClick={
                      subItem.externalPath
                        ? handleClick(subItem.externalPath, true)
                        : handleClick(subItem.path)
                    }
                    isActive={location.pathname === subItem.path}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        <MenuItem
          icon={LogOut}
          label="Sair"
          isExpanded={isExpanded}
          onClick={handleLogout}
        />
      </nav>
    </aside>
  );
}