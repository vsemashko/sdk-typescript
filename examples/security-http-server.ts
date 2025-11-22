/**
 * Example: Secure HTTP Server with Security Headers
 *
 * This example demonstrates how to create a secure HTTP server with proper
 * security headers, request validation, and error handling.
 *
 * Security headers help protect against common web vulnerabilities including:
 * - Cross-Site Scripting (XSS)
 * - Clickjacking
 * - MIME type sniffing
 * - Information leakage
 *
 * @module
 */

import * as http from 'http';
import {
  maskSensitiveData,
  sanitizeErrorMessage,
  validateInputLength,
  isValidUri,
} from '@temporalio/common';

/**
 * Security headers configuration
 */
const SECURITY_HEADERS = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // Enable XSS protection in older browsers
  'X-XSS-Protection': '1; mode=block',

  // Enforce HTTPS (adjust max-age as needed)
  // Uncomment when using HTTPS
  // 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',

  // Content Security Policy - adjust based on your needs
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join('; '),

  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions policy (formerly Feature-Policy)
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',

  // Remove server information
  'X-Powered-By': '',
};

/**
 * Request rate limiting (simple in-memory implementation)
 */
class RateLimiter {
  private requests = new Map<string, number[]>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs = 60000, maxRequests = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Cleanup old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];

    // Filter out old requests
    const recentRequests = requests.filter((time) => now - time < this.windowMs);

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [identifier, requests] of this.requests.entries()) {
      const recentRequests = requests.filter((time) => now - time < this.windowMs);
      if (recentRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, recentRequests);
      }
    }
  }
}

/**
 * Secure HTTP server class
 */
class SecureHTTPServer {
  private server: http.Server;
  private rateLimiter: RateLimiter;

  constructor(private port: number = 3000) {
    this.rateLimiter = new RateLimiter(60000, 100); // 100 requests per minute
    this.server = http.createServer(this.handleRequest.bind(this));
  }

  /**
   * Handle incoming HTTP requests with security measures
   */
  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    try {
      // 1. Set security headers
      this.setSecurityHeaders(res);

      // 2. Get client identifier for rate limiting
      const clientId = this.getClientIdentifier(req);

      // 3. Rate limiting
      if (!this.rateLimiter.isAllowed(clientId)) {
        this.sendResponse(res, 429, {
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
        });
        return;
      }

      // 4. Validate request
      if (!this.validateRequest(req)) {
        this.sendResponse(res, 400, {
          error: 'Bad Request',
          message: 'Invalid request',
        });
        return;
      }

      // 5. Route handling
      await this.handleRoute(req, res);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Set security headers on response
   */
  private setSecurityHeaders(res: http.ServerResponse): void {
    for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
      if (value) {
        res.setHeader(header, value);
      }
    }
  }

  /**
   * Get client identifier for rate limiting
   */
  private getClientIdentifier(req: http.IncomingMessage): string {
    // In production, consider using X-Forwarded-For with validation
    return req.socket.remoteAddress || 'unknown';
  }

  /**
   * Validate incoming request
   */
  private validateRequest(req: http.IncomingMessage): boolean {
    // 1. Validate URL length
    if (!req.url || !isValidUri(req.url, 2048)) {
      return false;
    }

    // 2. Validate method
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
    if (!req.method || !allowedMethods.includes(req.method)) {
      return false;
    }

    // 3. Validate headers
    const contentLength = req.headers['content-length'];
    if (contentLength && parseInt(contentLength) > 10_000_000) {
      // 10MB limit
      return false;
    }

    return true;
  }

  /**
   * Handle routing
   */
  private async handleRoute(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    switch (url.pathname) {
      case '/health':
        this.handleHealth(req, res);
        break;

      case '/api/workflow':
        await this.handleWorkflow(req, res);
        break;

      default:
        this.sendResponse(res, 404, {
          error: 'Not Found',
          message: 'The requested resource was not found',
        });
    }
  }

  /**
   * Health check endpoint
   */
  private handleHealth(req: http.IncomingMessage, res: http.ServerResponse): void {
    this.sendResponse(res, 200, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Example workflow endpoint
   */
  private async handleWorkflow(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    if (req.method !== 'POST') {
      this.sendResponse(res, 405, {
        error: 'Method Not Allowed',
        message: 'Only POST requests are allowed',
      });
      return;
    }

    try {
      // Read and validate request body
      const body = await this.readBody(req);

      // Parse JSON
      const data = JSON.parse(body);

      // Validate input
      if (data.workflowId) {
        validateInputLength(data.workflowId, 256, 'Workflow ID');
      }

      // Log request (with sensitive data masked)
      const maskedData = maskSensitiveData(data);
      console.log('Workflow request:', maskedData);

      // Process workflow...
      // const result = await startWorkflow(data);

      this.sendResponse(res, 200, {
        success: true,
        message: 'Workflow started',
        // workflowId: result.workflowId,
      });
    } catch (error) {
      if (error instanceof SyntaxError) {
        this.sendResponse(res, 400, {
          error: 'Bad Request',
          message: 'Invalid JSON',
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * Read request body with size limit
   */
  private readBody(req: http.IncomingMessage, maxSize = 10_000_000): Promise<string> {
    return new Promise((resolve, reject) => {
      let body = '';
      let size = 0;

      req.on('data', (chunk: Buffer) => {
        size += chunk.length;

        if (size > maxSize) {
          req.destroy();
          reject(new Error('Request body too large'));
          return;
        }

        body += chunk.toString();
      });

      req.on('end', () => {
        resolve(body);
      });

      req.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Send JSON response
   */
  private sendResponse(res: http.ServerResponse, statusCode: number, data: any): void {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  }

  /**
   * Handle errors securely
   */
  private handleError(error: unknown, res: http.ServerResponse): void {
    console.error('Server error:', sanitizeErrorMessage(error as Error));

    // Don't expose internal error details to clients
    this.sendResponse(res, 500, {
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  }

  /**
   * Start the server
   */
  start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        console.log(`Secure HTTP server listening on port ${this.port}`);
        console.log(`Health check: http://localhost:${this.port}/health`);
        resolve();
      });
    });
  }

  /**
   * Stop the server
   */
  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.close((error) => {
        if (error) {
          reject(error);
        } else {
          console.log('Server stopped');
          resolve();
        }
      });
    });
  }
}

/**
 * Example usage
 */
async function main() {
  const server = new SecureHTTPServer(3000);
  await server.start();

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

export { SecureHTTPServer, SECURITY_HEADERS };
