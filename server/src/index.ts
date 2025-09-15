import { prisma } from './prisma';
import { PORT } from './env';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { z } from 'zod';

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

// --- Admin auth (simple) ---
const AdminLoginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

app.post('/api/admin/login', async (req, reply) => {
  const body = AdminLoginBody.parse(req.body);
  const token = 'adm_' + Buffer.from(body.email).toString('base64');
  return reply.send({ token, role: 'admin', name: 'Saeed Aburahma' });
});

app.get('/api/admin/me', async (req, reply) => {
  const auth = (req.headers.authorization ?? '').replace('Bearer ','');
  if (!auth.startsWith('adm_')) return reply.code(401).send({ error: 'UNAUTHORIZED' });
  return reply.send({ role: 'admin', name: 'Saeed Aburahma' });
});

// --- Admin KYB Options (protected) ---
function assertAdmin(req:any, reply:any) {
  const auth = (req.headers.authorization ?? '').replace('Bearer ','');
  if (!auth.startsWith('adm_')) {
    reply.code(401).send({ error: 'UNAUTHORIZED' });
    return false;
  }
  return true;
}

const Categories = ['purpose_of_account','business_activity','annual_revenue'] as const;
type Category = (typeof Categories)[number];

app.get('/api/admin/kyb/options', async (req, reply) => {
  if (!assertAdmin(req, reply)) return;
  const url = new URL(req.url, 'http://x');
  const category = url.searchParams.get('category') as Category | null;
  const locale = url.searchParams.get('locale') || 'en';
  if (!category || !Categories.includes(category)) {
    return reply.code(400).send({ error: 'INVALID_CATEGORY' });
  }
  const items = await prisma.kybOption.findMany({
    where: { category, locale },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }]
  });
  return reply.send({ items });
});

const CreateBody = z.object({
  category: z.enum(['purpose_of_account','business_activity','annual_revenue']),
  label: z.string().min(1),
  code: z.string().optional(),
  order: z.number().int().nonnegative().optional(),
  active: z.boolean().optional(),
  locale: z.string().default('en')
});

app.post('/api/admin/kyb/options', async (req, reply) => {
  if (!assertAdmin(req, reply)) return;
  const body = CreateBody.parse(req.body);
  const count = await prisma.kybOption.count({ where: { category: body.category, locale: body.locale } });
  const created = await prisma.kybOption.create({
    data: {
      category: body.category,
      label: body.label,
      code: body.code,
      order: body.order ?? count + 1,
      active: body.active ?? true,
      locale: body.locale
    }
  });
  return reply.code(201).send(created);
});

// --- Public read endpoint for customer KYB page (no auth) ---
app.get('/api/kyb/options', async (req, reply) => {
  const url = new URL(req.url, 'http://x');
  const category = url.searchParams.get('category') as Category | null;
  const locale = url.searchParams.get('locale') || 'en';
  if (!category || !Categories.includes(category)) {
    return reply.code(400).send({ error: 'INVALID_CATEGORY' });
  }
  const items = await prisma.kybOption.findMany({
    where: { category, locale, active: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }]
  });
  return reply.send({ items });
});

app.listen({ port: PORT }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Server running at ${address}`);
});
