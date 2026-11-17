const isDevelopment = process.env.NODE_ENV !== 'production';

function buildContentSecurityPolicy() {
  const scriptSrc = ["'self'", "'unsafe-inline'", 'https://www.googletagmanager.com'];
  const connectSrc = [
    "'self'",
    'https://*.google-analytics.com',
    'https://*.analytics.google.com',
    'https://www.googletagmanager.com',
  ];

  if (isDevelopment) {
    scriptSrc.push("'unsafe-eval'");
    connectSrc.push('ws:');
  }

  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://tracker.metricool.com https://www.google-analytics.com https://www.googletagmanager.com",
    "font-src 'self'",
    `connect-src ${connectSrc.join(' ')}`,
    'frame-src https://www.youtube.com https://www.youtube-nocookie.com',
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Content-Security-Policy-Report-Only', value: buildContentSecurityPolicy() },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

module.exports = nextConfig;
