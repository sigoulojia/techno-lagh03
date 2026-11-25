// Cloudflare Pages Function: Native edge execution of Techno Laghouat backend
// All /api/*, /admin/*, /orders/*, /telegram/*, /ntfy/* execute directly on techno-laghouat.pages.dev

import backendWorker from '../cloudflare-backend/src/index';

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);

  const backendPrefixes = [
    '/api',
    '/admin',
    '/orders',
    '/telegram',
    '/ntfy',
  ];

  const isBackendRoute = backendPrefixes.some(
    (prefix) => url.pathname === prefix || url.pathname.startsWith(prefix + '/')
  );

  if (isBackendRoute) {
    return backendWorker.fetch(context.request, context.env as any, context);
  }

  return context.next();
};
