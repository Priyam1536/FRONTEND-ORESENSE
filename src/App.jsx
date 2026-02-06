import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import LoginPage from './components/LoginPage.jsx';
import MenuBar from './components/MenuBar.jsx';
import Toolbar from './components/Toolbar.jsx';
import EditorArea from './components/EditorArea.jsx';
import Sidebar from './components/Sidebar.jsx';
import { NotificationProvider, useNotification } from './components/NotificationSystem.jsx';

import { tokenStorage, authAPI } from './utils/api.jsx';

const LCAForm = lazy(() => import('./components/LCAForm.jsx'));
const ReportsDashboard = lazy(() => import('./components/ReportsDashboard.jsx'));
const LCAResultsPage = lazy(() => import('./components/LCAResultsPage.jsx'));
const ImpactResults = lazy(() => import('./components/ImpactResults.jsx'));
const TeamManagement = lazy(() => import('./components/TeamManagement.jsx'));
const Parameters = lazy(() => import('./components/Parameters.jsx'));
const UserProfile = lazy(() => import('./components/UserProfile.jsx'));
const AppSettings = lazy(() => import('./components/Settings.jsx'));
const FlowTemplates = lazy(() => import('./components/FlowTemplates.jsx'));
const PathwayComparisonModal = lazy(() => import('./components/PathwayComparisonModal.jsx'));


