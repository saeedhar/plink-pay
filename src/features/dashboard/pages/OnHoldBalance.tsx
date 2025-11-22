import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
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
  const [onHoldTransactions, setOnHoldTransactions] = useState<OnHoldTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalOnHoldBalance, setTotalOnHoldBalance] = useState<number>(0);

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

  // Load on-hold transactions and balance
  useEffect(() => {
    loadOnHoldData();
  }, []);

  const loadOnHoldData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch wallet balance to get total on-hold balance
      const balanceData = await TransactionService.getWalletBalance();
      setTotalOnHoldBalance(balanceData.onHoldBalance || 0);

      // Fetch on-hold transactions (status: PENDING indicates on-hold)
      // Try PENDING first, as that's the default status for transactions on hold
      let transactionData;
      try {
        transactionData = await TransactionService.getTransactionHistory(
          0, // page
          100, // size - get more transactions to show all on-hold ones
          undefined, // startDate
          undefined, // endDate
          undefined, // transactionType
          'PENDING' // status - filter for pending/on-hold transactions
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
          'ON_HOLD'
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

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-content">
          <h1 className="dashboard-title">On Hold Balance</h1>
          
          <div className="onhold-balance-table">
            <div className="table-header">
              <h3 className="table-title">On Hold Balances</h3>
              {totalOnHoldBalance > 0 && (
                <div style={{ marginTop: '8px', fontSize: '14px', color: '#6B7280' }}>
                  Total On Hold: {TransactionService.formatCurrency(totalOnHoldBalance, 'SAR')}
                </div>
              )}
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
