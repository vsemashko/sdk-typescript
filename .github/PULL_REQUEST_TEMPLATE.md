## Description
<!-- Provide a brief description of the changes in this PR -->

## Type of Change
<!-- Mark the relevant option with an "x" -->

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring
- [ ] Security fix
- [ ] Dependency update

## Related Issues
<!-- Link to related issues using #issue_number -->

Fixes #

## Testing
<!-- Describe the tests you ran to verify your changes -->

### Test Commands Run
- [ ] `pnpm run build` - Build passes
- [ ] `pnpm run test` - All tests pass
- [ ] `pnpm run lint.check` - Linting passes
- [ ] `pnpm run security:check` - Security audit passes

### Test Coverage
- [ ] Added tests for new functionality
- [ ] Updated existing tests for changes
- [ ] All tests are passing

## Security Checklist
<!-- Review and check all applicable items -->

### Code Security
- [ ] No hardcoded secrets, passwords, or API keys
- [ ] Sensitive data is masked in logs using `maskSensitiveData()`
- [ ] Error messages are sanitized using `sanitizeErrorMessage()`
- [ ] Input validation is implemented where needed
- [ ] No `eval()` or similar unsafe code execution
- [ ] File paths are validated to prevent directory traversal
- [ ] SQL queries use parameterized statements (if applicable)

### Dependencies
- [ ] No new dependencies with known vulnerabilities
- [ ] Dependencies are from trusted sources
- [ ] `pnpm run security:check` passes
- [ ] Lock file (`pnpm-lock.yaml`) is updated

### Authentication & Authorization
- [ ] Authentication mechanisms are properly implemented (if applicable)
- [ ] Authorization checks are in place (if applicable)
- [ ] Session management is secure (if applicable)
- [ ] Credentials are handled securely

### Data Protection
- [ ] Sensitive data is encrypted in transit (TLS)
- [ ] Sensitive data is encrypted at rest (if applicable)
- [ ] No sensitive data in version control
- [ ] PII is handled according to privacy requirements

### For Security-Sensitive Changes
If this PR modifies security-sensitive code (authentication, authorization, cryptography, input validation), please:

- [ ] Request review from security team
- [ ] Include detailed security testing results
- [ ] Update security documentation if needed
- [ ] Consider if a security advisory is needed

## Documentation
- [ ] Code is well-commented
- [ ] Documentation is updated (if needed)
- [ ] API documentation is updated (if applicable)
- [ ] CHANGELOG is updated (if applicable)
- [ ] Security implications are documented (if applicable)

## Commit Message
<!-- Ensure your commit message follows conventional commits format -->

- [ ] Commit message follows the [Conventional Commits](https://conventionalcommits.org/) specification
- [ ] Commit message includes appropriate scope (see [commitlint.config.js](https://github.com/temporalio/sdk-typescript/blob/main/commitlint.config.js))

Example: `feat(client): add retry logic for network errors`

## Checklist
<!-- Review and check all items before submitting -->

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings or errors
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published
- [ ] I have checked my code and corrected any misspellings

## Additional Context
<!-- Add any other context about the PR here -->

## Screenshots (if applicable)
<!-- Add screenshots to help explain your changes -->

## Reviewer Notes
<!-- Any special instructions or context for reviewers -->

---

## For Maintainers

- [ ] Approved by required reviewers
- [ ] CI/CD pipeline passes
- [ ] Security scan passes
- [ ] No merge conflicts
- [ ] Squash and merge or rebase appropriately
