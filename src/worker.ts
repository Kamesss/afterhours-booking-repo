/**
 * Cloudflare Worker for AfterHours Cebu Club Booking
 * Refactored strictly into standard MVC (Model-View-Controller) Architecture
 *
 * Models:      /src/server/models/*      (D1 Database queries & transactions)
 * Views:       /src/server/views/*       (JSON serializers & HTTP presentation)
 * Controllers: /src/server/controllers/* (Request logic, params validation, error handling)
 * Router:      /src/server/routes/*      (HTTP route matching & dispatch)
 */

import { Env } from './types';
import { AppRouter } from './server/routes/Router';
import { ApiResponseView } from './server/views/ApiResponseView';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 1. CORS Preflight handling
    if (request.method === 'OPTIONS') {
      return ApiResponseView.preflight();
    }

    // 2. Handle API routes using MVC Architecture
    if (url.pathname.startsWith('/api/') || url.pathname === '/api') {
      if (!env.DB) {
        return ApiResponseView.serverError(
          "D1 database binding 'DB' is missing. In Cloudflare Dashboard: Settings > Bindings > Add D1 Database with variable name 'DB'."
        );
      }

      const router = new AppRouter(env.DB);
      await router.initSchema();
      return router.dispatch(request);
    }

    // 3. Static Assets serving if bound (e.g. in Cloudflare Pages / Workers with Assets)
    if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      return await env.ASSETS.fetch(request);
    }

    // 4. Default Root response when accessed as pure Worker API
    if (url.pathname === '/' || url.pathname === '') {
      if (env.DB) {
        const router = new AppRouter(env.DB);
        return router.dispatch(request);
      }

      return ApiResponseView.success({
        status: 'online',
        architecture: 'MVC (Model-View-Controller)',
        service: 'AfterHours Cebu Club D1 API Worker',
        database: 'club_booking_db',
        endpoints: [
          '/api/d1-dump',
          '/api/clubs',
          '/api/table_types',
          '/api/club_tables',
          '/api/users',
          '/api/bookings',
          '/api/guest_list',
          '/api/verify-pass',
        ],
      });
    }

    return ApiResponseView.notFound(`Path '${url.pathname}' not found`);
  },
};
