export type NafathStatus = 'SENT'|'UNDER_REVIEW'|'FAILED'|'REJECTED'|'RECEIVED';

export type Scenario = {
  crValid: boolean;
  localHit: boolean;
  tahaquqMatch: boolean;
  nafathSeq: NafathStatus[];
  globalHit: boolean;
  complianceApproved: boolean;
  duplicatePhone: boolean;
  otpAcceptCode: string;  // code that verifies, e.g., '1234'
  idValid: boolean;       // ID format/checksum pass
  idPhoneMismatch: boolean;
};

export const scenario: Scenario = {
  crValid: true,
  localHit: false,
  tahaquqMatch: true,
  nafathSeq: ['SENT','UNDER_REVIEW','RECEIVED'],
  globalHit: false,
  complianceApproved: true,
  duplicatePhone: false,
  otpAcceptCode: '1234',
  idValid: true,
  idPhoneMismatch: false,
};

// Console helper for manual tweaking:
(window as any).setMockScenario = (patch: Partial<Scenario>) =>
  Object.assign(scenario, patch);
