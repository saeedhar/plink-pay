import { API } from '../lib/api';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface UserProfileResponse {
  id: string;
  email?: string;
  phoneE164?: string;
  dateOfBirth?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  name?: string;
  sourceOfFunds?: string;
  annualRevenue?: string;
  businessActivity?: string;
  accountPurpose?: string;
}

export interface UpdateProfileRequest {
  dateOfBirth?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface NotificationPreferencesResponse {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications?: boolean;
}

export interface UpdateNotificationPreferencesRequest {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
}

export interface LanguagePreferenceResponse {
  language: string;
  locale?: string;
}

export interface UpdateLanguagePreferenceRequest {
  language: string;
  locale?: string;
}

// Mobile Update
export interface UpdateMobileRequest {
  newPhoneNumber: string;
}

export interface UpdateMobileResponse {
  success: boolean;
  message: string;
  sessionId: string;
  otpCode?: string; // For testing only
}

export interface VerifyMobileUpdateRequest {
  sessionId: string;
  otp: string;
}

export interface VerifyMobileUpdateResponse {
  success: boolean;
  message: string;
  phoneE164?: string;
}

// Email Update
export interface UpdateEmailRequest {
  email: string;
}

export interface UpdateEmailResponse {
  success: boolean;
  message: string;
  sessionId: string;
  otpCode?: string; // For testing only
}

export interface VerifyEmailUpdateRequest {
  sessionId: string;
  otp: string;
}

export interface VerifyEmailUpdateResponse {
  success: boolean;
  message: string;
  email?: string;
}

// KYB Update
export interface UpdateKybRequest {
  businessName?: string;
  businessNameArabic?: string;
  sourceOfFunds?: string;
  annualRevenue?: string;
  businessActivity?: string;
  accountPurpose?: string;
}

export interface UpdateKybResponse {
  success: boolean;
  message: string;
  sessionId: string;
  otpCode?: string; // For testing only
}

export interface VerifyKybUpdateRequest {
  sessionId: string;
  otp: string;
}

export interface VerifyKybUpdateResponse {
  success: boolean;
  message: string;
}

export interface UpdateKybWithPasscodeRequest {
  businessName?: string;
  businessNameArabic?: string;
  sourceOfFunds?: string;
  annualRevenue?: string;
  businessActivity?: string;
  accountPurpose?: string;
  passcode: string;
}

// Address Update
export interface NationalAddressResponse {
  buildingNumber?: string;
  street?: string;
  district?: string;
  city?: string;
  postalCode?: string;
  additionalNumber?: string;
}

export interface UpdateAddressRequest {
  buildingNumber?: string;
  street?: string;
  district?: string;
  city?: string;
  postalCode?: string;
  additionalNumber?: string;
}

export interface UpdateAddressResponse {
  success: boolean;
  message: string;
  sessionId: string;
  otpCode?: string; // For testing only
}

export interface VerifyAddressUpdateRequest {
  sessionId: string;
  otp: string;
}

export interface VerifyAddressUpdateResponse {
  success: boolean;
  message: string;
}

export interface UpdateAddressWithPasscodeRequest {
  buildingNumber?: string;
  street?: string;
  district?: string;
  city?: string;
  postalCode?: string;
  additionalNumber?: string;
  passcode: string;
}

// Device Deactivation
export interface DeactivateDeviceRequest {
  deviceId: string;
}

export interface DeactivateDeviceResponse {
  success: boolean;
  message: string;
  sessionId: string;
  otpCode?: string; // For testing only
}

export interface VerifyDeviceDeactivationRequest {
  sessionId: string;
  otp: string;
}

export interface VerifyDeviceDeactivationResponse {
  success: boolean;
  message: string;
}

// Device List
export interface DeviceResponse {
  id: string;
  fingerprint: string;
  platform?: string;
  trusted: boolean;
  firstSeenAt?: string;
  lastSeenAt?: string;
}

// ==========================================
// USER MANAGEMENT SERVICE
// ==========================================

/**
 * User Management Service - Handles all user profile and settings management API calls
 */
export class UserManagementService {
  /**
   * Get current user profile
   */
  static async getProfile(): Promise<UserProfileResponse> {
    try {
      console.log('🔍 Fetching user profile...');
      const data = await API.get('/api/v1/users/me');
      console.log('✅ User profile data received:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(request: UpdateProfileRequest): Promise<UserProfileResponse> {
    try {
      console.log('🔄 Updating user profile...', request);
      const data = await API.put('/api/v1/users/me', request);
      console.log('✅ User profile updated:', data);
      return data;
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  static async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    try {
      console.log('🔐 Changing password...');
      const data = await API.post('/api/v1/users/me/password/change', request);
      console.log('✅ Password changed successfully');
      return data;
    } catch (error) {
      console.error('❌ Error changing password:', error);
      throw error;
    }
  }

  /**
   * Get notification preferences
   */
  static async getNotificationPreferences(): Promise<NotificationPreferencesResponse> {
    try {
      console.log('🔍 Fetching notification preferences...');
      const data = await API.get('/api/v1/users/me/notifications');
      console.log('✅ Notification preferences received:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching notification preferences:', error);
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  static async updateNotificationPreferences(
    request: UpdateNotificationPreferencesRequest
  ): Promise<NotificationPreferencesResponse> {
    try {
      console.log('🔄 Updating notification preferences...', request);
      const data = await API.put('/api/v1/users/me/notifications', request);
      console.log('✅ Notification preferences updated:', data);
      return data;
    } catch (error) {
      console.error('❌ Error updating notification preferences:', error);
      throw error;
    }
  }

  /**
   * Get language preference
   */
  static async getLanguagePreference(): Promise<LanguagePreferenceResponse> {
    try {
      console.log('🔍 Fetching language preference...');
      const data = await API.get('/api/v1/users/me/language');
      console.log('✅ Language preference received:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching language preference:', error);
      throw error;
    }
  }

  /**
   * Update language preference
   */
  static async updateLanguagePreference(
    request: UpdateLanguagePreferenceRequest
  ): Promise<LanguagePreferenceResponse> {
    try {
      console.log('🔄 Updating language preference...', request);
      const data = await API.put('/api/v1/users/me/language', request);
      console.log('✅ Language preference updated:', data);
      return data;
    } catch (error) {
      console.error('❌ Error updating language preference:', error);
      throw error;
    }
  }

  /**
   * Initiate mobile number update
   */
  static async initiateMobileUpdate(request: UpdateMobileRequest): Promise<UpdateMobileResponse> {
    try {
      console.log('📱 Initiating mobile update...', request);
      const data = await API.post('/api/v1/users/me/mobile/update', request);
      console.log('✅ Mobile update initiated, sessionId:', data.sessionId);
      return data;
    } catch (error) {
      console.error('❌ Error initiating mobile update:', error);
      throw error;
    }
  }

  /**
   * Verify mobile number update with OTP
   */
  static async verifyMobileUpdate(
    request: VerifyMobileUpdateRequest
  ): Promise<VerifyMobileUpdateResponse> {
    try {
      console.log('✅ Verifying mobile update with OTP...', request.sessionId);
      const data = await API.post('/api/v1/users/me/mobile/verify-otp', request);
      console.log('✅ Mobile update verified successfully');
      return data;
    } catch (error) {
      console.error('❌ Error verifying mobile update:', error);
      throw error;
    }
  }

  /**
   * Initiate email update
   */
  static async initiateEmailUpdate(request: UpdateEmailRequest): Promise<UpdateEmailResponse> {
    try {
      console.log('📧 Initiating email update...', request);
      const data = await API.post('/api/v1/users/me/email/update', request);
      console.log('✅ Email update initiated, sessionId:', data.sessionId);
      return data;
    } catch (error) {
      console.error('❌ Error initiating email update:', error);
      throw error;
    }
  }

  /**
   * Verify email update with OTP
   */
  static async verifyEmailUpdate(
    request: VerifyEmailUpdateRequest
  ): Promise<VerifyEmailUpdateResponse> {
    try {
      console.log('✅ Verifying email update with OTP...', request.sessionId);
      const data = await API.post('/api/v1/users/me/email/verify-otp', request);
      console.log('✅ Email update verified successfully');
      return data;
    } catch (error) {
      console.error('❌ Error verifying email update:', error);
      throw error;
    }
  }

  /**
   * Initiate KYB profile update
   */
  static async initiateKybUpdate(request: UpdateKybRequest): Promise<UpdateKybResponse> {
    try {
      console.log('🏢 Initiating KYB update...', request);
      const data = await API.post('/api/v1/users/me/kyb/update', request);
      console.log('✅ KYB update initiated, sessionId:', data.sessionId);
      return data;
    } catch (error) {
      console.error('❌ Error initiating KYB update:', error);
      throw error;
    }
  }

  /**
   * Verify KYB update with OTP
   */
  static async verifyKybUpdate(
    request: VerifyKybUpdateRequest
  ): Promise<VerifyKybUpdateResponse> {
    try {
      console.log('✅ Verifying KYB update with OTP...', request.sessionId);
      const data = await API.post('/api/v1/users/me/kyb/verify-otp', request);
      console.log('✅ KYB update verified successfully');
      return data;
    } catch (error) {
      console.error('❌ Error verifying KYB update:', error);
      throw error;
    }
  }

  /**
   * Update KYB profile with passcode (no OTP required)
   */
  static async updateKybWithPasscode(
    request: UpdateKybWithPasscodeRequest
  ): Promise<VerifyKybUpdateResponse> {
    try {
      console.log('🏢 Updating KYB with passcode...');
      const data = await API.post('/api/v1/users/me/kyb/update-with-passcode', request);
      console.log('✅ KYB updated successfully with passcode');
      return data;
    } catch (error) {
      console.error('❌ Error updating KYB with passcode:', error);
      throw error;
    }
  }

  /**
   * Get national address
   */
  static async getNationalAddress(): Promise<NationalAddressResponse> {
    try {
      console.log('🔍 Fetching national address...');
      const data = await API.get('/api/v1/users/me/address');
      console.log('✅ National address received:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching national address:', error);
      throw error;
    }
  }

  /**
   * Initiate national address update
   */
  static async initiateAddressUpdate(
    request: UpdateAddressRequest
  ): Promise<UpdateAddressResponse> {
    try {
      console.log('📍 Initiating address update...', request);
      const data = await API.post('/api/v1/users/me/address/update', request);
      console.log('✅ Address update initiated, sessionId:', data.sessionId);
      return data;
    } catch (error) {
      console.error('❌ Error initiating address update:', error);
      throw error;
    }
  }

  /**
   * Verify address update with OTP
   */
  static async verifyAddressUpdate(
    request: VerifyAddressUpdateRequest
  ): Promise<VerifyAddressUpdateResponse> {
    try {
      console.log('✅ Verifying address update with OTP...', request.sessionId);
      const data = await API.post('/api/v1/users/me/address/verify-otp', request);
      console.log('✅ Address update verified successfully');
      return data;
    } catch (error) {
      console.error('❌ Error verifying address update:', error);
      throw error;
    }
  }

  /**
   * Update national address with passcode (no OTP required)
   */
  static async updateAddressWithPasscode(
    request: UpdateAddressWithPasscodeRequest
  ): Promise<VerifyAddressUpdateResponse> {
    try {
      console.log('📍 Updating address with passcode...');
      const data = await API.post('/api/v1/users/me/address/update-with-passcode', request);
      console.log('✅ Address updated successfully with passcode');
      return data;
    } catch (error) {
      console.error('❌ Error updating address with passcode:', error);
      throw error;
    }
  }

  /**
   * Initiate device deactivation
   */
  static async initiateDeviceDeactivation(
    request: DeactivateDeviceRequest
  ): Promise<DeactivateDeviceResponse> {
    try {
      console.log('📱 Initiating device deactivation...', request);
      const data = await API.post('/api/v1/users/me/devices/deactivate', request);
      console.log('✅ Device deactivation initiated, sessionId:', data.sessionId);
      return data;
    } catch (error) {
      console.error('❌ Error initiating device deactivation:', error);
      throw error;
    }
  }

  /**
   * Verify device deactivation with OTP
   */
  static async verifyDeviceDeactivation(
    request: VerifyDeviceDeactivationRequest
  ): Promise<VerifyDeviceDeactivationResponse> {
    try {
      console.log('✅ Verifying device deactivation with OTP...', request.sessionId);
      const data = await API.post('/api/v1/users/me/devices/deactivate/verify-otp', request);
      console.log('✅ Device deactivation verified successfully');
      return data;
    } catch (error) {
      console.error('❌ Error verifying device deactivation:', error);
      throw error;
    }
  }

  /**
   * Get user devices
   */
  static async getDevices(): Promise<DeviceResponse[]> {
    try {
      console.log('📱 Fetching user devices...');
      const data = await API.get('/api/v1/devices');
      console.log('✅ User devices received:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching devices:', error);
      throw error;
    }
  }
}

