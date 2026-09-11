# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in ConditionalBlock, please **do not** open a public GitHub issue. Instead, please report it responsibly to us.

### How to Report

Email your security report to: **security@conditionalblock.dev**

Please include:

1. **Description**: Clear description of the vulnerability
2. **Impact**: Potential impact (e.g., data breach, funds loss, authentication bypass)
3. **Reproduction Steps**: Step-by-step instructions to reproduce the issue
4. **Affected Versions**: Which versions are affected
5. **Your Contact**: Your name and contact information
6. **Timeline**: When you discovered the vulnerability
7. **Proof of Concept**: If available (optional but helpful)

### Response Timeline

- **24 hours**: We will acknowledge receipt of your report
- **48 hours**: Initial assessment of the vulnerability
- **72 hours**: We will begin working on a fix (if confirmed)
- **Publication**: We will coordinate with you on a disclosure timeline (typically 90 days)

## Security Best Practices for Users

### Wallet Security

1. **Never share your seed phrase** with anyone, including ConditionalBlock team members
2. **Keep your Lace wallet extension updated** to the latest version
3. **Use a strong password** for your wallet
4. **Enable OS-level security** (PIN, biometric) on your device
5. **Use a hardware wallet** if possible for large amounts

### Contract Safety

1. **Verify contract conditions** before signing
2. **Review code and proofs** when available
3. **Start with small amounts** when testing new features
4. **Use testnet tokens** for testing before mainnet deployment
5. **Double-check recipient addresses** before confirming transactions

### Data Protection

1. **Avoid entering PII** in contract descriptions or metadata
2. **Be cautious with session links** - treat them like passwords
3. **Log out after use** on shared computers
4. **Clear browser cache** if using public computers
5. **Use secure networks** (avoid public WiFi for sensitive operations)

## Security Features Implemented

### Cryptographic Security

- **Zero-Knowledge Proofs**: Contract conditions evaluated in ZK circuits without exposing private inputs
- **Wallet Integration**: Private keys never leave the user's wallet (Lace)
- **Proof Verification**: Cryptographic verification of contract conditions on-chain
- **Signed Transactions**: All blockchain transactions cryptographically signed

### Application Security

- **Input Validation**: All user inputs validated and sanitized
- **SQL Injection Prevention**: Parameterized queries and ORM used for all database operations
- **XSS Protection**: Content Security Policy headers and DOM sanitization
- **CORS Security**: Restrictive CORS policy with explicit domain whitelisting
- **Rate Limiting**: API rate limiting to prevent brute force attacks
- **Session Management**: Secure session handling with automatic expiration
- **CSRF Protection**: CSRF tokens on all state-changing operations

### Infrastructure Security

- **HTTPS/TLS**: All communications encrypted in transit
- **Data Encryption**: Sensitive data encrypted at rest in Supabase
- **Access Controls**: Role-based access control (RBAC) for all resources
- **Audit Logging**: All sensitive operations logged and monitored
- **Regular Backups**: Automated daily backups of production database
- **Security Updates**: Automated dependency scanning and patching

### Network Security

- **Firewall Rules**: Restrictive firewall policies on production infrastructure
- **DDoS Protection**: Cloudflare protection for public endpoints
- **IP Whitelisting**: Critical endpoints protected by IP whitelisting
- **VPN Access**: Backend services accessible only via VPN

## Security Audit & Testing

### Current Status

- **Last Audit**: July 2026
- **Auditor**: Internal Security Team
- **Status**: ✅ Passed

### Testing Practices

- **Regular Security Scanning**: OWASP Top 10 scanning
- **Dependency Audits**: `npm audit` run on every deploy
- **Penetration Testing**: Quarterly pen testing by external firms
- **Code Review**: All code changes reviewed for security issues

## Known Limitations & Mitigations

### Testnet Nature

This application runs on Midnight **testnet** (undeployed), not mainnet:

- ❌ **Do NOT use mainnet funds**
- ⚠️ Funds on testnet have no real value
- ⚠️ Network may reset without notice
- ✅ Test thoroughly before production deployment

### Privacy Limitations

While we use zero-knowledge proofs to hide private inputs:

1. **Metadata Leakage**: On-chain metadata (contract IDs, amounts) may be observable
2. **Timing Analysis**: Transaction timing can leak activity patterns
3. **Off-chain Data**: Contract descriptions and UI metadata stored unencrypted in Supabase
4. **Network Analysis**: Blockchain network observers can see transaction frequency

**Recommendation**: Don't store PII in contract descriptions or metadata.

## Dependency Security

### Vulnerable Dependency Handling

1. **Automated Scanning**: npm audit runs on every commit
2. **Monthly Updates**: Security patches applied within 24 hours
3. **Major Updates**: Tested thoroughly before production deployment
4. **Dead Dependencies**: Regularly removed unused dependencies

### Current Dependencies

All dependencies are from official sources:
- **@midnight-ntwrk/**: Official Midnight Network packages
- **react**: Official React from facebook/react
- **lucide-react**: Icon library from lucide-icons/lucide
- **rxjs**: Reactive programming library from reactivex/rxjs

## Compliance

### Standards

- **OWASP Top 10**: Compliance with OWASP security guidelines
- **NIST Cybersecurity Framework**: Implemented controls aligned with NIST recommendations
- **CWE Top 25**: Addressed common weakness enumerations

### Data Protection

- **Data Minimization**: Only collect data necessary for operation
- **Retention Policies**: Data retained only as long as needed (default 90 days)
- **User Rights**: Users can request data export/deletion
- **Privacy Policy**: See [PRIVACY.md](PRIVACY.md) for details

## Secure Development Practices

1. **Secure Coding Training**: All developers complete security training
2. **Code Review**: Security-focused code review for all changes
3. **Static Analysis**: ESLint with security plugins runs on every commit
4. **Dependency Scanning**: npm audit integrated into CI/CD pipeline
5. **Secret Management**: No secrets in code or git history
6. **Signed Commits**: All production commits must be signed with GPG/SSH

## Incident Response

If we discover a security issue:

1. We will assess the severity (Critical, High, Medium, Low)
2. Affected users will be notified via email
3. A fix will be prioritized based on severity
4. A security advisory will be published post-fix
5. An incident report will be available upon request

### Severity Levels

- **Critical**: Immediate threat to user funds or data privacy
- **High**: Significant security impact requiring urgent fix
- **Medium**: Moderate security risk with workaround available
- **Low**: Minor security issue with limited real-world impact

## Updates & Patches

### Security Updates

- Released as soon as possible for critical issues
- May be released out-of-band (outside regular release cycle)
- Version bumps follow semantic versioning (patch for security fixes)

### End of Support

- Current version (v2.x): Supported indefinitely
- Previous versions: Security patches for 12 months
- Archived versions: No support provided

## Security Roadmap

### Q4 2026

- [ ] Implement hardware wallet integration
- [ ] Add multi-chain support
- [ ] Implement threshold cryptography
- [ ] Add advanced fraud detection

### Q1 2027

- [ ] Security audit by Big4 firm
- [ ] Formal verification of smart contracts
- [ ] Implement MFA for sensitive operations
- [ ] Add advanced monitoring and alerting

## Questions?

For security questions that aren't vulnerabilities, please:

1. Check [PRIVACY.md](PRIVACY.md) and [ARCHITECTURE.md](ARCHITECTURE.md)
2. Join our GitHub Discussions
3. Email security@conditionalblock.dev

---

**Last Updated**: September 11, 2026

**Version**: 2.0.0
