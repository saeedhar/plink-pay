import { useState, useEffect } from 'react';
import { filterService, type TransactionFilter, type CreateFilterRequest } from '../api/filterService';

export function AdminFiltersPage() {
  const [filters, setFilters] = useState<TransactionFilter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    label: '',
    code: '',
    order: '',
    active: true
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load filters on mount
  useEffect(() => {
    loadFilters();
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadFilters = async () => {
    setIsLoading(true);
    setError('');
    try {
      console.log('Loading transaction filters...');
      const response = await filterService.listFilters();
      console.log('Received response:', response);
      setFilters(Array.isArray(response.items) ? response.items : []);
    } catch (err) {
      console.error('Error loading filters:', err);
      setError(err instanceof Error ? err.message : 'Failed to load filters');
      setFilters([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddDrawer = () => {
    setFormData({
      label: '',
      code: '',
      order: '',
      active: true
    });
    setFormErrors({});
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setFormData({
      label: '',
      code: '',
      order: '',
      active: true
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.label.trim()) {
      errors.label = 'Label is required';
    }
    
    if (formData.order && isNaN(Number(formData.order))) {
      errors.order = 'Order must be a number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsCreating(true);
    try {
      const payload: CreateFilterRequest = {
        label: formData.label.trim(),
        code: formData.code.trim() || undefined,
        order: formData.order ? Number(formData.order) : undefined,
        active: formData.active
      };

      await filterService.createFilter(payload);
      
      // Success - close drawer and refresh list
      closeDrawer();
      setSuccessMessage('Filter created successfully!');
      await loadFilters();
    } catch (err) {
      setFormErrors({
        submit: err instanceof Error ? err.message : 'Failed to create filter'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleStatus = async (filter: TransactionFilter) => {
    try {
      await filterService.toggleFilterStatus(filter.id, !filter.active);
      setSuccessMessage(`Filter ${!filter.active ? 'activated' : 'deactivated'} successfully!`);
      await loadFilters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update filter status');
    }
  };

  const handleDelete = async (filter: TransactionFilter) => {
    if (!confirm(`Are you sure you want to delete the filter "${filter.label}"?`)) {
      return;
    }

    try {
      await filterService.deleteFilter(filter.id);
      setSuccessMessage('Filter deleted successfully!');
      await loadFilters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete filter');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Transaction Type Filters</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage transaction type filters for the application
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              All Transaction Filters
            </h3>
            <button
              onClick={openAddDrawer}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Filter
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Filters Table */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filters.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No filters found.</p>
            </div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Label
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filters.map((filter) => (
                    <tr key={filter.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
                          {filter.order}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {filter.label}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                          {filter.code || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          filter.active 
                            ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20' 
                            : 'bg-rose-100 text-rose-700 ring-1 ring-rose-600/20'
                        }`}>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 8 8">
                            <circle cx="4" cy="4" r="3" />
                          </svg>
                          {filter.active ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(filter)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                              filter.active 
                                ? 'bg-orange-50 text-orange-700 hover:bg-orange-100 ring-1 ring-orange-200 hover:ring-orange-300' 
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-1 ring-emerald-200 hover:ring-emerald-300'
                            }`}
                            title={filter.active ? 'Make Unavailable' : 'Make Available'}
                          >
                            {filter.active ? (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                Disable
                              </>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Enable
                              </>
                            )}
                          </button>
                          {parseInt(filter.id) > 17 && (
                            <button
                              onClick={() => handleDelete(filter)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 ring-1 ring-red-200 hover:ring-red-300 transition-all duration-200"
                              title="Delete"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                              Delete
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
        </div>
      </div>

      {/* Add Filter Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeDrawer}></div>
            <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="w-screen max-w-md">
                <div className="h-full flex flex-col bg-white shadow-xl">
                  <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <h2 className="text-lg font-medium text-gray-900">Add New Filter</h2>
                      <div className="ml-3 h-7 flex items-center">
                        <button
                          onClick={closeDrawer}
                          className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <span className="sr-only">Close panel</span>
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                      {/* Label */}
                      <div>
                        <label htmlFor="label" className="block text-sm font-semibold text-gray-700 mb-2">
                          Label <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="label"
                          value={formData.label}
                          onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                          className={`block w-full px-4 py-2.5 rounded-lg border-2 transition-colors ${
                            formErrors.label 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                          } focus:ring-2 focus:ring-opacity-20`}
                          placeholder="Enter filter label"
                        />
                        {formErrors.label && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                            </svg>
                            {formErrors.label}
                          </p>
                        )}
                      </div>

                      {/* Code */}
                      <div>
                        <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-2">
                          Code <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input
                          type="text"
                          id="code"
                          value={formData.code}
                          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                          className="block w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors"
                          placeholder="filter_code"
                        />
                      </div>

                      {/* Order */}
                      <div>
                        <label htmlFor="order" className="block text-sm font-semibold text-gray-700 mb-2">
                          Order <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input
                          type="number"
                          id="order"
                          value={formData.order}
                          onChange={(e) => setFormData(prev => ({ ...prev, order: e.target.value }))}
                          className={`block w-full px-4 py-2.5 rounded-lg border-2 transition-colors ${
                            formErrors.order 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                          } focus:ring-2 focus:ring-opacity-20`}
                          placeholder="Auto-generated if empty"
                        />
                        {formErrors.order && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                            </svg>
                            {formErrors.order}
                          </p>
                        )}
                      </div>

                      {/* Active */}
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                        <input
                          id="active"
                          type="checkbox"
                          checked={formData.active}
                          onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                        />
                        <label htmlFor="active" className="block text-sm font-medium text-gray-900 cursor-pointer">
                          Mark as active and available immediately
                        </label>
                      </div>

                      {/* Submit Error */}
                      {formErrors.submit && (
                        <div className="rounded-md bg-red-50 p-4">
                          <div className="text-sm text-red-700">{formErrors.submit}</div>
                        </div>
                      )}
                    </form>
                  </div>

                  {/* Footer */}
                  <div className="flex-shrink-0 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 bg-gray-50">
                    <button
                      type="button"
                      onClick={closeDrawer}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isCreating}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isCreating ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                          Create Filter
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

