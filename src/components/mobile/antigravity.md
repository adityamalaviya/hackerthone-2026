# Mobile Authentication Module (`src/components/mobile`)

## Purpose
Implements the React Native / Expo OAuth2 flow for "Sign in with Google" using Appwrite Auth, custom deep link scheme handling (`appwrite-callback-6aa3a24400158be49594`), navigation auth guards, and the signed-in Dashboard.

## Architecture & Rule Adherence
1. **OAuth2 Token Flow**: Uses `account.createOAuth2Token` with `WebBrowser.openAuthSessionAsync` and exchanges `userId` + `secret` via `account.createSession`. Strictly avoids deprecated/direct `createOAuth2Session`.
2. **Security**: Zero OAuth client secrets in application binaries. Secrets remain isolated in the Appwrite Console for project `6aa3a24400158be49594`.
3. **Auth Guards**:
   - `DashboardScreen`: Awaits `account.get()`. If session is missing or invalid, navigates to `AuthScreen`.
   - `AuthScreen`: Awaits `account.get()`. If session exists, navigates to `DashboardScreen`.
   - `MobileAuthNavigator`: Resolves auth state before rendering protected UI.
4. **UI Standards**: Primary CTA labeled "Sign in with Google" featuring the exact provider SVG icon, clean status handling, user name display (fallback to email), and explicit sign out control.
