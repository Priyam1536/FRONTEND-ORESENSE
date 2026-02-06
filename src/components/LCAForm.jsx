import React, { useState, lazy, Suspense, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Mountain, 
  Factory, 
  Truck, 
  Timer, 
  Recycle, 
  BarChart3, 
  ArrowDownCircle,
  LayoutGrid,
  ArrowUpCircle,
  Waves,
  TreePine,
  Zap,
  Download,
  Eye,
  X,
  File,
  FileText,
  ClipboardList,
  Loader,
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
  Lightbulb // Added for prediction button
} from 'lucide-react';

// Lazy load components
const LCAProcessFlow = lazy(() => import('./EnhancedLCAProcessFlow'));
const LCAInsightsDashboard = lazy(() => import('./LCAInsightsDashboard'));

// Complete form field configuration for all steps
const formConfig = {
  step1: {
    title: 'Metal Information',
    icon: LayoutGrid,
    description: 'Please provide basic information about the metal and production system.',
    fields: [
      { name: 'metalType', label: 'Metal Type', type: 'select', icon: LayoutGrid, 
        options: ['aluminum', 'copper', 'gold', 'iron', 'lead', 'lithium', 'nickel', 'silver', 'steel', 'zinc'],
        hint: 'Select the primary metal in your product or process' },
      { name: 'miningLocation', label: 'Mining Location', type: 'text', icon: Mountain,
        hint: 'Location impacts transportation emissions and regional factors' },
      { name: 'oreGrade', label: 'Ore Grade (%)', type: 'number', icon: ArrowUpCircle, 
        hint: 'Higher grade ores generally require less energy for processing' },
      { name: 'productionVolume', label: 'Production Volume', type: 'number', icon: Factory, 
        suffix: 'tonnes', hint: 'Total production volume for the assessment period' },
      { name: 'functionalUnit', label: 'Functional Unit', type: 'text',
        hint: 'Reference unit for assessment (e.g. 1 tonne of refined metal)' }
    ]
  },
  step2: {
    title: 'Mining & Ore Extraction',
    icon: Mountain,
    description: 'Please provide information about the mining and extraction processes used to obtain the metal ore.',
    fields: [
      { name: 'energyConsumptionMining', label: 'Energy Consumption (MJ/tonne ore)', type: 'number', icon: Zap,
        hint: 'Total energy used in mining operations per tonne of ore' },
      { name: 'energyTypeMining', label: 'Energy Type', type: 'select', icon: Zap,
        options: ['diesel', 'electricity', 'natural_gas', 'mixed'],
        hint: 'Primary energy source used in mining operations' },
      { name: 'waterConsumptionMining', label: 'Water Consumption (m³/tonne ore)', type: 'number', icon: Waves,
        hint: 'Volume of water used in mining and processing per tonne of ore' },
      { name: 'emissionsMining', label: 'Emissions (kg CO₂-eq/tonne ore)', type: 'number', icon: ArrowUpCircle,
        hint: 'Total greenhouse gas emissions from mining operations' },
      { name: 'emissionsTypeMining', label: 'Emissions Type', type: 'select', icon: ArrowUpCircle,
        options: ['dust', 'particulates', 'methane', 'mixed'],
        hint: 'Primary type of emissions from mining operations' },
      { name: 'landUse', label: 'Land Use (m²/tonne ore)', type: 'number', icon: TreePine,
        hint: 'Area of land disturbed or used for mining operations' }
    ]
  },
  step3: {
    title: 'Processing & Energy',
    icon: Factory,
    description: 'Please provide information about the processing and energy requirements for refining the metal.',
    fields: [
      { name: 'transportToProcessing', label: 'Transport to Processing', type: 'select', icon: Truck,
        options: ['truck', 'rail', 'ship', 'mixed'],
        hint: 'Primary transport mode from mine to processing facility' },
      { name: 'transportDistanceToProcessing', label: 'Transport Distance (km)', type: 'number', icon: Truck,
        hint: 'Distance from mine to processing facility' },
      { name: 'energySource', label: 'Energy Source', type: 'select', icon: Zap,
        options: ['grid', 'coal', 'natural_gas', 'renewables', 'mixed'],
        hint: 'Primary energy source for processing operations' },
      { name: 'energyConsumptionProcessing', label: 'Energy Consumption (MJ/tonne)', type: 'number', icon: Zap,
        hint: 'Energy used in smelting/refining per tonne of product' },
      { name: 'processingRoute', label: 'Processing Route', type: 'select', icon: Factory,
        options: ['primary', 'secondary', 'mixed'],
        hint: 'Type of processing route used' },
      { name: 'recycledInputRate', label: 'Recycled Input Rate (%)', type: 'number', icon: Recycle,
        hint: 'Percentage of recycled/scrap material used as input' },
      { name: 'chemicalInputs', label: 'Chemical Inputs', type: 'text', icon: Factory,
        hint: 'Major reagents, chemicals, or fluxes used in processing' },
      { name: 'recoveryRate', label: 'Recovery Rate (%)', type: 'number', icon: ArrowUpCircle,
        hint: 'Percentage of metal recovered during processing' }
    ]
  },
  step4: {
    title: 'Transport & Supply Chain',
    icon: Truck,
    description: 'Please provide information about transportation and logistics throughout the supply chain.',
    fields: [
      { name: 'transportDistances', label: 'Transport Distances (km)', type: 'number', icon: Truck,
        hint: 'Total transport distance across all stages' },
      { name: 'transportMode', label: 'Transport Mode', type: 'select', icon: Truck,
        options: ['truck', 'rail', 'ship', 'air', 'mixed'],
        hint: 'Primary mode of transport used' },
      { name: 'packaging', label: 'Packaging Material', type: 'text', icon: LayoutGrid,
        hint: 'Types of packaging materials used' }
    ]
  },
  step5: {
    title: 'Use Phase',
    icon: Timer,
    description: 'Please provide information about how the metal is used in its application.',
    fields: [
      { name: 'productLifetime', label: 'Expected Product Lifetime (years)', type: 'number', icon: Timer,
        hint: 'Average expected lifetime of products made with this metal' }
    ]
  },
  step6: {
    title: 'End-of-Life / Circularity',
    icon: Recycle,
    description: 'Please provide information about what happens to the metal at the end of its useful life.',
    fields: [
      { name: 'reuseRate', label: 'Reuse / Repurposing Rate (%)', type: 'number', icon: Recycle,
        hint: 'Percentage of metal directly reused without reprocessing' },
      { name: 'recyclingRate', label: 'Recycling Rate (%)', type: 'number', icon: Recycle,
        hint: 'Percentage of metal collected for recycling' },
      { name: 'recyclingEfficiency', label: 'Recycling Efficiency (%)', type: 'number', icon: Recycle,
        hint: 'Percentage of metal actually recovered in recycling process' },
      { name: 'disposalRoute', label: 'Disposal Route', type: 'select', icon: ArrowDownCircle,
        options: ['landfill', 'incineration', 'special_waste', 'mixed'],
        hint: 'Primary method for disposing non-recycled material' },
      { name: 'transportDisposal', label: 'Transport for Disposal (km)', type: 'number', icon: Truck,
        hint: 'Average distance for transporting waste/recycling' }
    ]
  },
  step7: {
    title: 'Impact Metrics',
    icon: BarChart3,
    description: 'Please provide environmental impact indicators if available from previous assessments.',
    fields: [
      { name: 'globalWarmingPotential', label: 'Global Warming Potential (kg CO₂-eq)', type: 'number', icon: ArrowUpCircle,
        hint: 'Carbon footprint per functional unit' },
      { name: 'acidificationPotential', label: 'Acidification Potential (kg SO₂-eq)', type: 'number', icon: ArrowUpCircle,
        hint: 'Contributes to acid rain and ocean acidification' },
      { name: 'eutrophicationPotential', label: 'Eutrophication Potential (kg PO₄-eq)', type: 'number', icon: Waves,
        hint: 'Impacts on water quality and aquatic ecosystems' },
      { name: 'ozoneDepletionPotential', label: 'Ozone Depletion Potential (kg CFC-11-eq)', type: 'number', icon: ArrowUpCircle,
        hint: 'Impact on the ozone layer' },
      { name: 'waterScarcityFootprint', label: 'Water Scarcity Footprint (m³-eq)', type: 'number', icon: Waves,
        hint: 'Water usage weighted by regional water scarcity' },
      { name: 'cumulativeEnergyDemand', label: 'Cumulative Energy Demand (MJ)', type: 'number', icon: Zap,
        hint: 'Total energy used across the entire life cycle' }
    ]
  }
};

