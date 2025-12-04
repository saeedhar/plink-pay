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
import CardManagement from '../../features/dashboard/pages/CardManagement';
import RequestVirtualCard from '../../features/dashboard/pages/RequestVirtualCard';
import RequestVirtualCardOTP from '../../features/dashboard/pages/RequestVirtualCardOTP';
import RequestPhysicalCard from '../../features/dashboard/pages/RequestPhysicalCard';
import PhysicalCardFee from '../../features/dashboard/pages/PhysicalCardFee';
import DeliveryLocation from '../../features/dashboard/pages/DeliveryLocation';
import SelectOnMap from '../../features/dashboard/pages/SelectOnMap';
import UseBrowserLocation from '../../features/dashboard/pages/UseBrowserLocation';
import RequestPhysicalCardOTP from '../../features/dashboard/pages/RequestPhysicalCardOTP';
import SetCardPIN from '../../features/dashboard/pages/SetCardPIN';
import ConfirmCardPIN from '../../features/dashboard/pages/ConfirmCardPIN';
import SelectPhysicalCardActivation from '../../features/dashboard/pages/SelectPhysicalCardActivation';
import NFCActivation from '../../features/dashboard/pages/NFCActivation';
import ManualActivation from '../../features/dashboard/pages/ManualActivation';
import CardActivationOTP from '../../features/dashboard/pages/CardActivationOTP';
import CardActivationSuccess from '../../features/dashboard/pages/CardActivationSuccess';
import ShowCardDetailsOTP from '../../features/dashboard/pages/ShowCardDetailsOTP';
import ShowCardDetails from '../../features/dashboard/pages/ShowCardDetails';
import FreezeCardOTP from '../../features/dashboard/pages/FreezeCardOTP';
import DisplayCardPINOTP from '../../features/dashboard/pages/DisplayCardPINOTP';
import DisplayCardPIN from '../../features/dashboard/pages/DisplayCardPIN';
import ChangeCardPINOTP from '../../features/dashboard/pages/ChangeCardPINOTP';
import ChangeCardPINSuccess from '../../features/dashboard/pages/ChangeCardPINSuccess';
import ChangeCardPINFinalSuccess from '../../features/dashboard/pages/ChangeCardPINFinalSuccess';
import ReportReplaceCard from '../../features/dashboard/pages/ReportReplaceCard';
import SelectReplacementCardType from '../../features/dashboard/pages/SelectReplacementCardType';
import ReportReplaceCardOTP from '../../features/dashboard/pages/ReportReplaceCardOTP';
import ReportReplaceCardSuccess from '../../features/dashboard/pages/ReportReplaceCardSuccess';
import StopCardOTP from '../../features/dashboard/pages/StopCardOTP';
import StopCardSuccess from '../../features/dashboard/pages/StopCardSuccess';

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
            <Route path="cards" element={<CardManagement />} />
            <Route path="cards/request-virtual" element={<RequestVirtualCard />} />
            <Route path="cards/request-virtual/otp" element={<RequestVirtualCardOTP />} />
            <Route path="cards/request-physical" element={<RequestPhysicalCard />} />
            <Route path="cards/request-physical/fee" element={<PhysicalCardFee />} />
            <Route path="cards/request-physical/delivery" element={<DeliveryLocation />} />
            <Route path="cards/request-physical/delivery/map" element={<SelectOnMap />} />
            <Route path="cards/request-physical/delivery/map/browser-location" element={<UseBrowserLocation />} />
            <Route path="cards/request-physical/otp" element={<RequestPhysicalCardOTP />} />
            <Route path="cards/set-pin" element={<SetCardPIN />} />
            <Route path="cards/set-pin/confirm" element={<ConfirmCardPIN />} />
            <Route path="cards/activate-physical" element={<SelectPhysicalCardActivation />} />
            <Route path="cards/activate-physical/nfc" element={<NFCActivation />} />
            <Route path="cards/activate-physical/manual" element={<ManualActivation />} />
            <Route path="cards/activate-physical/manual/otp" element={<CardActivationOTP />} />
            <Route path="cards/activate-physical/success" element={<CardActivationSuccess />} />
            <Route path="cards/show-details/otp" element={<ShowCardDetailsOTP />} />
            <Route path="cards/show-details" element={<ShowCardDetails />} />
            <Route path="cards/freeze/otp" element={<FreezeCardOTP />} />
            <Route path="cards/display-pin/otp" element={<DisplayCardPINOTP />} />
            <Route path="cards/display-pin" element={<DisplayCardPIN />} />
            <Route path="cards/change-pin/otp" element={<ChangeCardPINOTP />} />
            <Route path="cards/change-pin/success" element={<ChangeCardPINSuccess />} />
            <Route path="cards/change-pin/final-success" element={<ChangeCardPINFinalSuccess />} />
            <Route path="cards/report-replace" element={<ReportReplaceCard />} />
            <Route path="cards/report-replace/select-type" element={<SelectReplacementCardType />} />
            <Route path="cards/report-replace/otp" element={<ReportReplaceCardOTP />} />
            <Route path="cards/report-replace/success" element={<ReportReplaceCardSuccess />} />
            <Route path="cards/stop-card" element={<ReportReplaceCard />} />
            <Route path="cards/stop-card/select-type" element={<SelectReplacementCardType />} />
            <Route path="cards/stop-card/otp" element={<StopCardOTP />} />
            <Route path="cards/stop-card/success" element={<StopCardSuccess />} />
          {/** Top Up route handled at root level as /services/topup */}
            {/* Add more service routes here */}
          </Route>
      <Route path="/" element={<Dashboard />} />
      {/* Add more authenticated routes here */}
    </Routes>
  );
};

export default AppNavigator;
