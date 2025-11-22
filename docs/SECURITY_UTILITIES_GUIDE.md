# Security Utilities Guide

This guide provides examples and best practices for using the security utilities provided by the Temporal TypeScript SDK.

## Overview

The `@temporalio/common` package includes a comprehensive set of security utilities to help you:

- **Mask sensitive data** in logs and error messages
- **Validate input** to prevent injection attacks
- **Sanitize errors** to prevent information disclosure
- **Protect credentials** during debugging and monitoring

## Installation

The security utilities are part of `@temporalio/common`:

```typescript
import {
  maskSensitiveString,
  maskSensitiveData,
  maskAuthorizationHeader,
  sanitizeErrorMessage,
  validateInputLength,
  isValidUri,
} from '@temporalio/common';
```

---

## API Reference

### `maskSensitiveString()`

Masks sensitive string values while preserving a few characters for debugging.

**Signature:**
```typescript
function maskSensitiveString(
  value: string | undefined,
  visibleChars?: number
): string | undefined
```

**Parameters:**
- `value` - The sensitive string to mask
- `visibleChars` - Number of characters to show at start and end (default: 4)

**Examples:**

```typescript
// API keys
const apiKey = 'sk_live_abc123def456ghi789jkl';
console.log(maskSensitiveString(apiKey));
// Output: 'sk_l******************jkl'

// Tokens
const token = 'ghp_1234567890abcdefghij';
console.log(maskSensitiveString(token, 3));
// Output: 'ghp***************hij'

// Short strings are completely masked
const shortSecret = 'pass';
console.log(maskSensitiveString(shortSecret));
// Output: '****'

// Undefined values are preserved
console.log(maskSensitiveString(undefined));
// Output: undefined
```

**Best Practices:**

```typescript
import { Logger } from '@temporalio/worker';
import { maskSensitiveString } from '@temporalio/common';

const logger: Logger = {
  info: (message, attrs) => {
    // Mask API keys in attributes
    const safeAttrs = {
      ...attrs,
      apiKey: attrs.apiKey ? maskSensitiveString(attrs.apiKey) : undefined,
    };
    console.log(message, safeAttrs);
  },
  // ... other log levels
};
```

---

### `maskSensitiveData()`

Recursively masks sensitive properties in objects for safe logging.

**Signature:**
```typescript
function maskSensitiveData(
  obj: any,
  sensitiveKeys?: string[]
): any
```

**Parameters:**
- `obj` - Object containing potentially sensitive data
- `sensitiveKeys` - Array of property names to mask (case-insensitive, default: common credential keys)

**Default Sensitive Keys:**
- `apikey`, `api_key`
- `password`
- `secret`
- `token`
- `authorization`
- `bearer`

**Examples:**

```typescript
// Configuration object with sensitive data
const config = {
  serverUrl: 'https://api.example.com',
  apiKey: 'sk_live_1234567890',
  timeout: 5000,
  credentials: {
    username: 'admin',
    password: 'super_secret_123',
    token: 'bearer_xyz789',
  },
  features: {
    enabled: true,
  },
};

const masked = maskSensitiveData(config);
console.log(masked);
/* Output:
{
  serverUrl: 'https://api.example.com',
  apiKey: '****',
  timeout: 5000,
  credentials: {
    username: 'admin',
    password: '****',
    token: '****'
  },
  features: {
    enabled: true
  }
}
*/

// Custom sensitive keys
const data = {
  userId: '12345',
  creditCard: '4111-1111-1111-1111',
  email: 'user@example.com',
};

const maskedCustom = maskSensitiveData(data, ['creditCard', 'email']);
console.log(maskedCustom);
/* Output:
{
  userId: '12345',
  creditCard: '****',
  email: '****'
}
*/
```

**Usage with Logger:**

```typescript
import { maskSensitiveData } from '@temporalio/common';

class SafeLogger {
  logConfig(config: any) {
    const safeConfig = maskSensitiveData(config);
    console.log('Application config:', JSON.stringify(safeConfig, null, 2));
  }

  logError(error: Error, context: any) {
    const safeContext = maskSensitiveData(context);
    console.error('Error occurred:', error.message, 'Context:', safeContext);
  }
}
```

