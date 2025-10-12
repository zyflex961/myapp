export async function handler(event) {
  // ✅ Universal allowed origins (localhost + production)
  const allowedOrigins = [
    'http://localhost:4321',
    'http://localhost:8888',
    'https://walletdps.netlify.app',
    'https://walletdps.netlify.com',
  ];

  const origin = event.headers.origin || '';
  const allowOrigin = allowedOrigins.includes(origin) ? origin : '*';

  // ✅ Handle CORS preflight (OPTIONS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers':
          'X-App-Env, X-App-Version, X-Requested-With, Content-Type, Authorization, Origin, Accept',
        'Access-Control-Max-Age': '86400',
      },
      body: '',
    };
  }

  // ✅ Build target URL
  const targetUrl = `https://api.mytonwallet.org${event.path.replace('/.netlify/functions/proxy', '')}`;

  try {
    // ✅ Forward request to external API
    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: {
        ...event.headers,
        'X-App-Env': event.headers['x-app-env'] || event.headers['X-App-Env'] || 'Production',
      },
      body: event.body,
    });

    // ✅ Read response body
    const data = await response.text();

    // ✅ Send back the response
    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers':
          'X-App-Env, X-App-Version, X-Requested-With, Content-Type, Authorization, Origin, Accept',
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
      body: data,
    };
  } catch (error) {
    // ✅ Error handler
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': allowOrigin,
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
}