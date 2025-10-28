import React, { useState, useEffect } from 'react';
import { Sidebar, Header } from '../components';
import { FiFilter, FiRefreshCw, FiDownload, FiSearch } from 'react-icons/fi';
import { fetchTransactionFilters, type TransactionFilter } from '../../../services/transactionFiltersService';
import { TransactionService, TransactionSummary } from '../../../services/transactionService';

const Transactions: React.FC = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionSummary | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    transactionType: '',
    merchant: ''
  });
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

  // Fetch transactions on mount and when page changes
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setIsLoadingTransactions(true);
        setTransactionsError(null);
        const response = await TransactionService.getTransactionHistory(
          pagination.currentPage,
          pagination.pageSize
        );
        setTransactions(response.transactions);
        setPagination(prev => ({
          ...prev,
          totalPages: response.totalPages,
          totalElements: response.totalElements
        }));
        console.log('🔍 Transactions loaded:', response);
      } catch (error) {
        console.error('Error loading transactions:', error);
        setTransactionsError(error instanceof Error ? error.message : 'Failed to load transactions');
      } finally {
        setIsLoadingTransactions(false);
      }
    };

    loadTransactions();
  }, [pagination.currentPage, pagination.pageSize]);

  // Apply frontend filtering
  useEffect(() => {
    let filtered = [...transactions];

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(t => 
        t.status === filters.status
      );
    }

    // Filter by transaction type
    if (filters.transactionType) {
      filtered = filtered.filter(t => 
        TransactionService.formatTransactionType(t.transactionType).toLowerCase() === filters.transactionType.toLowerCase()
      );
    }

    // Filter by merchant/beneficiary (search in description)
    if (filters.merchant) {
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(filters.merchant.toLowerCase()) ||
        t.referenceNumber?.toLowerCase().includes(filters.merchant.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, filters]);

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
    setFilters({
      status: '',
      transactionType: '',
      merchant: ''
    });
  };

  const handleApplyFilters = () => {
    // Filters are applied automatically via useEffect
    console.log('Filters applied:', filters);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="transactions-content">
          <h1 className="transactions-page-title">Transactions</h1>
          
          <div className="transactions-main-content">
            {/* Transactions Table with Integrated Filter */}
            <div className={`transactions-table-container ${selectedTransaction ? 'with-details' : 'full-width'}`}>
              {/* Filter Bar */}
              <div className="transactions-filter-bar">
                <div className="filter-section">
                  <label className="filter-label">Status</label>
                  <select 
                    className="status-dropdown"
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
                    className="status-dropdown"
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
                          <option key={filter.id} value={filter.label}>
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
                      className="search-input" 
                      placeholder="Search..."
                      value={filters.merchant}
                      onChange={(e) => setFilters({...filters, merchant: e.target.value})}
                    />
                    <FiSearch className="search-icon" />
                  </div>
                </div>

                <div className="filter-actions">
                  <button className="filter-button apply-filter" onClick={handleApplyFilters}>
                    <FiFilter className="button-icon" />
                    Filter
                  </button>
                  <button className="filter-button clear-filter" onClick={handleClearFilters}>
                    <FiRefreshCw className="button-icon" />
                    Clear
                  </button>
                  <button className="filter-button download-filter">
                    <FiDownload className="button-icon" />
                    Download
                  </button>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