const LCAForm = ({ onComplete, onCancel, onViewDetailedResults }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [formData, setFormData] = useState({});
  const [stayOnPage, setStayOnPage] = useState(true); // New state to control navigation
  
  // Add new state for prediction functionality
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionSuccess, setPredictionSuccess] = useState(false);
  const [predictedFields, setPredictedFields] = useState([]);

  // Add new state variables for API interactions
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // Backend API URL - should come from environment variables in production
  const API_URL = 'http://localhost:8000/api/lca';

  const isMissingValue = (value) => value === undefined || value === null || value === '';

  // Generic input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Navigation handlers
  const handleNext = () => setCurrentStep(currentStep + 1);
  const handlePrevious = () => setCurrentStep(currentStep - 1);
  
  // Updated submit handler to send data to backend
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    console.log("LCA Form Completed with data:", formData);
    setIsCompleted(true);
    
    // Generate insights from AI and save report
    await generateAiInsights();
    
    // Only navigate if explicitly requested
    if (!stayOnPage && onComplete) {
      onComplete(formData);
    }
  };

  // Function to navigate to dashboard after viewing results
  const handleBackToDashboard = () => {
    if (onComplete) {
      onComplete(formData);
    }
  };

  // Function to view detailed results page
  const handleViewDetailedResults = () => {
    if (onViewDetailedResults) {
      onViewDetailedResults(formData, aiInsights);
    }
  };

  // Function to send data to backend and get AI insights
  const generateAiInsights = async () => {
    setIsGeneratingInsights(true);
    setError(null);
    setNotice(null);
    
    try {
      const response = await fetch(`${API_URL}/generate-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include authentication token if available
          ...localStorage.getItem('authToken') ? 
            { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } : {}
        },
        body: JSON.stringify({ formData }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate LCA insights');
      }
      
      const data = await response.json();
      console.log("AI Generated Insights:", data);
      
      if (data.success && data.report) {
        setAiInsights(data.report);
        
        // Save reportId if returned from server
        if (data.reportId) {
          console.log("Report saved with ID:", data.reportId);
          setFormData(prev => ({ ...prev, savedReportId: data.reportId }));
        }
      } else {
        throw new Error(data.message || 'Failed to generate insights');
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      setError(error.message || 'Something went wrong generating AI insights');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  // Function to get parameter suggestions (could be used for incomplete fields)
  const getSuggestions = async (partialData, targetFields = null) => {
    setIsLoading(true);
    setError(null);
    setNotice(null);
    
    try {
      const payload = { formData: partialData };
      if (Array.isArray(targetFields) && targetFields.length > 0) {
        payload.targetFields = targetFields;
      }

      const response = await fetch(`${API_URL}/suggest-parameters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get parameter suggestions');
      }
      
      const data = await response.json();
      console.log("AI Suggestions:", data);
      
      if (data.success && data.suggestions) {
        if (data.warning) {
          setNotice(data.warning);
        }
        const cleanedSuggestions = Object.fromEntries(
          Object.entries(data.suggestions).filter(([, value]) => !isMissingValue(value))
        );

        // Apply suggestions to form data (do not override existing inputs)
        const missingOnly = Object.fromEntries(
          Object.entries(cleanedSuggestions).filter(([key]) => isMissingValue(partialData[key]))
        );
        if (Object.keys(missingOnly).length > 0) {
          setFormData(prev => ({
            ...prev,
            ...missingOnly
          }));
        }
        return missingOnly;
      } else {
        throw new Error(data.message || 'Failed to get suggestions');
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
      setError(error.message || 'Something went wrong getting suggestions');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Export functionality 
  const handleExport = (format = 'json') => {
    setShowExportOptions(false);
    try {
      // Prepare data based on format
      let data, type, filename;
      
      switch(format) {
        case 'csv':
          data = `${Object.keys(formData).join(',')}\n${Object.values(formData).join(',')}`;
          type = 'text/csv';
          filename = `lca-assessment-${formData.metalType || 'data'}.csv`;
          break;
        case 'pdf':
        case 'excel':
          alert(`${format.toUpperCase()} export would require additional libraries in production.`);
          return;
        default: // json
          data = JSON.stringify(formData, null, 2);
          type = 'application/json';
          filename = `lca-assessment-${formData.metalType || 'data'}.json`;
      }
      
      // Create and trigger download
      const blob = new Blob([data], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Export error:', error);
    }
  };
  
  // Reusable field renderer with fallback for missing icons
  const renderField = (field) => {
    if (!field) return null;
    
    const { name, label, type, icon, options, hint, suffix } = field;
    const FieldIcon = icon || LayoutGrid; // Fallback icon
    
    // Check if this field was recently predicted
    const isPredicted = predictedFields.includes(name);
    
    return (
      <div key={name} className={`bg-white p-4 rounded-lg border ${isPredicted ? 'border-green-400 shadow-md' : 'border-gray-200 shadow-sm'} hover:shadow-md transition-shadow`}>
        <div className="flex items-center mb-3">
          <div className={`w-10 h-10 rounded-full ${isPredicted ? 'bg-green-100' : 'bg-blue-100'} flex items-center justify-center mr-3`}>
            <FieldIcon className={`h-5 w-5 ${isPredicted ? 'text-green-600' : 'text-blue-600'}`} />
          </div>
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {isPredicted && <span className="ml-2 text-xs text-green-600">(AI suggested)</span>}
          </label>
        </div>
        
        {type === 'select' ? (
          <select
            name={name}
            value={formData[name] || ''}
            onChange={handleInputChange}
            className={`block w-full p-2 border ${isPredicted ? 'border-green-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
          >
            <option value="">Select {label.toLowerCase()}</option>
            {options.map(opt => (
              <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>
            ))}
          </select>
        ) : (
          <div className={suffix ? "flex rounded-md shadow-sm" : ""}>
            <input
              type={type}
              name={name}
              value={formData[name] || ''}
              onChange={handleInputChange}
              className={`block w-full p-2 border ${isPredicted ? 'border-green-300' : 'border-gray-300'} rounded${suffix ? '-l' : ''}-md focus:ring-blue-500 focus:border-blue-500`}
              placeholder={`e.g. ${name === 'oreGrade' ? '0.5' : ''}`}
            />
            {suffix && (
              <span className="inline-flex items-center px-4 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm font-medium">
                {suffix}
              </span>
            )}
          </div>
        )}
        
        {hint && <div className="mt-2 text-xs text-gray-500">{hint}</div>}
      </div>
    );
  };

  // Progress steps indicator with text above icons instead of below
  const renderProgressSteps = () => {
    const steps = [
      { name: 'Metal Info', icon: LayoutGrid },
      { name: 'Mining & Extraction', icon: Mountain },
      { name: 'Processing', icon: Factory },
      { name: 'Transport', icon: Truck },
      { name: 'Use Phase', icon: Timer },
      { name: 'End of Life', icon: Recycle },
      { name: 'Impact Metrics', icon: BarChart3 }
    ];

    const progress = Math.round(((currentStep - 1) / (steps.length - 1)) * 100);
    
    return (
      <div className="relative mb-12">
        {/* Progress bar */}
        <div className="absolute top-24 left-0 right-0 h-1 bg-gray-200 z-0">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Step indicators with text ABOVE icons */}
        <div className="flex items-center justify-between relative z-10 px-2">
          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isActive = currentStep === stepNum;
            const isCompleted = currentStep > stepNum;
            const StepIcon = step.icon;
            
            return (
              <div key={stepNum} className="flex flex-col items-center">
                {/* Text now appears ABOVE the icon */}
                <div className={`text-xs font-medium text-center max-w-[80px] mb-2 
                  ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                  {step.name}
                </div>
                <div 
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all duration-300
                    ${isActive ? 'bg-gradient-to-br from-blue-500 to-green-500 text-white scale-110' : 
                      isCompleted ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' : 
                      'bg-white text-gray-400 border border-gray-200'}`}
                >
                  {isCompleted ? <CheckCircle className="h-6 w-6" /> : <StepIcon className="h-6 w-6" />}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 text-center text-sm font-medium text-blue-600">{progress}% Complete</div>
      </div>
    );
  };

  // Render current form step content with robust error handling
  const renderFormContent = () => {
    const stepKey = `step${currentStep}`;
    const stepConfig = formConfig[stepKey];
    
    if (!stepConfig) {
      // Fallback for missing configuration
      return (
        <div className="p-6 text-center">
          <p className="text-gray-600">Configuration for step {currentStep} is not available.</p>
        </div>
      );
    }
    
    return (
      <div>
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl mb-6 border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              {stepConfig.icon && <stepConfig.icon className="h-6 w-6 text-blue-600 mr-2" />}
              <h3 className="text-xl font-semibold text-gray-800">{stepConfig.title}</h3>
            </div>
            
            {/* Add AI prediction button */}
            <button
              type="button"
              onClick={predictMissingFields}
              disabled={isPredicting}
              className="flex items-center px-3 py-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md border border-blue-200 transition-colors"
            >
              {isPredicting ? (
                <Loader className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Lightbulb className="h-4 w-4 mr-1" />
              )}
              {isPredicting ? 'Predicting...' : 'Predict Fields'}
            </button>
          </div>
          {stepConfig.description && <p className="text-sm text-gray-600">{stepConfig.description}</p>}
          
          {/* Show success message */}
          {predictionSuccess && (
            <div className="mt-3 bg-green-50 text-green-800 p-2 rounded-md text-sm border border-green-200 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              AI has successfully predicted missing field values!
            </div>
          )}
          
          {/* Show error message */}
          {error && (
            <div className="mt-3 bg-red-50 text-red-800 p-2 rounded-md text-sm border border-red-200 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          {notice && !error && (
            <div className="mt-3 bg-blue-50 text-blue-800 p-2 rounded-md text-sm border border-blue-200 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {notice}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stepConfig.fields && stepConfig.fields.map(field => renderField(field))}
        </div>
      </div>
    );
  };

  // Assessment view modal with complete sections
  const renderAssessmentView = () => {
    // Simplified section renderer
    const renderSection = (title, data) => (
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-gray-600">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
              <span className="font-medium text-gray-900">{value || 'Not specified'}</span>
            </div>
          ))}
        </div>
      </div>
    );

    // Complete data organization for all sections
    const sections = {
      "Metal Information": {
        metalType: formData.metalType,
        miningLocation: formData.miningLocation,
        oreGrade: formData.oreGrade ? `${formData.oreGrade}%` : '',
        productionVolume: formData.productionVolume ? `${formData.productionVolume} tonnes` : '',
        functionalUnit: formData.functionalUnit,
      },
      "Mining & Ore Extraction": {
        energyConsumptionMining: formData.energyConsumptionMining ? `${formData.energyConsumptionMining} MJ/tonne` : '',
        energyTypeMining: formData.energyTypeMining,
        waterConsumptionMining: formData.waterConsumptionMining ? `${formData.waterConsumptionMining} m³/tonne` : '',
        emissionsMining: formData.emissionsMining ? `${formData.emissionsMining} kg CO₂-eq/tonne` : '',
        landUse: formData.landUse ? `${formData.landUse} m²/tonne` : '',
      },
      "Processing & Energy": {
        processingRoute: formData.processingRoute,
        energySource: formData.energySource,
        recoveryRate: formData.recoveryRate ? `${formData.recoveryRate}%` : '',
        recycledInputRate: formData.recycledInputRate ? `${formData.recycledInputRate}%` : '',
      },
      "Transport & Supply Chain": {
        transportMode: formData.transportMode,
        transportDistances: formData.transportDistances ? `${formData.transportDistances} km` : '',
      },
      "Use Phase & End of Life": {
        productLifetime: formData.productLifetime ? `${formData.productLifetime} years` : '',
        recyclingRate: formData.recyclingRate ? `${formData.recyclingRate}%` : '',
        reuseRate: formData.reuseRate ? `${formData.reuseRate}%` : '',
      },
      "Environmental Impact": {
        globalWarmingPotential: formData.globalWarmingPotential ? `${formData.globalWarmingPotential} kg CO₂-eq` : '',
        waterScarcityFootprint: formData.waterScarcityFootprint ? `${formData.waterScarcityFootprint} m³-eq` : '',
        cumulativeEnergyDemand: formData.cumulativeEnergyDemand ? `${formData.cumulativeEnergyDemand} MJ` : '',
      }
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Life Cycle Assessment for {formData.metalType || 'Metal'}</h2>
            <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Process Flow Overview</h3>
              <div className="border border-gray-200 rounded-lg p-4" style={{ height: '400px' }}>
                <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader className="animate-spin h-8 w-8 text-blue-500" /></div>}>
                  <LCAProcessFlow 
                    key={`modal-${processFlowKey}`} 
                    currentStep={7} 
                    formData={formData} 
                  />
                </Suspense>
              </div>
            </div>
            
            {Object.entries(sections).map(([title, data]) => renderSection(title, data))}
          </div>
          
          <div className="p-4 border-t border-gray-200 flex justify-end">
            <button 
              onClick={() => setShowViewModal(false)}
              className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-2"
            >Close</button>
            <button
              onClick={() => { setShowViewModal(false); setShowExportOptions(true); }}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            ><Download className="mr-1 h-4 w-4 inline" /> Export</button>
          </div>
        </div>
      </div>
    );
  };

  // Initialize form data with empty object that has all field names
  const initializeFormData = () => {
    const emptyData = {};
    // Create keys for all fields from all steps
    Object.values(formConfig).forEach(step => {
      if (step.fields) {
        step.fields.forEach(field => {
          emptyData[field.name] = '';
        });
      }
    });
    return emptyData;
  };

  // Initialize form data on component mount
  useEffect(() => {
    setFormData(initializeFormData());
  }, []);

  // Add a properly centered initialization for the LCAProcessFlow component
  const [processFlowKey, setProcessFlowKey] = useState(0);

  // Force re-render of the LCAProcessFlow component when it first loads
  useEffect(() => {
    // Reset the form and center the process flow on component mount
    const timer = setTimeout(() => {
      setProcessFlowKey(prevKey => prevKey + 1);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Render AI Insights component
  const renderAiInsights = () => {
    if (isGeneratingInsights) {
      return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader className="animate-spin h-8 w-8 text-blue-500 mb-4" />
            <p className="text-gray-600">Generating AI insights from your LCA data...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a moment as we analyze your lifecycle data</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 shadow-sm mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Error generating insights</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button 
                onClick={() => generateAiInsights()}
                className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (aiInsights) {
      return (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-blue-100 shadow-sm mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="mr-2 h-6 w-6 text-blue-600" />
            AI-Generated LCA Insights
          </h3>
          
          <div className="mb-4">
            <h4 className="font-medium text-gray-800 mb-2">Assessment Summary</h4>
            <p className="text-gray-700 bg-white p-4 rounded-md border border-gray-200">{aiInsights.lca_summary}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Recommendations</h4>
            <ul className="space-y-3">
              {aiInsights.recommendations.map((rec, index) => (
                <li key={index} className="bg-white p-4 rounded-md border border-gray-200 flex">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Enhanced function to predict missing fields for the current step
  const predictMissingFields = async () => {
    setIsPredicting(true);
    setError(null);
    setNotice(null);
    setPredictionSuccess(false);
    setPredictedFields([]);
    
    try {
      const stepKey = `step${currentStep}`;
      const currentStepFields = formConfig[stepKey]?.fields.map(f => f.name) || [];
      const missingStepFields = currentStepFields.filter(field => isMissingValue(formData[field]));

      if (missingStepFields.length === 0) {
        setNotice("All fields for this step are already filled.");
        return;
      }

      const hasAnyInput = Object.values(formData).some(value => !isMissingValue(value));
      if (!hasAnyInput) {
        setNotice("Add at least one value before requesting predictions.");
        return;
      }
      
      // Get suggestions from the backend using all data entered so far
      const suggestions = await getSuggestions(formData, missingStepFields);
      
      if (suggestions && Object.keys(suggestions).length > 0) {
        // Filter suggestions to only include fields for the current step
        const relevantSuggestions = {};
        let hasRelevantSuggestions = false;
        
        // Check which suggested fields belong to the current step
        Object.keys(suggestions).forEach(key => {
          if (currentStepFields.includes(key) && !formData[key]) {
            relevantSuggestions[key] = suggestions[key];
            hasRelevantSuggestions = true;
          }
        });
        
        if (hasRelevantSuggestions) {
          // Apply the relevant suggestions to the form data
          setFormData(prev => ({
            ...prev,
            ...relevantSuggestions
          }));
          
          // Save the names of predicted fields for highlighting
          setPredictedFields(Object.keys(relevantSuggestions));
          setPredictionSuccess(true);
          
          // Show success message briefly
          setTimeout(() => {
            setPredictionSuccess(false);
          }, 3000);
        } else {
          setNotice("No relevant predictions available for this step. Try adding more information first.");
        }
      } else {
        setNotice("No relevant predictions available for this step. Try adding more information first.");
      }
    } catch (error) {
      console.error('Error predicting fields:', error);
      setError(error.message || 'Failed to predict field values');
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Life Cycle Assessment Form</h2>
        
        {!isCompleted ? (
          <>
            {renderProgressSteps()}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Process Flow Visualization with key to force re-render */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Process Flow Visualization</h3>
                <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader className="animate-spin h-8 w-8 text-blue-500" /></div>}>
                  <LCAProcessFlow 
                    key={processFlowKey} 
                    currentStep={currentStep} 
                    formData={formData} 
                  />
                </Suspense>
              </div>
              
              {/* Form Content */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                  {renderFormContent()}
                </form>
              </div>
            </div>
            
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={currentStep === 1 ? onCancel : handlePrevious}
                className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={isLoading}
              >
                {currentStep === 1 ? 'Cancel' : <><ArrowLeft className="mr-1 h-4 w-4 inline" /> Previous</>}
              </button>
              
              {currentStep < 7 && (
                <button
                  type="button"
                  onClick={() => {
                    // Optionally get AI suggestions before moving to next step
                    // getSuggestions(formData).then(() => handleNext());
                    handleNext();
                  }}
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <><Loader className="mr-1 h-4 w-4 inline animate-spin" /> Processing...</>
                  ) : (
                    <>Next <ArrowRight className="ml-1 h-4 w-4 inline" /></>
                  )}
                </button>
              )}
              
              {currentStep === 7 && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <><Loader className="mr-1 h-4 w-4 inline animate-spin" /> Processing...</>
                  ) : (
                    'Complete LCA'
                  )}
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-8">
            {/* Completion content */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-medium text-gray-900 mb-2">LCA Assessment Complete!</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Your Life Cycle Assessment for {formData.metalType || 'your metal'} has been completed successfully.
              </p>
            </div>
            
            {/* AI Insights Section */}
            {renderAiInsights()}
            
            {/* Process Flow Visualization */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Process Flow Overview</h3>
              <Suspense fallback={<div className="flex items-center justify-center h-[400px]"><Loader className="animate-spin h-8 w-8 text-blue-500" /></div>}>
                <LCAProcessFlow 
                  key={`results-${processFlowKey}`} 
                  currentStep={7} 
                  formData={formData} 
                />
              </Suspense>
            </div>
            
            {/* Summary display */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4">Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {['metalType', 'miningLocation', 'productionVolume', 'globalWarmingPotential'].map(key => (
                  <div key={key}>
                    <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                    <span> {formData[key] || 'Not specified'}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Action buttons with new navigation options */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* View Detailed Results button */}
              <button
                onClick={handleViewDetailedResults}
                className="flex items-center justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              >
                <BarChart3 className="mr-2 h-5 w-5" /> View Detailed Results
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </button>
              
              {/* Export dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowExportOptions(!showExportOptions)}
                  className="flex items-center justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                >
                  <Download className="mr-2 h-5 w-5" /> Export Assessment Data
                </button>
                
                {showExportOptions && (
                  <>
                    <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      {['json', 'csv', 'excel', 'pdf'].map(format => (
                        <button
                          key={format}
                          onClick={() => handleExport(format)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          {format === 'json' ? <File className="mr-2 h-5 w-5 text-blue-500" /> :
                           format === 'csv' ? <FileText className="mr-2 h-5 w-5 text-green-500" /> :
                           <ClipboardList className="mr-2 h-5 w-5 text-red-500" />}
                          Export as {format.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <div className="fixed inset-0 z-0" onClick={() => setShowExportOptions(false)}></div>
                  </>
                )}
              </div>
              
              {/* View Full Assessment */}
              <button
                onClick={() => setShowViewModal(true)}
                className="flex items-center justify-center py-3 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 w-full sm:w-auto"
              >
                <Eye className="mr-2 h-5 w-5" /> View Assessment Details
              </button>
              
              {/* Back to Dashboard */}
              <button
                onClick={handleBackToDashboard}
                className="flex items-center justify-center py-3 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 w-full sm:w-auto"
              >
                <ChevronRight className="mr-2 h-5 w-5" /> Back to Dashboard
              </button>
            </div>
            
            {/* Reset button */}
            <div className="text-center">
              <button 
                onClick={() => { 
                  setIsCompleted(false); 
                  setCurrentStep(1); 
                  setFormData(initializeFormData()); 
                  setAiInsights(null);
                  setError(null);
                  setNotice(null);
                }}
                className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
              >
                Start New Assessment
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* View Modal with improved process flow centering */}
      {showViewModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Life Cycle Assessment for {formData.metalType || 'Metal'}</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Process Flow Overview</h3>
                <div className="border border-gray-200 rounded-lg p-4" style={{ height: '400px' }}>
                  <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader className="animate-spin h-8 w-8 text-blue-500" /></div>}>
                    <LCAProcessFlow 
                      key={`modal-${processFlowKey}`} 
                      currentStep={7} 
                      formData={formData} 
                    />
                  </Suspense>
                </div>
              </div>
              
              {/* AI Insights in modal if available */}
              {aiInsights && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">AI Analysis & Recommendations</h3>
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-gray-700 mb-4">{aiInsights.lca_summary}</p>
                    
                    <h4 className="font-medium text-gray-800 mb-2">Recommendations</h4>
                    <ul className="space-y-2">
                      {aiInsights.recommendations.map((rec, index) => (
                        <li key={index} className="flex">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {Object.entries(sections).map(([title, data]) => renderSection(title, data))}
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => setShowViewModal(false)}
                className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-2"
              >Close</button>
              <button
                onClick={() => { setShowViewModal(false); setShowExportOptions(true); }}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              ><Download className="mr-1 h-4 w-4 inline" /> Export</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LCAForm;
