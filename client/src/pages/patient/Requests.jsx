import React, { useState, useEffect } from 'react';
import { requestsAPI } from '../../services/api';
import Loading from '../../components/Loading';
import { toast } from 'react-toastify';
import { FiAlertCircle, FiX, FiDroplet } from 'react-icons/fi';
import { getStatusColor, getUrgencyColor, getBloodGroupColor, formatDateTime } from '../../utils/helpers';

const PatientRequests = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await requestsAPI.getMyRequests();
      setRequests(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (requestId) => {
    try {
      await requestsAPI.cancel(requestId);
      toast.success('Request cancelled successfully');
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel request');
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
          My Requests
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your blood requests
        </p>
      </div>

      {/* Requests List */}
      {requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="card p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className={`badge ${getBloodGroupColor(request.bloodGroup)} text-lg px-3 py-1`}>
                    {request.bloodGroup}
                  </span>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {request.hospital}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {request.location?.city}, {request.location?.state}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`badge ${getUrgencyColor(request.urgencyLevel)}`}>
                    {request.urgencyLevel?.toUpperCase()}
                  </span>
                  <span className={`badge ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="text-primary-600 dark:text-primary-400 text-sm hover:underline"
                  >
                    View Details
                  </button>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Created: {formatDateTime(request.createdAt)}
                </span>
                <span className="text-gray-500">
                  Required by: {formatDateTime(request.requiredBy)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <FiAlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Requests Yet
          </h3>
          <p className="text-gray-500 mb-4">
            You haven't created any blood requests yet.
          </p>
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
                  <span className="text-gray-500 block mb-1">Hospital</span>
                  <span className="text-gray-900 dark:text-white">{selectedRequest.hospital}</span>
                </div>
                
                <div>
                  <span className="text-gray-500 block mb-1">Location</span>
                  <span className="text-gray-900 dark:text-white">
                    {selectedRequest.location?.address}, {selectedRequest.location?.city}
                  </span>
                </div>
                
                {selectedRequest.assignedHospital && (
                  <div>
                    <span className="text-gray-500 block mb-1">Assigned Hospital</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedRequest.assignedHospital?.hospitalName}
                    </span>
                  </div>
                )}
                
                {selectedRequest.reason && (
                  <div>
                    <span className="text-gray-500 block mb-1">Reason</span>
                    <span className="text-gray-900 dark:text-white">{selectedRequest.reason}</span>
                  </div>
                )}
                
                {selectedRequest.rejectionReason && (
                  <div>
                    <span className="text-gray-500 block mb-1">Rejection Reason</span>
                    <span className="text-red-600">{selectedRequest.rejectionReason}</span>
                  </div>
                )}
              </div>
              
              {selectedRequest.status === 'pending' && (
                <button
                  onClick={() => handleCancel(selectedRequest._id)}
                  className="w-full btn-danger mt-6"
                >
                  Cancel Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRequests;