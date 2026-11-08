# Implementation Plan: Fix Authentication System for Local Development

## Overview
The authentication system currently requires Manus OAuth configuration which isn't available in local development. This plan adds a development-mode email/password authentication system while keeping OAuth as an option for production.

**Root Cause:** `frontend/src/const.ts` line 24 fails because `VITE_OAUTH_PORTAL_URL` is undefined, causing the login flow to crash before even reaching the backend.

---

## Implementation Plan

- [ ] 1. **Add password hashing dependency to backend**
      Install bcrypt for secure password hashing in development auth.
      Files: `backend/package.json`
      Verify: Run `npm install` in backend directory and confirm bcrypt is listed in package.json dependencies.

- [ ] 2. **Update database schema to support password authentication**
      Add `passwordHash` field to the users table in the Drizzle schema. This field is nullable since OAuth users won't have passwords.
      Files: `backend/drizzle/schema.ts`
      Verify: Run `npm run db:push` from backend directory to apply schema changes. Check that the migration completes without errors.

- [ ] 3. **Create backend development authentication service**
      Create a new service module that handles dev auth: password hashing with bcrypt (10 rounds), credential validation, and session token creation using the existing `sdk.createSessionToken` method. The service exports `hashPassword`, `verifyPassword`, `registerUser`, and `authenticateUser` functions.
      Files: `backend/src/_core/devAuth.ts` (new file)
      Verify: Run `npm run test` from backend directory. Unit tests for the devAuth service should pass.

- [ ] 4. **Add development authentication routes to backend**
      Register two new routes in the Express app: `POST /api/auth/dev-login` (accepts email/password, returns session cookie) and `POST /api/auth/dev-signup` (accepts email/password/name, creates user, returns session cookie). Both routes check `ENV.oAuthServerUrl` — if it's configured and non-empty, they return 404 (OAuth mode active). Use the same cookie-setting pattern as oauth.ts callback. Add request validation with zod schemas.
      Files: `backend/src/_core/devAuth.ts` (add route handlers), `backend/src/index.ts` (register routes before tRPC middleware)
      Verify: Start backend with `npm run dev`, then use curl or Postman to POST to `/api/auth/dev-signup` with `{"email":"test@example.com","password":"test123","name":"Test User"}`. Should return 200 and set `app_session_id` cookie. Then POST to `/api/auth/dev-login` with the same credentials and verify authentication succeeds.

- [ ] 5. **Make OAuth configuration optional in backend**
      Update `backend/src/_core/env.ts` to accept empty OAuth values. Update `backend/src/_core/sdk.ts` constructor to skip OAuth client initialization when `ENV.oAuthServerUrl` is empty or undefined. Update `backend/src/_core/oauth.ts` routes to return early with appropriate error if OAuth is not configured. Update `backend/src/index.ts` to conditionally register OAuth routes only when OAuth is configured.
      Files: `backend/src/_core/env.ts`, `backend/src/_core/sdk.ts`, `backend/src/_core/oauth.ts`, `backend/src/index.ts`
      Verify: Remove OAUTH_SERVER_URL from backend/.env, restart server with `npm run dev`. Server should start without OAuth errors. Calling /api/oauth/callback should return an error message indicating OAuth is not configured.

- [ ] 6. **Update frontend const.ts to detect and handle missing OAuth**
      Modify `frontend/src/const.ts` startLogin function: check if `VITE_OAUTH_PORTAL_URL` and `VITE_APP_ID` are defined before constructing the URL. If either is missing, throw a clear error: "OAuth not configured - use email/password login form". Export a new helper `isOAuthConfigured()` that returns boolean. This prevents the "Invalid URL" error.
      Files: `frontend/src/const.ts`
      Verify: In frontend/.env, set `VITE_OAUTH_PORTAL_URL=` (empty). Run `npm run dev` from frontend directory. Open browser console and call the exported `isOAuthConfigured()` function — should return false. Attempting to call `startLogin()` should throw the clear error message, not "Invalid URL".

- [ ] 7. **Create frontend development authentication helpers**
      Create a new module with async functions `devLogin(email, password)` and `devSignup(email, password, name)` that POST to the backend dev auth endpoints using fetch. Both return `{success: boolean, error?: string}`. Handle network errors and return user-friendly messages.
      Files: `frontend/src/lib/devAuth.ts` (new file)
      Verify: With backend running, open browser console and import the functions. Call `devSignup("user@test.com", "pass123", "Test")` and verify it returns `{success: true}`. Call `devLogin` with same credentials and verify success.

- [ ] 8. **Update login page to show email/password form when OAuth unavailable**
      Modify `frontend/src/pages/WorkspacePages.tsx` LoginPage component: import `isOAuthConfigured` and `devLogin`. When form submits, check `isOAuthConfigured()` — if true, call `startLogin(returnTo)` (existing OAuth flow); if false, call `devLogin` with form email/password values, show loading state during submission, display error if login fails, and redirect to returnTo path on success. Update the form fields to be controlled inputs with useState for email and password.
      Files: `frontend/src/pages/WorkspacePages.tsx` (LoginPage component)
      Verify: Start frontend with `npm run dev`. Navigate to /login. Form should show email/password fields. Enter credentials from previous test, submit form. Should redirect to dashboard on success. Invalid credentials should show error message without crashing.

- [ ] 9. **Update signup page to show email/password form when OAuth unavailable**
      Modify `frontend/src/pages/WorkspacePages.tsx` SignupPage component: import `isOAuthConfigured` and `devSignup`. When form submits, check `isOAuthConfigured()` — if true, call `startLogin(returnTo)` (existing OAuth flow); if false, call `devSignup` with form email/password/firstName/lastName values (concatenate first+last as name), show loading state, display error if signup fails, and redirect on success. Update form fields to be controlled inputs. Add password confirmation field with validation (passwords must match).
      Files: `frontend/src/pages/WorkspacePages.tsx` (SignupPage component)
      Verify: Navigate to /signup. Fill in all fields with matching passwords, submit. Should create account and redirect to dashboard. Try submitting with mismatched passwords — should show validation error. Try signing up with existing email — should show appropriate error from backend.

- [ ] 10. **Update environment configuration files**
       Update `backend/.env.example` to document OAuth as optional: add comments explaining that OAUTH_SERVER_URL and VITE_APP_ID can be left empty for dev auth mode. Update `frontend/.env.example` similarly. Update both actual .env files to remove or comment out OAuth URLs to enable dev auth by default in local development.
       Files: `backend/.env.example`, `backend/.env`, `frontend/.env.example`, `frontend/.env`
       Verify: Read both .env.example files and confirm the comments clearly explain the two auth modes. Read both .env files and confirm OAuth variables are empty or commented, enabling dev auth mode.

- [ ] 11. **Create backend tests for development authentication**
       Create test file that verifies: (1) dev-signup creates user with hashed password, (2) dev-login authenticates valid credentials, (3) dev-login rejects invalid credentials, (4) dev routes return 404 when OAuth is configured, (5) password hash is bcrypt format and verifiable. Use vitest following the pattern in `auth.logout.test.ts`.
       Files: `backend/src/auth.dev.test.ts` (new file)
       Verify: Run `npm run test` from backend directory. All dev auth tests should pass. Test output should show at least 5 passing tests for the scenarios listed above.

- [ ] 12. **Update README with authentication setup instructions**
       Add a new "Authentication Setup" section to the main README explaining the two authentication modes: (1) Development Mode (default) - uses email/password, no OAuth config needed, and (2) Production Mode - configure OAuth environment variables. Include setup steps for each mode and how to switch between them. Add a troubleshooting subsection for the "Invalid URL" error.
       Files: `README.md`
       Verify: Read the updated README and confirm the authentication section is clear and complete. Verify that a new developer could follow the instructions to set up either auth mode without additional guidance.

