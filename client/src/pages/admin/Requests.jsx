import React, { useState, useEffect } from 'react';
import { requestsAPI } from '../../services/api';
import Loading from '../../components/Loading';
import { toast } from 'react-toastify';
import { 
  FiAlertCircle, 
  FiFilter, 
  FiEye,
  FiX,
  FiCheck,
  FiXCircle
} from 'react-icons/fi';
import { getStatusColor, getUrgencyColor, getBloodGroupColor, formatDateTime } from '../../utils/helpers';

const AdminRequests = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ status: '', urgencyLevel: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [pagination.page, filters]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      const response = await requestsAPI.getAll(params);
      setRequests(response.data.data);
      setPagination(prev => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusUpdate = async (requestId, status, rejectionReason = '') => {
    try {
      await requestsAPI.updateStatus(requestId, { status, rejectionReason });
      toast.success(`Request ${status} successfully`);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update request');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Emergency Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage blood requests from patients
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="label">Urgency</label>
              <select
                value={filters.urgencyLevel}
                onChange={(e) => handleFilterChange('urgencyLevel', e.target.value)}
                className="input"
              >
                <option value="">All Urgency Levels</option>
                <option value="critical">Critical</option>
                <option value="urgent">Urgent</option>
                <option value="normal">Normal</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: '', urgencyLevel: '' })}
                className="btn-outline w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Requests Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <Loading size="medium" />
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No requests found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Patient</th>
                  <th className="table-header-cell">Blood Group</th>
                  <th className="table-header-cell">Urgency</th>
                  <th className="table-header-cell">Hospital</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Created</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {requests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {request.patientName}
                        </p>
                        <p className="text-sm text-gray-500">{request.patientPhone}</p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${getBloodGroupColor(request.bloodGroup)}`}>
                        {request.bloodGroup}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${getUrgencyColor(request.urgencyLevel)}`}>
                        {request.urgencyLevel?.toUpperCase()}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-gray-600 dark:text-gray-400">
                        {request.hospital}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      {formatDateTime(request.createdAt)}
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        title="View Details"
                      >
                        <FiEye />
                      </button>
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
              Showing page {pagination.page} of {pagination.pages}
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

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Request Details
                </h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <FiX />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`badge ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Urgency</span>
                  <span className={`badge ${getUrgencyColor(selectedRequest.urgencyLevel)}`}>
                    {selectedRequest.urgencyLevel?.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Blood Group</span>
                  <span className={`badge ${getBloodGroupColor(selectedRequest.bloodGroup)}`}>
                    {selectedRequest.bloodGroup}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Quantity</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {selectedRequest.quantity} unit(s)
                  </span>
                </div>
                
                <hr className="border-gray-200 dark:border-gray-700" />
                
                <div>
                  <span className="text-gray-500 block mb-1">Patient Name</span>
                  <span className="text-gray-900 dark:text-white">{selectedRequest.patientName}</span>
                </div>
                
                <div>
                  <span className="text-gray-500 block mb-1">Patient Phone</span>
                  <span className="text-gray-900 dark:text-white">{selectedRequest.patientPhone}</span>
                </div>
                
                <div>
                  <span className="text-gray-500 block mb-1">Hospital</span>
                  <span className="text-gray-900 dark:text-white">{selectedRequest.hospital}</span>
                </div>
                
                {selectedRequest.doctorName && (
                  <div>
                    <span className="text-gray-500 block mb-1">Doctor</span>
                    <span className="text-gray-900 dark:text-white">{selectedRequest.doctorName}</span>
                  </div>
                )}
                
                <div>
                  <span className="text-gray-500 block mb-1">Location</span>
                  <span className="text-gray-900 dark:text-white">
                    {selectedRequest.location?.address}, {selectedRequest.location?.city}, {selectedRequest.location?.state}
                  </span>
                </div>
                
                {selectedRequest.reason && (
                  <div>
                    <span className="text-gray-500 block mb-1">Reason</span>
                    <span className="text-gray-900 dark:text-white">{selectedRequest.reason}</span>
                  </div>
                )}
                
                <div>
                  <span className="text-gray-500 block mb-1">Required By</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDateTime(selectedRequest.requiredBy)}
                  </span>
                </div>
              </div>
              
              {selectedRequest.status === 'pending' && (
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => handleStatusUpdate(selectedRequest._id, 'approved')}
                    className="flex-1 btn-success flex items-center justify-center gap-2"
                  >
                    <FiCheck /> Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedRequest._id, 'rejected', 'Rejected by admin')}
                    className="flex-1 btn-danger flex items-center justify-center gap-2"
                  >
                    <FiXCircle /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequests;