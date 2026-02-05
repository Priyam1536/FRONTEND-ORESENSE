import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Camera, Edit, Save, X, Bell, Shield, Palette } from 'lucide-react';
import { authAPI, tokenStorage } from '../utils/api.jsx';

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    department: '',
    position: '',
    joinDate: '',
    bio: ''
  });

  const [preferences, setPreferences] = useState({
    notifications: {
      emailAlerts: true,
      pushNotifications: false,
      weeklyReports: true,
      projectUpdates: true,
      teamNotifications: false
    },
    display: {
      theme: 'light',
      language: 'en',
      timezone: 'America/Los_Angeles',
      dateFormat: 'MM/DD/YYYY',
      numberFormat: 'US'
    },
    privacy: {
      profileVisibility: 'team',
      activitySharing: true,
      dataSharing: false,
      twoFactorAuth: false
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [prefsDirty, setPrefsDirty] = useState(false);

  const [tempData, setTempData] = useState({ ...profileData });

  const getInitials = (firstName, lastName, fallbackName = '') => {
    const combined = `${firstName || ''} ${lastName || ''}`.trim();
    if (combined) {
      return combined
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0].toUpperCase())
        .join('');
    }
    if (fallbackName) {
      return fallbackName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0].toUpperCase())
        .join('');
    }
    return 'U';
  };

  const loadProfile = async () => {
    const token = tokenStorage.getToken();
    if (!token) {
      setIsLoading(false);
      setErrorMessage('Please log in to view your profile.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await authAPI.getProfile(token);
      const loadedProfile = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        department: data.department || '',
        position: data.position || '',
        joinDate: data.joinDate || '',
        bio: data.bio || ''
      };

      setProfileData(loadedProfile);
      setTempData(loadedProfile);

      if (data.preferences) {
        setPreferences(prev => ({
          ...prev,
          ...data.preferences,
          notifications: {
            ...prev.notifications,
            ...data.preferences.notifications
          },
          display: {
            ...prev.display,
            ...data.preferences.display
          },
          privacy: {
            ...prev.privacy,
            ...data.preferences.privacy
          }
        }));
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setTempData({ ...profileData });
  };

  const handleSave = async () => {
    const token = tokenStorage.getToken();
    if (!token) {
      setErrorMessage('Please log in to update your profile.');
      return;
    }

    setSaveMessage('');
    setErrorMessage('');

    try {
      const updated = await authAPI.updateProfile(token, {
        ...tempData,
        preferences
      });

      const updatedProfile = {
        firstName: updated.firstName || '',
        lastName: updated.lastName || '',
        email: updated.email || '',
        phone: updated.phone || '',
        location: updated.location || '',
        department: updated.department || '',
        position: updated.position || '',
        joinDate: updated.joinDate || '',
        bio: updated.bio || ''
      };

      setProfileData(updatedProfile);
      setTempData(updatedProfile);
      setPreferences(prev => ({
        ...prev,
        ...updated.preferences,
        notifications: {
          ...prev.notifications,
          ...updated.preferences?.notifications
        },
        display: {
          ...prev.display,
          ...updated.preferences?.display
        },
        privacy: {
          ...prev.privacy,
          ...updated.preferences?.privacy
        }
      }));

      tokenStorage.setUserData({
        id: updated._id,
        name: updated.name || `${updatedProfile.firstName} ${updatedProfile.lastName}`.trim(),
        email: updatedProfile.email
      });
      window.dispatchEvent(new Event('userDataUpdated'));

      setIsEditing(false);
      setPrefsDirty(false);
      setSaveMessage('Profile updated successfully.');
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update profile');
    }
  };

  const handleSavePreferences = async () => {
    const token = tokenStorage.getToken();
    if (!token) {
      setErrorMessage('Please log in to update preferences.');
      return;
    }

    setSaveMessage('');
    setErrorMessage('');

    try {
      await authAPI.updateProfile(token, { preferences });
      setPrefsDirty(false);
      setSaveMessage('Preferences saved successfully.');
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update preferences');
    }
  };

  const handleCancel = () => {
    setTempData({ ...profileData });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setTempData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (category, field, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
    setPrefsDirty(true);
  };

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Bell },
    { id: 'security', label: 'Security & Privacy', icon: Shield },
    { id: 'activity', label: 'Activity History', icon: Calendar }
  ];

  const ActivityHistory = () => {
    const activities = [
      { date: '2024-01-20', action: 'Created LCA report for Aluminum Production', type: 'report' },
      { date: '2024-01-19', action: 'Updated team parameters for Mining Operations', type: 'parameter' },
      { date: '2024-01-18', action: 'Invited new team member: Bob Smith', type: 'team' },
      { date: '2024-01-17', action: 'Exported environmental impact analysis', type: 'export' },
      { date: '2024-01-16', action: 'Completed LCA comparison for Steel vs Aluminum', type: 'analysis' }
    ];

    return (
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{activity.action}</p>
              <p className="text-sm text-gray-500">{activity.date}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              activity.type === 'report' ? 'bg-blue-100 text-blue-800' :
              activity.type === 'parameter' ? 'bg-green-100 text-green-800' :
              activity.type === 'team' ? 'bg-purple-100 text-purple-800' :
              activity.type === 'export' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {activity.type}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const displayProfile = isEditing ? tempData : profileData;
  const avatarText = getInitials(displayProfile.firstName, displayProfile.lastName, `${displayProfile.firstName || ''} ${displayProfile.lastName || ''}`.trim());
  const joinedDateText = displayProfile.joinDate
    ? new Date(displayProfile.joinDate).toLocaleDateString()
    : 'Not specified';

  return (
    <div className="p-6 bg-gray-50 min-h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Profile & Preferences</h1>
        <p className="text-gray-600 mt-1">Manage your personal information, preferences, and account settings</p>
      </div>

      {isLoading && (
        <div className="mb-6 text-sm text-gray-600">Loading profile...</div>
      )}

      {errorMessage && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      {saveMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {saveMessage}
        </div>
      )}

      <div className="flex gap-6">
        {/* Profile Card */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {avatarText}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {displayProfile.firstName} {displayProfile.lastName}
              </h2>
              <p className="text-gray-600">{displayProfile.position}</p>
              <p className="text-sm text-gray-500 mt-1">{displayProfile.department}</p>
            </div>
            
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{displayProfile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{displayProfile.phone || 'Not specified'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{displayProfile.location || 'Not specified'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Joined {joinedDateText}</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            
            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={isEditing ? tempData.firstName : profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isEditing 
                          ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={isEditing ? tempData.lastName : profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isEditing 
                          ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={isEditing ? tempData.email : profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isEditing 
                          ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={isEditing ? tempData.phone : profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isEditing 
                          ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={isEditing ? tempData.location : profileData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isEditing 
                          ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <input
                      type="text"
                      value={isEditing ? tempData.position : profileData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isEditing 
                          ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      rows="3"
                      value={isEditing ? tempData.bio : profileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isEditing 
                          ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Preferences</h3>
                
                <div className="space-y-8">
                  {/* Notifications */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Notifications
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(preferences.notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-700">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => handlePreferenceChange('notifications', key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Display */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Display Settings
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                        <select
                          value={preferences.display.theme}
                          onChange={(e) => handlePreferenceChange('display', 'theme', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                        <select
                          value={preferences.display.language}
                          onChange={(e) => handlePreferenceChange('display', 'language', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleSavePreferences}
                      disabled={!prefsDirty}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        prefsDirty
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Security & Privacy</h3>
                <div className="space-y-6">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600 mb-4">Add an extra layer of security to your account</p>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      {preferences.privacy.twoFactorAuth ? 'Enabled' : 'Enable 2FA'}
                    </button>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Change Password</h4>
                    <p className="text-sm text-gray-600 mb-4">Update your account password regularly</p>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Activity History</h3>
                <ActivityHistory />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
