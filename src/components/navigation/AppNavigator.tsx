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
import UpdateEmailOTP from '../../features/dashboard/pages/UpdateEmailOTP';
import UpdateEmailSuccess from '../../features/dashboard/pages/UpdateEmailSuccess';
import UpdateKYB from '../../features/dashboard/pages/UpdateKYB';
import UpdateKYBOTP from '../../features/dashboard/pages/UpdateKYBOTP';
import UpdateKYBSuccess from '../../features/dashboard/pages/UpdateKYBSuccess';
import ChangePassword from '../../features/dashboard/pages/ChangePassword';
import SetPassword from '../../features/dashboard/pages/SetPassword';
import SetPasswordOTP from '../../features/dashboard/pages/SetPasswordOTP';
import SetPasswordSuccess from '../../features/dashboard/pages/SetPasswordSuccess';
import NotificationManagement from '../../features/dashboard/pages/NotificationManagement';
import PreferredLanguage from '../../features/dashboard/pages/PreferredLanguage';
import UpdateNationalAddress from '../../features/dashboard/pages/UpdateNationalAddress';
import UpdateNationalAddressOTP from '../../features/dashboard/pages/UpdateNationalAddressOTP';
import UpdateNationalAddressSuccess from '../../features/dashboard/pages/UpdateNationalAddressSuccess';
import TrustedDevicesManagement from '../../features/dashboard/pages/TrustedDevicesManagement';
import DeactivateDevice from '../../features/dashboard/pages/DeactivateDevice';
import DeactivateDeviceOTP from '../../features/dashboard/pages/DeactivateDeviceOTP';
import DeactivateDeviceSuccess from '../../features/dashboard/pages/DeactivateDeviceSuccess';

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
      <Route path="/account-settings/email/otp" element={<UpdateEmailOTP />} />
      <Route path="/account-settings/email/success" element={<UpdateEmailSuccess />} />
      <Route path="/account-settings/kyc" element={<UpdateKYB />} />
      <Route path="/account-settings/kyb/otp" element={<UpdateKYBOTP />} />
      <Route path="/account-settings/kyb/success" element={<UpdateKYBSuccess />} />
      <Route path="/account-settings/password" element={<ChangePassword />} />
      <Route path="/account-settings/password/new" element={<SetPassword />} />
      <Route path="/account-settings/password/otp" element={<SetPasswordOTP />} />
      <Route path="/account-settings/password/success" element={<SetPasswordSuccess />} />
      <Route path="/account-settings/notifications" element={<NotificationManagement />} />
      <Route path="/account-settings/language" element={<PreferredLanguage />} />
      <Route path="/account-settings/national-address" element={<UpdateNationalAddress />} />
      <Route path="/account-settings/national-address/otp" element={<UpdateNationalAddressOTP />} />
      <Route path="/account-settings/national-address/success" element={<UpdateNationalAddressSuccess />} />
      <Route path="/account-settings/devices" element={<TrustedDevicesManagement />} />
      <Route path="/account-settings/devices/deactivate" element={<DeactivateDevice />} />
      <Route path="/account-settings/devices/deactivate/otp" element={<DeactivateDeviceOTP />} />
      <Route path="/account-settings/devices/deactivate/success" element={<DeactivateDeviceSuccess />} />
          <Route path="/services" element={<Outlet />}>
            <Route path="wallet" element={<Wallet />} />
            <Route path="wallet/otp" element={<WalletOTPPage />} />
            <Route path="wallet/limits" element={<LimitsConfiguration />} />
            <Route path="wallet/subwallet" element={<SubWallet />} />
          {/** Top Up route handled at root level as /services/topup */}
            {/* Add more service routes here */}
          </Route>
      <Route path="/" element={<Dashboard />} />
      {/* Add more authenticated routes here */}
    </Routes>
  );
};

export default AppNavigator;