---

### `maskAuthorizationHeader()`

Specifically designed to mask Authorization headers (Bearer, Basic, etc.).

**Signature:**
```typescript
function maskAuthorizationHeader(
  authHeader: string | undefined
): string | undefined
```

**Examples:**

```typescript
// Bearer token
const bearer = 'Bearer sk_live_abc123def456ghi789';
console.log(maskAuthorizationHeader(bearer));
// Output: 'Bearer sk_l****************789'

// Basic auth
const basic = 'Basic dXNlcjpwYXNzd29yZA==';
console.log(maskAuthorizationHeader(basic));
// Output: 'Basic dXNl**********ZA=='

// No scheme
const token = 'sk_live_abc123def456ghi789';
console.log(maskAuthorizationHeader(token));
// Output: 'sk_l****************789'
```

**Usage in Connection:**

```typescript
import { Connection } from '@temporalio/client';
import { maskAuthorizationHeader } from '@temporalio/common';

// Override Connection.withMetadata to mask auth headers in logs
Connection.prototype.withMetadata = function (metadata) {
  const maskedMetadata = { ...metadata };
  if (maskedMetadata.Authorization) {
    console.log('Auth header:', maskAuthorizationHeader(maskedMetadata.Authorization));
  }
  // ... rest of the implementation
};
```

---

### `sanitizeErrorMessage()`

Removes sensitive information from error messages.

**Signature:**
```typescript
function sanitizeErrorMessage(
  error: Error | string,
  replacements?: Record<string, string>
): string
```

**Parameters:**
- `error` - Error object or message string
- `replacements` - Additional find/replace patterns

**Automatically Removes:**
- Long tokens and API keys (20+ character alphanumeric strings)
- Email addresses
- File paths (Unix and Windows)

**Examples:**

```typescript
// Error with API key
const error1 = new Error(
  'Authentication failed with key sk_live_1234567890abcdefghij'
);
console.log(sanitizeErrorMessage(error1));
// Output: 'Authentication failed with key [REDACTED]'

// Error with email
const error2 = new Error('User user@example.com not found');
console.log(sanitizeErrorMessage(error2));
// Output: 'User [REDACTED] not found'

// Error with file path
const error3 = new Error('Failed to load /home/user/.env file');
console.log(sanitizeErrorMessage(error3));
// Output: 'Failed to load [REDACTED] file'

// Custom replacements
const error4 = new Error('Connection to db-prod-001 failed');
console.log(sanitizeErrorMessage(error4, { 'db-prod-001': 'database' }));
// Output: 'Connection to database failed'
```

**Usage in Error Handler:**

```typescript
import { sanitizeErrorMessage } from '@temporalio/common';

class ErrorReporter {
  report(error: Error, context?: any) {
    // Sanitize the error message
    const safeMessage = sanitizeErrorMessage(error);

    // Sanitize context
    const safeContext = maskSensitiveData(context || {});

    // Send to monitoring service
    this.sendToMonitoring({
      message: safeMessage,
      context: safeContext,
      timestamp: new Date().toISOString(),
    });
  }

  private sendToMonitoring(data: any) {
    // Send to external service...
  }
}
```

---

### `validateInputLength()`

Validates input length to prevent ReDoS and DoS attacks.

**Signature:**
```typescript
function validateInputLength(
  input: string,
  maxLength: number,
  fieldName?: string
): void
```

**Parameters:**
- `input` - Input string to validate
- `maxLength` - Maximum allowed length
- `fieldName` - Name of the field for error message (default: "Input")

**Throws:** `Error` if input exceeds maxLength

**Examples:**

