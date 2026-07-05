/**
 * k6 stress test — realistic AutoMate session against the API.
 *
 *   k6 run -e API_URL=http://127.0.0.1:4000 scripts/stress/k6-api.js
 *
 * Models: signup → OTP → add vehicle → submit damage request → fetch quotes
 * → daily check-in → fetch points. 0→50 VUs over 60s, hold 50 for 4 min.
 *
 * Against staging Supabase: point the SERVER at the staging DATABASE_URL
 * (pooled, port 6543, pgbouncer) and watch the dashboard's connection count.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

const API = __ENV.API_URL || 'http://127.0.0.1:4000';

export const options = {
  stages: [
    { duration: '60s', target: 50 },
    { duration: '4m', target: 50 },
    { duration: '15s', target: 0 },
  ],
  thresholds: {
    // Reads must stay snappy; the estimate submit does AI + DB work.
    'http_req_duration{kind:read}': ['p(95)<800'],
    'http_req_duration{kind:submit}': ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
  },
};

const j = (obj) => JSON.stringify(obj);
const HDR = { 'Content-Type': 'application/json' };

export default function () {
  const email = `k6-${__VU}-${__ITER}-${Date.now()}@stress.automate`;

  let res = http.post(`${API}/auth/signup`, j({ fullName: 'K6 User', email, password: 'hunter22' }), { headers: HDR });
  check(res, { 'signup 200': (r) => r.status === 200 });

  res = http.post(`${API}/auth/verify-otp`, j({ email, code: '123456' }), { headers: HDR });
  check(res, { 'otp 200 + token': (r) => r.status === 200 && !!r.json('token') });
  const token = res.json('token');
  const auth = { headers: { ...HDR, Authorization: `Bearer ${token}` } };

  res = http.post(`${API}/profile/vehicles`, j({ name: '2019 Honda Accord EX-L', colorName: 'White' }), auth);
  check(res, { 'vehicle 200': (r) => r.status === 200 });

  res = http.post(
    `${API}/quotes/submit`,
    j({ parts: [{ part: 'Front bumper', type: 'Dent, Scratch', photos: 1 }] }),
    { ...auth, tags: { kind: 'submit' } },
  );
  check(res, { 'submit 200 + estimate': (r) => r.status === 200 && r.json('aiEstimate.priceLow') > 0 });

  res = http.get(`${API}/quotes`, { ...auth, tags: { kind: 'read' } });
  check(res, { 'quotes 200': (r) => r.status === 200 });

  res = http.post(`${API}/points/check-in`, j({}), auth);
  check(res, { 'check-in 200': (r) => r.status === 200 });

  res = http.get(`${API}/points`, { ...auth, tags: { kind: 'read' } });
  check(res, { 'points 200 + ledger consistent': (r) => r.status === 200 && r.json('balance') >= 0 });

  sleep(1);
}
