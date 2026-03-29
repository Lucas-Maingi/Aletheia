const http = require('http');

/**
 * Simulates a Gumroad 'Ping' (Webhook) to your local server.
 * Usage: node scripts/test-gumroad.js <email> <resource_name>
 */

const targetEmail = process.argv[2] || 'test_user@example.com';
const resourceName = process.argv[3] || 'sale';

const payloadData = new URLSearchParams({
  seller_id: 'dummy_seller',
  product_id: 'aletheia_pro',
  resource_name: resourceName,
  email: targetEmail,
  price: '9900', // $99.00
  subscription_id: 'sub_test_123',
  is_recurring_charge: 'true'
});

const body = payloadData.toString();

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/webhooks/gumroad',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(body),
    // Dummy signature (usually you'd compute this via HMAC-SHA256 of the body using the Gumroad Secret)
    'X-Gumroad-Signature': 'dummy_signature_verified'
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', chunk => responseData += chunk);
  res.on('end', () => {
    console.log(`[Status Code]: ${res.statusCode}`);
    console.log(`[Response]: ${responseData}`);
  });
});

req.on('error', (e) => {
  console.error(`[Error] Request failed. Is your next.js server running on port 3000?`);
  console.error(e.message);
});

req.write(body);
req.end();
