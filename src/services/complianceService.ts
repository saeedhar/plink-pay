/**
 * Global Screening & Compliance Service
 * Implements BRD requirements for compliance checks and decision workflow
 */

import { globalCache } from './cacheService';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface GlobalScreeningRequest {
  firstName: string;
  lastName: string;
  idNumber: string;
  phoneNumber: string;
  dateOfBirth?: string;
  nationality?: string;
  businessName?: string;
  crNumber?: string;
}

export interface GlobalScreeningResult {
  isClean: boolean;
  riskScore: number; // 0-1 scale
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  matches: ScreeningMatch[];
  categories: string[];
  lastUpdated: string;
}

export interface ScreeningMatch {
  id: string;
  source: string;
  category: 'PEP' | 'SANCTIONS' | 'ADVERSE_MEDIA' | 'WATCHLIST';
  confidence: number; // 0-100
  description: string;
  details: {
    name: string;
    aliases?: string[];
    dateOfBirth?: string;
    nationality?: string;
    positions?: string[];
    sanctions?: string[];
  };
}

export interface ComplianceSubmission {
  customerData: GlobalScreeningRequest;
  screeningResult: GlobalScreeningResult;
  kybData: any;
  documents: ComplianceDocument[];
  riskAssessment: RiskAssessment;
  submittedAt: string;
  submittedBy: string;
}

export interface ComplianceDocument {
  type: 'ID' | 'CR_CERTIFICATE' | 'NAFATH_VERIFICATION' | 'BANK_STATEMENT' | 'OTHER';
  url: string;
  filename: string;
  size: number;
  uploadedAt: string;
  verified: boolean;
}

export interface RiskAssessment {
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  factors: RiskFactor[];
  mitigationActions: string[];
  reviewRequired: boolean;
  approvalLevel: 'AUTO' | 'LEVEL_1' | 'LEVEL_2' | 'SENIOR';
}

export interface RiskFactor {
  category: string;
  description: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  score: number;
}

export interface ComplianceDecision {
  id: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'UNDER_REVIEW';
  riskScore: number;
  requiresManualReview: boolean;
  decision: {
    outcome: 'APPROVE' | 'REJECT' | 'ESCALATE';
    reason: string;
    conditions?: string[];
    validUntil?: string;
  };
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}

// ==========================================
// GLOBAL SCREENING SERVICE
// ==========================================

export class GlobalScreeningService {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = '/api/compliance') {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Perform global screening check
   */
  async performScreening(request: GlobalScreeningRequest): Promise<GlobalScreeningResult> {
    const cacheKey = `screening:${this.generateScreeningKey(request)}`;
    
    // Check cache first (valid for 24 hours)
    const cached = globalCache.get<GlobalScreeningResult>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Simulate API call to screening provider
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const result = await this.simulateScreeningResult(request);
      
      // Cache result for 24 hours
      globalCache.set(cacheKey, result, 24 * 60 * 60 * 1000);
      
      return result;
    } catch (error) {
      console.error('Global screening failed:', error);
      throw new Error('Screening service temporarily unavailable');
    }
  }

  /**
   * Generate cache key for screening request
   */
  private generateScreeningKey(request: GlobalScreeningRequest): string {
    return btoa(JSON.stringify({
      name: `${request.firstName} ${request.lastName}`,
      id: request.idNumber,
      dob: request.dateOfBirth || '',
    }));
  }

  /**
   * Simulate screening result for demo
   */
  private async simulateScreeningResult(request: GlobalScreeningRequest): Promise<GlobalScreeningResult> {
    // Simulate different risk levels based on name/data
    const riskWords = ['sanction', 'pep', 'watchlist', 'terrorist', 'embargo'];
    const fullName = `${request.firstName} ${request.lastName}`.toLowerCase();
    
    const hasRiskIndicator = riskWords.some(word => fullName.includes(word));
    const randomRisk = Math.random();
    
    let riskScore = 0.1 + (randomRisk * 0.2); // Base low risk
    let matches: ScreeningMatch[] = [];
    
    if (hasRiskIndicator || randomRisk > 0.95) {
      // High risk case
      riskScore = 0.7 + (randomRisk * 0.3);
      matches = [
        {
          id: 'match_001',
          source: 'OFAC_SDN',
          category: 'SANCTIONS',
          confidence: 85,
          description: 'Potential match found in sanctions list',
          details: {
            name: `${request.firstName} ${request.lastName}`,
            dateOfBirth: request.dateOfBirth,
            nationality: request.nationality || 'Unknown',
            sanctions: ['OFAC SDN List']
          }
        }
      ];
    } else if (randomRisk > 0.85) {
      // Medium risk case
      riskScore = 0.4 + (randomRisk * 0.2);
      matches = [
        {
          id: 'match_002',
          source: 'PEP_DATABASE',
          category: 'PEP',
          confidence: 65,
          description: 'Potential PEP match requiring review',
          details: {
            name: `${request.firstName} ${request.lastName}`,
            positions: ['Government Official'],
            nationality: request.nationality || 'Unknown'
          }
        }
      ];
    }

    const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 
      riskScore >= 0.7 ? 'HIGH' : 
      riskScore >= 0.4 ? 'MEDIUM' : 'LOW';

    return {
      isClean: matches.length === 0,
      riskScore,
      riskLevel,
      matches,
      categories: matches.map(m => m.category),
      lastUpdated: new Date().toISOString()
    };
  }
}

// ==========================================
// COMPLIANCE SERVICE
// ==========================================

export class ComplianceService {
  private apiBaseUrl: string;
  private screeningService: GlobalScreeningService;

