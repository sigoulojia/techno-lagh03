// Cloudflare Pages Function: Transparent reverse proxy to Worker backend
// Routes all /api/*, /admin/*, /orders/*, /telegram/*, /ntfy/* directly through techno-laghouat.pages.dev

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);

  const proxyPrefixes = [
    '/api',
    '/admin',
    '/orders',
    '/telegram',
    '/ntfy',
  ];

  const shouldProxy = proxyPrefixes.some(
    (prefix) => url.pathname === prefix || url.pathname.startsWith(prefix + '/')
  );

  if (shouldProxy) {
    const backendOrigin = 'https://techno-laghouat-backend.hotel-saharien.workers.dev';
    const targetUrl = new URL(url.pathname + url.search, backendOrigin);

    const reqHeaders = new Headers(context.request.headers);
    reqHeaders.set('X-Forwarded-Host', url.host);
    reqHeaders.set('X-Forwarded-Proto', url.protocol.replace(':', ''));

    const response = await fetch(targetUrl.toString(), {
      method: context.request.method,
      headers: reqHeaders,
      body: context.request.body,
      redirect: 'manual',
    });

    const resHeaders = new Headers(response.headers);
    // Rewrite redirects so Location points to techno-laghouat.pages.dev
    const location = resHeaders.get('Location');
    if (location && location.includes('hotel-saharien.workers.dev')) {
      resHeaders.set(
        'Location',
        location.replace('https://techno-laghouat-backend.hotel-saharien.workers.dev', '')
      );
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders,
    });
  }

  return context.next();
};
