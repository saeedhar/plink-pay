export type NafathStatus = 'SENT'|'UNDER_REVIEW'|'FAILED'|'REJECTED'|'RECEIVED';

export type Scenario = {
  crValid: boolean;
  localHit: boolean;
  tahaquqMatch: boolean;
  nafathSeq: NafathStatus[];
  globalHit: boolean;
  complianceApproved: boolean;
  duplicatePhone: boolean;
  otpAcceptCode: string;
  idValid: boolean;
  idPhoneMismatch: boolean;
};

export function applyScenarioPatch(patch: Partial<Scenario>) {
  const g = (window as any).__MOCK_SCENARIO__ ?? {};
  const next = { ...g, ...patch };
  (window as any).__MOCK_SCENARIO__ = next;
  if (typeof (window as any).setMockScenario === 'function') {
    (window as any).setMockScenario(patch);
  }
  
  // Trigger custom event to notify components
  window.dispatchEvent(new CustomEvent('mockScenarioChanged'));
}

export function getScenarioHeader(): string {
  const g = (window as any).__MOCK_SCENARIO__ ?? {};
  return JSON.stringify(g);
}

export function resetScenario(defaults: Partial<Scenario> = {}) {
  (window as any).__MOCK_SCENARIO__ = { ...defaults };
  if (typeof (window as any).setMockScenario === 'function') {
    (window as any).setMockScenario(defaults);
  }
}