const AppContent = () => {
  // Initialize login state from token storage
  const [isLoggedIn, setIsLoggedIn] = useState(!!tokenStorage.getToken());
  const { showSuccess, showError, showInfo, showWarning } = useNotification();
  const [userData, setUserData] = useState(tokenStorage.getUserData());
  const [showLCAForm, setShowLCAForm] = useState(false);
  const [showPathwayComparison, setShowPathwayComparison] = useState(false);
  const [reports, setReports] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentReport, setCurrentReport] = useState(null);
  const [currentInsights, setCurrentInsights] = useState(null);
  const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');
  const [actionHistory, setActionHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [flowTemplates, setFlowTemplates] = useState([]);
  const [currentParameters, setCurrentParameters] = useState({});
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const transitionTimerRef = useRef(null);
  const prefetchDoneRef = useRef(false);

  const prefetchAppBundles = () => {
    if (prefetchDoneRef.current) return;
    prefetchDoneRef.current = true;
    // Fire-and-forget prefetch to reduce post-login load time
    import('./components/ReportsDashboard.jsx');
    import('./components/LCAForm.jsx');
    import('./components/ImpactResults.jsx');
    import('./components/TeamManagement.jsx');
    import('./components/Parameters.jsx');
    import('./components/UserProfile.jsx');
    import('./components/Settings.jsx');
    import('./components/FlowTemplates.jsx');
    import('./components/PathwayComparisonModal.jsx');
    import('./components/LCAResultsPage.jsx');
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              handleMenuAction('redo');
            } else {
              handleMenuAction('undo');
            }
            break;
          case 'y':
            e.preventDefault();
            handleMenuAction('redo');
            break;
          case 'c':
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
              e.preventDefault();
              handleMenuAction('copy');
            }
            break;
          case 'v':
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
              e.preventDefault();
              handleMenuAction('paste');
            }
            break;
          case 'n':
            e.preventDefault();
            handleMenuAction('new-project');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, actionHistory, currentReport]);

  // Verify token is valid on initial load
  useEffect(() => {
    const verifyToken = async () => {
      const token = tokenStorage.getToken();
      if (token) {
        try {
          // Attempt to get user profile with the stored token
          const profile = await authAPI.getProfile(token);
          setUserData(profile);
          setIsLoggedIn(true);
          prefetchAppBundles();
        } catch (error) {
          // Token is invalid, clear it
          console.error("Invalid token:", error);
          tokenStorage.removeToken();
          tokenStorage.clearUserData();
          setIsLoggedIn(false);
        }
      }
      setIsBootstrapping(false);
    };
    
    verifyToken();
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleUserDataUpdated = () => {
      setUserData(tokenStorage.getUserData());
    };

    window.addEventListener('userDataUpdated', handleUserDataUpdated);
    return () => {
      window.removeEventListener('userDataUpdated', handleUserDataUpdated);
    };
  }, []);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUserData(userData);
    prefetchAppBundles();
  };

  const handleLogout = () => {
    tokenStorage.removeToken();
    tokenStorage.clearUserData();
    setIsLoggedIn(false);
    setUserData(null);
  };

  const handleMenuAction = (action) => {
    console.log('Menu action:', action);
    
    switch (action) {
      // File Menu Actions
      case 'new-project':
        setShowLCAForm(true);
        break;
      case 'import-data':
        // Create file input for importing data
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json,.csv,.xlsx';
        fileInput.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            console.log('Importing file:', file.name);
            // Add file import logic here
            showInfo(`Importing file: ${file.name}`);
          }
        };
        fileInput.click();
        break;
      case 'export-data':
        // Export current data
        const data = { reports, userData, parameters: 'sample-data' };
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `oresense-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        break;
      case 'exit':
        if (confirm('Are you sure you want to exit the application?')) {
          handleLogout();
        }
        break;
      
      // Edit Menu Actions
      case 'undo':
        if (historyIndex >= 0) {
          const action = actionHistory[historyIndex];
          // Restore previous state
          if (action.type === 'DELETE_REPORT') {
            setReports(action.before.reports);
          }
          setHistoryIndex(historyIndex - 1);
          showSuccess(`Undid: ${action.type}`);
        } else {
          showWarning('Nothing to undo');
        }
        break;
      case 'redo':
        if (historyIndex < actionHistory.length - 1) {
          const nextIndex = historyIndex + 1;
          const action = actionHistory[nextIndex];
          // Restore next state
          if (action.type === 'DELETE_REPORT') {
            setReports(action.after.reports);
          }
          setHistoryIndex(nextIndex);
          showSuccess(`Redid: ${action.type}`);
        } else {
          showWarning('Nothing to redo');
        }
        break;
      case 'copy':
        // Copy current selection or data
        if (currentReport) {
          navigator.clipboard.writeText(JSON.stringify(currentReport, null, 2));
          showSuccess('Current report data copied to clipboard');
        } else {
          showWarning('No data to copy. Please select a report first.');
        }
        break;
      case 'paste':
        // Paste from clipboard
        navigator.clipboard.readText().then(text => {
          try {
            const data = JSON.parse(text);
            console.log('Pasted data:', data);
            showSuccess('Data pasted successfully');
          } catch (e) {
            showError('Invalid data in clipboard');
          }
        });
        break;
      case 'preferences':
        setActiveSidebarItem('settings');
        break;
      
      // View Menu Actions
      case 'show-navigation':
        // Toggle navigation panel visibility
        showInfo('Navigation panel toggled');
        break;
      case 'show-results':
        setActiveSidebarItem('impact-results');
        showSuccess('Switched to Results view');
        break;
      case 'reset-layout':
        // Reset to default layout
        setTabs([]);
        setActiveTab('');
        setActiveSidebarItem('dashboard');
        showInfo('Layout reset to default');
        break;
      
      // Navigate Menu Actions
      case 'goto-process':
        setActiveSidebarItem('parameters');
        showSuccess('Navigated to Process Parameters');
        break;
      case 'goto-flow':
        setActiveSidebarItem('impact-results');
        showSuccess('Navigated to Impact Flow Analysis');
        break;
      case 'goto-system':
        setActiveSidebarItem('dashboard');
        showSuccess('Navigated to System Dashboard');
        break;
      
      // Run Menu Actions
      case 'run-lca':
        setShowLCAForm(true);
        showInfo('Starting LCA Calculation Process');
        break;
      case 'generate-report':
        if (reports.length > 0) {
          setActiveSidebarItem('reports');
          showSuccess(`Generating report for ${reports.length} available reports`);
        } else {
          showWarning('No reports available. Please create an LCA first.');
        }
        break;
      
      // Window Menu Actions
      case 'perspective-modeling':
        setActiveSidebarItem('parameters');
        showSuccess('Switched to Modeling Perspective');
        break;
      case 'perspective-analysis':
        setActiveSidebarItem('impact-results');
        showSuccess('Switched to Analysis Perspective');
        break;
      
      // Help Menu Actions
      case 'help-docs':
        window.open('https://docs.oresense.ai', '_blank');
        break;
      case 'help-about':
        showInfo('OreSense AI v2.0 - Environmental Impact Assessment Platform. © 2025 OreSense Technologies. Built with React, Node.js, and MongoDB');
        break;
      case 'help-update':
        showInfo('Checking for updates... You are running the latest version of OreSense AI v2.0');
        break;
      
      default:
        console.log('Unhandled menu action:', action);
        showWarning(`Menu action "${action}" is not yet implemented`);
    }
  };

  // Utility function to record actions for undo/redo
  const recordAction = (actionType, beforeState, afterState) => {
    const action = {
      type: actionType,
      before: beforeState,
      after: afterState,
      timestamp: new Date().toISOString()
    };
    
    const newHistory = actionHistory.slice(0, historyIndex + 1);
    newHistory.push(action);
    setActionHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Enhanced functions with action recording
  const handleNewReportWithHistory = () => {
    const beforeState = { reports: [...reports] };
    setShowLCAForm(true);
    // Record action when form is completed
  };

  const handleDeleteReportWithHistory = (reportId) => {
    const beforeState = { reports: [...reports] };
    const newReports = reports.filter(r => r.id !== reportId);
    setReports(newReports);
    const afterState = { reports: newReports };
    recordAction('DELETE_REPORT', beforeState, afterState);
  };

  const handleToolbarAction = (action) => {
    console.log('Toolbar action:', action);
    
    // Show notification for any action
    try {
      showInfo(`Toolbar action: ${action.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
    
    switch (action) {
      case 'new-project':
        setShowLCAForm(true);
        showSuccess('Opening new project form');
        break;
      
      case 'import':
        // Create file input for importing data
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json,.csv,.xlsx,.xml';
        fileInput.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            console.log('Importing file:', file.name);
            showSuccess(`Importing file: ${file.name}`);
            // Add file import logic here
          }
        };
        fileInput.click();
        break;
      
      case 'export':
        // Export current data
        const data = { 
          reports, 
          userData, 
          parameters: 'sample-data',
          exportDate: new Date().toISOString(),
          appVersion: '1.0.0'
        };
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `oresense-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        showSuccess('Data exported successfully');
        break;
      
      case 'save':
        // Save current work
        try {
          localStorage.setItem('oresense_workspace', JSON.stringify({
            reports,
            userData,
            activeSidebarItem,
            timestamp: new Date().toISOString()
          }));
          showSuccess('Workspace saved successfully');
        } catch (error) {
          showError('Failed to save workspace: ' + error.message);
        }
        break;
      
      case 'refresh':
        // Refresh data
        window.location.reload();
        break;
      
      case 'delete':
        if (activeSidebarItem === 'reports' && reports.length > 0) {
          if (confirm('Are you sure you want to delete the selected report?')) {
            const newReports = reports.slice(0, -1); // Remove last report as example
            setReports(newReports);
            showSuccess('Report deleted successfully');
          }
        } else {
          showWarning('No item selected for deletion');
        }
        break;
      
      case 'run-lca':
        showInfo('Starting LCA calculation...');
        setTimeout(() => {
          showSuccess('LCA calculation completed!');
        }, 2000);
        break;
      
      case 'generate-report':
        setActiveSidebarItem('reports');
        showSuccess('Generating report... Check the Reports section');
        break;
      
      case 'system-editor':
        setActiveSidebarItem('systemEditor');
        showInfo('Opening Product System Editor');
        break;
      
      case 'process-editor':
        setActiveSidebarItem('processEditor');
        showInfo('Opening Process Editor');
        break;
      
      case 'settings':
        setActiveSidebarItem('settings');
        showInfo('Opening Settings panel');
        break;
      
      default:
        showWarning(`Action "${action}" not implemented yet`);
        break;
    }
  };

  const handleItemSelect = (itemId) => {
    if (!itemId) return; // Guard against null/undefined items
    
    // Handle sidebar navigation
    setActiveSidebarItem(itemId);
    
    // For special navigation items like LCA Form, use existing logic
    if (itemId === 'lcaForm') {
      setShowLCAForm(true);
      return;
    }
    
    // Clear tabs when navigating to main pages
    setTabs([]);
    setActiveTab('');
  };

  // Flow Template Handlers
  const handleSelectTemplate = (template) => {
    setCurrentParameters(template.parameters);
    setActiveSidebarItem('parameters');
    showSuccess(`Template "${template.name}" loaded! Parameters have been prefilled.`);
  };

  const handleCreateTemplate = (template) => {
    setFlowTemplates(prev => [...prev, template]);
    showSuccess(`Template "${template.name}" created successfully!`);
  };

  const handleSaveTemplate = (template) => {
    setFlowTemplates(prev => 
      prev.map(t => t.id === template.id ? template : t)
    );
    showSuccess(`Template "${template.name}" updated successfully!`);
  };

  const handleDeleteTemplate = (templateId) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setFlowTemplates(prev => prev.filter(t => t.id !== templateId));
      showSuccess('Template deleted successfully!');
    }
  };

  const handleTabClose = (tabId) => {
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    if (activeTab === tabId && newTabs.length > 0) {
      setActiveTab(newTabs[newTabs.length - 1].id);
    } else if (newTabs.length === 0) {
      setActiveTab('');
    }
  };

  const handleNewTab = () => {
    const newTab = {
      id: `new-${Date.now()}`,
      title: 'New Item',
      type: 'general'
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newTab.id);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleNewReport = () => {
    setShowLCAForm(true);
  };

  const handleComparePathways = () => {
    setShowPathwayComparison(true);
  };

  const handleLCAFormComplete = (formData) => {
    // Generate a new report from the form data
    const newReport = {
      id: `report-${Date.now()}`,
      name: `${formData.metalType || 'Metal'} LCA Report`,
      metalType: formData.metalType || 'Unknown',
      createdDate: new Date().toLocaleDateString(),
      status: 'completed',
      co2Impact: formData.globalWarmingPotential ? `${formData.globalWarmingPotential} kg CO₂-eq` : 'TBD'
    };
    
    setReports([...reports, newReport]);
    setShowLCAForm(false);
  };

  const handleLCAFormCancel = () => {
    setShowLCAForm(false);
  };

  const handleClosePathwayComparison = () => {
    setShowPathwayComparison(false);
  };

  const handleViewReport = (reportId) => {
    console.log('Viewing report:', reportId);
    // Here you would implement report viewing functionality
    const report = reports.find(r => r.id === reportId);
    if (report) {
      // Create a tab for this report
      handleItemSelect({
        id: report.id,
        label: report.name,
        type: 'report',
        data: report
      });
    }
  };

  const handleViewDetailedResults = (formData, insights) => {
    // Create a report if not already in reports list
    let report = reports.find(r => 
      r.formData && r.formData.metalType === formData.metalType
    );
    
    if (!report) {
      report = {
        id: Date.now().toString(),
        name: `LCA for ${formData.metalType || 'Metal'}`,
        metalType: formData.metalType || 'Unknown',
        createdDate: new Date().toLocaleDateString(),
        status: 'Completed',
        co2Impact: formData.globalWarmingPotential ? 
          `${formData.globalWarmingPotential} kg CO₂-eq` : 'Not calculated',
        formData: formData
      };
      setReports([report, ...reports]);
    }
    
    setCurrentReport(report);
    setCurrentInsights(insights);
    setCurrentPage('results');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  // Render login page if not logged in
  if (isBootstrapping) {
    return null;
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Render LCA form if showing form
  if (showLCAForm) {
    return (
      <Suspense fallback={null}>
        <LCAForm 
          onComplete={handleLCAFormComplete}
          onCancel={handleLCAFormCancel}
        />
      </Suspense>
    );
  }

  if (showPathwayComparison) {
    return (
      <Suspense fallback={null}>
        <PathwayComparisonModal 
          onClose={handleClosePathwayComparison}
        />
      </Suspense>
    );
  }

  // Render main application UI
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <MenuBar 
        onMenuAction={handleMenuAction} 
        userName={userData?.name || "Priyam"}
        onProfileAction={handleItemSelect}
      />
      <Toolbar onToolbarAction={handleToolbarAction} />
      
      <Suspense fallback={null}>
        <div className="flex-1 flex overflow-hidden">
          <div className="w-64 flex-shrink-0">
            <Sidebar onItemSelect={handleItemSelect} activeItem={activeSidebarItem} />
          </div>
          
          <div className="flex-1 flex flex-col">
            {tabs.length === 0 ? (
              <div className="flex-1 overflow-y-auto bg-gray-50">
                {activeSidebarItem === 'dashboard' && (
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">LCA Reports Dashboard</h1>
                    <ReportsDashboard 
                      reports={reports}
                      onNewReport={handleNewReport}
                      onComparePathways={handleComparePathways}
                    />
                  </div>
                )}
                {activeSidebarItem === 'flows' && (
                  <FlowTemplates
                    flowTemplates={flowTemplates}
                    onSelectTemplate={handleSelectTemplate}
                    onSaveTemplate={handleSaveTemplate}
                    onDeleteTemplate={handleDeleteTemplate}
                    onCreateTemplate={handleCreateTemplate}
                    currentParameters={currentParameters}
                  />
                )}
                {activeSidebarItem === 'impact-results' && <ImpactResults />}
                {activeSidebarItem === 'team-management' && <TeamManagement />}
                {activeSidebarItem === 'parameters' && (
                  <Parameters 
                    currentParameters={currentParameters} 
                    onParametersChange={setCurrentParameters}
                  />
                )}
                {activeSidebarItem === 'user-profile' && <UserProfile />}
                {activeSidebarItem === 'settings' && <AppSettings />}
              </div>
            ) : (
              <EditorArea
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                onTabClose={handleTabClose}
                onNewTab={handleNewTab}
              />
            )}
          </div>
        </div>

        {currentPage === 'results' && currentReport && (
          <LCAResultsPage
            formData={currentReport.formData}
            insights={currentInsights}
            onBack={handleBackToDashboard}
            onExport={(format) => console.log(`Export in ${format} format requested`)}
          />
        )}
      </Suspense>
    </div>
  );
};

function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}

export default App;
