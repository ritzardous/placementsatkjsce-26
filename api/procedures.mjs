// Keep the Vercel entry point independent of TypeScript transpilation.
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.statusCode = 405;
    res.end(JSON.stringify({ error: { code: 'invalid-argument', message: 'POST required.' } }));
    return;
  }
  if (!req.headers.authorization?.match(/^Bearer (\S+)$/)) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: { code: 'unauthenticated', message: 'Sign in with Google.' } }));
    return;
  }
  let implementation;
  try {
    implementation = await import('../functions/lib/functions/src/http.js');
  } catch (error) {
    console.error('Procedure API module loading failed:', error);
    res.statusCode = 503;
    // Module names help diagnose packaging; never expose credential errors.
    const missingModule = error.code === 'ERR_MODULE_NOT_FOUND'
      ? error.message.match(/Cannot find (?:package|module) '([^']+)'/)?.[1]
      : undefined;
    const startupError = error.code || error.name;
    const startupDetail = /^(?:SyntaxError|ReferenceError)$/.test(error.name)
      || /^ERR_(?:MODULE|PACKAGE|UNKNOWN_FILE_EXTENSION)/.test(error.code || '')
      ? error.message.slice(0,500) : undefined;
    res.end(JSON.stringify({ error: { code: 'unavailable', message: 'The community API could not load its server modules.', missingModule, startupError, startupDetail } }));
    return;
  }
  await implementation.default(req, res);
}
