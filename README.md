<p align="center">
  <img src="https://assets.temporal.io/w/ts.png" alt="Temporal TypeScript SDK" />
</p>
<p align="center">
  <a href="https://www.npmjs.com/search?q=author%3Atemporal-sdk-team">
    <img src="https://img.shields.io/npm/v/temporalio.svg?style=for-the-badge" alt="NPM" />
  </a>
  <a href="https://github.com/temporalio/sdk-typescript/blob/main/LICENSE.md">
    <img src="https://img.shields.io/npm/l/temporalio?style=for-the-badge" alt="LICENSE" />
  </a>
  <a href="https://github.com/temporalio/sdk-typescript/security/policy">
    <img src="https://img.shields.io/badge/security-policy-blue?style=for-the-badge" alt="Security Policy" />
  </a>
</p>

[Temporal](https://temporal.io) is a durable execution system that transparently makes your code durable, fault-tolerant, and simple.

"Temporal TypeScript SDK" is the framework for authoring workflows and activities using either the TypeScript or JavaScript programming languages.

For documentation and samples, see:

- [Code Samples](https://github.com/temporalio/samples-typescript)
- [TypeScript SDK docs](https://docs.temporal.io/typescript/introduction)
- [TypeScript SDK API reference](https://typescript.temporal.io/)
- [General Temporal docs](https://docs.temporal.io)

## Security

The Temporal TypeScript SDK takes security seriously. We follow industry best practices and implement comprehensive security measures.

### 🔒 Security Features

- **Zero Known Vulnerabilities**: Regular automated dependency scanning and updates
- **TLS/mTLS Support**: Secure communication with Temporal Server
- **Input Validation**: Built-in utilities to prevent injection attacks
- **Credential Masking**: Automatic sensitive data protection in logs
- **Security Linting**: Automated detection of security anti-patterns

### 📋 Security Resources

- **[Security Policy](SECURITY.md)**: Vulnerability reporting and disclosure policy
- **[Security Utilities Guide](docs/SECURITY_UTILITIES_GUIDE.md)**: Complete guide to using security utilities
- **[Security Analysis Report](SECURITY_ANALYSIS_REPORT.md)**: Comprehensive security analysis
- **[Contributing Guidelines](CONTRIBUTING.md#security-guidelines)**: Security best practices for contributors

### 🛡️ For Developers

The SDK provides security utilities to help you build secure applications:

```typescript
import {
  maskSensitiveData,
  sanitizeErrorMessage,
  validateInputLength,
} from '@temporalio/common';

// Mask sensitive data in logs
const safeConfig = maskSensitiveData(config);
console.log('Config:', safeConfig);

// Sanitize error messages
try {
  // ... code
} catch (error) {
  console.error('Error:', sanitizeErrorMessage(error));
}

// Validate input lengths to prevent DoS
validateInputLength(userInput, 1024, 'User input');
```

See the [Security Utilities Guide](docs/SECURITY_UTILITIES_GUIDE.md) for complete documentation.

### 🔐 Reporting Security Issues

**Please do not create public GitHub issues for security vulnerabilities.**

Report security issues to: **sdk@temporal.io**

We will respond within 48 hours and work with you to address the issue promptly.

## Packages

This monorepo contains the following packages:

| Subfolder                                                                          | Package                                                                                                              |
|------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| [`packages/client/`](packages/client/)                                             | [`@temporalio/client`](https://www.npmjs.com/package/@temporalio/client)                                             |
| [`packages/worker/`](packages/worker/)                                             | [`@temporalio/worker`](https://www.npmjs.com/package/@temporalio/worker)                                             |
| [`packages/workflow/`](packages/workflow/)                                         | [`@temporalio/workflow`](https://www.npmjs.com/package/@temporalio/workflow)                                         |
| [`packages/activity/`](packages/activity/)                                         | [`@temporalio/activity`](https://www.npmjs.com/package/@temporalio/activity)                                         |
| [`packages/testing/`](packages/testing/)                                           | [`@temporalio/testing`](https://www.npmjs.com/package/@temporalio/testing)                                           |
| [`packages/common/`](packages/common/)                                             | [`@temporalio/common`](https://www.npmjs.com/package/@temporalio/common)                                             |
| [`packages/proto/`](packages/proto/)                                               | [`@temporalio/proto`](https://www.npmjs.com/package/@temporalio/proto)                                               |
| [`packages/interceptors-opentelemetry/`](packages/interceptors-opentelemetry/)     | [`@temporalio/interceptors-opentelemetry`](https://www.npmjs.com/package/@temporalio/interceptors-opentelemetry)     |
| [`packages/meta/`](packages/meta/)                                                 | [`temporalio`](https://www.npmjs.com/package/@temporalio/meta) (deprecated)                                          |
| [`packages/test/`](packages/test/)                                                 | SDK internal tests                                                                                                   |
| [`packages/create-project/`](packages/create-project/)                             | [`@temporalio/create`](https://www.npmjs.com/package/@temporalio/create-project)                                     |
| [`packages/docs/`](packages/docs/)                                                 | [API docs](https://typescript.temporal.io/)                                                                          |

## Contributors

[/sdk-typescript/graphs/contributors](https://github.com/temporalio/sdk-typescript/graphs/contributors)

Thank you to everyone who has contributed 😃🙌

## Contributing

We welcome issues and PRs! Read our [contributing guide](CONTRIBUTING.md) to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes to the SDK.
