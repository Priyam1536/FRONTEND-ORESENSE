import React from 'react';
import { 
  Plus,
  Upload,
  Download,
  Save,
  RefreshCw,
  Trash2,
  Calculator,
  GitBranch,
  Layers,
  BarChart3,
  Settings
} from 'lucide-react';

const Toolbar = ({ onToolbarAction }) => {
  const toolbarItems = [
    { icon: Plus, label: 'New Project', action: 'new-project' },
    { type: 'separator' },
    { icon: Upload, label: 'Import', action: 'import' },
    { icon: Download, label: 'Export', action: 'export' },
    { type: 'separator' },
    { icon: Save, label: 'Save', action: 'save' },
    { icon: RefreshCw, label: 'Refresh', action: 'refresh' },
    { icon: Trash2, label: 'Delete', action: 'delete' },
    { type: 'separator' },
    { icon: Calculator, label: 'Run LCA', action: 'run-lca' },
    { icon: BarChart3, label: 'Generate Report', action: 'generate-report' },
    { type: 'separator' },
    { icon: GitBranch, label: 'Product System Editor', action: 'system-editor' },
    { icon: Layers, label: 'Process Editor', action: 'process-editor' },
    { type: 'separator' },
    { icon: Settings, label: 'Settings', action: 'settings' }
  ];

  return (
    <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
      <div className="flex items-center space-x-1">
        {toolbarItems.map((item, index) => (
          item.type === 'separator' ? (
            <div key={index} className="w-px h-6 bg-gray-300 mx-2" />
          ) : (
            <button
              key={index}
              onClick={() => onToolbarAction(item.action)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors group relative"
              title={item.label}
            >
              <item.icon className="h-4 w-4" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {item.label}
              </div>
            </button>
          )
        ))}
      </div>
    </div>
  );
};

export default Toolbar;