/**
 * Card API Service for E-wallet Website
 * Handles all card-related API calls
 * Note: Website uses OTP instead of passcode (unlike mobile app)
 */

import { API } from '../lib/api';

// ============================================================================
// Types and Interfaces
// ============================================================================

export type CardType = 'MADA' | 'MASTERCARD';
export type CardForm = 'VIRTUAL' | 'PHYSICAL';
export type CardStatus = 'PENDING' | 'INACTIVE' | 'ACTIVE' | 'FROZEN' | 'CLOSED' | 'ISSUANCE_IN_PROGRESS' | 'REPLACEMENT_IN_PROGRESS';
export type CardOperation = 'REQUEST_CARD' | 'ACTIVATE_CARD' | 'FREEZE_CARD' | 'UNFREEZE_CARD' | 'CHANGE_PIN' | 'SHOW_DETAILS' | 'STOP_CARD' | 'REPORT_REPLACE';
export type CardFeatureType = 'nfc-payments' | 'online-payments' | 'abroad-payments' | 'atm-withdrawal';

export interface CardResponse {
  id: string;
  cardType: CardType;
  cardForm: CardForm;
  last4Digits: string;
  expiryMonth: string;
  expiryYear: string;
  cardholderName: string;
  status: CardStatus;
  createdAt: string;
  activatedAt?: string;
  frozenAt?: string;
  closedAt?: string;
}

export interface CardDetailsResponse {
  id: string;
  cardType: CardType;
  cardForm: CardForm;
  pan: string; // Masked PAN (e.g., ****1234)
  cvv?: string; // Only shown if verified and not expired
  expiryMonth: string;
  expiryYear: string;
  cardholderName: string;
  status: CardStatus;
  createdAt: string;
  activatedAt?: string;
  cvvExpiresAt?: string; // When CVV display expires (ISO timestamp)
}

export interface CardOtpRequest {
  operation: CardOperation;
}

export interface CardOtpResponse {
  otpCode?: string; // For testing only
  expiresIn: number; // seconds
  message: string;
}

export interface VerifyCardOtpRequest {
  otp: string;
  operation: CardOperation;
}

export interface VerifyCardOtpResponse {
  verified: boolean;
  token: string; // Temporary token for operation
  expiresIn: number; // seconds
}

export interface ChangePinRequest {
  currentPin: string; // Current 4-digit PIN
  newPin: string; // New 4-digit PIN
  confirmPin: string; // Confirmation of new PIN
}

export interface PinResponse {
  success: boolean;
  message: string;
}

export interface CardActionResponse {
  cardId?: string;
  status?: string;
  actionAt?: string;
  message: string;
}

export interface CardFeature {
  enabled: boolean;
  riskId?: string;
  limit?: number;
}

export interface CardFeatureResponse {
  nfcPayments: CardFeature;
  onlinePayments: CardFeature;
  abroadPayments: CardFeature;
  atmWithdrawal: CardFeature;
}

export interface ToggleFeatureRequest {
  enabled: boolean;
  limit?: number;
}

export interface CardEligibilityResponse {
  eligible: boolean;
  reason?: string;
  existingCardId?: string;
}

export interface PhysicalCardFeeResponse {
  feeEnabled: boolean;
  feeAmount: number;
  vatPercentage: number;
  vatAmount: number;
  totalAmount: number;
}

export interface NationalAddressRequest {
  buildingNumber?: string;
  street?: string;
  district?: string;
  city?: string;
  postalCode?: string;
  additionalNumber?: string;
}

export interface RequestPhysicalCardRequest {
  cardType: 'MADA' | 'MASTERCARD';
  nationalAddress?: NationalAddressRequest;
  useExistingAddress?: boolean;
}

export interface RequestPhysicalCardResponse {
  cardId: string;
  status: string;
  feeAmount: number;
  vatAmount: number;
  message: string;
}

export interface ActivateCardRequest {
  activationMethod: 'NFC' | 'MANUAL';
  last4Digits?: string; // Required if activationMethod is 'MANUAL'
}

export interface RequestVirtualCardRequest {
  cardType: 'MADA' | 'MASTERCARD';
  pin: string; // 4-digit PIN
  confirmPin: string; // 4-digit confirmation PIN
}

export interface RequestVirtualCardResponse {
  cardId: string;
  status: string;
  last4Digits: string;
  message: string;
}

export interface ReportReplaceCardRequest {
  reason: 'LOST' | 'STOLEN' | 'DAMAGED';
  description?: string;
}

// ============================================================================
// Card Management APIs
// ============================================================================

/**
 * List all cards for user
 */
export async function listCards(): Promise<CardResponse[]> {
  const response = await API.get('/api/v1/cards');
  return response as CardResponse[];
}

/**
 * Get card details (with PAN and CVV)
 * Website: requires otpToken (unlike mobile which uses passcode)
 * @param cardId Card ID
 * @param otpToken OTP token from verifyCardOtp
 */
