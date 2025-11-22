# Security Policy

## Supported Versions

We actively support the following versions of the Temporal TypeScript SDK with security updates:

| Version | Supported          | Notes |
| ------- | ------------------ | ----- |
| 1.x.x   | :white_check_mark: | Current stable release |
| < 1.0   | :x:                | No longer supported |

## Reporting a Vulnerability

The Temporal team takes security vulnerabilities seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**DO NOT** create public GitHub issues for security vulnerabilities.

Instead, please report security vulnerabilities to:
- **Email:** sdk@temporal.io
- **Subject:** [SECURITY] Brief description of the vulnerability

### What to Include

Please include the following information in your report:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Suggested fix (if available)
- Your name/affiliation (if you wish to be credited)

### Response Timeline

- **Initial Response:** Within 48 hours of receiving the report
- **Status Update:** Within 5 business days
- **Fix Timeline:** Varies based on severity and complexity

### Severity Levels

We use the following severity classification:

| Severity | Description | Expected Fix Timeline |
|----------|-------------|----------------------|
| **Critical** | Remote code execution, authentication bypass | 1-7 days |
| **High** | Privilege escalation, data leakage | 7-14 days |
| **Medium** | DoS, information disclosure | 14-30 days |
| **Low** | Minor issues with minimal impact | 30-90 days |

## Security Update Process

1. **Verification:** We verify and reproduce the reported vulnerability
2. **Development:** Our team develops and tests a fix
3. **Coordination:** We coordinate the disclosure timeline with the reporter
4. **Release:** We release a patched version
5. **Disclosure:** We publish a security advisory

## Public Disclosure Policy

- We follow a **coordinated disclosure** policy
- We request **90 days** from initial report before public disclosure
- We will credit the reporter (unless they wish to remain anonymous)
- We publish security advisories for all confirmed vulnerabilities

## Security Best Practices

When using the Temporal TypeScript SDK, we recommend:

### Authentication & Authorization
- Always use TLS/mTLS for production environments
- Rotate API keys and certificates regularly
- Use strong, unique credentials for each environment
- Store credentials securely (use secret management systems)

### Network Security
- Deploy Temporal Server behind a firewall
- Use private networks when possible
- Enable TLS 1.2 or higher
- Validate server certificates

### Dependency Management
- Regularly update to the latest SDK version
- Run `pnpm audit` to check for vulnerabilities
- Use lock files (`pnpm-lock.yaml`) for reproducible builds
- Monitor security advisories

### Workflow Security
- Validate all inputs to workflows and activities
- Avoid logging sensitive data
- Use payload encryption for sensitive data
- Implement proper error handling
- Follow the principle of least privilege

### Code Security
- Enable strict TypeScript mode
- Use ESLint with security plugins
- Perform security code reviews
- Implement comprehensive testing
- Avoid eval() and dynamic code execution

## Known Security Considerations

### Workflow Isolation
Workflows run in isolated V8 contexts with limited access to Node.js APIs. However:
- Do not trust user-provided workflow code in multi-tenant environments
- Implement strict module allowlisting
- Set appropriate execution timeouts

### Payload Handling
- Custom payload converters must be carefully implemented
- Avoid prototype pollution when deserializing payloads
- Validate payload sizes to prevent DoS

### Secret Management
- Never hardcode secrets in workflow/activity code
- Use environment variables or secret management systems
- Mask sensitive data in logs and error messages

## Security Contacts

- **General Security:** sdk@temporal.io
- **GitHub:** https://github.com/temporalio/sdk-typescript/issues
- **Documentation:** https://docs.temporal.io/security

## Bug Bounty Program

We do not currently offer a bug bounty program. However, we greatly appreciate all security research and will publicly credit researchers who responsibly disclose vulnerabilities (unless they prefer to remain anonymous).

## Security Advisories

Security advisories are published at:
- GitHub Security Advisories: https://github.com/temporalio/sdk-typescript/security/advisories
- npm advisories: https://www.npmjs.com/advisories

## Compliance

The Temporal TypeScript SDK is designed to support compliance with various security standards:
- SOC 2 Type II
- ISO 27001
- GDPR
- HIPAA (when configured appropriately)
- PCI DSS (when configured appropriately)

Note: Compliance requirements vary by deployment. Consult the Temporal documentation and your security team for specific compliance guidance.

## Additional Resources

- [Temporal Security Documentation](https://docs.temporal.io/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Security Analysis Report](./SECURITY_ANALYSIS_REPORT.md)

## Acknowledgments

We would like to thank the security researchers and community members who have helped improve the security of the Temporal TypeScript SDK.

---

**Last Updated:** November 22, 2025

**Version:** 1.0
