import app from '../src/server/api.js';

export default function handler(req: any, res: any) {
  return app(req, res);
}
