import React, { useState, useRef, useEffect } from 'react';
import { 
  Mountain,
  Factory, 
  Truck, 
  Timer, 
  Recycle, 
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

const EnhancedLCAProcessFlow = ({ currentStep, formData }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const containerRef = useRef(null);
  const startPosRef = useRef(null);
  const animationRef = useRef(null);
  const isInitialRender = useRef(true);

  // Modern node positions with equidistant circular layout
  const centerX = 400;
  const centerY = 300;
  const radius = 170;
  
  // Calculate node positions in a circular layout
  const calculateNodePosition = (index, totalNodes) => {
    // Start from the top (270 degrees in unit circle, -90 in SVG)
    const angle = (index / totalNodes) * 2 * Math.PI - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  // Create nodes with calculated positions
  const mainNodes = [
    { id: 1, name: 'Raw Material', icon: Mountain, step: 1, color: '#3B82F6', gradient: ['#3B82F6', '#2563EB'] }, // Blue
    { id: 2, name: 'Processing', icon: Factory, step: 2, color: '#10B981', gradient: ['#10B981', '#059669'] }, // Green
    { id: 3, name: 'Manufacturing', icon: Factory, step: 3, color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'] }, // Purple
    { id: 4, name: 'Distribution', icon: Truck, step: 4, color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] }, // Amber
    { id: 5, name: 'Use Phase', icon: Timer, step: 5, color: '#EC4899', gradient: ['#EC4899', '#DB2777'] }, // Pink
    { id: 6, name: 'End of Life', icon: Recycle, step: 6, color: '#6366F1', gradient: ['#6366F1', '#4F46E5'] }, // Indigo
  ];

  // Assign positions to nodes
  const nodes = mainNodes.map((node, index) => {
    const position = calculateNodePosition(index, mainNodes.length);
    return { ...node, x: position.x, y: position.y };
  });

  // Add central impact analysis node
  nodes.push({ 
    id: 7, 
    name: 'Impact Analysis', 
    icon: Zap, 
    x: centerX, 
    y: centerY, 
    step: 7, 
    color: '#EF4444', 
    gradient: ['#EF4444', '#DC2626'] // Red
  });

  // Define connections between nodes
  const connections = [
    // Main cycle connections
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 4, to: 5 },
    { from: 5, to: 6 },
    { from: 6, to: 1, isRecycling: true },
    
    // Impact analysis connections (bidirectional)
    { from: 7, to: 1, isImpact: true },
    { from: 7, to: 2, isImpact: true },
    { from: 7, to: 3, isImpact: true },
    { from: 7, to: 4, isImpact: true },
    { from: 7, to: 5, isImpact: true },
    { from: 7, to: 6, isImpact: true },
    { from: 1, to: 7, isDataFlow: true },
    { from: 2, to: 7, isDataFlow: true },
    { from: 3, to: 7, isDataFlow: true },
    { from: 4, to: 7, isDataFlow: true },
    { from: 5, to: 7, isDataFlow: true },
    { from: 6, to: 7, isDataFlow: true },
  ];

  // Auto-rotation animation effect
  useEffect(() => {
    if (!autoRotate) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    let startTime;
    const rotationSpeed = 0.00005; // Adjust for faster/slower rotation

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsedTime = timestamp - startTime;
      
      // Calculate rotation angle based on elapsed time
      const rotationAngle = elapsedTime * rotationSpeed;
      
      // Update nodes' positions
      nodes.forEach((node, index) => {
        if (node.id !== 7) { // Skip the central node
          const originalPosition = calculateNodePosition(index / mainNodes.length + rotationAngle, 1);
          node.x = originalPosition.x;
          node.y = originalPosition.y;
        }
      });
      
      // Force re-render
      setPosition(prev => ({ ...prev }));
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [autoRotate]);

  // Handle mouse down for dragging
  const handleMouseDown = (e) => {
    if (e.target.closest('g') || !containerRef.current) return;
    setIsDragging(true);
    startPosRef.current = { 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    };
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - startPosRef.current.x,
      y: e.clientY - startPosRef.current.y
    });
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle mouse wheel for zooming
  const handleWheel = (e) => {
    if (e.cancelable) {
      e.preventDefault();
    }
    const delta = e.deltaY * 0.001;
    setZoom(prevZoom => Math.min(Math.max(0.5, prevZoom - delta), 2));
  };

  // Attach non-passive wheel listener to avoid React passive warning
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onWheel = (event) => handleWheel(event);
    container.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', onWheel);
    };
  }, []);

  // Handle node click
  const handleNodeClick = (nodeId) => {
    setAutoRotate(false); // Stop rotation when a node is selected
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
  };

  // Get summary information for the selected node
  const getNodeSummary = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;
    
    switch(node.id) {
      case 1:
        return {
          title: 'Raw Material Extraction',
          details: [
            { label: 'Metal Type', value: formData.metalType || 'Not specified' },
            { label: 'Mining Location', value: formData.miningLocation || 'Not specified' },
            { label: 'Ore Grade', value: formData.oreGrade ? `${formData.oreGrade}%` : 'Not specified' },
            { label: 'Land Use', value: formData.landUse ? `${formData.landUse} m²/tonne` : 'Not specified' }
          ],
          circularOpportunities: 'Optimize extraction to minimize waste and use recycled input when possible.',
          environmentalImpacts: 'Land disturbance, habitat loss, energy use, water consumption.'
        };
      case 2:
        return {
          title: 'Processing',
          details: [
            { label: 'Energy Source', value: formData.energySource || 'Not specified' },
            { label: 'Energy Consumption', value: formData.energyConsumptionProcessing ? `${formData.energyConsumptionProcessing} MJ/tonne` : 'Not specified' },
            { label: 'Recovery Rate', value: formData.recoveryRate ? `${formData.recoveryRate}%` : 'Not specified' }
          ],
          circularOpportunities: 'Recover process heat, utilize by-products, implement closed-loop water systems.',
          environmentalImpacts: 'Air emissions, water pollution, energy consumption, chemical waste.'
        };
      case 3:
        return {
          title: 'Manufacturing',
          details: [
            { label: 'Processing Route', value: formData.processingRoute || 'Not specified' },
            { label: 'Recycled Input Rate', value: formData.recycledInputRate ? `${formData.recycledInputRate}%` : 'Not specified' }
          ],
          circularOpportunities: 'Design for disassembly, use recycled materials, minimize scrap and waste.',
          environmentalImpacts: 'Resource consumption, energy use, process emissions, waste generation.'
        };
      case 4:
        return {
          title: 'Distribution',
          details: [
            { label: 'Transport Mode', value: formData.transportMode || 'Not specified' },
            { label: 'Transport Distance', value: formData.transportDistances ? `${formData.transportDistances} km` : 'Not specified' },
            { label: 'Packaging', value: formData.packaging || 'Not specified' }
          ],
          circularOpportunities: 'Optimize routes, use returnable packaging, employ low-carbon transport.',
          environmentalImpacts: 'Fuel consumption, greenhouse gas emissions, packaging waste.'
        };
      case 5:
        return {
          title: 'Use Phase',
          details: [
            { label: 'Product Lifetime', value: formData.productLifetime ? `${formData.productLifetime} years` : 'Not specified' }
          ],
          circularOpportunities: 'Design for longevity, enable repair and upgradeability, facilitate sharing models.',
          environmentalImpacts: 'Energy consumption during use, wear and tear, maintenance impacts.'
        };
      case 6:
        return {
          title: 'End of Life',
          details: [
            { label: 'Recycling Rate', value: formData.recyclingRate ? `${formData.recyclingRate}%` : 'Not specified' },
            { label: 'Disposal Method', value: formData.disposalMethod || 'Not specified' }
          ],
          circularOpportunities: 'Increase recyclability, enable material recovery, design for disassembly.',
          environmentalImpacts: 'Waste generation, landfill use, energy for recycling, emissions from disposal.'
        };
      case 7:
        return {
          title: 'Impact Analysis',
          details: [
            { label: 'Global Warming Potential', value: formData.globalWarmingPotential ? `${formData.globalWarmingPotential} kg CO₂-eq` : 'Not specified' },
            { label: 'Acidification Potential', value: formData.acidificationPotential ? `${formData.acidificationPotential} kg SO₂-eq` : 'Not specified' },
            { label: 'Water Scarcity Footprint', value: formData.waterScarcityFootprint ? `${formData.waterScarcityFootprint} m³-eq` : 'Not specified' },
            { label: 'Functional Unit', value: formData.functionalUnit || 'Not specified' }
          ],
          circularOpportunities: 'Identify hotspots for intervention, assess trade-offs, benchmark against alternatives.',
          environmentalImpacts: 'Quantifies cumulative environmental impacts across the entire life cycle.'
        };
      default:
        return null;
    }
  };

  // Calculate control points for curved paths (recycling connection)
  const calculateControlPoints = (fromNode, toNode) => {
    // Calculate the midpoint of the direct line between nodes
    const midX = (fromNode.x + toNode.x) / 2;
    const midY = (fromNode.y + toNode.y) / 2;
    
    // Calculate the vector from the center to the midpoint
    const vectorX = midX - centerX;
    const vectorY = midY - centerY;
    
    // Calculate the distance from center to midpoint
    const distance = Math.sqrt(vectorX * vectorX + vectorY * vectorY);
    
    // Normalize the vector and scale it to create an offset
    const normalizedX = vectorX / distance;
    const normalizedY = vectorY / distance;
    
    // Calculate control points with outward offset
    const curvature = 1.35; // Higher values create more pronounced curves
    return {
      x1: midX + normalizedX * (radius * curvature),
      y1: midY + normalizedY * (radius * curvature)
    };
  };

  // Render node summary
  const renderNodeSummary = () => {
    if (!selectedNode) return null;
    
    const summary = getNodeSummary(selectedNode);
    if (!summary) return null;
    
    const selectedNodeData = nodes.find(n => n.id === selectedNode);
    
    return (
      <div className="absolute top-4 right-4 w-80 bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200 z-10 animate-fadeIn">
        <div 
          className="flex justify-between items-center px-4 py-3" 
          style={{backgroundImage: `linear-gradient(to right, ${selectedNodeData.gradient[0]}, ${selectedNodeData.gradient[1]})`}}
        >
          <h3 className="text-lg font-medium text-white">{summary.title}</h3>
          <button 
            onClick={() => setSelectedNode(null)}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            {summary.details.map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium text-gray-600">{item.label}:</div>
                <div className="text-sm text-gray-900">{item.value}</div>
              </div>
            ))}
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-green-700 mb-1">Circular Opportunities</h4>
            <p className="text-xs text-gray-600">{summary.circularOpportunities}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-red-700 mb-1">Environmental Impacts</h4>
            <p className="text-xs text-gray-600">{summary.environmentalImpacts}</p>
          </div>
        </div>
      </div>
    );
  };

  // Toggle information panel
  const toggleInfoPanel = () => {
    setShowInfo(!showInfo);
  };

  // Animation for moving particles along the paths
  const renderAnimatedPath = (connection) => {
    const fromNode = nodes.find(n => n.id === connection.from);
    const toNode = nodes.find(n => n.id === connection.to);
    
    if (!fromNode || !toNode) return null;

    // Different animation style based on connection type
    let animationDuration, pathColor;
    
    if (connection.isRecycling) {
      animationDuration = "3s";
      pathColor = "#10B981"; // Green
    } else if (connection.isImpact) {
      animationDuration = "2s";
      pathColor = "#EF4444"; // Red
    } else if (connection.isDataFlow) {
      animationDuration = "1.5s";
      pathColor = "#6366F1"; // Indigo
    } else {
      animationDuration = "2s";
      pathColor = fromNode.color;
    }

    // Generate a unique ID for this animation
    const animationId = `flow-${connection.from}-${connection.to}`;

    return (
      <circle
        key={animationId}
        r="3"
        fill={pathColor}
        opacity="0.8"
      >
        <animateMotion
          dur={animationDuration}
          repeatCount="indefinite"
          path={
            connection.isRecycling 
              ? `M ${fromNode.x} ${fromNode.y} Q ${calculateControlPoints(fromNode, toNode).x1} ${calculateControlPoints(fromNode, toNode).y1}, ${toNode.x} ${toNode.y}`
              : `M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`
          }
        />
      </circle>
    );
  };

  // Center visualization on initial render
  useEffect(() => {
    if (!containerRef.current || !isInitialRender.current) return;
    
    const centerVisualization = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const { clientWidth, clientHeight } = container;
      
      // Center the visualization in the container
      const centerX = (clientWidth / 2) - 400;
      const centerY = (clientHeight / 2) - 300;
      
      setPosition({ x: centerX, y: centerY });
    };
    
    centerVisualization();
    isInitialRender.current = false;
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
        <button 
          onClick={toggleInfoPanel}
          className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow hover:shadow-md transition-shadow border border-gray-200 text-gray-600 hover:text-gray-900"
          title="Show Information"
        >
          <Info size={20} />
        </button>
        
        <button
          onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}
          className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow hover:shadow-md transition-shadow border border-gray-200 text-gray-600 hover:text-gray-900"
          title="Zoom In"
        >
          <ChevronUp size={20} />
        </button>
        
        <button
          onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
          className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow hover:shadow-md transition-shadow border border-gray-200 text-gray-600 hover:text-gray-900"
          title="Zoom Out"
        >
          <ChevronDown size={20} />
        </button>
        
        <button
          onClick={() => setAutoRotate(prev => !prev)}
          className={`flex items-center justify-center w-10 h-10 rounded-full shadow hover:shadow-md transition-shadow border ${autoRotate ? 'bg-blue-100 border-blue-300 text-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'}`}
          title={autoRotate ? "Stop Animation" : "Start Animation"}
        >
          <Recycle size={20} />
        </button>
      </div>
      
      {/* Info Panel */}
      {showInfo && (
        <div className="absolute top-4 left-20 w-64 bg-white shadow-lg rounded-lg p-4 z-10 text-sm">
          <h4 className="font-semibold mb-2">Life Cycle Diagram</h4>
          <p className="text-gray-600 mb-3">This interactive diagram shows the complete life cycle of a product. Click on nodes to see details.</p>
          <ul className="space-y-1 text-xs text-gray-500">
            <li>• Drag to move the diagram</li>
            <li>• Scroll or use buttons to zoom</li>
            <li>• Click on any stage for details</li>
            <li>• Toggle animation to visualize flow</li>
          </ul>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs">Recycling flow</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs">Impact assessment</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              <span className="text-xs">Data collection</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Selected Node Summary */}
      {renderNodeSummary()}
      
      {/* SVG Diagram */}
      <svg
        ref={containerRef}
        className={`w-full h-[600px] bg-gray-50 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g
          transform={`translate(${position.x}, ${position.y}) scale(${zoom})`}
        >
          {/* Background circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius + 20}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          
          {/* Outer glow for central node */}
          <circle
            cx={centerX}
            cy={centerY}
            r={45}
            fill="url(#centralGlow)"
          />
          
          {/* Gradient definitions */}
          <defs>
            <radialGradient id="centralGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#FEF2F2" />
              <stop offset="100%" stopColor="#FEF2F2" stopOpacity="0" />
            </radialGradient>
            
            {nodes.map(node => (
              <linearGradient
                key={`gradient-${node.id}`}
                id={`gradient-${node.id}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={node.gradient[0]} />
                <stop offset="100%" stopColor={node.gradient[1]} />
              </linearGradient>
            ))}
            
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            {/* Arrow markers for different connection types */}
            {nodes.map(node => (
              <marker
                key={`arrowhead-${node.id}`}
                id={`arrowhead-${node.id}`}
                markerWidth="10"
                markerHeight="7"
                refX="10"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill={node.color} />
              </marker>
            ))}
            
            <marker
              id="arrowheadGreen"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#10B981" />
            </marker>
            
            <marker
              id="arrowheadRed"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#EF4444" />
            </marker>
            
            <marker
              id="arrowheadIndigo"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#6366F1" />
            </marker>
          </defs>
          
          {/* Draw connections between nodes */}
          {connections.map(conn => {
            const fromNode = nodes.find(n => n.id === conn.from);
            const toNode = nodes.find(n => n.id === conn.to);
            
            if (!fromNode || !toNode) return null;
            
            if (conn.isRecycling) {
              // Curved recycling connection
              const controlPoints = calculateControlPoints(fromNode, toNode);
              const path = `M ${fromNode.x} ${fromNode.y} Q ${controlPoints.x1} ${controlPoints.y1}, ${toNode.x} ${toNode.y}`;
              
              return (
                <g key={`${conn.from}-${conn.to}`}>
                  <path
                    d={path}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeDasharray="none"
                    className="transition-all duration-300"
                    markerEnd="url(#arrowheadGreen)"
                    filter="url(#glow)"
                    opacity="0.8"
                  />
                  <text>
                    <textPath
                      href={`#recycling-path-${conn.from}-${conn.to}`}
                      startOffset="50%"
                      textAnchor="middle"
                      className="text-xs fill-green-600 font-medium"
                      dy="-8"
                    >
                      Recycled Materials
                    </textPath>
                  </text>
                  <path
                    id={`recycling-path-${conn.from}-${conn.to}`}
                    d={path}
                    fill="none"
                    stroke="none"
                  />
                </g>
              );
            } else if (conn.isImpact) {
              // Connection from center to outer nodes (impact analysis)
              return (
                <line
                  key={`${conn.from}-${conn.to}`}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="#EF4444"
                  strokeWidth="1.5"
                  strokeDasharray="4"
                  opacity="0.6"
                  className="transition-all duration-300"
                  markerEnd="url(#arrowheadRed)"
                />
              );
            } else if (conn.isDataFlow) {
              // Connection from outer nodes to center (data collection)
              return (
                <line
                  key={`${conn.from}-${conn.to}`}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="#6366F1"
                  strokeWidth="1.5"
                  strokeDasharray="4"
                  opacity="0.6"
                  className="transition-all duration-300"
                  markerEnd="url(#arrowheadIndigo)"
                />
              );
            } else {
              // Normal connections between sequential nodes
              const isActive = fromNode.step === currentStep || toNode.step === currentStep;
              
              return (
                <g key={`${conn.from}-${conn.to}`}>
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={`url(#gradient-${fromNode.id})`}
                    strokeWidth={isActive ? "3" : "2"}
                    strokeDasharray="none"
                    className="transition-all duration-300"
                    markerEnd={`url(#arrowhead-${fromNode.id})`}
                    opacity={isActive ? "1" : "0.7"}
                  />
                </g>
              );
            }
          })}
          
          {/* Animated particles along paths */}
          {connections.map((conn) => renderAnimatedPath(conn))}

          {/* Draw nodes */}
          {nodes.map(node => {
            const isActive = currentStep === node.step;
            const isSelected = selectedNode === node.id;
            const isImpactAnalysis = node.id === 7;
            const nodeSize = isImpactAnalysis ? 36 : 45;
            
            return (
              <g
                key={node.id}
                className={`transition-all duration-300 ${isActive ? 'scale-110' : ''} ${isSelected ? 'scale-115' : ''}`}
                onClick={() => handleNodeClick(node.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* Shadow effect */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeSize + 3}
                  fill="#00000015"
                  className="transition-transform duration-300"
                />
                
                {/* Node background */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeSize}
                  fill={`url(#gradient-${node.id})`}
                  className={`transition-all duration-300 ${isSelected || isActive ? 'stroke-2 stroke-white' : ''}`}
                  filter={isSelected || isActive ? "url(#glow)" : "none"}
                />
                
                {/* Icon */}
                <foreignObject
                  x={node.x - 12}
                  y={node.y - 12}
                  width={24}
                  height={24}
                  className="pointer-events-none"
                >
                  <div className="flex items-center justify-center w-full h-full text-white">
                    <node.icon size={20} />
                  </div>
                </foreignObject>
                
                {/* Node label with background for better readability */}
                <foreignObject
                  x={node.x - 60}
                  y={node.y + nodeSize + 5}
                  width={120}
                  height={30}
                  className="pointer-events-none"
                >
                  <div className={`text-center text-xs font-medium px-2 py-1 rounded-full mx-auto w-fit ${isSelected || isActive ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}`}>
                    {node.name}
                  </div>
                </foreignObject>
                
                {/* Step number indicator */}
                {!isImpactAnalysis && (
                  <circle
                    cx={node.x + nodeSize/1.5}
                    cy={node.y - nodeSize/1.5}
                    r={12}
                    fill="white"
                    stroke={node.color}
                    strokeWidth="2"
                    className="transition-all duration-300"
                  />
                )}
                
                {!isImpactAnalysis && (
                  <text
                    x={node.x + nodeSize/1.5}
                    y={node.y - nodeSize/1.5}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-xs font-bold fill-gray-700"
                  >
                    {node.step}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* CSS animations for particles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        .pulse {
          animation: pulse 2s infinite;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default EnhancedLCAProcessFlow;