- [ ] 13. **Integration test: Full authentication flow**
       Manually test the complete flow: (1) Start backend and frontend with OAuth disabled, (2) Navigate to /signup and create a new account, (3) Verify redirect to dashboard after signup, (4) Call auth.me tRPC endpoint and verify user data, (5) Logout using the UI, (6) Navigate to /login and sign in with the created credentials, (7) Verify successful login and dashboard access. Document any issues found.
       Files: No file changes, this is a manual testing step
       Verify: Complete each step of the integration test successfully. The user should be able to signup, login, access protected routes, and logout without any console errors. The session cookie should persist across page refreshes.

---

## Success Criteria
- ✅ Frontend loads without "Invalid URL" error
- ✅ Users can sign up with email/password in development mode
- ✅ Users can log in with email/password in development mode
- ✅ Session tokens work identically for both OAuth and dev auth
- ✅ OAuth configuration is optional and can be enabled for production
- ✅ All existing OAuth functionality remains intact when configured
- ✅ Database schema supports both authentication methods
- ✅ Comprehensive tests cover development authentication
- ✅ Documentation clearly explains both authentication modes

---

## Technical Notes

### Password Security
- Use bcrypt with 10 salt rounds (good balance of security and performance)
- Store only hashed passwords, never plaintext
- Minimum password length: 8 characters (enforce in validation)

### Session Token Compatibility
- Dev auth uses `sdk.createSessionToken(openId, {name})` just like OAuth
- Session verification is unchanged — works for both auth methods
- The openId for dev users should use a prefix like `dev_` or be generated from email hash to avoid collisions with OAuth openIds

### Environment Variable Strategy
- OAuth enabled when `OAUTH_SERVER_URL` is non-empty
- Dev auth enabled when `OAUTH_SERVER_URL` is empty or undefined
- Frontend checks `VITE_OAUTH_PORTAL_URL` and `VITE_APP_ID` to determine which UI to show
- Both modes can coexist in the codebase; selection is purely configuration-driven

### Database Considerations
- `passwordHash` column must be nullable (VARCHAR 255)
- OAuth users have NULL passwordHash
- Dev auth users have NULL loginMethod initially (can set to "email")
- The `openId` field remains the unique identifier for all users

### Error Handling
- Backend dev auth routes validate input with zod schemas
- Password mismatch returns 401 with message "Invalid credentials"
- Duplicate email returns 400 with message "Email already registered"
- Frontend shows user-friendly error messages, never exposes stack traces

---

## Build and Test Commands

**Backend:**
- Install dependencies: `npm install` (from backend/)
- Run development server: `npm run dev` (from backend/)
- Run tests: `npm run test` (from backend/)
- Apply database migrations: `npm run db:push` (from backend/)

**Frontend:**
- Install dependencies: `npm install` (from frontend/)
- Run development server: `npm run dev` (from frontend/)
- Build for production: `npm run build` (from frontend/)

**Root:**
- Install all dependencies: `npm run install:all`
- Run both backend and frontend: `npm run dev`

---

## Files Modified/Created

### Modified:
1. `backend/package.json` - Add bcrypt dependency
2. `backend/drizzle/schema.ts` - Add passwordHash field
3. `backend/src/_core/env.ts` - Make OAuth optional
4. `backend/src/_core/sdk.ts` - Conditional OAuth initialization
5. `backend/src/_core/oauth.ts` - Check OAuth configured before handling
6. `backend/src/index.ts` - Register dev auth routes conditionally
7. `frontend/src/const.ts` - Add OAuth detection and safe startLogin
8. `frontend/src/pages/WorkspacePages.tsx` - Update LoginPage and SignupPage
9. `backend/.env.example` - Document optional OAuth
10. `backend/.env` - Default to dev auth mode
11. `frontend/.env.example` - Document optional OAuth
12. `frontend/.env` - Default to dev auth mode
13. `README.md` - Add authentication documentation

### Created:
1. `backend/src/_core/devAuth.ts` - Development authentication service and routes
2. `frontend/src/lib/devAuth.ts` - Frontend dev auth helpers
3. `backend/src/auth.dev.test.ts` - Tests for development authentication

---

## Dependencies Added
- **backend**: `bcrypt` (^5.1.1) and `@types/bcrypt` (^5.0.2) - for password hashing
