import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Dashboard from '../../features/dashboard/pages/Dashboard';
import OnHoldBalance from '../../features/dashboard/pages/OnHoldBalance';
import Wallet from '../../features/dashboard/pages/Wallet';
import WalletOTPPage from '../../features/dashboard/pages/WalletOTPPage';
import LimitsConfiguration from '../../features/dashboard/pages/LimitsConfiguration';
import SubWallet from '../../features/dashboard/pages/SubWallet';

const AppNavigator: React.FC = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/onhold-balance" element={<OnHoldBalance />} />
          <Route path="/services" element={<Outlet />}>
            <Route path="wallet" element={<Wallet />} />
            <Route path="wallet/otp" element={<WalletOTPPage />} />
            <Route path="wallet/limits" element={<LimitsConfiguration />} />
            <Route path="wallet/subwallet" element={<SubWallet />} />
            {/* Add more service routes here */}
          </Route>
      <Route path="/" element={<Dashboard />} />
      {/* Add more authenticated routes here */}
    </Routes>
  );
};

export default AppNavigator;
