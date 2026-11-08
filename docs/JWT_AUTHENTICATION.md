# JWT authentication and dashboard routing

The root portal landing page is replaced with session verification and role-based navigation. Anonymous visitors go to /login. Authenticated ADMIN users go to /admin/users, CLINICIAN users to /doctor/dashboard and PATIENT users to /patient/dashboard. Opening /login while authenticated also redirects to the correct workspace. Role is obtained from the authenticated API user; frontend role cookies and URL paths cannot grant permission.

Portal API authentication now requires a signed Simple JWT access token in the HttpOnly orthosense_access cookie. It lasts 15 minutes. An HttpOnly refresh cookie lasts one day and rotates at POST /api/v1/auth/refresh/. The frontend shares concurrent refresh requests and retries an unauthorized request once after refresh succeeds. Tokens are not stored in localStorage or returned to JavaScript. Cookie requests retain CSRF checks. Production cookie security follows SESSION_COOKIE_SECURE; production deployment must select production settings and HTTPS.

JWT token families reference the Django database session as a revocation record. Current user identity, active status and password hash are checked. Logout flushes that record and clears both token cookies; previously copied tokens cannot restore access. A refresh token's JTI must match the current session record, preventing reuse after rotation. A Django session cookie alone no longer authenticates portal API requests. Django's built-in /admin/ continues using Django session authentication. Hardware ingestion continues using its scoped device credentials.

Requirements now include djangorestframework-simplejwt>=5.5,<6. The package was already installed in this environment. No new tables or migration were needed; existing Django session tables are used. Restart the backend after updating requirements. Existing portal sessions must log in again to obtain JWT cookies.

Checks: TypeScript and 17 frontend tests passed; 113 backend tests cover existing permission flows plus JWT cookies, signature rejection, expiry, rotation, refresh replay, logout revocation and session-cookie-only rejection. These are local automated checks, not browser/deployment validation.

Manual tests:
1. Signed out, open localhost:3000: expect login instead of Clinical Orthopedic Web Portal.
2. Log in with each role: verify the correct dashboard; revisit / and /login and verify routing.
3. Refresh the page and verify identity persists through JWT cookies.
4. Open a different role's workspace: access must remain denied.
5. Let the access token expire while refresh remains valid: the next API request should refresh and retry once.
6. Log out and reopen a protected URL: expect login. Replayed old tokens must be rejected.
7. Open localhost:8085/admin/ with your Django superuser: built-in admin remains available.
