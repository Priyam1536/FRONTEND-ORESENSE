import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Mail, Shield, MoreHorizontal, Search, Filter, Edit, Trash2, Crown, User } from 'lucide-react';
import { teamAPI, tokenStorage } from '../utils/api.jsx';

const TeamManagement = () => {
  const [activeTab, setActiveTab] = useState('team');
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'Viewer',
    message: ''
  });

  const rolePermissions = {
    Admin: ['Full Access', 'User Management', 'System Settings', 'Export Data'],
    Analyst: ['Create Reports', 'View All Data', 'Export Data'],
    Collaborator: ['View Shared Projects', 'Comment', 'Basic Export'],
    Viewer: ['View Only', 'Basic Reports']
  };

  const getInitials = (name = '') => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join('') || 'U';
  };

  const loadTeamData = async () => {
    const token = tokenStorage.getToken();
    if (!token) {
      setErrorMessage('Please log in to manage your team.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const [membersResponse, invitationsResponse] = await Promise.all([
        teamAPI.getMembers(token),
        teamAPI.getInvitations(token)
      ]);

      setTeamMembers(membersResponse.members || []);
      setPendingInvitations(invitationsResponse.invitations || []);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load team data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeamData();
  }, []);

  const handleInviteInputChange = (field, value) => {
    setInviteForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSendInvite = async () => {
    const token = tokenStorage.getToken();
    if (!token) {
      setErrorMessage('Please log in to send invitations.');
      return;
    }

    setErrorMessage('');

    try {
      await teamAPI.sendInvitation(token, inviteForm);
      setInviteForm({ email: '', role: 'Viewer', message: '' });
      setShowInviteModal(false);
      loadTeamData();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to send invitation');
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    const token = tokenStorage.getToken();
    if (!token) return;

    try {
      await teamAPI.cancelInvitation(token, invitationId);
      loadTeamData();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to cancel invitation');
    }
  };

  const handleResendInvitation = async (invitationId) => {
    const token = tokenStorage.getToken();
    if (!token) return;

    try {
      await teamAPI.resendInvitation(token, invitationId);
      loadTeamData();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to resend invitation');
    }
  };

  const filteredTeamMembers = teamMembers.filter(member =>
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInvitations = pendingInvitations.filter(invitation =>
    invitation.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'Analyst':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-gray-100 text-gray-800',
      Pending: 'bg-yellow-100 text-yellow-800',
      Expired: 'bg-red-100 text-red-800',
      Canceled: 'bg-gray-100 text-gray-800',
      Accepted: 'bg-green-100 text-green-800',
      Declined: 'bg-red-100 text-red-800'
    };
    
    const className = styles[status] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
        {status || 'Unknown'}
      </span>
    );
  };

  const InviteModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Invite Team Member</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={inviteForm.email}
              onChange={(e) => handleInviteInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="colleague@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={inviteForm.role}
              onChange={(e) => handleInviteInputChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Viewer">Viewer</option>
              <option value="Collaborator">Collaborator</option>
              <option value="Analyst">Analyst</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
            <textarea
              rows="3"
              value={inviteForm.message}
              onChange={(e) => handleInviteInputChange('message', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a personal message..."
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowInviteModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSendInvite}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={!inviteForm.email}
          >
            Send Invite
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600 mt-1">Manage users, collaborators, and permissions</p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        </div>

        {isLoading && (
          <div className="mb-4 text-sm text-gray-600">Loading team data...</div>
        )}

        {errorMessage && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {errorMessage}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('team')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'team'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Team Members ({teamMembers.length})
            </button>
            <button
              onClick={() => setActiveTab('invitations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'invitations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Invitations ({pendingInvitations.length})
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'roles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Roles & Permissions
            </button>
          </nav>
        </div>
      </div>

      {/* Search and Filter */}
      {activeTab !== 'roles' && (
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      )}

      {/* Team Members Tab */}
      {activeTab === 'team' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Member</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Role</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Last Active</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Projects</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeamMembers.map((member) => (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-medium">
                          {getInitials(member.name)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(member.role)}
                        <span>{member.role}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(member.status)}</td>
                    <td className="py-4 px-6 text-gray-600">
                      {member.lastActive ? new Date(member.lastActive).toLocaleString() : 'Recently'}
                    </td>
                    <td className="py-4 px-6 text-gray-600">{member.projects ?? 0}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreHorizontal className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending Invitations Tab */}
      {activeTab === 'invitations' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Email</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Role</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Invited By</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvitations.map((invitation) => (
                  <tr key={invitation.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">{invitation.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">{invitation.role}</td>
                    <td className="py-4 px-6 text-gray-600">{invitation.invitedBy}</td>
                    <td className="py-4 px-6 text-gray-600">
                      {invitation.invitedDate ? new Date(invitation.invitedDate).toLocaleDateString() : ''}
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(invitation.status)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResendInvitation(invitation.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Resend
                        </button>
                        <button
                          onClick={() => handleCancelInvitation(invitation.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Roles & Permissions Tab */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(rolePermissions).map(([role, permissions]) => (
            <div key={role} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                {getRoleIcon(role)}
                <h3 className="text-lg font-semibold text-gray-900">{role}</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-3">Permissions:</p>
                {permissions.map((permission, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{permission}</span>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                Edit Permissions
              </button>
            </div>
          ))}
        </div>
      )}

      {showInviteModal && <InviteModal />}
    </div>
  );
};

export default TeamManagement;
