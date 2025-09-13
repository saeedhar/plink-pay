/**
 * Multi-Factor Authentication Service
 * Implements BRD requirements for MFA with feature flags (OTP + WebAuthn)
 */

export interface MFAConfig {
  otpEnabled: boolean;
  webAuthnEnabled: boolean;
  backupCodesEnabled: boolean;
  requireMFAForSensitiveActions: boolean;
}

export interface OTPSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface WebAuthnCredential {
  id: string;
  publicKey: ArrayBuffer;
  counter: number;
  createdAt: string;
  lastUsed?: string;
  name?: string;
}

export interface MFAStatus {
  isEnabled: boolean;
  methods: {
    otp: boolean;
    webauthn: boolean;
    backupCodes: boolean;
  };
  lastVerified?: string;
}

export class MFAService {
  private config: MFAConfig;
  private isWebAuthnSupported: boolean;

  constructor(config: Partial<MFAConfig> = {}) {
    this.config = {
      otpEnabled: false, // Feature flag - disabled by default
      webAuthnEnabled: false, // Feature flag - disabled by default
      backupCodesEnabled: false,
      requireMFAForSensitiveActions: false,
      ...config
    };

    this.isWebAuthnSupported = this.checkWebAuthnSupport();
  }

  /**
   * Check if WebAuthn is supported in current browser
   */
  private checkWebAuthnSupport(): boolean {
    return !!(
      window.PublicKeyCredential &&
      navigator.credentials &&
      navigator.credentials.create &&
      navigator.credentials.get
    );
  }

  /**
   * Get MFA configuration (respects feature flags)
   */
  getConfig(): MFAConfig {
    return {
      ...this.config,
      webAuthnEnabled: this.config.webAuthnEnabled && this.isWebAuthnSupported
    };
  }

  /**
   * Check if MFA is required for current action
   */
  isMFARequired(action: 'login' | 'password_change' | 'sensitive_data' | 'transaction'): boolean {
    if (!this.config.requireMFAForSensitiveActions) {
      return false; // Feature disabled
    }

    const sensitiveActions = ['password_change', 'sensitive_data', 'transaction'];
    return sensitiveActions.includes(action);
  }

  /**
   * Get user's MFA status
   */
  async getMFAStatus(userId: string): Promise<MFAStatus> {
    // In real implementation, this would call backend API
    // For demo, return based on feature flags
    return {
      isEnabled: this.config.otpEnabled || this.config.webAuthnEnabled,
      methods: {
        otp: this.config.otpEnabled,
        webauthn: this.config.webAuthnEnabled && this.isWebAuthnSupported,
        backupCodes: this.config.backupCodesEnabled
      }
    };
  }

  /**
   * Setup OTP authentication
   */
  async setupOTP(userId: string): Promise<OTPSetup> {
    if (!this.config.otpEnabled) {
      throw new Error('OTP authentication is not enabled');
    }

    // Simulate OTP setup
    await new Promise(resolve => setTimeout(resolve, 1000));

    const secret = this.generateSecret();
    const qrCodeUrl = this.generateQRCodeUrl(userId, secret);
    const backupCodes = this.generateBackupCodes();

    return {
      secret,
      qrCodeUrl,
      backupCodes
    };
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(userId: string, code: string): Promise<boolean> {
    if (!this.config.otpEnabled) {
      throw new Error('OTP authentication is not enabled');
    }

    // Simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 500));

    // For demo, accept any 6-digit code
    return /^\d{6}$/.test(code);
  }

  /**
   * Setup WebAuthn authentication
   */
  async setupWebAuthn(userId: string, credentialName?: string): Promise<WebAuthnCredential> {
    if (!this.config.webAuthnEnabled) {
      throw new Error('WebAuthn is not enabled');
    }

    if (!this.isWebAuthnSupported) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    try {
      // Create credential options
      const createOptions: CredentialCreationOptions = {
        publicKey: {
          challenge: new Uint8Array(32), // In real app, get from server
          rp: {
            name: 'Plink Pay',
            id: window.location.hostname
          },
          user: {
            id: new TextEncoder().encode(userId),
            name: userId,
            displayName: credentialName || 'User'
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' }, // ES256
            { alg: -257, type: 'public-key' } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'preferred'
          },
          timeout: 60000,
          attestation: 'direct'
        }
      };

      // Create credential
      const credential = await navigator.credentials.create(createOptions) as PublicKeyCredential;
      
      if (!credential) {
        throw new Error('Failed to create WebAuthn credential');
      }

      // In real app, send credential to server for verification and storage
      const webAuthnCredential: WebAuthnCredential = {
        id: credential.id,
        publicKey: credential.response.publicKey || new ArrayBuffer(0),
        counter: 0,
        createdAt: new Date().toISOString(),
        name: credentialName
      };

      return webAuthnCredential;
    } catch (error) {
      console.error('WebAuthn setup failed:', error);
      throw new Error('Failed to setup WebAuthn authentication');
    }
  }

  /**
   * Verify WebAuthn authentication
   */
  async verifyWebAuthn(userId: string, credentialId?: string): Promise<boolean> {
    if (!this.config.webAuthnEnabled) {
      throw new Error('WebAuthn is not enabled');
    }

    if (!this.isWebAuthnSupported) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    try {
      // Get assertion options
      const getOptions: CredentialRequestOptions = {
        publicKey: {
          challenge: new Uint8Array(32), // In real app, get from server
          timeout: 60000,
          userVerification: 'preferred',
          allowCredentials: credentialId ? [{
            id: new TextEncoder().encode(credentialId),
            type: 'public-key'
          }] : undefined
        }
      };

      // Get assertion
      const assertion = await navigator.credentials.get(getOptions) as PublicKeyCredential;
      
      if (!assertion) {
        return false;
      }

      // In real app, send assertion to server for verification
      return true;
    } catch (error) {
      console.error('WebAuthn verification failed:', error);
      return false;
    }
  }

  /**
   * Generate backup codes
   */
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    if (!this.config.backupCodesEnabled) {
      throw new Error('Backup codes are not enabled');
    }

    // Simulate backup code verification
    await new Promise(resolve => setTimeout(resolve, 300));

    // For demo, accept any 8-character alphanumeric code
    return /^[A-Z0-9]{8}$/.test(code.toUpperCase());
  }

  /**
   * Enable MFA feature flags (for admin/config)
   */
  enableMFA(options: Partial<MFAConfig>): void {
    this.config = { ...this.config, ...options };
    console.log('MFA configuration updated:', this.config);
  }

  /**
   * Disable MFA feature flags
   */
  disableMFA(): void {
    this.config = {
      otpEnabled: false,
      webAuthnEnabled: false,
      backupCodesEnabled: false,
      requireMFAForSensitiveActions: false
    };
    console.log('MFA disabled');
  }

  /**
   * Generate OTP secret (base32)
   */
  private generateSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  /**
   * Generate QR code URL for OTP setup
   */
  private generateQRCodeUrl(userId: string, secret: string): string {
    const issuer = 'Plink Pay';
    const label = `${issuer}:${userId}`;
    const params = new URLSearchParams({
      secret,
      issuer,
      algorithm: 'SHA1',
      digits: '6',
      period: '30'
    });
    
    return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
  }
}

// Export singleton instance with feature flags disabled by default
export const mfaService = new MFAService({
  otpEnabled: false, // Will be enabled when ready
  webAuthnEnabled: false, // Will be enabled when ready
  backupCodesEnabled: false,
  requireMFAForSensitiveActions: false
});
