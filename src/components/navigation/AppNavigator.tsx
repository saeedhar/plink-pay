import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Dashboard from '../../features/dashboard/pages/Dashboard';
import OnHoldBalance from '../../features/dashboard/pages/OnHoldBalance';
import Wallet from '../../features/dashboard/pages/Wallet';
import WalletOTPPage from '../../features/dashboard/pages/WalletOTPPage';
import LimitsConfiguration from '../../features/dashboard/pages/LimitsConfiguration';
import SubWallet from '../../features/dashboard/pages/SubWallet';
import Transactions from '../../features/dashboard/pages/Transactions';
import AccountSettings from '../../features/dashboard/pages/AccountSettings';
import UpdateMobileNumber from '../../features/dashboard/pages/UpdateMobileNumber';
import UpdateMobileOTP from '../../features/dashboard/pages/UpdateMobileOTP';
import UpdateMobileSuccess from '../../features/dashboard/pages/UpdateMobileSuccess';
import UpdateEmail from '../../features/dashboard/pages/UpdateEmail';

const AppNavigator: React.FC = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/onhold-balance" element={<OnHoldBalance />} />
      <Route path="/account-settings" element={<AccountSettings />} />
      <Route path="/account-settings/mobile" element={<UpdateMobileNumber />} />
      <Route path="/account-settings/mobile/otp" element={<UpdateMobileOTP />} />
      <Route path="/account-settings/mobile/success" element={<UpdateMobileSuccess />} />
      <Route path="/account-settings/email" element={<UpdateEmail />} />
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
