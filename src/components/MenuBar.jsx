import React, { useState } from 'react';
import { ChevronDown, FileText, Download, Upload, LogOut, Undo, Redo, Copy, Clipboard as Paste, Settings, Eye, Navigation, Calculator, BarChart3, AppWindow as Window, BookOpen, Info, RefreshCw, User } from 'lucide-react';
import Logo from './Logo.jsx';

const MenuBar = ({ onMenuAction, userName = "Priyam", onProfileAction }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const menuItems = [
    {
      label: 'File',
      items: [
        { label: 'New Project', icon: FileText, action: 'new-project' },
        { type: 'separator' },
        { label: 'Import Data', icon: Upload, action: 'import-data' },
        { label: 'Export Data', icon: Download, action: 'export-data' },
        { type: 'separator' },
        { label: 'Exit', icon: LogOut, action: 'exit' }
      ]
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', icon: Undo, action: 'undo', shortcut: 'Ctrl+Z' },
        { label: 'Redo', icon: Redo, action: 'redo', shortcut: 'Ctrl+Y' },
        { type: 'separator' },
        { label: 'Copy', icon: Copy, action: 'copy', shortcut: 'Ctrl+C' },
        { label: 'Paste', icon: Paste, action: 'paste', shortcut: 'Ctrl+V' },
        { type: 'separator' },
        { label: 'Preferences', icon: Settings, action: 'preferences' }
      ]
    },
    {
      label: 'View',
      items: [
        { label: 'Show Navigation', icon: Eye, action: 'show-navigation' },
        { label: 'Show Results', icon: Eye, action: 'show-results' },
        { type: 'separator' },
        { label: 'Reset Layout', icon: RefreshCw, action: 'reset-layout' }
      ]
    },
    {
      label: 'Navigate',
      items: [
        { label: 'Go to Process', icon: Navigation, action: 'goto-process' },
        { label: 'Go to Flow', icon: Navigation, action: 'goto-flow' },
        { label: 'Go to Product System', icon: Navigation, action: 'goto-system' }
      ]
    },
    {
      label: 'Run',
      items: [
        { label: 'LCA Calculation', icon: Calculator, action: 'run-lca' },
        { label: 'Generate Report', icon: BarChart3, action: 'generate-report' }
      ]
    },
    {
      label: 'Window',
      items: [
        { label: 'Modeling Perspective', icon: Window, action: 'perspective-modeling' },
        { label: 'Analysis Perspective', icon: Window, action: 'perspective-analysis' }
      ]
    },
    {
      label: 'Help',
      items: [
        { label: 'Documentation', icon: BookOpen, action: 'help-docs' },
        { label: 'About OreSense AI', icon: Info, action: 'help-about' },
        { label: 'Check for Updates', icon: RefreshCw, action: 'help-update' }
      ]
    }
  ];

  const handleMenuClick = (menuLabel) => {
    setActiveMenu(activeMenu === menuLabel ? null : menuLabel);
  };

  const handleItemClick = (action) => {
    if (typeof onMenuAction === 'function') {
      onMenuAction(action);
    } else {
      console.error('MenuBar: onMenuAction is not a function:', onMenuAction);
    }
    
    setLastAction(action);
    setActiveMenu(null);
    
    // Clear the action indicator after 2 seconds
    setTimeout(() => setLastAction(null), 2000);
  };

  return (
    <div className="bg-white border-b border-gray-200 relative z-50">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Logo and Menu Items */}
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Logo size="small" />
            <span className="text-lg font-semibold text-gray-800">OreSense AI</span>
          </div>
          
          {/* Menu Items */}
          <div className="flex items-center">
          {menuItems.map((menu) => (
          <div key={menu.label} className="relative">
            <button
              onClick={() => handleMenuClick(menu.label)}
              className={`px-3 py-2 text-sm font-medium rounded hover:bg-gray-100 transition-colors flex items-center space-x-1 ${
                activeMenu === menu.label ? 'bg-gray-100' : ''
              }`}
            >
              <span>{menu.label}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            
            {activeMenu === menu.label && (
              <div className="absolute left-0 mt-1 w-56 bg-white border border-gray-200 shadow-lg rounded-md py-1 z-50">
                {menu.items.map((item, index) => (
                  item.type === 'separator' ? (
                    <div key={`sep-${index}`} className="border-t border-gray-100 my-1" />
                  ) : (
                    <button
                      key={item.action}
                      onClick={() => handleItemClick(item.action)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      {item.icon && <item.icon className="h-4 w-4 mr-3 text-gray-400" />}
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span className="ml-auto text-xs text-gray-400">
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
          </div>
        </div>
        
        {/* User Profile Section */}
        <div className="flex items-center space-x-4">
          {/* Status Bar */}
          {lastAction && (
            <div className="px-3 py-1 text-xs text-gray-500 bg-gray-50 rounded">
              Last action: {lastAction.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </div>
          )}
          
          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-600">Hey! {userName}</span>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </button>
            
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-md py-1 z-50">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onProfileAction) onProfileAction('user-profile');
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                >
                  <User className="h-4 w-4 mr-3 text-gray-400" />
                  <span>My Profile</span>
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onMenuAction) onMenuAction('exit');
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4 mr-3 text-gray-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {(activeMenu || showProfileMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setActiveMenu(null);
            setShowProfileMenu(false);
          }}
        />
      )}
    </div>
  );
};

export default MenuBar;