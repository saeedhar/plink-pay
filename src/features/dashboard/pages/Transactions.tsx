import React, { useState, useEffect } from 'react';
import { Sidebar, Header } from '../components';
import { FiFilter, FiRefreshCw, FiDownload, FiSearch } from 'react-icons/fi';
import { fetchTransactionFilters, type TransactionFilter } from '../../../services/transactionFiltersService';

const Transactions: React.FC = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [filters, setFilters] = useState({
    status: 'Successful',
    transactionType: '',
    merchant: ''
  });
  const [transactionTypes, setTransactionTypes] = useState<TransactionFilter[]>([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);

  // Fetch transaction filters on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        setIsLoadingFilters(true);
        const filters = await fetchTransactionFilters();
        setTransactionTypes(filters);
        // Set first filter as default if available
        if (filters.length > 0) {
          setFilters(prev => ({ ...prev, transactionType: filters[0].label }));
        }
      } catch (error) {
        console.error('Failed to load transaction filters:', error);
      } finally {
        setIsLoadingFilters(false);
      }
    };

    loadFilters();
  }, []);

  const transactions = [
    {
      referenceId: 'TXN12345',
      status: 'Successful',
      currency: 'SAR',
      amount: '50.00',
      transactionType: 'Wallet Top_Up',
      time: '14:30',
      date: '2025-08-21'
    },
    {
      referenceId: 'TXN12345',
      status: 'Successful',
      currency: 'SAR',
      amount: '50.00',
      transactionType: 'Wallet Top_Up',
      time: '14:30',
      date: '2025-08-21'
    },
    {
      referenceId: 'TXN12345',
      status: 'Successful',
      currency: 'SAR',
      amount: '50.00',
      transactionType: 'Wallet Top_Up',
      time: '14:30',
      date: '2025-08-21'
    },
    {
      referenceId: 'TXN12345',
      status: 'Successful',
      currency: 'SAR',
      amount: '50.00',
      transactionType: 'Wallet Top_Up',
      time: '14:30',
      date: '2025-08-21'
    },
   
  ];

  const handleTransactionClick = (transaction: any) => {
    setSelectedTransaction(transaction);
  };

  const handlePrint = () => {
    console.log('Print transaction details');
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
                    <option value="Successful">Successful</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
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
                  <button className="filter-button apply-filter">
                    <FiFilter className="button-icon" />
                    Filter
                  </button>
                  <button className="filter-button clear-filter">
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
              {transactions.map((transaction, index) => (
                <div 
                  key={index} 
                  className={`transactions-table-row ${selectedTransaction === transaction ? 'selected' : ''}`}
                  onClick={() => handleTransactionClick(transaction)}
                >
                  <div className="table-cell">{transaction.referenceId}</div>
                  <div className="table-cell">{transaction.status}</div>
                  <div className="table-cell">{transaction.currency}</div>
                  <div className="table-cell">{transaction.amount}</div>
                  <div className="table-cell">{transaction.transactionType}</div>
                  <div className="table-cell">{transaction.time}</div>
                  <div className="table-cell">{transaction.date}</div>
                </div>
              ))}

              {/* Pagination */}
              <div className="transactions-pagination">
                <button className="pagination-btn">←</button>
                <button className="pagination-btn active">1</button>
                <button className="pagination-btn">2</button>
                <button className="pagination-btn">3</button>
                <button className="pagination-btn">→</button>
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
                      <span className="detail-value">{selectedTransaction.date}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Time:</span>
                      <span className="detail-value">{selectedTransaction.time}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Amount:</span>
                      <span className="detail-value">{selectedTransaction.amount}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Currency:</span>
                      <span className="detail-value">{selectedTransaction.currency}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Transaction Type:</span>
                      <span className="detail-value">{selectedTransaction.transactionType}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Reference ID:</span>
                      <span className="detail-value">{selectedTransaction.referenceId}</span>
                    </div>
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