  constructor(apiBaseUrl: string = '/api/compliance') {
    this.apiBaseUrl = apiBaseUrl;
    this.screeningService = new GlobalScreeningService();
  }

  /**
   * Submit compliance package for review
   */
  async submitCompliance(submission: ComplianceSubmission): Promise<{ submissionId: string }> {
    try {
      // Simulate API submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const submissionId = `COMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Cache submission for tracking
      globalCache.set(`submission:${submissionId}`, submission, 24 * 60 * 60 * 1000);
      
      return { submissionId };
    } catch (error) {
      console.error('Compliance submission failed:', error);
      throw new Error('Failed to submit compliance package');
    }
  }

  /**
   * Get compliance decision
   */
  async getComplianceDecision(submissionId: string): Promise<ComplianceDecision> {
    const cacheKey = `decision:${submissionId}`;
    
    // Check cache first
    const cached = globalCache.get<ComplianceDecision>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const decision = await this.simulateComplianceDecision(submissionId);
      
      // Cache decision
      globalCache.set(cacheKey, decision, 60 * 60 * 1000); // 1 hour
      
      return decision;
    } catch (error) {
      console.error('Failed to get compliance decision:', error);
      throw new Error('Decision service temporarily unavailable');
    }
  }

  /**
   * Perform risk assessment
   */
  async performRiskAssessment(
    customerData: GlobalScreeningRequest,
    screeningResult: GlobalScreeningResult,
    kybData: any
  ): Promise<RiskAssessment> {
    const factors: RiskFactor[] = [];
    let totalScore = 0;

    // Screening risk factors
    if (screeningResult.riskLevel === 'HIGH') {
      factors.push({
        category: 'SCREENING',
        description: 'High-risk screening matches found',
        impact: 'HIGH',
        score: 30
      });
      totalScore += 30;
    } else if (screeningResult.riskLevel === 'MEDIUM') {
      factors.push({
        category: 'SCREENING',
        description: 'Medium-risk screening indicators',
        impact: 'MEDIUM',
        score: 15
      });
      totalScore += 15;
    }

    // Business activity risk
    const highRiskActivities = ['money-service', 'crypto', 'gambling', 'precious-metals'];
    if (kybData?.businessActivity && highRiskActivities.includes(kybData.businessActivity)) {
      factors.push({
        category: 'BUSINESS_ACTIVITY',
        description: 'High-risk business activity',
        impact: 'HIGH',
        score: 20
      });
      totalScore += 20;
    }

    // Transaction volume risk
    if (kybData?.annualRevenue === 'above-10m') {
      factors.push({
        category: 'TRANSACTION_VOLUME',
        description: 'High transaction volume expected',
        impact: 'MEDIUM',
        score: 10
      });
      totalScore += 10;
    }

    const overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 
      totalScore >= 40 ? 'HIGH' : 
      totalScore >= 20 ? 'MEDIUM' : 'LOW';

    const approvalLevel: 'AUTO' | 'LEVEL_1' | 'LEVEL_2' | 'SENIOR' = 
      overallRisk === 'HIGH' ? 'SENIOR' :
      overallRisk === 'MEDIUM' ? 'LEVEL_2' : 
      totalScore > 10 ? 'LEVEL_1' : 'AUTO';

    return {
      overallRisk,
      factors,
      mitigationActions: this.getMitigationActions(factors),
      reviewRequired: overallRisk !== 'LOW',
      approvalLevel
    };
  }

  /**
   * Get mitigation actions based on risk factors
   */
  private getMitigationActions(factors: RiskFactor[]): string[] {
    const actions: string[] = [];

    factors.forEach(factor => {
      switch (factor.category) {
        case 'SCREENING':
          if (factor.impact === 'HIGH') {
            actions.push('Enhanced due diligence required');
            actions.push('Senior management approval needed');
          } else {
            actions.push('Additional documentation review');
          }
          break;
        case 'BUSINESS_ACTIVITY':
          actions.push('Continuous monitoring required');
          actions.push('Transaction limit restrictions');
          break;
        case 'TRANSACTION_VOLUME':
          actions.push('Enhanced transaction monitoring');
          actions.push('Regular compliance reviews');
          break;
      }
    });

    return [...new Set(actions)]; // Remove duplicates
  }

  /**
   * Simulate compliance decision for demo
   */
  private async simulateComplianceDecision(submissionId: string): Promise<ComplianceDecision> {
    const submission = globalCache.get<ComplianceSubmission>(`submission:${submissionId}`);
    
    if (!submission) {
      throw new Error('Submission not found');
    }

    const { riskAssessment, screeningResult } = submission;
    
    // Auto-approve low risk
    if (riskAssessment.overallRisk === 'LOW' && screeningResult.isClean) {
      return {
        id: `DEC_${submissionId}`,
        status: 'APPROVED',
        riskScore: screeningResult.riskScore,
        requiresManualReview: false,
        decision: {
          outcome: 'APPROVE',
          reason: 'Low risk profile - auto-approved',
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
        },
        reviewedBy: 'SYSTEM',
        reviewedAt: new Date().toISOString()
      };
    }

    // Medium/High risk requires review
    return {
      id: `DEC_${submissionId}`,
      status: 'UNDER_REVIEW',
      riskScore: screeningResult.riskScore,
      requiresManualReview: true,
      decision: {
        outcome: 'ESCALATE',
        reason: `${riskAssessment.overallRisk} risk profile requires manual review`,
      },
      notes: `Escalated for ${riskAssessment.approvalLevel} level review`
    };
  }
}

// Export singleton instances
export const globalScreeningService = new GlobalScreeningService();
export const complianceService = new ComplianceService();
