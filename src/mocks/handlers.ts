import { http, HttpResponse } from 'msw';
import { scenario } from './scenario';

// Helper to read scenario from request headers
function readScenario(req: Request) {
  try {
    const h = req.headers.get('x-mock-scenario');
    return h ? JSON.parse(h) : {};
  } catch { 
    return {}; 
  }
}

// Helper to merge scenario with request-specific overrides
function getEffectiveScenario(req: Request) {
  return { ...scenario, ...readScenario(req) };
}

// Track Nafath request statuses
const nafathStatusMap = new Map<string, { currentIndex: number; seq: string[] }>();

// OTP handlers
export const handlers = [
  // OTP send
  http.post('/otp/send', ({ request }) => {
    console.log('MSW: Intercepted POST /otp/send', request.url)
    const s = getEffectiveScenario(request);
    if (s.duplicatePhone) {
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
    const s = getEffectiveScenario(request);
    const body = await request.json() as { code: string };
    if (body.code === s.otpAcceptCode) {
      return HttpResponse.json({ ok: true });
    }
    return HttpResponse.json(
      { error: 'INVALID_OTP' },
      { status: 400 }
    );
  }),

  // CR verification (Wathiq)
  http.get('/wathiq/cr/verify', ({ request }) => {
    const s = getEffectiveScenario(request);
    const url = new URL(request.url);
    const cr = url.searchParams.get('cr');
    
    if (s.crValid && cr && /^\d{10}$/.test(cr)) {
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
  http.get('/stitch/local-screen', ({ request }) => {
    const s = getEffectiveScenario(request);
    return HttpResponse.json({
      status: s.localHit ? 'HIT' : 'CLEAR'
    });
  }),

  // ID verification
  http.get('/id/verify', ({ request }) => {
    const s = getEffectiveScenario(request);
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    const ok = s.idValid && id && /^\d{10}$/.test(id) && /^[12]/.test(id);
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
    const s = getEffectiveScenario(request);
    const body = await request.json() as { phone: string; id: string };
    
    if (s.idPhoneMismatch) {
      return HttpResponse.json({ match: false });
    }
    return HttpResponse.json({ match: s.tahaquqMatch });
  }),

  // Nafath initiate
  http.post('/nafath/initiate', async ({ request }) => {
    const s = getEffectiveScenario(request);
    const body = await request.json() as { id: string };
    const requestId = `naf_${Date.now()}`;
    
    // Track this request's status sequence
    nafathStatusMap.set(requestId, {
      currentIndex: 0,
      seq: [...s.nafathSeq]
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
  http.post('/screening/global', ({ request }) => {
    const s = getEffectiveScenario(request);
    return HttpResponse.json({
      status: s.globalHit ? 'HIT' : 'CLEAR'
    });
  }),

  // Compliance decision
  http.get('/compliance/decision', ({ request }) => {
    const s = getEffectiveScenario(request);
    return HttpResponse.json({
      status: s.complianceApproved ? 'APPROVED' : 'REJECTED'
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
