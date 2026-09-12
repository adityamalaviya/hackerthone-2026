# Pages Module (`src/pages`)

## Purpose
Provides first-party application route pages for CivicFix Gandhidham, implementing Appwrite OAuth2 token authentication, callbacks, and guarded citizen views.

## Routes Breakdown
1. `AuthPage.tsx` (`/auth`):
   - Signed-out authentication page.
   - Enforces Auth Guard: Awaits `account.get()`. If already authenticated, redirects immediately to `/` (home page).
   - Renders primary CTA "Sign in with Google" via `GoogleSignInButton`.

2. `OAuthSuccessPage.tsx` (`/auth/success`):
   - First-party OAuth callback page.
   - Parses `userId` and `secret` parameters from the query string.
   - Awaits `account.createSession({ userId, secret })`.
   - On success, redirects to `/` (home page). On failure, redirects to `/auth/failure`.

3. `OAuthFailurePage.tsx` (`/auth/failure`):
   - First-party OAuth error page.
   - Renders failure message and error details.
   - Provides a direct CTA button to return to `/auth`.

4. `DashboardPage.tsx` (`/dashboard`):
   - Deprecated route that immediately redirects to `/` (home page).
   - Directs authenticated citizens back to the main interactive portal.
