import React from 'react';

const TransactionsTable: React.FC = () => {
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
    }
  ];

  return (
    <div className="transactions-table">
      <div className="transactions-header">
        <h3 className="transactions-title">Transactions</h3>
        <a href="#" className="see-all-link">See All</a>
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
        
        {transactions.map((transaction, index) => (
          <div key={index} className="table-row">
            <div className="table-cell">{transaction.referenceId}</div>
            <div className="table-cell">{transaction.status}</div>
            <div className="table-cell">{transaction.currency}</div>
            <div className="table-cell">{transaction.amount}</div>
            <div className="table-cell">{transaction.transactionType}</div>
            <div className="table-cell">{transaction.time}</div>
            <div className="table-cell">{transaction.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionsTable;
