import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import { FiDownload } from 'react-icons/fi';
import { TransactionService, TransactionSummary } from '../../../services/transactionService';

interface OnHoldTransaction {
  name: string;
  amount: string;
  status: string;
  reason: string;
  transactionRef: string;
  holdDate: string;
  expectedRelease: string;
}

const OnHoldBalance: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { subWalletName?: string; subWalletId?: string; isSubWallet?: boolean } | null;
  const subWalletId = state?.subWalletId;
  const isSubWallet = state?.isSubWallet;
  const [onHoldTransactions, setOnHoldTransactions] = useState<OnHoldTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalOnHoldBalance, setTotalOnHoldBalance] = useState<number>(0);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.getElementById('root');
    if (root) {
      root.classList.add('dashboard-root');
    }
    return () => {
      if (root) {
        root.classList.remove('dashboard-root');
      }
    };
  }, []);

  // Load on-hold transactions and balance on mount or when sub-wallet changes
  useEffect(() => {
    loadOnHoldData();
  }, [isSubWallet, subWalletId]);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    };

    if (showExportDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportDropdown]);

  const loadOnHoldData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch wallet balance to get total on-hold balance (pass subWalletId if viewing a sub-wallet)
      const balanceData = await TransactionService.getWalletBalance(isSubWallet ? subWalletId : undefined);
      setTotalOnHoldBalance(balanceData.onHoldBalance || 0);

      // Fetch on-hold transactions (status: PENDING indicates on-hold)
      // Try PENDING first, as that's the default status for transactions on hold
      // Pass subWalletId if viewing a sub-wallet
      let transactionData;
      try {
        transactionData = await TransactionService.getTransactionHistory(
          0, // page
          100, // size - get more transactions to show all on-hold ones
          undefined, // startDate
          undefined, // endDate
          undefined, // transactionType
          'PENDING', // status - filter for pending/on-hold transactions
          isSubWallet ? subWalletId : undefined // subWalletId
        );
      } catch (err) {
        // If PENDING doesn't work, try ON_HOLD
        console.log('Trying ON_HOLD status...');
        transactionData = await TransactionService.getTransactionHistory(
          0,
          100,
          undefined,
          undefined,
          undefined,
          'ON_HOLD',
          isSubWallet ? subWalletId : undefined // subWalletId
        );
      }

      // Transform transactions to match the display format
      const transformedTransactions: OnHoldTransaction[] = transactionData.transactions.map((tx: TransactionSummary) => {
        const date = new Date(tx.createdAt);
        const holdDate = date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
        
        // Calculate expected release date (assuming 7 days hold period)
        const expectedReleaseDate = new Date(date);
        expectedReleaseDate.setDate(expectedReleaseDate.getDate() + 7);
        const expectedRelease = expectedReleaseDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });

        return {
          name: tx.description || TransactionService.formatTransactionType(tx.transactionType),
          amount: TransactionService.formatCurrency(tx.amount, tx.currency),
          status: TransactionService.formatTransactionStatus(tx.status),
          reason: tx.status.toLowerCase().replace('_', ' '), // Use status as reason
          transactionRef: tx.referenceNumber || tx.id.substring(0, 12),
          holdDate: holdDate,
          expectedRelease: expectedRelease
        };
      });

      setOnHoldTransactions(transformedTransactions);
    } catch (err) {
      console.error('Error loading on-hold data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load on-hold transactions');
      // Set empty array on error
      setOnHoldTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name Transaction', 'Amount', 'Status', 'Reason', 'Transaction Ref', 'Hold Date', 'Expected Release'];
    const rows = onHoldTransactions.map(t => [
      t.name,
      t.amount,
      t.status,
      t.reason,
      t.transactionRef,
      t.holdDate,
      t.expectedRelease
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `onhold_balance_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportDropdown(false);
  };

  const exportToExcel = () => {
    const headers = ['Name Transaction', 'Amount', 'Status', 'Reason', 'Transaction Ref', 'Hold Date', 'Expected Release'];
    const rows = onHoldTransactions.map(t => [
      t.name,
      t.amount,
      t.status,
      t.reason,
      t.transactionRef,
      t.holdDate,
      t.expectedRelease
    ]);

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
    link.setAttribute('download', `onhold_balance_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportDropdown(false);
  };

  const exportToPDF = () => {
    const headers = ['Name Transaction', 'Amount', 'Status', 'Reason', 'Transaction Ref', 'Hold Date', 'Expected Release'];
    const rows = onHoldTransactions.map(t => [
      t.name,
      t.amount,
      t.status,
      t.reason,
      t.transactionRef,
      t.holdDate,
      t.expectedRelease
    ]);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>On-Hold Balance Export</title>
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
        <h1>On-Hold Balance Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Total On-Hold Transactions: ${rows.length}</p>
        <p>Total On-Hold Balance: ${TransactionService.formatCurrency(totalOnHoldBalance, 'SAR')}</p>
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
    if (onHoldTransactions.length === 0) {
      alert('No on-hold transactions to export.');
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

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header subWalletId={subWalletId} isSubWallet={isSubWallet} />
        <div className="dashboard-content">
          <h1 className="dashboard-title">On Hold Balance</h1>
          
          <div className="onhold-balance-table">
            <div className="transactions-header-row" style={{ marginBottom: '20px', justifyContent: 'flex-end' }}>
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
           
            
            {isLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
                Loading on-hold transactions...
              </div>
            ) : error ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#EF4444' }}>
                {error}
              </div>
            ) : onHoldTransactions.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
                No on-hold transactions found.
              </div>
            ) : (
              <div className="table-container">
                <table className="onhold-table">
                  <thead>
                    <tr>
                      <th>Name Transaction</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Reason</th>
                      <th>Transaction Ref</th>
                      <th>Hold Date</th>
                      <th>Expected Release</th>
                    </tr>
                  </thead>
                  <tbody>
                    {onHoldTransactions.map((transaction, index) => (
                      <tr key={index}>
                        <td>{transaction.name}</td>
                        <td>{transaction.amount}</td>
                        <td>
                          <span className="status-badge onhold">{transaction.status}</span>
                        </td>
                        <td>{transaction.reason}</td>
                        <td>{transaction.transactionRef}</td>
                        <td>{transaction.holdDate}</td>
                        <td>{transaction.expectedRelease}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="pagination-controls">
              <button className="pagination-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <span className="pagination-ellipsis">...</span>
              <button className="pagination-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnHoldBalance;
