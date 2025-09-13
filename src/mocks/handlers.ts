import { http, HttpResponse } from 'msw';
import { scenario } from './scenario';

// Track Nafath request statuses
const nafathStatusMap = new Map<string, { currentIndex: number; seq: string[] }>();

// OTP handlers
export const handlers = [
  // OTP send
  http.post('/otp/send', () => {
    if (scenario.duplicatePhone) {
      return HttpResponse.json(
        { error: 'PHONE_IN_USE' },
        { status: 409 }
      );
    }
    return HttpResponse.json({
      sessionId: 'sess_abc',
      expiresAt: Date.now() + 5 * 60 * 1000
    });
  }),

  // OTP verify
  http.post('/otp/verify', async ({ request }) => {
    const body = await request.json() as { code: string };
    if (body.code === scenario.otpAcceptCode) {
      return HttpResponse.json({ ok: true });
    }
    return HttpResponse.json(
      { error: 'INVALID_OTP' },
      { status: 400 }
    );
  }),

  // CR verification (Wathiq)
  http.get('/wathiq/cr/verify', ({ request }) => {
    const url = new URL(request.url);
    const cr = url.searchParams.get('cr');
    
    if (scenario.crValid && cr && /^\d{10}$/.test(cr)) {
      return HttpResponse.json({
        valid: true,
        companyType: 'SOLE_OWNER',
        activityAllowed: true
      });
    }
    return HttpResponse.json(
      { valid: false },
      { status: 400 }
    );
  }),

  // Local screening (Stitch)
  http.get('/stitch/local-screen', () => {
    return HttpResponse.json({
      status: scenario.localHit ? 'HIT' : 'CLEAR'
    });
  }),

  // ID verification
  http.get('/id/verify', ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    const ok = scenario.idValid && id && /^\d{10}$/.test(id) && /^[12]/.test(id);
    if (ok) {
      return HttpResponse.json({ valid: true });
    }
    return HttpResponse.json(
      { valid: false },
      { status: 400 }
    );
  }),

  // Tahaquq phone-ID match
  http.post('/tahaquq/check', async ({ request }) => {
    const body = await request.json() as { phone: string; id: string };
    
    if (scenario.idPhoneMismatch) {
      return HttpResponse.json({ match: false });
    }
    return HttpResponse.json({ match: scenario.tahaquqMatch });
  }),

  // Nafath initiate
  http.post('/nafath/initiate', async ({ request }) => {
    const body = await request.json() as { id: string };
    const requestId = `naf_${Date.now()}`;
    
    // Track this request's status sequence
    nafathStatusMap.set(requestId, {
      currentIndex: 0,
      seq: [...scenario.nafathSeq]
    });
    
    return HttpResponse.json({
      requestId,
      deepLink: `https://nafath.example/${body.id}/${requestId}`,
      expiresAt: Date.now() + 90 * 1000
    });
  }),

  // Nafath status
  http.get('/nafath/status', ({ request }) => {
    const url = new URL(request.url);
    const requestId = url.searchParams.get('requestId');
    
    if (!requestId) {
      return HttpResponse.json(
        { error: 'Missing requestId' },
        { status: 400 }
      );
    }
    
    const statusInfo = nafathStatusMap.get(requestId);
    if (!statusInfo) {
      return HttpResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }
    
    const { currentIndex, seq } = statusInfo;
    const status = seq[currentIndex];
    
    // Move to next status, but stay on last item
    if (currentIndex < seq.length - 1) {
      statusInfo.currentIndex++;
    }
    
    return HttpResponse.json({
      status,
      requestId
    });
  }),

  // Global screening
  http.post('/screening/global', () => {
    return HttpResponse.json({
      status: scenario.globalHit ? 'HIT' : 'CLEAR'
    });
  }),

  // Compliance decision
  http.get('/compliance/decision', () => {
    return HttpResponse.json({
      status: scenario.complianceApproved ? 'APPROVED' : 'REJECTED'
    });
  }),

  // KYB submit
  http.post('/kyb/submit', () => {
    return HttpResponse.json({
      riskRating: 'LOW',
      nextStep: 'password'
    });
  }),

  // Password set
  http.post('/password/set', () => {
    return HttpResponse.json({ ok: true });
  }),
];
