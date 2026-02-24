import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import Loading from '../../components/Loading';
import { toast } from 'react-toastify';
import { 
  FiSearch, 
  FiFilter, 
  FiEye, 
  FiTrash2,
  FiX,
  FiUser
} from 'react-icons/fi';
import { getRoleColor, getBloodGroupColor, formatDate, capitalize } from '../../utils/helpers';

const AdminUsers = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ role: '', bloodGroup: '', search: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      const response = await usersAPI.getAll(params);
      setUsers(response.data.data);
      setPagination(prev => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ role: '', bloodGroup: '', search: '' });
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    
    try {
      await usersAPI.delete(selectedUser._id);
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const roles = ['donor', 'patient', 'hospital', 'admin'];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all registered users
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-outline flex items-center gap-2"
        >
          <FiFilter /> Filters
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card p-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="label">Search</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Name or email..."
                  className="input pl-10"
                />
              </div>
            </div>
            <div>
              <label className="label">Role</label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="input"
              >
                <option value="">All Roles</option>
                {roles.map(role => (
                  <option key={role} value={role}>{capitalize(role)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Blood Group</label>
              <select
                value={filters.bloodGroup}
                onChange={(e) => handleFilterChange('bloodGroup', e.target.value)}
                className="input"
              >
                <option value="">All Blood Groups</option>
                {bloodGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={clearFilters} className="btn-outline w-full">
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <Loading size="medium" />
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">User</th>
                  <th className="table-header-cell">Role</th>
                  <th className="table-header-cell">Blood Group</th>
                  <th className="table-header-cell">Location</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Joined</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mr-3">
                          <span className="text-primary-600 dark:text-primary-400 font-medium">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${getRoleColor(user.role)}`}>
                        {capitalize(user.role)}
                      </span>
                    </td>
                    <td className="table-cell">
                      {user.bloodGroup ? (
                        <span className={`badge ${getBloodGroupColor(user.bloodGroup)}`}>
                          {user.bloodGroup}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <span className="text-gray-600 dark:text-gray-400">
                        {user.city}, {user.state}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-cell">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                          title="View Details"
                        >
                          <FiEye />
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            title="Delete User"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="btn-outline disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="btn-outline disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && !showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  User Details
                </h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <FiX />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mr-4">
                    <FiUser className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedUser.name}
                    </p>
                    <p className="text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <span className={`badge ${getRoleColor(selectedUser.role)}`}>
                      {capitalize(selectedUser.role)}
                    </span>
                  </div>
                  {selectedUser.bloodGroup && (
                    <div>
                      <p className="text-sm text-gray-500">Blood Group</p>
                      <span className={`badge ${getBloodGroupColor(selectedUser.bloodGroup)}`}>
                        {selectedUser.bloodGroup}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-900 dark:text-white">{selectedUser.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-gray-900 dark:text-white">
                      {selectedUser.city}, {selectedUser.state}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`badge ${selectedUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Joined</p>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(selectedUser.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete <strong>{selectedUser?.name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 btn-danger"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;