```typescript
import { validateInputLength } from '@temporalio/common';

// Validate user input
function processWorkflowId(workflowId: string) {
  // Prevent extremely long workflow IDs
  validateInputLength(workflowId, 256, 'Workflow ID');

  // Process the workflow ID...
}

// This is fine
processWorkflowId('my-workflow-123');

// This throws an error
try {
  processWorkflowId('x'.repeat(300));
} catch (error) {
  console.error(error.message);
  // Output: 'Workflow ID exceeds maximum length of 256 characters (got 300)'
}
```

**Usage in API Validation:**

```typescript
import { validateInputLength } from '@temporalio/common';

interface WorkflowInput {
  name: string;
  description: string;
  data: string;
}

function validateWorkflowInput(input: WorkflowInput): void {
  validateInputLength(input.name, 128, 'Workflow name');
  validateInputLength(input.description, 1024, 'Description');
  validateInputLength(input.data, 10_000, 'Data payload');

  // Additional validation...
}
```

**Recommended Limits:**

| Field Type | Recommended Max Length | Rationale |
|------------|------------------------|-----------|
| IDs | 256 | Database field limits |
| Names | 128 | UI display limits |
| Descriptions | 1024 | Reasonable text length |
| URLs | 2048 | Browser limits |
| Payloads | 10,000 - 100,000 | Prevent memory exhaustion |

---

### `isValidUri()`

Validates URI format and length to prevent injection attacks.

**Signature:**
```typescript
function isValidUri(
  uri: string,
  maxLength?: number
): boolean
```

**Parameters:**
- `uri` - URI string to validate
- `maxLength` - Maximum allowed URI length (default: 2048)

**Returns:** `true` if valid, `false` otherwise

**Examples:**

```typescript
import { isValidUri } from '@temporalio/common';

// Valid absolute URLs
console.log(isValidUri('https://api.example.com'));
// Output: true

console.log(isValidUri('http://localhost:7233'));
// Output: true

// Valid relative URIs
console.log(isValidUri('/api/v1/workflows'));
// Output: true

// Invalid - too long
const longUri = 'https://example.com/' + 'x'.repeat(3000);
console.log(isValidUri(longUri));
// Output: false

// Invalid - malformed
console.log(isValidUri('ht!tp://bad-url'));
// Output: false

// Custom max length
console.log(isValidUri('https://example.com/very/long/path', 20));
// Output: false
```

**Usage in Connection Options:**

```typescript
import { isValidUri } from '@temporalio/common';
import { Connection } from '@temporalio/client';

async function createSafeConnection(address: string) {
  // Validate the address before creating connection
  if (!isValidUri(address, 256)) {
    throw new Error('Invalid server address format or length');
  }

  return Connection.connect({ address });
}

// Usage
try {
  const connection = await createSafeConnection('localhost:7233');
  // Use connection...
} catch (error) {
  console.error('Connection failed:', error.message);
}
```

---

## Complete Example: Secure Logger

Here's a complete example of a security-aware logger:

