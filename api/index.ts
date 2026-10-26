import app from '../src/server/api';

// Export handler for Vercel Serverless Function
export default function handler(req: any, res: any) {
  // If Vercel stripped /api prefix when routing to /api/index, restore it
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  return app(req, res);
}

export { handler };

