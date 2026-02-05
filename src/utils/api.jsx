const API_BASE_URL = 'http://localhost:8000/api';

// Auth related API calls
export const authAPI = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Register new user
  signup: async (name, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },
  
  // Get user profile (authenticated endpoint)
  getProfile: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Update user profile (authenticated endpoint)
  updateProfile: async (token, payload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },
};

// Team management API calls
export const teamAPI = {
  getMembers: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/team/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }

      return await response.json();
    } catch (error) {
      console.error('Get members error:', error);
      throw error;
    }
  },

  getInvitations: async (token, status = '') => {
    try {
      const query = status ? `?status=${encodeURIComponent(status)}` : '';
      const response = await fetch(`${API_BASE_URL}/team/invitations${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch invitations');
      }

      return await response.json();
    } catch (error) {
      console.error('Get invitations error:', error);
      throw error;
    }
  },

  sendInvitation: async (token, payload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/team/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send invitation');
      }

      return await response.json();
    } catch (error) {
      console.error('Send invitation error:', error);
      throw error;
    }
  },

  cancelInvitation: async (token, invitationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/team/invitations/${invitationId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel invitation');
      }

      return await response.json();
    } catch (error) {
      console.error('Cancel invitation error:', error);
      throw error;
    }
  },

  resendInvitation: async (token, invitationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/team/invitations/${invitationId}/resend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to resend invitation');
      }

      return await response.json();
    } catch (error) {
      console.error('Resend invitation error:', error);
      throw error;
    }
  }
};

// Local storage functions for token management
export const tokenStorage = {
  setToken: (token) => {
    localStorage.setItem('authToken', token);
  },
  
  getToken: () => {
    return localStorage.getItem('authToken');
  },
  
  removeToken: () => {
    localStorage.removeItem('authToken');
  },
  
  setUserData: (userData) => {
    localStorage.setItem('userData', JSON.stringify(userData));
  },
  
  getUserData: () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },
  
  clearUserData: () => {
    localStorage.removeItem('userData');
  }
};

// Report utilities for PDF generation and analysis
export const reportUtils = {
  // Generate insights based on form data
  generateInsights: (formData) => {
    const metalType = formData?.metalType || 'metal';
    let insights = '';
    
    // Check how complete the data is
    const requiredFields = [
      'metalType', 'miningLocation', 'oreGrade', 'productionVolume', 
      'energyConsumptionMining', 'waterConsumptionMining', 'emissionsMining',
      'energyConsumptionProcessing', 'recyclingRate'
    ];
    
    const filledFields = requiredFields.filter(field => formData && formData[field]);
    const completeness = filledFields.length / requiredFields.length;
    
    if (completeness < 0.5) {
      insights = `Based on the provided incomplete dataset, a comprehensive environmental impact assessment is impossible. However, assuming typical ${metalType} mining and processing practices, the process likely has significant environmental impacts due to energy-intensive mining and processing, potential water consumption issues, and emissions related to both. The lack of data on ore grade, production volume, energy sources, chemical inputs, and waste management prevents a detailed quantification of these impacts.`;
    } else {
      insights = `The life cycle assessment for ${metalType} indicates significant environmental impacts across multiple categories. Based on the provided data, the most substantial impacts are in ${formData.energyConsumptionMining ? 'energy consumption during mining operations' : 'resource extraction and processing'}, with approximately ${formData.emissionsMining || 'unknown'} kg CO₂-eq emissions and ${formData.waterConsumptionMining || 'significant'} water usage. The recovery rate of ${formData.recoveryRate || 'typical industry rates'} suggests opportunities for optimization in the production process.`;
    }
    
    return insights;
  },
  
  // Generate recommendations based on form data
  generateRecommendations: (formData) => {
    const recommendations = [
      "Conduct a comprehensive data collection effort to fill in the missing data points, including ore grade, production volume, energy consumption (mining and processing), water consumption, emissions, chemical inputs, recovery rate, transport distances, and waste disposal methods.",
      "Implement energy-efficient technologies in both mining and processing operations, such as high-efficiency grinding mills, optimized ventilation systems, and waste heat recovery systems.",
      "Consider renewable energy sources for processing facilities to reduce the carbon footprint of operations.",
      "Develop a water management plan that includes recycling and reuse strategies to minimize freshwater consumption.",
      "Improve material efficiency through better ore sorting technologies and process optimization to reduce waste generation."
    ];
    
    // Filter recommendations based on available data
    if (formData.recyclingRate && parseFloat(formData.recyclingRate) < 50) {
      recommendations.push("Increase the recycling rate by implementing better collection systems and technologies for metal recovery from waste streams.");
    }
    
    if (formData.energyConsumptionProcessing && formData.energyConsumptionMining) {
      recommendations.push("Focus on reducing energy consumption in the most energy-intensive process steps identified in the assessment.");
    }
    
    if (formData.transportDistances && parseFloat(formData.transportDistances) > 500) {
      recommendations.push("Optimize transportation routes and consider more energy-efficient transport modes to reduce emissions associated with logistics.");
    }
    
    return recommendations.slice(0, 5); // Limit to 5 recommendations
  },
  
  // Generate PDF report with form data and AI insights
  generatePDFReport: (formData) => {
    try {
      // Import jsPDF dynamically to avoid server-side rendering issues
      import('jspdf').then(({ jsPDF }) => {
        import('jspdf-autotable').then(() => {
          // Create a new PDF document
          const doc = new jsPDF();
          
          // Add title
          doc.setFontSize(22);
          doc.setTextColor(0, 51, 102); // Navy blue color for the title
          doc.text('Life Cycle Assessment Report', 105, 20, { align: 'center' });
          
          // Add date
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100); // Gray color for the date
          doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
          
          // Add horizontal line
          doc.setDrawColor(220, 220, 220);
          doc.line(20, 35, 190, 35);
          
          // Reset text color
          doc.setTextColor(0, 0, 0);
          
          // Start position for content
          let yPosition = 45;
          
          // Add metal type if available
          const metalType = formData.metalType || 'Unknown Metal';
          doc.setFontSize(16);
          doc.text(`Life Cycle Assessment for: ${metalType}`, 20, yPosition);
          yPosition += 10;
          
          // Generate AI insights
          doc.setFontSize(14);
          doc.setTextColor(0, 102, 204); // Blue for section headers
          doc.text('AI-Generated LCA Insights', 20, yPosition);
          yPosition += 10;
          
          // Add insights content
          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
          const insights = reportUtils.generateInsights(formData);
          
          // Handle text wrapping for insights
          const splitInsights = doc.splitTextToSize(insights, 170);
          doc.text(splitInsights, 20, yPosition);
          yPosition += splitInsights.length * 7 + 10;
          
          // Add recommendations section
          doc.setFontSize(14);
          doc.setTextColor(0, 102, 204);
          doc.text('Recommendations', 20, yPosition);
          yPosition += 10;
          
          // Add recommendations with bullet points
          const recommendations = reportUtils.generateRecommendations(formData);
          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
          
          recommendations.forEach((recommendation, index) => {
            // Add bullet point
            doc.text('•', 20, yPosition);
            
            // Add wrapped recommendation text
            const splitRecommendation = doc.splitTextToSize(recommendation, 160);
            doc.text(splitRecommendation, 25, yPosition);
            yPosition += splitRecommendation.length * 7 + 5;
            
            // Add page if needed
            if (yPosition > 270 && index < recommendations.length - 1) {
              doc.addPage();
              yPosition = 20;
            }
          });
          
          yPosition += 10;
          
          // Add form data section if there's room, otherwise add a new page
          if (yPosition > 240) {
            doc.addPage();
            yPosition = 20;
          }
          
          // Add assessment data
          doc.setFontSize(14);
          doc.setTextColor(0, 102, 204);
          doc.text('Assessment Data Summary', 20, yPosition);
          yPosition += 10;
          
          // Group form data by categories
          const categories = {
            'General Information': ['metalType', 'miningLocation', 'oreGrade', 'productionVolume', 'functionalUnit'],
            'Mining & Production': ['energyConsumptionMining', 'waterConsumptionMining', 'emissionsMining', 'landUse'],
            'Processing & Energy': ['processingRoute', 'energySource', 'energyConsumptionProcessing', 'recoveryRate'],
            'Environmental Impact': ['globalWarmingPotential', 'acidificationPotential', 'waterScarcityFootprint']
          };
          
          // Create table data
          const tableData = [];
          for (const [category, fields] of Object.entries(categories)) {
            tableData.push([{content: category, colSpan: 2, styles: {fillColor: [240, 240, 240], fontStyle: 'bold'}}]);
            
            fields.forEach(field => {
              if (formData[field]) {
                const label = field
                  .replace(/([A-Z])/g, ' $1') // Add space before capital letters
                  .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
                tableData.push([label, formData[field].toString()]);
              }
            });
            
            // Add empty row between categories
            tableData.push([{content: '', colSpan: 2, styles: {cellPadding: 1}}]);
          }
          
          // Add table
          doc.autoTable({
            startY: yPosition,
            head: [['Field', 'Value']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [245, 250, 255] },
            margin: { left: 20, right: 20 }
          });
          
          // Add footer to all pages
          const pageCount = doc.internal.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(128, 128, 128);
            doc.text('Generated by OreSense AI', 105, doc.internal.pageSize.height - 10, { align: 'center' });
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
          }
          
          // Save the PDF file with a descriptive name
          const filename = `OreSense_LCA_Report_${metalType.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`;
          doc.save(filename);
        });
      });
      
      return true;
    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw error;
    }
  }
};

export default { authAPI, teamAPI, tokenStorage, reportUtils };
