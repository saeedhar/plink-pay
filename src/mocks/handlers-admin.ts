import { http, HttpResponse } from 'msw';
import { 
  kybOptions, 
  getKybOptionsByCategory, 
  createKybOption, 
  getNextOrderForCategory,
  type KybCategory,
  type KybOption 
} from './db-admin';

// Helper to validate admin token
function validateAdminToken(request: Request): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.substring(7);
  // For mocks, accept any token that starts with 'adm_'
  return token.startsWith('adm_');
}

// Helper to return 401 for invalid auth
function unauthorized() {
  return HttpResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}

export const adminHandlers = [
  // Admin login
  http.post('/admin/login', async ({ request }) => {
    try {
      const body = await request.json() as { email: string; password: string };
      
      if (!body.email?.trim() || !body.password?.trim()) {
        return HttpResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        );
      }

      // Mock successful login for any non-empty credentials
      const token = `adm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return HttpResponse.json({
        token,
        role: 'admin',
        name: 'Admin'
      });
    } catch {
      return HttpResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
  }),

  // Get admin profile
  http.get('/admin/me', ({ request }) => {
    if (!validateAdminToken(request)) {
      return unauthorized();
    }

    return HttpResponse.json({
      role: 'admin',
      name: 'Admin'
    });
  }),

  // Get KYB options by category
  http.get('/admin/kyb/options', ({ request }) => {
    if (!validateAdminToken(request)) {
      return unauthorized();
    }

    const url = new URL(request.url);
    const category = url.searchParams.get('category') as KybCategory;
    const locale = (url.searchParams.get('locale') as 'en' | 'ar') || 'en';

    if (!category) {
      return HttpResponse.json(
        { error: 'Category parameter is required' },
        { status: 400 }
      );
    }

    const validCategories: KybCategory[] = ['purpose_of_account', 'business_activity', 'annual_revenue'];
    if (!validCategories.includes(category)) {
      return HttpResponse.json(
        { error: 'Invalid category. Must be one of: ' + validCategories.join(', ') },
        { status: 400 }
      );
    }

    const items = getKybOptionsByCategory(category, locale);
    
    return HttpResponse.json({
      items,
      category,
      locale,
      total: items.length
    });
  }),

  // Create new KYB option
  http.post('/admin/kyb/options', async ({ request }) => {
    if (!validateAdminToken(request)) {
      return unauthorized();
    }

    try {
      const body = await request.json() as Partial<KybOption>;
      
      // Validate required fields
      if (!body.category || !body.label?.trim()) {
        return HttpResponse.json(
          { error: 'Category and label are required' },
          { status: 400 }
        );
      }

      const validCategories: KybCategory[] = ['purpose_of_account', 'business_activity', 'annual_revenue'];
      if (!validCategories.includes(body.category)) {
        return HttpResponse.json(
          { error: 'Invalid category. Must be one of: ' + validCategories.join(', ') },
          { status: 400 }
        );
      }

      // Set defaults for optional fields
      const locale = body.locale || 'en';
      const order = body.order || getNextOrderForCategory(body.category, locale);
      const active = body.active !== undefined ? body.active : true;

      const newOption = createKybOption({
        category: body.category,
        label: body.label.trim(),
        code: body.code?.trim() || undefined,
        order,
        active,
        locale
      });

      return HttpResponse.json(newOption, { status: 201 });
    } catch {
      return HttpResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
  })
];
