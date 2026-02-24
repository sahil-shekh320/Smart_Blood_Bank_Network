import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inventoryAPI } from '../../services/api';
import Loading from '../../components/Loading';
import { toast } from 'react-toastify';
import { FiDroplet, FiPlus, FiEdit2, FiTrash2, FiAlertTriangle, FiClock } from 'react-icons/fi';
import { getBloodGroupColor, formatDate } from '../../utils/helpers';

const HospitalInventory = () => {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await inventoryAPI.getAll();
      setInventory(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this item?')) return;
    
    try {
      await inventoryAPI.delete(id);
      toast.success('Item removed successfully');
      fetchInventory();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const isExpiringSoon = (expiryDate) => {
    const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 && days <= 7;
  };

  const isExpired = (expiryDate) => new Date(expiryDate) < new Date();

  if (loading) {
    return <Loading size="large" text="Loading inventory..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Blood Inventory
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your blood stock
          </p>
        </div>
        <Link to="/hospital/inventory/add" className="btn-primary flex items-center gap-2">
          <FiPlus /> Add Stock
        </Link>
      </div>

      {/* Inventory Table */}
      {inventory.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Blood Group</th>
                  <th className="table-header-cell">Quantity</th>
                  <th className="table-header-cell">Expiry Date</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {inventory.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="table-cell">
                      <span className={`badge ${getBloodGroupColor(item.bloodGroup)}`}>
                        {item.bloodGroup}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`font-medium ${item.quantity < 5 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                        {item.quantity} units
                      </span>
                    </td>
                    <td className="table-cell">
                      {formatDate(item.expiryDate)}
                    </td>
                    <td className="table-cell">
                      {isExpired(item.expiryDate) ? (
                        <span className="badge bg-red-100 text-red-800 flex items-center gap-1 w-fit">
                          <FiAlertTriangle /> Expired
                        </span>
                      ) : isExpiringSoon(item.expiryDate) ? (
                        <span className="badge bg-yellow-100 text-yellow-800 flex items-center gap-1 w-fit">
                          <FiClock /> Expiring Soon
                        </span>
                      ) : item.quantity < 5 ? (
                        <span className="badge bg-orange-100 text-orange-800 flex items-center gap-1 w-fit">
                          <FiAlertTriangle /> Low Stock
                        </span>
                      ) : (
                        <span className="badge bg-green-100 text-green-800">Available</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/hospital/inventory/edit/${item._id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        >
                          <FiEdit2 />
                        </Link>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center">
          <FiDroplet className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Inventory Yet
          </h3>
          <p className="text-gray-500 mb-4">
            Start by adding blood stock to your inventory.
          </p>
          <Link to="/hospital/inventory/add" className="btn-primary inline-flex items-center gap-2">
            <FiPlus /> Add First Stock
          </Link>
        </div>
      )}
    </div>
  );
};

export default HospitalInventory;