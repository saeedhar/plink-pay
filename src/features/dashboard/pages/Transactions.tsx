import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import { FiFilter, FiRefreshCw, FiDownload, FiSearch } from 'react-icons/fi';
import { fetchTransactionFilters, type TransactionFilter } from '../../../services/transactionFiltersService';
import { TransactionService, TransactionSummary } from '../../../services/transactionService';

const Transactions: React.FC = () => {
  const location = useLocation();
  const state = location.state as { subWalletName?: string; subWalletId?: string; isSubWallet?: boolean } | null;
  const subWalletId = state?.subWalletId;
  const isSubWallet = state?.isSubWallet;
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionSummary | null>(null);
  const [filters, setFilters] = useState({
    periodStart: '',
    periodEnd: '',
    amountRange: { min: 10, max: 10000 },
    amountValue: 10, // Current slider value
    status: '',
    transactionType: '',
    merchant: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({
    periodStart: '',
    periodEnd: '',
    amountRange: { min: 10, max: 10000 },
    amountValue: 10,
    status: '',
    transactionType: '',
    merchant: ''
  });
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const sliderRef = useRef<HTMLInputElement>(null);
  const [sliderDisplayValue, setSliderDisplayValue] = useState(() => filters.amountValue || 10);

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

  // Close period picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (periodPickerRef.current && !periodPickerRef.current.contains(event.target as Node)) {
        setShowPeriodPicker(false);
      }
    };

    if (showPeriodPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPeriodPicker]);

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
  }, [appliedFilters.status, appliedFilters.transactionType, appliedFilters.merchant, appliedFilters.periodStart, appliedFilters.periodEnd, appliedFilters.amountRange.min, appliedFilters.amountRange.max, appliedFilters.amountValue]);

  // Apply frontend filtering based on applied filters
  useEffect(() => {
    let filtered = [...transactions];

    // Filter by date range
    if (appliedFilters.periodStart || appliedFilters.periodEnd) {
      filtered = filtered.filter(t => {
        if (!t.date) return false;
        const transactionDate = new Date(t.date);
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

    // Filter by amount range (using slider value as minimum threshold)
    filtered = filtered.filter(t => {
      const amount = Math.abs(t.amount); // Use absolute value to handle both positive and negative amounts
      return amount >= appliedFilters.amountValue && amount <= appliedFilters.amountRange.max;
    });

    // Filter by status
    if (appliedFilters.status) {
      filtered = filtered.filter(t => 
        t.status.toUpperCase() === appliedFilters.status.toUpperCase()
      );
    }

    // Filter by transaction type - compare enum codes directly
    if (appliedFilters.transactionType) {
      filtered = filtered.filter(t => 
        t.transactionType.toUpperCase() === appliedFilters.transactionType.toUpperCase()
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

  const handlePrint = () => {
    console.log('Print transaction details');
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleClearFilters = () => {
    const resetFilters = {
      periodStart: '',
      periodEnd: '',
      amountRange: { min: 10, max: 10000 },
      amountValue: 10,
      status: '',
      transactionType: '',
      merchant: ''
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setSliderDisplayValue(10);
    if (sliderRef.current) {
      sliderRef.current.value = '10';
    }
  };

  const handleApplyFilters = () => {
    // Apply current filter inputs to applied filters, including slider value
    const currentSliderValue = sliderRef.current ? parseInt(sliderRef.current.value, 10) : filters.amountValue;
    setAppliedFilters({ ...filters, amountValue: currentSliderValue });
    setFilters(prev => ({ ...prev, amountValue: currentSliderValue }));
    console.log('Filters applied:', { ...filters, amountValue: currentSliderValue });
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
                  <button className="action-button download-filter">
                    <FiDownload className="button-icon" />
                    Download
                  </button>
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
                    <span className="amount-range-label-left">{sliderDisplayValue.toLocaleString('en-US')} SAR</span>
                    <div className="amount-range-slider-wrapper">
                      <input
                        ref={sliderRef}
                        type="range"
                        className="amount-range-slider"
                        min={filters.amountRange.min}
                        max={filters.amountRange.max}
                        step="10"
                        value={sliderDisplayValue}
                        onInput={(e) => {
                          const newValue = parseInt((e.target as HTMLInputElement).value, 10);
                          setSliderDisplayValue(newValue);
                        }}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value, 10);
                          setSliderDisplayValue(newValue);
                          setFilters(prev => ({ ...prev, amountValue: newValue }));
                        }}
                      />
                    </div>
                    <span className="amount-range-label-right">{filters.amountRange.max.toLocaleString('en-US')} SAR</span>
                  </div>
                </div>

                <div className="filter-section">
                  <label className="filter-label">Status</label>
                  <select 
                    className="filter-select"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="">All Statuses</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="REVERSED">Reversed</option>
                  </select>
                </div>

                <div className="filter-section">
                  <label className="filter-label">Transaction Type</label>
                  <select 
                    className="filter-select"
                    value={filters.transactionType}
                    onChange={(e) => setFilters({...filters, transactionType: e.target.value})}
                    disabled={isLoadingFilters}
                  >
                    {isLoadingFilters ? (
                      <option value="">Loading...</option>
                    ) : transactionTypes.length === 0 ? (
                      <option value="">No transaction types available</option>
                    ) : (
                      <>
                        <option value="">All Transaction Types</option>
                        {transactionTypes.map((filter) => (
                          <option key={filter.id} value={filter.code}>
                            {filter.label}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
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
                <div className="table-cell">Currency</div>
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
                      <div className="table-cell">{transaction.currency}</div>
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
                    <h3 className="details-title">Transactions Details</h3>
                    <button className="close-button" onClick={() => setSelectedTransaction(null)}>
                      <span className="close-icon">×</span>
                    </button>
                  </div>
                  <div className="details-content">
                    <div className="detail-item">
                      <span className="detail-label">Date:</span>
                      <span className="detail-value">{TransactionService.formatDate(selectedTransaction.createdAt).date}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Time:</span>
                      <span className="detail-value">{TransactionService.formatDate(selectedTransaction.createdAt).time}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Amount:</span>
                      <span className="detail-value">{TransactionService.formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Currency:</span>
                      <span className="detail-value">{selectedTransaction.currency}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Transaction Type:</span>
                      <span className="detail-value">{TransactionService.formatTransactionType(selectedTransaction.transactionType)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Reference ID:</span>
                      <span className="detail-value">{selectedTransaction.referenceNumber || selectedTransaction.id.substring(0, 8)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Status:</span>
                      <span className="detail-value">
                        <span className={`status-badge ${selectedTransaction.status.toLowerCase()}`}>
                          {TransactionService.formatTransactionStatus(selectedTransaction.status)}
                        </span>
                      </span>
                    </div>
                    {selectedTransaction.description && (
                      <div className="detail-item">
                        <span className="detail-label">Description:</span>
                        <span className="detail-value">{selectedTransaction.description}</span>
                      </div>
                    )}
                  </div>
                  <button className="print-button" onClick={handlePrint}>
                    Print
                  </button>
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
