import { useState, useEffect } from 'react';
import { kybOptionsService, type KybCategory, type KybOption, type CreateKybOptionRequest } from '../api/kybOptionsService';

export function AdminKybOptionsPage() {
  const [selectedCategory, setSelectedCategory] = useState<KybCategory>('purpose_of_account');
  const [options, setOptions] = useState<KybOption[]>([]);
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
    active: true,
    locale: 'en' as 'en' | 'ar'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const categories = kybOptionsService.getCategories();

  // Load options when category changes
  useEffect(() => {
    loadOptions();
  }, [selectedCategory]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadOptions = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await kybOptionsService.listOptions(selectedCategory);
      setOptions(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load options');
    } finally {
      setIsLoading(false);
    }
  };

  const openAddDrawer = () => {
    setFormData({
      label: '',
      code: '',
      order: '',
      active: true,
      locale: 'en'
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
      active: true,
      locale: 'en'
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
      const payload: CreateKybOptionRequest = {
        category: selectedCategory,
        label: formData.label.trim(),
        code: formData.code.trim() || undefined,
        order: formData.order ? Number(formData.order) : undefined,
        active: formData.active,
        locale: formData.locale
      };

      await kybOptionsService.createOption(payload);
      
      // Success - close drawer and refresh list
      closeDrawer();
      setSuccessMessage('Option created successfully!');
      await loadOptions();
    } catch (err) {
      setFormErrors({
        submit: err instanceof Error ? err.message : 'Failed to create option'
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage KYB Options</h1>
        <p className="mt-1 text-sm text-gray-600">
          Configure dropdown options for KYB forms
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

      {/* Category Selector */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedCategory === category.value
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {category.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {kybOptionsService.getCategoryDisplayName(selectedCategory)} Options
            </h3>
            <button
              onClick={openAddDrawer}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Option
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Options Table */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : options.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No options found for this category.</p>
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
                      Active
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Locale
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {options.map((option) => (
                    <tr key={option.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {option.order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {option.label}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {option.code || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          option.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {option.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {option.locale.toUpperCase()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Option Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeDrawer}></div>
            <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="w-screen max-w-md">
                <div className="h-full flex flex-col bg-white shadow-xl">
                  <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <h2 className="text-lg font-medium text-gray-900">Add New Option</h2>
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
                      {/* Category (readonly) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-500">
                          {kybOptionsService.getCategoryDisplayName(selectedCategory)}
                        </div>
                      </div>

                      {/* Label */}
                      <div>
                        <label htmlFor="label" className="block text-sm font-medium text-gray-700">
                          Label *
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id="label"
                            value={formData.label}
                            onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                            className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                              formErrors.label ? 'border-red-300' : ''
                            }`}
                            placeholder="Enter option label"
                          />
                          {formErrors.label && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.label}</p>
                          )}
                        </div>
                      </div>

                      {/* Code */}
                      <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                          Code (optional)
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id="code"
                            value={formData.code}
                            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="OPTION_CODE"
                          />
                        </div>
                      </div>

                      {/* Order */}
                      <div>
                        <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                          Order (optional)
                        </label>
                        <div className="mt-1">
                          <input
                            type="number"
                            id="order"
                            value={formData.order}
                            onChange={(e) => setFormData(prev => ({ ...prev, order: e.target.value }))}
                            className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                              formErrors.order ? 'border-red-300' : ''
                            }`}
                            placeholder="Auto-generated if empty"
                          />
                          {formErrors.order && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.order}</p>
                          )}
                        </div>
                      </div>

                      {/* Active */}
                      <div className="flex items-center">
                        <input
                          id="active"
                          type="checkbox"
                          checked={formData.active}
                          onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                          Active
                        </label>
                      </div>

                      {/* Locale */}
                      <div>
                        <label htmlFor="locale" className="block text-sm font-medium text-gray-700">
                          Locale
                        </label>
                        <div className="mt-1">
                          <select
                            id="locale"
                            value={formData.locale}
                            onChange={(e) => setFormData(prev => ({ ...prev, locale: e.target.value as 'en' | 'ar' }))}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            <option value="en">English</option>
                            <option value="ar">Arabic</option>
                          </select>
                        </div>
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
                  <div className="flex-shrink-0 px-4 py-4 flex justify-end space-x-3 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={closeDrawer}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isCreating}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating ? 'Creating...' : 'Create Option'}
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
