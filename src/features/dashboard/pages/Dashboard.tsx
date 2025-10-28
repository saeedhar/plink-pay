import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar, Header, DashboardWidgets, TransactionsTable } from '../components';

const Dashboard: React.FC = () => {
  const location = useLocation();
  const state = location.state as { subWalletName?: string; subWalletId?: string; isSubWallet?: boolean } | null;
  const subWalletName = state?.subWalletName;
  const subWalletId = state?.subWalletId;
  const isSubWallet = state?.isSubWallet;

  useEffect(() => {
    // Add dashboard-root class to root element
    const root = document.getElementById('root');
    if (root) {
      root.classList.add('dashboard-root');
    }
    
    // Cleanup function to remove class when component unmounts
    return () => {
      if (root) {
        root.classList.remove('dashboard-root');
      }
    };
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-content">
          <h1 className="dashboard-title">Dashboard</h1>
          <DashboardWidgets subWalletName={subWalletName} subWalletId={subWalletId} isSubWallet={isSubWallet} />
          <div className="transactions-separator"></div>
          <TransactionsTable />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
