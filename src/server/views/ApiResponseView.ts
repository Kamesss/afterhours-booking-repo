export const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export class ApiResponseView {
  static json(data: unknown, status = 200, customHeaders: Record<string, string> = {}): Response {
    return Response.json(data, {
      status,
      headers: {
        ...CORS_HEADERS,
        ...customHeaders,
      },
    });
  }

  static success<T>(data: T, status = 200): Response {
    return this.json(data, status);
  }

  static created<T>(data: T): Response {
    return this.json(data, 201);
  }

  static noContent(): Response {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  static error(message = 'An error occurred', status = 400): Response {
    return this.json({ error: message, success: false }, status);
  }

  static badRequest(message = 'Invalid request parameters'): Response {
    return this.error(message, 400);
  }

  static notFound(message = 'Resource not found in D1 database'): Response {
    return this.error(message, 404);
  }

  static serverError(message = 'Internal D1 database error'): Response {
    return this.error(message, 500);
  }

  static preflight(): Response {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }
}
