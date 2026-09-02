import { createApiApp } from '../server/app';

// Vercel serverless function entry point.
// All /api/* requests are rewritten here by vercel.json; the Express app
// handles internal routing. The built frontend is served as static assets
// by Vercel directly from the dist/ output directory.
export default createApiApp();
