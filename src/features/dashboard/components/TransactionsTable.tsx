import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransactionService, TransactionSummary } from '../../../services/transactionService';

const TransactionsTable: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions on component mount
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await TransactionService.getTransactionHistory(0, 10); // Get first 10 transactions
        setTransactions(response.transactions);
        console.log('🔍 Transactions loaded:', response.transactions);
      } catch (err) {
        console.error('Error loading transactions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, []);

  return (
    <div className="transactions-table">
      <div className="transactions-header">
        <h3 className="transactions-title">Transactions</h3>
        <a href="#" className="see-all-link" onClick={(e) => { e.preventDefault(); navigate('/app/transactions'); }}>See All</a>
      </div>
      
      <div className="table-container">
        <div className="table-header">
          <div className="table-cell">Reference ID</div>
          <div className="table-cell">Status</div>
          <div className="table-cell">Currency</div>
          <div className="table-cell">Amount</div>
          <div className="table-cell">Transaction Type</div>
          <div className="table-cell">Time</div>
          <div className="table-cell">Date</div>
        </div>
        
        {isLoading ? (
          <div className="table-row">
            <div className="table-cell" style={{ textAlign: 'center', padding: '20px', gridColumn: '1 / -1' }}>
              Loading transactions...
            </div>
          </div>
        ) : error ? (
          <div className="table-row">
            <div className="table-cell" style={{ textAlign: 'center', padding: '20px', gridColumn: '1 / -1', color: '#EF4444' }}>
              Error: {error}
            </div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="table-row">
            <div className="table-cell" style={{ textAlign: 'center', padding: '20px', gridColumn: '1 / -1' }}>
              No transactions found
            </div>
          </div>
        ) : (
          transactions.map((transaction) => {
            const { date, time } = TransactionService.formatDate(transaction.createdAt);
            return (
              <div key={transaction.id} className="table-row">
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
      </div>
    </div>
  );
};

export default TransactionsTable;