```typescript
import {
  maskSensitiveData,
  maskAuthorizationHeader,
  sanitizeErrorMessage,
} from '@temporalio/common';

interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: any;
  error?: Error;
  timestamp?: Date;
}

class SecureLogger {
  private maskSensitiveKeys = [
    'password',
    'apiKey',
    'api_key',
    'token',
    'secret',
    'authorization',
    'bearer',
    'clientKey',
    'client_key',
    'privateKey',
    'private_key',
  ];

  log(entry: LogEntry): void {
    const safeEntry = this.sanitize(entry);
    const output = this.format(safeEntry);

    // Send to logging service
    console.log(output);
  }

  private sanitize(entry: LogEntry): LogEntry {
    const sanitized: LogEntry = {
      level: entry.level,
      message: entry.message,
      timestamp: entry.timestamp || new Date(),
    };

    // Sanitize context
    if (entry.context) {
      sanitized.context = maskSensitiveData(entry.context, this.maskSensitiveKeys);

      // Special handling for Authorization headers
      if (sanitized.context.headers?.Authorization) {
        sanitized.context.headers.Authorization = maskAuthorizationHeader(
          sanitized.context.headers.Authorization
        );
      }
    }

    // Sanitize error
    if (entry.error) {
      sanitized.error = {
        name: entry.error.name,
        message: sanitizeErrorMessage(entry.error),
        stack: this.sanitizeStack(entry.error.stack),
      } as any;
    }

    return sanitized;
  }

  private sanitizeStack(stack?: string): string | undefined {
    if (!stack) return undefined;

    // Remove file paths from stack traces in production
    if (process.env.NODE_ENV === 'production') {
      return stack.replace(/\/.*?\//g, '[PATH]/');
    }

    return stack;
  }

  private format(entry: LogEntry): string {
    return JSON.stringify(entry, null, 2);
  }

  // Convenience methods
  debug(message: string, context?: any): void {
    this.log({ level: 'debug', message, context });
  }

  info(message: string, context?: any): void {
    this.log({ level: 'info', message, context });
  }

  warn(message: string, context?: any): void {
    this.log({ level: 'warn', message, context });
  }

  error(message: string, error?: Error, context?: any): void {
    this.log({ level: 'error', message, error, context });
  }
}

// Usage
const logger = new SecureLogger();

logger.info('Connecting to Temporal', {
  address: 'localhost:7233',
  apiKey: 'sk_live_1234567890',
  namespace: 'default',
});

// Output will have apiKey masked:
// {
//   "level": "info",
//   "message": "Connecting to Temporal",
//   "context": {
//     "address": "localhost:7233",
//     "apiKey": "****",
//     "namespace": "default"
//   },
//   "timestamp": "2025-11-22T..."
// }
```

---

## Best Practices

### 1. Always Mask Credentials in Logs

```typescript
// ❌ BAD - Exposes credentials
console.log('Config:', config);

// ✅ GOOD - Masks sensitive data
console.log('Config:', maskSensitiveData(config));
```

### 2. Validate Input Lengths

```typescript
// ❌ BAD - No validation
function processData(data: string) {
  return JSON.parse(data);
}

// ✅ GOOD - Validates length
function processData(data: string) {
  validateInputLength(data, 100_000, 'JSON data');
  return JSON.parse(data);
}
```

### 3. Sanitize Error Messages

```typescript
// ❌ BAD - May expose sensitive info
catch (error) {
  console.error('Error:', error.message);
}

// ✅ GOOD - Sanitizes error
catch (error) {
  console.error('Error:', sanitizeErrorMessage(error));
}
```

### 4. Validate URIs

```typescript
// ❌ BAD - No validation
const connection = await Connection.connect({ address });

// ✅ GOOD - Validates URI
if (!isValidUri(address, 256)) {
  throw new Error('Invalid address');
}
const connection = await Connection.connect({ address });
```

### 5. Use Custom Sensitive Keys

```typescript
// Define your application's sensitive keys
const SENSITIVE_KEYS = [
  'password',
  'apiKey',
  'creditCard',
  'ssn',
  'oauth_token',
  'refresh_token',
  // Add your app-specific keys
];

// Use consistently
const masked = maskSensitiveData(data, SENSITIVE_KEYS);
```

---

## Security Checklist

- [ ] All API keys and tokens are masked in logs
- [ ] Error messages are sanitized before logging
- [ ] Input lengths are validated to prevent DoS
- [ ] URIs are validated before use
- [ ] Authorization headers are masked in debug output
- [ ] Production logs don't contain file paths
- [ ] Sensitive data is never logged in plaintext
- [ ] Custom payload converters mask sensitive fields

---

## Related Documentation

- [SECURITY.md](../SECURITY.md) - Security policy and vulnerability reporting
- [SECURITY_ANALYSIS_REPORT.md](../SECURITY_ANALYSIS_REPORT.md) - Detailed security analysis
- [Temporal Security Documentation](https://docs.temporal.io/security)

---

## Support

For security-related questions:
- Email: sdk@temporal.io
- GitHub Issues: https://github.com/temporalio/sdk-typescript/issues

**Remember:** Security utilities help protect sensitive data, but they're not a substitute for proper access controls, encryption, and security practices. Always follow the principle of least privilege and defense in depth.
