/**
 * Central finite-state machine for onboarding flow
 * Manages state transitions with validation guards
 */

export type OnboardingStep = 
  | 'businessType'
  | 'phone'
  | 'otp'
  | 'cr'
  | 'id'
  | 'nafath'
  | 'kyb'
  | 'password'
  | 'done';

export interface OnboardingState {
  currentStep: OnboardingStep;
  completedSteps: Set<OnboardingStep>;
  data: {
    businessType?: string;
    phone?: string;
    otpVerified?: boolean;
    crNumber?: string;
    crVerified?: boolean;
    idNumber?: string;
    idVerified?: boolean;
    nafathStatus?: 'SENT' | 'UNDER_REVIEW' | 'FAILED' | 'REJECTED' | 'RECEIVED';
    kybData?: {
      annualRevenue?: string;
      businessActivity?: string;
      purposeOfAccount?: string[];
      purposeOther?: string;
      expectedVolume?: {
        payroll?: string;
        domestic?: string;
        international?: string;
        deposits?: string;
      };
    };
    passwordSet?: boolean;
  };
  validationErrors: Record<string, string>;
  isLoading: boolean;
}

export const STEP_ORDER: OnboardingStep[] = [
  'businessType',
  'phone', 
  'otp',
  'cr',
  'id',
  'nafath',
  'kyb',
  'password',
  'done'
];

export const STEP_LABELS = {
  businessType: "Select Your Business Type",
  phone: "phone number", 
  cr: "CR Number",
  id: "ID Number",
  nafath: "Nafath",
  kyb: "KYB"
} as const;

export const initialState: OnboardingState = {
  currentStep: 'businessType',
  completedSteps: new Set(),
  data: {},
  validationErrors: {},
  isLoading: false,
};

export type OnboardingAction = 
  | { type: 'SET_BUSINESS_TYPE'; payload: string }
  | { type: 'SET_PHONE'; payload: string }
  | { type: 'VERIFY_OTP_SUCCESS' }
  | { type: 'SET_CR_NUMBER'; payload: string }
  | { type: 'VERIFY_CR_SUCCESS' }
  | { type: 'SET_ID_NUMBER'; payload: string }
  | { type: 'VERIFY_ID_SUCCESS' }
  | { type: 'SET_NAFATH_STATUS'; payload: OnboardingState['data']['nafathStatus'] }
  | { type: 'SET_KYB_DATA'; payload: OnboardingState['data']['kybData'] }
  | { type: 'SET_PASSWORD_SUCCESS' }
  | { type: 'NEXT_STEP' }
  | { type: 'SET_VALIDATION_ERROR'; payload: { field: string; error: string } }
  | { type: 'CLEAR_VALIDATION_ERROR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESET_STATE' };

export function onboardingReducer(
  state: OnboardingState,
  action: OnboardingAction
): OnboardingState {
  switch (action.type) {
    case 'SET_BUSINESS_TYPE':
      return {
        ...state,
        data: { ...state.data, businessType: action.payload },
        validationErrors: { ...state.validationErrors, businessType: '' }
      };

    case 'SET_PHONE':
      return {
        ...state,
        data: { ...state.data, phone: action.payload },
        validationErrors: { ...state.validationErrors, phone: '' }
      };

    case 'VERIFY_OTP_SUCCESS':
      return {
        ...state,
        data: { ...state.data, otpVerified: true },
        completedSteps: new Set([...state.completedSteps, 'otp'])
      };

    case 'SET_CR_NUMBER':
      return {
        ...state,
        data: { ...state.data, crNumber: action.payload },
        validationErrors: { ...state.validationErrors, crNumber: '' }
      };

    case 'VERIFY_CR_SUCCESS':
      return {
        ...state,
        data: { ...state.data, crVerified: true },
        completedSteps: new Set([...state.completedSteps, 'cr'])
      };

    case 'SET_ID_NUMBER':
      return {
        ...state,
        data: { ...state.data, idNumber: action.payload },
        validationErrors: { ...state.validationErrors, idNumber: '' }
      };

    case 'VERIFY_ID_SUCCESS':
      return {
        ...state,
        data: { ...state.data, idVerified: true },
        completedSteps: new Set([...state.completedSteps, 'id'])
      };

    case 'SET_NAFATH_STATUS':
      return {
        ...state,
        data: { ...state.data, nafathStatus: action.payload },
        completedSteps: action.payload === 'RECEIVED' 
          ? new Set([...state.completedSteps, 'nafath'])
          : state.completedSteps
      };

    case 'SET_KYB_DATA':
      return {
        ...state,
        data: { ...state.data, kybData: action.payload },
        completedSteps: new Set([...state.completedSteps, 'kyb'])
      };

    case 'SET_PASSWORD_SUCCESS':
      return {
        ...state,
        data: { ...state.data, passwordSet: true },
        completedSteps: new Set([...state.completedSteps, 'password'])
      };

    case 'NEXT_STEP':
      const currentIndex = STEP_ORDER.indexOf(state.currentStep);
      const nextStep = STEP_ORDER[currentIndex + 1] || 'done';
      return {
        ...state,
        currentStep: nextStep,
        completedSteps: new Set([...state.completedSteps, state.currentStep])
      };

    case 'SET_VALIDATION_ERROR':
      return {
        ...state,
        validationErrors: {
          ...state.validationErrors,
          [action.payload.field]: action.payload.error
        }
      };

    case 'CLEAR_VALIDATION_ERROR':
      return {
        ...state,
        validationErrors: {
          ...state.validationErrors,
          [action.payload]: ''
        }
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// Guard functions for step transitions
export const canAdvanceToStep = (
  state: OnboardingState,
  targetStep: OnboardingStep
): boolean => {
  switch (targetStep) {
    case 'businessType':
      return true;
    case 'phone':
      return !!state.data.businessType;
    case 'otp':
      return !!state.data.phone;
    case 'cr':
      return !!state.data.otpVerified;
    case 'id':
      return !!state.data.crVerified;
    case 'nafath':
      return !!state.data.idVerified;
    case 'kyb':
      return state.data.nafathStatus === 'RECEIVED';
    case 'password':
      return !!state.data.kybData;
    case 'done':
      return !!state.data.passwordSet;
    default:
      return false;
  }
};
