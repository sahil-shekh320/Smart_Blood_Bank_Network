import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../../services/api';
import Loading from '../../components/Loading';
import { FiSearch, FiDroplet, FiMapPin, FiPhone } from 'react-icons/fi';
import { getBloodGroupColor, formatDate } from '../../utils/helpers';
import { bloodGroups, indianStates } from '../../utils/helpers';

const PatientSearch = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [filters, setFilters] = useState({
    bloodGroup: '',
    city: '',
    state: ''
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!filters.bloodGroup) return;

    setLoading(true);
    setSearched(true);
    
    try {
      const response = await inventoryAPI.search(filters);
      setResults(response.data.hospitals || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Search Blood
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Find available blood in hospitals near you
        </p>
      </div>

      {/* Search Form */}
      <div className="card p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="label">Blood Group *</label>
              <select
                value={filters.bloodGroup}
                onChange={(e) => setFilters(prev => ({ ...prev, bloodGroup: e.target.value }))}
                className="input"
                required
              >
                <option value="">Select Blood Group</option>
                {bloodGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="label">City</label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Enter city"
                className="input"
              />
            </div>
            
            <div>
              <label className="label">State</label>
              <select
                value={filters.state}
                onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
                className="input"
              >
                <option value="">All States</option>
                {indianStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                <FiSearch /> Search
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <Loading size="medium" text="Searching..." />
      ) : searched && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Search Results ({results.length} hospitals found)
          </h2>
          
          {results.length > 0 ? (
            <div className="grid gap-4">
              {results.map((hospital, index) => (
                <div key={index} className="card p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {hospital.hospital?.hospitalName || hospital.hospital?.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 text-gray-500">
                        <FiMapPin className="w-4 h-4" />
                        <span>{hospital.hospital?.city}, {hospital.hospital?.state}</span>
                      </div>
                      {hospital.hospital?.phone && (
                        <div className="flex items-center gap-2 mt-1 text-gray-500">
                          <FiPhone className="w-4 h-4" />
                          <span>{hospital.hospital.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {hospital.bloodUnits?.map((unit, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                          <span className={`badge ${getBloodGroupColor(unit.bloodGroup)} mb-1`}>
                            {unit.bloodGroup}
                          </span>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {unit.quantity}
                          </p>
                          <p className="text-xs text-gray-500">units</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <FiDroplet className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Results Found
              </h3>
              <p className="text-gray-500">
                No hospitals found with the selected blood group. Try different search criteria.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientSearch;