import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoMark from '../../../assets/logo-mark.svg';
import dashboardIcon from '../../../assets/dashboard/dashboard.svg';
import transfersIcon from '../../../assets/dashboard/trasnfers.svg';
import servicesIcon from '../../../assets/dashboard/services.svg';
import settingsIcon from '../../../assets/dashboard/settings.svg';
import supportIcon from '../../../assets/dashboard/support.svg';
import logoutIcon from '../../../assets/dashboard/logout.svg';
import { logout } from '../../../services/realBackendAPI';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [servicesExpanded, setServicesExpanded] = useState(true);
  const [hasViewedTransactions, setHasViewedTransactions] = useState(false);
  
  // Get sub-wallet context from location state
  const state = location.state as { subWalletName?: string; subWalletId?: string; isSubWallet?: boolean } | null;
  const subWalletId = state?.subWalletId;
  const isSubWallet = state?.isSubWallet;
  const subWalletName = state?.subWalletName;

  const isActive = (path: string) => location.pathname === path;
  const isWalletActive = location.pathname === '/app/services/wallet';
  const isTransactionsPage = location.pathname === '/app/transactions';
  
  const isAccountSettingsPage = location.pathname.startsWith('/app/account-settings');
  
  useEffect(() => {
    const viewed = localStorage.getItem('hasViewedTransactions');
    if (viewed === 'true') {
      setHasViewedTransactions(true);
    }
  }, []);

  useEffect(() => {
    if (isTransactionsPage && !hasViewedTransactions) {
      setHasViewedTransactions(true);
      localStorage.setItem('hasViewedTransactions', 'true');
    }
  }, [isTransactionsPage, hasViewedTransactions]);
  
  useEffect(() => {
    if (isAccountSettingsPage) {
      setServicesExpanded(false);
    }
  }, [isAccountSettingsPage]);

  const handleLogout = async () => {
    try {
      console.log('🚪 Starting logout process...');
      
      await logout();
      
      console.log('✅ Logged out successfully, redirecting to login');
      
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // Even if logout throws an error, tokens should be cleared
      // Navigate to login to ensure user is logged out
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <img src={logoMark} alt="Tyaseer Pay" className="logo-image" />
        </div>
      </div>

      <nav className="sidebar-nav">
        <div 
          className={`nav-item ${isActive('/app/dashboard') ? 'active' : ''}`}
          onClick={() => navigate('/app/dashboard', {
            state: {
              subWalletId: isSubWallet ? subWalletId : undefined,
              isSubWallet: isSubWallet,
              subWalletName: subWalletName
            }
          })}
          style={{ cursor: 'pointer' }}
        >
          <img src={dashboardIcon} alt="Dashboard" className="nav-icon" />
          <span>Dashboard</span>
        </div>

        <div 
          className={`nav-item ${isActive('/app/transactions') ? 'active' : ''}`}
          onClick={() => navigate('/app/transactions', {
            state: {
              subWalletId: isSubWallet ? subWalletId : undefined,
              isSubWallet: isSubWallet,
              subWalletName: subWalletName
            }
          })}
          style={{ cursor: 'pointer' }}
        >
          <img src={transfersIcon} alt="Transactions" className="nav-icon" />
          <span>Transaction</span>
          {!hasViewedTransactions && !isTransactionsPage && (
            <div className="nav-badges">
              <span className="badge badge-new">New</span>
              <span className="badge badge-count">6</span>
            </div>
          )}
        </div>

        <div className={`nav-item services-item ${servicesExpanded ? 'expanded' : ''}`}>
          <div 
            className="nav-item-content"
            onClick={() => setServicesExpanded(!servicesExpanded)}
          >
            <img src={servicesIcon} alt="Services" className="nav-icon" />
            <span>Services</span>
            <div className={`expand-icon ${servicesExpanded ? 'expanded' : ''}`}></div>
          </div>
          
          {servicesExpanded && (
            <div className="services-submenu">
              <div 
                className={`submenu-item ${isWalletActive ? 'active' : ''}`}
                onClick={() => navigate('/app/services/wallet', {
                  state: {
                    subWalletId: isSubWallet ? subWalletId : undefined,
                    isSubWallet: isSubWallet,
                    subWalletName: subWalletName
                  }
                })}
                style={{ cursor: 'pointer' }}
              >
                Wallet
              </div>
              <div className="submenu-item">Transfer</div>
              <div className="submenu-item">Credit</div>
              <div className="submenu-item">Bills</div>
              <div className="submenu-item">Beneficiaries</div>
              <Link to="/services/topup" className="submenu-item">Top Up</Link>
            </div>
          )}
        </div>

        <Link 
          to="/app/account-settings" 
          className={`nav-item ${isAccountSettingsPage ? 'active' : ''}`}
        >
          <img src={settingsIcon} alt="Settings" className="nav-icon" />
          <span>Settings</span>
        </Link>

        <div 
          className={`nav-item ${isActive('/support') ? 'active' : ''}`}
        >
          <img src={supportIcon} alt="Support" className="nav-icon" />
          <span>Support</span>
        </div>

        <button 
          onClick={handleLogout}
          className="nav-item"
          style={{ 
            background: 'none', 
            border: 'none', 
            width: '100%', 
            textAlign: 'left',
            cursor: 'pointer'
          }}
        >
          <img src={logoutIcon} alt="Logout" className="nav-icon" />
          <span>Log out</span>
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
