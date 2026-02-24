import React, { useState, useEffect } from 'react';
import { requestsAPI } from '../../services/api';
import Loading from '../../components/Loading';
import { toast } from 'react-toastify';
import { FiAlertCircle, FiX, FiCheck, FiXCircle } from 'react-icons/fi';
import { getStatusColor, getUrgencyColor, getBloodGroupColor, formatDateTime } from '../../utils/helpers';

const HospitalRequests = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await requestsAPI.getAll();
      setRequests(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    try {
      await requestsAPI.updateStatus(requestId, { 
        status, 
        rejectionReason: status === 'rejected' ? rejectionReason : undefined 
      });
      toast.success(`Request ${status} successfully`);
      setSelectedRequest(null);
      setRejectionReason('');
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update request');
    }
  };

  if (loading) {
    return <Loading size="large" text="Loading requests..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Blood Requests
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage emergency blood requests
        </p>
      </div>

      {/* Requests List */}
      {requests.length > 0 ? (
        <div className="card overflow-hidden">
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
                    <td className="table-cell">{request.hospital}</td>
                    <td className="table-cell">
                      <span className={`badge ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="table-cell">{formatDateTime(request.createdAt)}</td>
                    <td className="table-cell">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="text-primary-600 dark:text-primary-400 text-sm hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center">
          <FiAlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Requests
          </h3>
          <p className="text-gray-500">No blood requests at the moment.</p>
        </div>
      )}

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
                  onClick={() => {
                    setSelectedRequest(null);
                    setRejectionReason('');
                  }}
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
                  <span className="text-gray-500">Blood Group</span>
                  <span className={`badge ${getBloodGroupColor(selectedRequest.bloodGroup)}`}>
                    {selectedRequest.bloodGroup}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Urgency</span>
                  <span className={`badge ${getUrgencyColor(selectedRequest.urgencyLevel)}`}>
                    {selectedRequest.urgencyLevel?.toUpperCase()}
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
                
                <div>
                  <span className="text-gray-500 block mb-1">Location</span>
                  <span className="text-gray-900 dark:text-white">
                    {selectedRequest.location?.address}, {selectedRequest.location?.city}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-500 block mb-1">Required By</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDateTime(selectedRequest.requiredBy)}
                  </span>
                </div>
              </div>
              
              {selectedRequest.status === 'pending' && (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="label">Rejection Reason (if rejecting)</label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="input"
                      placeholder="Enter reason for rejection..."
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleStatusUpdate(selectedRequest._id, 'approved')}
                      className="flex-1 btn-success flex items-center justify-center gap-2"
                    >
                      <FiCheck /> Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedRequest._id, 'rejected')}
                      className="flex-1 btn-danger flex items-center justify-center gap-2"
                    >
                      <FiXCircle /> Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalRequests;