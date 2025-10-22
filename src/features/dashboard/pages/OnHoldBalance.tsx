import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';

const OnHoldBalance: React.FC = () => {
  const navigate = useNavigate();

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

  const onHoldTransactions = [
    {
      name: "Name Transaction",
      amount: "400 SAR",
      status: "On-Hold",
      reason: "review",
      transactionRef: "TX-293848",
      holdDate: "05-Sep-2025",
      expectedRelease: "12-Sep-2025"
    },
    {
      name: "Name Transaction",
      amount: "400 SAR",
      status: "On-Hold",
      reason: "review",
      transactionRef: "TX-293848",
      holdDate: "05-Sep-2025",
      expectedRelease: "12-Sep-2025"
    },
    {
      name: "Name Transaction",
      amount: "400 SAR",
      status: "On-Hold",
      reason: "review",
      transactionRef: "TX-293848",
      holdDate: "05-Sep-2025",
      expectedRelease: "12-Sep-2025"
    }
  ];

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
            </div>
            
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