export async function getCardDetails(cardId: string, otpToken: string): Promise<CardDetailsResponse> {
  const response = await API.get(`/api/v1/cards/${cardId}`, {
    headers: {
      'X-OTP-Token': otpToken
    }
  });
  return response as CardDetailsResponse;
}

/**
 * Send card OTP for operation verification
 */
export async function sendCardOtp(request: CardOtpRequest): Promise<CardOtpResponse> {
  const response = await API.post('/api/v1/cards/otp/send', request);
  return response as CardOtpResponse;
}

/**
 * Verify card OTP and get temporary token
 */
export async function verifyCardOtp(request: VerifyCardOtpRequest): Promise<VerifyCardOtpResponse> {
  const response = await API.post('/api/v1/cards/otp/verify', request);
  return response as VerifyCardOtpResponse;
}

/**
 * Change card PIN
 * @param cardId Card ID
 * @param request Change PIN request with currentPin, newPin, and confirmPin
 */
export async function changeCardPin(cardId: string, request: ChangePinRequest): Promise<PinResponse> {
  const response = await API.post(`/api/v1/cards/${cardId}/pin/change`, request);
  return response as PinResponse;
}

/**
 * Freeze a card
 * @param cardId Card ID
 */
export async function freezeCard(cardId: string): Promise<CardActionResponse> {
  const response = await API.post(`/api/v1/cards/${cardId}/freeze`);
  return response as CardActionResponse;
}

/**
 * Unfreeze a card
 * @param cardId Card ID
 */
export async function unfreezeCard(cardId: string): Promise<CardActionResponse> {
  const response = await API.post(`/api/v1/cards/${cardId}/unfreeze`);
  return response as CardActionResponse;
}

/**
 * Get card features (NFC, Online, Abroad, ATM)
 * @param cardId Card ID
 */
export async function getCardFeatures(cardId: string): Promise<CardFeatureResponse> {
  const response = await API.get(`/api/v1/cards/${cardId}/features`);
  return response as CardFeatureResponse;
}

/**
 * Toggle a card feature
 * @param cardId Card ID
 * @param featureType Feature type (nfc-payments, online-payments, abroad-payments, atm-withdrawal)
 * @param request Toggle request with enabled status
 */
export async function toggleCardFeature(
  cardId: string, 
  featureType: CardFeatureType, 
  request: ToggleFeatureRequest
): Promise<CardFeature> {
  const response = await API.post(`/api/v1/cards/${cardId}/features/${featureType}/toggle`, request);
  return response as CardFeature;
}

/**
 * Check physical card eligibility
 */
export async function checkPhysicalCardEligibility(): Promise<CardEligibilityResponse> {
  const response = await API.get('/api/v1/cards/eligibility?cardForm=PHYSICAL');
  return response as CardEligibilityResponse;
}

/**
 * Check virtual card eligibility
 */
export async function checkVirtualCardEligibility(): Promise<CardEligibilityResponse> {
  const response = await API.get('/api/v1/cards/eligibility?cardForm=VIRTUAL');
  return response as CardEligibilityResponse;
}

/**
 * Calculate physical card fee
 */
export async function calculatePhysicalCardFee(): Promise<PhysicalCardFeeResponse> {
  const response = await API.post('/api/v1/cards/config/calculate-fee');
  return response as PhysicalCardFeeResponse;
}

/**
 * Request a physical card
 * @param request Request with card type and national address
 */
export async function requestPhysicalCard(request: RequestPhysicalCardRequest): Promise<RequestPhysicalCardResponse> {
  const response = await API.post('/api/v1/cards/request-physical', request);
  return response as RequestPhysicalCardResponse;
}

/**
 * Activate a physical card
 * @param cardId Card ID
 * @param request Activation request with method and last4Digits
 */
export async function activateCard(cardId: string, request: ActivateCardRequest): Promise<CardActionResponse> {
  const response = await API.post(`/api/v1/cards/${cardId}/activate`, request);
  return response as CardActionResponse;
}

/**
 * Request a virtual card
 * @param request Request with card type, PIN, and confirm PIN
 */
export async function requestVirtualCard(request: RequestVirtualCardRequest): Promise<RequestVirtualCardResponse> {
  const response = await API.post('/api/v1/cards/request-virtual', request);
  return response as RequestVirtualCardResponse;
}

/**
 * Report and replace a card
 * @param cardId Card ID to report and replace
 * @param request Request with reason and optional description
 */
export async function reportReplaceCard(cardId: string, request: ReportReplaceCardRequest): Promise<CardActionResponse> {
  const response = await API.post(`/api/v1/cards/${cardId}/report-replace`, request);
  return response as CardActionResponse;
}

/**
 * Stop (permanently close) a card
 * @param cardId Card ID to stop
 */
export async function stopCard(cardId: string): Promise<CardActionResponse> {
  const response = await API.post(`/api/v1/cards/${cardId}/stop`);
  return response as CardActionResponse;
}
