import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar, Header, DashboardWidgets, TransactionsTable } from '../components';

const Dashboard: React.FC = () => {
  const location = useLocation();
  const state = location.state as { subWalletName?: string; subWalletId?: string; isSubWallet?: boolean } | null;
  const subWalletName = state?.subWalletName;
  const subWalletId = state?.subWalletId;
  const isSubWallet = state?.isSubWallet;
  const prevStateRef = useRef<{ subWalletId?: string; isSubWallet?: boolean } | null>(null);

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

  // Reload data when sub-wallet context changes or when navigating back
  useEffect(() => {
    const currentState = { subWalletId, isSubWallet };
    const prevState = prevStateRef.current;
    
    // If state changed (different sub-wallet selected or coming back from another page)
    if (prevState && (
      prevState.subWalletId !== currentState.subWalletId ||
      prevState.isSubWallet !== currentState.isSubWallet
    )) {
      // Force reload by triggering a re-render
      // The child components (DashboardWidgets, Header, TransactionsTable) will reload
      // when their props change, which happens when state changes
      console.log('🔄 Dashboard: Sub-wallet context changed, components will reload');
    }
    
    // Update ref for next comparison
    prevStateRef.current = currentState;
  }, [subWalletId, isSubWallet]);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header subWalletId={subWalletId} isSubWallet={isSubWallet} />
        <div className="dashboard-content">
          <h1 className="dashboard-title">Dashboard</h1>
          <DashboardWidgets subWalletName={subWalletName} subWalletId={subWalletId} isSubWallet={isSubWallet} />
          <TransactionsTable subWalletId={subWalletId} isSubWallet={isSubWallet} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
