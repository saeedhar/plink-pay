import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransactionService, TransactionSummary } from '../../../services/transactionService';

interface TransactionsTableProps {
  subWalletId?: string;
  isSubWallet?: boolean;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ subWalletId, isSubWallet }) => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions on component mount or when sub-wallet changes
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Pass subWalletId if viewing a sub-wallet
        const response = await TransactionService.getTransactionHistory(
          0, 
          10, 
          undefined, 
          undefined, 
          undefined, 
          undefined,
          isSubWallet ? subWalletId : undefined
        );
        setTransactions(response.transactions);
        console.log('🔍 Transactions loaded:', response.transactions, isSubWallet ? `(sub-wallet: ${subWalletId})` : '(main wallet)');
      } catch (err) {
        console.error('Error loading transactions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [isSubWallet, subWalletId]);

  return (
    <div className="transactions-table">
      <div className="transactions-header">
        <h3 className="transactions-title">Transactions</h3>
        <a href="#" className="see-all-link" onClick={(e) => { 
          e.preventDefault(); 
          navigate('/app/transactions', { 
            state: { 
              subWalletId: isSubWallet ? subWalletId : undefined,
              isSubWallet: isSubWallet,
              subWalletName: isSubWallet ? 'Sub-Wallet' : undefined
            } 
          }); 
        }}>See All</a>
      </div>
      
      <div className="table-container">
        <div className="table-header">
          <div className="table-cell">Reference ID</div>
          <div className="table-cell">Status</div>
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
