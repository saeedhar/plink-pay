import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import { FiFilter, FiRefreshCw, FiDownload, FiSearch } from 'react-icons/fi';
import { fetchTransactionFilters, type TransactionFilter } from '../../../services/transactionFiltersService';
import { TransactionService, TransactionSummary } from '../../../services/transactionService';
import successIcon from '../../../assets/success.svg';
import checkCircle from '../../../assets/check_circle.svg';

const Transactions: React.FC = () => {
  const location = useLocation();
  const state = location.state as { subWalletName?: string; subWalletId?: string; isSubWallet?: boolean } | null;
  const subWalletId = state?.subWalletId;
  const isSubWallet = state?.isSubWallet;
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionSummary | null>(null);
  const [filters, setFilters] = useState({
    periodStart: '',
    periodEnd: '',
    amountRange: { min: 10, max: 100000 },
    status: [] as string[],
    transactionType: [] as string[],
    merchant: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({
    periodStart: '',
    periodEnd: '',
    amountRange: { min: 10, max: 100000 },
    status: [] as string[],
    transactionType: [] as string[],
    merchant: ''
  });
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTransactionTypeDropdown, setShowTransactionTypeDropdown] = useState(false);
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const minSliderRef = useRef<HTMLInputElement>(null);
  const maxSliderRef = useRef<HTMLInputElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const transactionTypeDropdownRef = useRef<HTMLDivElement>(null);

  // Format date range for display
  const formatDateRange = (start: string, end: string): string => {
    if (!start && !end) return '';
    if (!start || !end) {
      const date = start || end;
      const d = new Date(date);
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    const formatDate = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };
  const [transactionTypes, setTransactionTypes] = useState<TransactionFilter[]>([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 20
  });
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionSummary[]>([]);
  const periodPickerRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Close period picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (periodPickerRef.current && !periodPickerRef.current.contains(event.target as Node)) {
        setShowPeriodPicker(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (transactionTypeDropdownRef.current && !transactionTypeDropdownRef.current.contains(event.target as Node)) {
        setShowTransactionTypeDropdown(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    };

    if (showPeriodPicker || showStatusDropdown || showTransactionTypeDropdown || showExportDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPeriodPicker, showStatusDropdown, showTransactionTypeDropdown, showExportDropdown]);

  // Fetch transaction filters on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        setIsLoadingFilters(true);
        const filters = await fetchTransactionFilters();
        setTransactionTypes(filters);
      } catch (error) {
        console.error('Failed to load transaction filters:', error);
      } finally {
        setIsLoadingFilters(false);
      }
    };

    loadFilters();
  }, []);

  // Fetch transactions on mount and when page changes or sub-wallet changes
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setIsLoadingTransactions(true);
        setTransactionsError(null);
        // Pass subWalletId if viewing a sub-wallet
        const response = await TransactionService.getTransactionHistory(
          pagination.currentPage,
          pagination.pageSize,
          undefined,
          undefined,
          undefined,
          undefined,
          isSubWallet ? subWalletId : undefined
        );
        setTransactions(response.transactions);
        setPagination(prev => ({
          ...prev,
          totalPages: response.totalPages,
          totalElements: response.totalElements
        }));
        console.log('🔍 Transactions loaded:', response, isSubWallet ? `(sub-wallet: ${subWalletId})` : '(main wallet)');
      } catch (error) {
        console.error('Error loading transactions:', error);
        setTransactionsError(error instanceof Error ? error.message : 'Failed to load transactions');
      } finally {
        setIsLoadingTransactions(false);
      }
    };

    loadTransactions();
  }, [pagination.currentPage, pagination.pageSize, isSubWallet, subWalletId]);

  // Reset pagination when applied filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 0 }));
  }, [
    appliedFilters.status.length, 
    appliedFilters.status.join(','), 
    appliedFilters.transactionType.length, 
    appliedFilters.transactionType.join(','), 
    appliedFilters.merchant, 
    appliedFilters.periodStart, 
    appliedFilters.periodEnd, 
    appliedFilters.amountRange.min, 
    appliedFilters.amountRange.max
  ]);

  // Apply frontend filtering based on applied filters
  useEffect(() => {
    let filtered = [...transactions];

    // Filter by date range
    if (appliedFilters.periodStart || appliedFilters.periodEnd) {
      filtered = filtered.filter(t => {
        if (!t.createdAt) return false;
        const transactionDate = new Date(t.createdAt);
        transactionDate.setHours(0, 0, 0, 0);
        
        if (appliedFilters.periodStart) {
          const startDate = new Date(appliedFilters.periodStart);
          startDate.setHours(0, 0, 0, 0);
          if (transactionDate < startDate) return false;
        }
        
        if (appliedFilters.periodEnd) {
          const endDate = new Date(appliedFilters.periodEnd);
          endDate.setHours(23, 59, 59, 999);
          if (transactionDate > endDate) return false;
        }
        
        return true;
      });
    }

    // Filter by amount range (using min and max slider values)
    filtered = filtered.filter(t => {
      const amount = Math.abs(t.amount); // Use absolute value to handle both positive and negative amounts
      return amount >= appliedFilters.amountRange.min && amount <= appliedFilters.amountRange.max;
    });

    // Filter by status (multiple statuses)
    if (appliedFilters.status && appliedFilters.status.length > 0) {
      filtered = filtered.filter(t => 
        appliedFilters.status.some(status => 
          t.status.toUpperCase() === status.toUpperCase()
        )
      );
    }

    // Filter by transaction type (multiple types)
    if (appliedFilters.transactionType && appliedFilters.transactionType.length > 0) {
      filtered = filtered.filter(t => 
        appliedFilters.transactionType.some(type => 
          t.transactionType.toUpperCase() === type.toUpperCase()
        )
      );
    }

    // Filter by merchant/beneficiary (search in description, reference number, and formatted transaction type)
    if (appliedFilters.merchant) {
      const searchTerm = appliedFilters.merchant.toLowerCase();
      filtered = filtered.filter(t => {
        const descriptionMatch = t.description?.toLowerCase().includes(searchTerm) || false;
        const referenceMatch = t.referenceNumber?.toLowerCase().includes(searchTerm) || false;
        const typeMatch = TransactionService.formatTransactionType(t.transactionType).toLowerCase().includes(searchTerm);
        return descriptionMatch || referenceMatch || typeMatch;
      });
    }

    setFilteredTransactions(filtered);
  }, [transactions, appliedFilters]);

  const handleTransactionClick = (transaction: TransactionSummary) => {
    setSelectedTransaction(transaction);
  };

  // Format date as YYYY-MM-DD (matching mobile)
  const formatDateMobile = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format time as 12-hour with AM/PM (matching mobile)
  const formatTimeMobile = (dateString: string) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = String(minutes).padStart(2, '0');
    return `${hours}:${minutesStr} ${ampm}`;
  };

  // Get status display text (matching mobile)
  const getStatusDisplay = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'Successful';
      case 'PENDING':
        return 'Pending';
      case 'FAILED':
        return 'Failed';
      case 'CANCELLED':
        return 'Cancelled';
      case 'REVERSED':
        return 'Reversed';
      default:
        return TransactionService.formatTransactionStatus(status);
    }
  };

  // Get status color (matching mobile)
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return '#10B981';
      case 'PENDING':
        return '#F59E0B';
      case 'FAILED':
        return '#EF4444';
      case 'CANCELLED':
        return '#6B7280';
      case 'REVERSED':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const handleDownload = () => {
    if (!selectedTransaction) return;
    
    // Create downloadable content
    const statusDisplay = getStatusDisplay(selectedTransaction.status);
    let downloadContent = `Transaction Details\n\n`;
    downloadContent += `Type: ${TransactionService.formatTransactionType(selectedTransaction.transactionType)}\n`;
    downloadContent += `Date: ${formatDateMobile(selectedTransaction.createdAt)}\n`;
    downloadContent += `Time: ${formatTimeMobile(selectedTransaction.createdAt)}\n`;
    downloadContent += `Amount: ${TransactionService.formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}\n`;
    downloadContent += `Currency: ${selectedTransaction.currency}\n`;
    downloadContent += `Reference: ${selectedTransaction.referenceNumber || selectedTransaction.id.substring(0, 8)}\n`;
    if (selectedTransaction.description) {
      downloadContent += `Description: ${selectedTransaction.description}\n`;
    }
    downloadContent += `Status: ${statusDisplay}\n`;

    // Create blob and download
    const blob = new Blob([downloadContent], { type: 'text/plain' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transaction_${selectedTransaction.referenceNumber || selectedTransaction.id.substring(0, 8)}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleClearFilters = () => {
    const resetFilters = {
      periodStart: '',
      periodEnd: '',
      amountRange: { min: 10, max: 100000 },
      status: [] as string[],
      transactionType: [] as string[],
      merchant: ''
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setSliderDisplayValue(10);
    if (sliderRef.current) {
      sliderRef.current.value = '10';
    }
  };

  const handleTransactionTypeToggle = (typeCode: string) => {
    setFilters(prev => {
      const currentTypes = prev.transactionType;
      if (currentTypes.includes(typeCode)) {
        return { ...prev, transactionType: currentTypes.filter(t => t !== typeCode) };
      } else {
        return { ...prev, transactionType: [...currentTypes, typeCode] };
      }
    });
  };

  const handleStatusToggle = (statusValue: string) => {
    setFilters(prev => {
      const currentStatuses = prev.status;
      if (currentStatuses.includes(statusValue)) {
        return { ...prev, status: currentStatuses.filter(s => s !== statusValue) };
      } else {
        return { ...prev, status: [...currentStatuses, statusValue] };
      }
    });
  };

  const statusOptions = [
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'REVERSED', label: 'Reversed' }
  ];

  // Export functions
  const exportToCSV = () => {
    const headers = ['Reference ID', 'Status', 'Amount', 'Transaction Type', 'Time', 'Date', 'Description'];
    const rows = filteredTransactions.map(t => {
      const { date, time } = TransactionService.formatDate(t.createdAt);
      return [
        t.referenceNumber || t.id.substring(0, 8),
        TransactionService.formatTransactionStatus(t.status),
        TransactionService.formatCurrency(t.amount, t.currency),
        TransactionService.formatTransactionType(t.transactionType),
        time,
        date,
        t.description || ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportDropdown(false);
  };

  const exportToExcel = () => {
    // For Excel, we'll create a CSV file with .xlsx extension or use a library
    // For simplicity, we'll create an HTML table that Excel can open
    const headers = ['Reference ID', 'Status', 'Amount', 'Transaction Type', 'Time', 'Date', 'Description'];
    const rows = filteredTransactions.map(t => {
      const { date, time } = TransactionService.formatDate(t.createdAt);
      return [
        t.referenceNumber || t.id.substring(0, 8),
        TransactionService.formatTransactionStatus(t.status),
        TransactionService.formatCurrency(t.amount, t.currency),
        TransactionService.formatTransactionType(t.transactionType),
        time,
        date,
        t.description || ''
      ];
    });

    let htmlContent = '<html><head><meta charset="utf-8"><style>table{border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background-color:#f2f2f2;font-weight:bold;}</style></head><body><table>';
    htmlContent += '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
    rows.forEach(row => {
      htmlContent += '<tr>' + row.map(cell => `<td>${String(cell)}</td>`).join('') + '</tr>';
    });
    htmlContent += '</table></body></html>';

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportDropdown(false);
  };

  const exportToPDF = () => {
    // For PDF, we'll create an HTML page and use window.print() or a library
    // For simplicity, we'll create a printable HTML page
    const headers = ['Reference ID', 'Status', 'Amount', 'Transaction Type', 'Time', 'Date', 'Description'];
    const rows = filteredTransactions.map(t => {
      const { date, time } = TransactionService.formatDate(t.createdAt);
      return [
        t.referenceNumber || t.id.substring(0, 8),
        TransactionService.formatTransactionStatus(t.status),
        TransactionService.formatCurrency(t.amount, t.currency),
        TransactionService.formatTransactionType(t.transactionType),
        time,
        date,
        t.description || ''
      ];
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Transactions Export</title>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1F2937; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          @media print {
            body { padding: 0; }
            @page { margin: 1cm; }
          }
        </style>
      </head>
      <body>
        <h1>Transactions Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Total Transactions: ${rows.length}</p>
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows.map(row => `<tr>${row.map(cell => `<td>${String(cell)}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
    setShowExportDropdown(false);
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    if (filteredTransactions.length === 0) {
      alert('No transactions to export. Please apply filters or wait for transactions to load.');
      return;
    }

    switch (format) {
      case 'csv':
        exportToCSV();
        break;
      case 'excel':
        exportToExcel();
        break;
      case 'pdf':
        exportToPDF();
        break;
    }
  };

  const handleApplyFilters = () => {
    // Apply current filter inputs to applied filters, including slider values
    setAppliedFilters({ ...filters });
    console.log('Filters applied:', filters);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header subWalletId={subWalletId} isSubWallet={isSubWallet} />
        <div className="transactions-content">
          <h1 className="transactions-page-title">Transactions</h1>
          
          <div className="transactions-main-content">
            {/* Transactions Table with Integrated Filter */}
            <div className={`transactions-table-container ${selectedTransaction ? 'with-details' : 'full-width'}`}>
              {/* Header Row with Title and Action Buttons */}
              <div className="transactions-header-row">
                <h2 className="transactions-header-title">Transactions</h2>
                <div className="transactions-action-buttons">
                  <button className="action-button apply-filter" onClick={handleApplyFilters}>
                    <FiFilter className="button-icon" />
                    Apply Filter
                  </button>
                  <button className="action-button clear-filter" onClick={handleClearFilters}>
                    <FiRefreshCw className="button-icon" />
                    Clear
                  </button>
                  <div className="export-dropdown-container" ref={exportDropdownRef}>
                    <button 
                      className="action-button download-filter"
                      onClick={() => setShowExportDropdown(!showExportDropdown)}
                    >
                      <FiDownload className="button-icon" />
                      Download
                      <svg 
                        className={`export-dropdown-arrow ${showExportDropdown ? 'open' : ''}`}
                        width="12" 
                        height="8" 
                        viewBox="0 0 12 8" 
                        fill="none"
                        style={{ marginLeft: '8px' }}
                      >
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {showExportDropdown && (
                      <div className="export-dropdown-menu">
                        <button 
                          className="export-option"
                          onClick={() => handleExport('csv')}
                        >
                          <span>Export as CSV</span>
                        </button>
                        <button 
                          className="export-option"
                          onClick={() => handleExport('excel')}
                        >
                          <span>Export as Excel</span>
                        </button>
                        <button 
                          className="export-option"
                          onClick={() => handleExport('pdf')}
                        >
                          <span>Export as PDF</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="transactions-filter-bar">
                <div className="filter-section period-filter" ref={periodPickerRef}>
                  <label className="filter-label">Period</label>
                  <div className="date-range-picker-container">
                    <input 
                      type="text" 
                      className="filter-input date-range-input" 
                      placeholder="2/2/2025 - 8/9/2025"
                      value={formatDateRange(filters.periodStart, filters.periodEnd)}
                      readOnly
                      onClick={() => setShowPeriodPicker(!showPeriodPicker)}
                    />
                    {showPeriodPicker && (
                      <div className="date-range-picker-popup">
                        <div className="date-range-fields">
                          <div className="date-field-group">
                            <label className="date-field-label">From</label>
                            <input 
                              type="date" 
                              className="filter-input date-input" 
                              value={filters.periodStart}
                              onChange={(e) => setFilters({...filters, periodStart: e.target.value})}
                            />
                          </div>
                          <div className="date-field-group">
                            <label className="date-field-label">To</label>
                            <input 
                              type="date" 
                              className="filter-input date-input" 
                              value={filters.periodEnd}
                              onChange={(e) => setFilters({...filters, periodEnd: e.target.value})}
                            />
                          </div>
                        </div>
                        <button 
                          className="date-range-close"
                          onClick={() => setShowPeriodPicker(false)}
                        >
                          Done
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="filter-section amount-range-filter">
                  <label className="filter-label">Amount Range</label>
                  <div className="amount-range-input-container">
                    <span className="amount-range-label-left">{filters.amountRange.min.toLocaleString('en-US')} SAR</span>
                    <div className="amount-range-slider-wrapper">
                      <input
                        ref={minSliderRef}
                        type="range"
                        className="amount-range-slider amount-range-slider-min"
                        min={10}
                        max={100000}
                        step="10"
                        value={Math.min(filters.amountRange.min, filters.amountRange.max)}
                        onChange={(e) => {
                          const newMinValue = parseInt(e.target.value, 10);
                          setFilters(prev => ({ 
                            ...prev, 
                            amountRange: { 
                              min: Math.min(newMinValue, prev.amountRange.max),
                              max: prev.amountRange.max
                            } 
                          }));
                        }}
                      />
                      <input
                        ref={maxSliderRef}
                        type="range"
                        className="amount-range-slider amount-range-slider-max"
                        min={10}
                        max={100000}
                        step="10"
                        value={Math.max(filters.amountRange.max, filters.amountRange.min)}
                        onChange={(e) => {
                          const newMaxValue = parseInt(e.target.value, 10);
                          setFilters(prev => ({ 
                            ...prev, 
                            amountRange: { 
                              min: prev.amountRange.min,
                              max: Math.max(newMaxValue, prev.amountRange.min)
                            } 
                          }));
                        }}
                      />
                    </div>
                    <span className="amount-range-label-right">{filters.amountRange.max.toLocaleString('en-US')} SAR</span>
                  </div>
                </div>

                <div className="filter-section status-filter" ref={statusDropdownRef}>
                  <label className="filter-label">Status</label>
                  <div className="status-multiselect-container">
                    <button
                      type="button"
                      className="filter-select status-multiselect-button"
                      onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    >
                      <span className="status-multiselect-text">
                        {filters.status.length === 0 
                          ? 'All Statuses' 
                          : filters.status.length === 1
                          ? statusOptions.find(opt => opt.value === filters.status[0])?.label || filters.status[0]
                          : `${filters.status.length} selected`}
                      </span>
                      <svg 
                        className={`status-dropdown-arrow ${showStatusDropdown ? 'open' : ''}`}
                        width="12" 
                        height="8" 
                        viewBox="0 0 12 8" 
                        fill="none"
                      >
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {showStatusDropdown && (
                      <div className="status-multiselect-dropdown">
                        {statusOptions.map((option) => {
                          const isSelected = filters.status.includes(option.value);
                          return (
                            <label
                              key={option.value}
                              className={`status-multiselect-option ${isSelected ? 'selected' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleStatusToggle(option.value)}
                                className="status-checkbox"
                              />
                              <span className="status-option-label">{option.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="filter-section status-filter transaction-type-filter" ref={transactionTypeDropdownRef}>
                  <label className="filter-label">Transaction Type</label>
                  <div className="status-multiselect-container">
                    <button
                      type="button"
                      className="filter-select status-multiselect-button"
                      onClick={() => setShowTransactionTypeDropdown(!showTransactionTypeDropdown)}
                      disabled={isLoadingFilters}
                    >
                      <span className="status-multiselect-text">
                        {isLoadingFilters 
                          ? 'Loading...' 
                          : transactionTypes.length === 0
                          ? 'No transaction types available'
                          : filters.transactionType.length === 0 
                          ? 'All Transaction Types' 
                          : filters.transactionType.length === 1
                          ? transactionTypes.find(opt => opt.code === filters.transactionType[0])?.label || filters.transactionType[0]
                          : `${filters.transactionType.length} selected`}
                      </span>
                      <svg 
                        className={`status-dropdown-arrow ${showTransactionTypeDropdown ? 'open' : ''}`}
                        width="12" 
                        height="8" 
                        viewBox="0 0 12 8" 
                        fill="none"
                      >
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {showTransactionTypeDropdown && !isLoadingFilters && transactionTypes.length > 0 && (
                      <div className="status-multiselect-dropdown">
                        {transactionTypes.map((option) => {
                          const isSelected = filters.transactionType.includes(option.code);
                          return (
                            <label
                              key={option.id}
                              className={`status-multiselect-option ${isSelected ? 'selected' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleTransactionTypeToggle(option.code)}
                                className="status-checkbox"
                              />
                              <span className="status-option-label">{option.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="filter-section">
                  <label className="filter-label">Merchant/Beneficiary</label>
                  <div className="search-input-container">
                    <input 
                      type="text" 
                      className="filter-input search-input" 
                      placeholder="Search..."
                      value={filters.merchant}
                      onChange={(e) => setFilters({...filters, merchant: e.target.value})}
                    />
                    <FiSearch className="search-icon" />
                  </div>
                </div>
              </div>

              {/* Table Header */}
              <div className="transactions-table-header">
                <div className="table-cell">Reference ID</div>
                <div className="table-cell">Status</div>
                <div className="table-cell">Amount</div>
                <div className="table-cell">Transaction Type</div>
                <div className="table-cell">Time</div>
                <div className="table-cell">Date</div>
              </div>
              
              {/* Table Rows */}
              {isLoadingTransactions ? (
                <div className="transactions-table-row">
                  <div className="table-cell" style={{ textAlign: 'center', padding: '20px', gridColumn: '1 / -1' }}>
                    Loading transactions...
                  </div>
                </div>
              ) : transactionsError ? (
                <div className="transactions-table-row">
                  <div className="table-cell" style={{ textAlign: 'center', padding: '20px', gridColumn: '1 / -1', color: '#EF4444' }}>
                    Error: {transactionsError}
                  </div>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="transactions-table-row">
                  <div className="table-cell" style={{ textAlign: 'center', padding: '20px', gridColumn: '1 / -1' }}>
                    No transactions found
                  </div>
                </div>
              ) : (
                filteredTransactions.map((transaction) => {
                  const { date, time } = TransactionService.formatDate(transaction.createdAt);
                  return (
                    <div 
                      key={transaction.id} 
                      className={`transactions-table-row ${selectedTransaction?.id === transaction.id ? 'selected' : ''}`}
                      onClick={() => handleTransactionClick(transaction)}
                    >
                      <div className="table-cell">{transaction.referenceNumber || transaction.id.substring(0, 8)}</div>
                      <div className="table-cell">
                        <span className={`status-badge ${transaction.status.toLowerCase()}`}>
                          {TransactionService.formatTransactionStatus(transaction.status)}
                        </span>
                      </div>
                      <div className="table-cell">{TransactionService.formatCurrency(transaction.amount, transaction.currency)}</div>
                      <div className="table-cell">{TransactionService.formatTransactionType(transaction.transactionType)}</div>
                      <div className="table-cell">{time}</div>
                      <div className="table-cell">{date}</div>
                    </div>
                  );
                })
              )}

              {/* Pagination */}
              <div className="transactions-pagination">
                <button 
                  className="pagination-btn" 
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 0}
                >
                  ←
                </button>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i;
                  return (
                    <button 
                      key={pageNum}
                      className={`pagination-btn ${pagination.currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
                <button 
                  className="pagination-btn" 
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages - 1}
                >
                  →
                </button>
              </div>
            </div>

            {/* Transaction Details Panel */}
            <div className={`transaction-details-panel ${selectedTransaction ? 'open' : 'closed'}`}>
              {selectedTransaction && (
                <>
                  <div className="details-header">
                    <button className="close-button" onClick={() => setSelectedTransaction(null)}>
                      <span className="close-icon">×</span>
                    </button>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="status-indicator-container">
                    <div className="status-icon-circle">
                      {selectedTransaction.status.toUpperCase() === 'COMPLETED' ? (
                        <img src={checkCircle} alt="Success" className="status-icon-img" />
                      ) : selectedTransaction.status.toUpperCase() === 'PENDING' ? (
                        <svg className="status-icon-svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#312783" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                      ) : (
                        <svg className="status-icon-svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#312783" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="15" y1="9" x2="9" y2="15"/>
                          <line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Title and Status */}
                  <div className="details-title-section">
                    <h3 className="details-title">Transaction Details</h3>
                    <div className="details-status-row">
                      {selectedTransaction.status.toUpperCase() === 'COMPLETED' && (
                        <svg className="status-icon-left" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={getStatusColor(selectedTransaction.status)} strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                          <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                      )}
                      {selectedTransaction.status.toUpperCase() === 'PENDING' && (
                        <svg className="status-icon-left" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={getStatusColor(selectedTransaction.status)} strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                      )}
                      {(selectedTransaction.status.toUpperCase() === 'CANCELLED' || selectedTransaction.status.toUpperCase() === 'FAILED') && (
                        <svg className="status-icon-left" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={getStatusColor(selectedTransaction.status)} strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="15" y1="9" x2="9" y2="15"/>
                          <line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                      )}
                      <span className="details-status-text" style={{ color: getStatusColor(selectedTransaction.status) }}>
                        {getStatusDisplay(selectedTransaction.status)}
                      </span>
                    </div>
                  </div>

                  {/* Transaction Details Card */}
                  <div className="details-card">
                    <div className="detail-row">
                      <span className="detail-label">Date</span>
                      <span className="detail-value">{formatDateMobile(selectedTransaction.createdAt)}</span>
                    </div>
                    <div className="detail-separator"></div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Time</span>
                      <span className="detail-value">{formatTimeMobile(selectedTransaction.createdAt)}</span>
                    </div>
                    <div className="detail-separator"></div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Amount</span>
                      <span className="detail-value">{TransactionService.formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}</span>
                    </div>
                    <div className="detail-separator"></div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Currency</span>
                      <span className="detail-value">{selectedTransaction.currency}</span>
                    </div>
                    
                    {(selectedTransaction as any).merchantName && (
                      <>
                        <div className="detail-separator"></div>
                        <div className="detail-row">
                          <span className="detail-label">Merchant Name</span>
                          <span className="detail-value">{(selectedTransaction as any).merchantName}</span>
                        </div>
                      </>
                    )}
                    
                    {(selectedTransaction as any).beneficiaryName && (
                      <>
                        <div className="detail-separator"></div>
                        <div className="detail-row">
                          <span className="detail-label">Beneficiary Name</span>
                          <span className="detail-value">{(selectedTransaction as any).beneficiaryName}</span>
                        </div>
                      </>
                    )}
                    
                    {(selectedTransaction as any).location && (
                      <>
                        <div className="detail-separator"></div>
                        <div className="detail-row">
                          <span className="detail-label">Location</span>
                          <span className="detail-value">{(selectedTransaction as any).location}</span>
                        </div>
                      </>
                    )}
                    
                    <div className="detail-separator"></div>
                    <div className="detail-row">
                      <span className="detail-label">Transaction Type</span>
                      <span className="detail-value">{TransactionService.formatTransactionType(selectedTransaction.transactionType)}</span>
                    </div>
                    <div className="detail-separator"></div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Description</span>
                      <span className="detail-value">{selectedTransaction.description || 'N/A'}</span>
                    </div>
                    <div className="detail-separator"></div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Reference</span>
                      <span className="detail-value">{selectedTransaction.referenceNumber || selectedTransaction.id.substring(0, 8)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="details-button-container">
                    <button className="details-download-button" onClick={handleDownload}>
                      Download
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Backdrop for mobile */}
            {selectedTransaction && (
              <div 
                className="transaction-details-backdrop"
                onClick={() => setSelectedTransaction(null)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
