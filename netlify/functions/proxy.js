export async function handler(event) {
  // Allowed origins (localhost + Netlify)
  const allowedOrigins = [
    'http://localhost:4321', 
    'http://127.0.0.1:4321', 
    'http://localhost:8888',
    'https://walletdps.netlify.app'];
  const origin = event.headers.origin || '*';
  const allowOrigin = allowedOrigins.includes(origin) ? origin : '*';

  // Common CORS headers (used everywhere)
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'x-app-env, X-App-Env, X-App-Version, X-Requested-With, Content-Type, Authorization, Origin, Accept',
    'Access-Control-Max-Age': '86400',
  };

  // Handle preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  // Build target URL
  const targetUrl = `https://api.mytonwallet.org${event.path.replace('/.netlify/functions/proxy', '')}`;

  try {
    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: {
        ...event.headers,
        'X-App-Env': event.headers['x-app-env'] || event.headers['X-App-Env'] || 'Production',
      },
      body: event.body,
    });

    const data = await response.text();

    return {
      statusCode: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
      body: data,
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
