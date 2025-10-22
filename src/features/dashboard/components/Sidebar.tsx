import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoMark from '../../../assets/logo-mark.svg';
import dashboardIcon from '../../../assets/dashboard/dashboard.svg';
import transfersIcon from '../../../assets/dashboard/trasnfers.svg';
import servicesIcon from '../../../assets/dashboard/services.svg';
import settingsIcon from '../../../assets/dashboard/settings.svg';
import supportIcon from '../../../assets/dashboard/support.svg';
import logoutIcon from '../../../assets/dashboard/logout.svg';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [servicesExpanded, setServicesExpanded] = useState(true);

  const isActive = (path: string) => location.pathname === path;
  const isWalletActive = location.pathname === '/app/services/wallet';

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <img src={logoMark} alt="Tyaseer Pay" className="logo-image" />
        </div>
      </div>

      <nav className="sidebar-nav">
        <Link 
          to="/app/dashboard" 
          className={`nav-item ${isActive('/app/dashboard') ? 'active' : ''}`}
        >
          <img src={dashboardIcon} alt="Dashboard" className="nav-icon" />
          <span>Dashboard</span>
        </Link>

        <Link 
          to="/app/transactions" 
          className={`nav-item ${isActive('/app/transactions') ? 'active' : ''}`}
        >
          <img src={transfersIcon} alt="Transactions" className="nav-icon" />
          <span>Transaction</span>
          <div className="nav-badges">
            <span className="badge badge-new">New</span>
            <span className="badge badge-count">6</span>
          </div>
        </Link>

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
              <Link to="/app/services/wallet" className={`submenu-item ${isWalletActive ? 'active' : ''}`}>Wallet</Link>
              <Link to="/services/transfer" className="submenu-item">Transfer</Link>
              <Link to="/services/credit" className="submenu-item">Credit</Link>
              <Link to="/services/bills" className="submenu-item">Bills</Link>
              <Link to="/services/beneficiaries" className="submenu-item">Beneficiaries</Link>
              <Link to="/services/topup" className="submenu-item">Top Up</Link>
            </div>
          )}
        </div>

        <Link 
          to="/settings" 
          className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
        >
          <img src={settingsIcon} alt="Settings" className="nav-icon" />
          <span>Settings</span>
        </Link>

        <Link 
          to="/support" 
          className={`nav-item ${isActive('/support') ? 'active' : ''}`}
        >
          <img src={supportIcon} alt="Support" className="nav-icon" />
          <span>Support</span>
        </Link>

        <Link 
          to="/logout" 
          className={`nav-item ${isActive('/logout') ? 'active' : ''}`}
        >
          <img src={logoutIcon} alt="Logout" className="nav-icon" />
          <span>Log out</span>
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
