import app from '../src/server/api.js';

// Vercel Serverless Function entry point for Express
export default app;
export const handler = app;

