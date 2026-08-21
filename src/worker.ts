export interface Env {
  DB: D1Database; // Or your specific DB binding type
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle backend API requests with your DB binding
    if (url.pathname.startsWith("/api/")) {
      const { results } = await env.DB.prepare("SELECT * FROM your_table").all();
      return Response.json(results);
    }

    // Pass all other requests to your frontend Vite assets
    return env.ASSETS.fetch(request);
  },
};