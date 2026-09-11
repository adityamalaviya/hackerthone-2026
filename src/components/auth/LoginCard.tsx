import React, { useState, useEffect } from 'react';
import {
  EnvelopeSimple,
  LockSimple,
  User,
  Phone,
  ArrowRight,
  CircleNotch,
  WarningCircle,
  CheckCircle,
  ShieldCheck,
} from '@phosphor-icons/react';
import { DotGridDecoration } from './DotGridDecoration';
import { FormInput } from './FormInput';
import { authService, UserSession } from '../../lib/appwrite';
import { registerMockUser } from '../../lib/mockUsers';
import {
  validateFullName,
  validateEmail,
  validatePhoneNumber,
  validatePassword,
  validateConfirmPassword,
  isRegistrationFormValid,
} from '../../lib/authValidation';

export interface LoginCardProps {
  initialMode?: 'login' | 'register';
  onSwitchToRegister?: () => void;
  onSwitchToLogin?: () => void;
  onSuccess: (session: UserSession) => void;
}

export const LoginCard: React.FC<LoginCardProps> = ({
  initialMode = 'login',
  onSwitchToRegister,
  onSwitchToLogin,
  onSuccess,
}): React.JSX.Element => {
  // Current view mode: 'login' or 'register' (transitions in place without layout shifts)
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const redirectTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync mode when initialMode prop changes externally
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Clean up any pending redirect timer on unmount
  useEffect(() => {
    return (): void => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, []);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Registration form state (preserved across mode toggles)
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Interaction tracking for inline validation
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Shared UI states
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const markTouched = (field: string): void => {
    setTouched((prev: Record<string, boolean>): Record<string, boolean> => ({ ...prev, [field]: true }));
  };

  // Inline validation calculations
  const fullNameError = touched.regFullName ? validateFullName(regFullName) : null;
  const emailError = touched.regEmail
    ? validateEmail(regEmail, { checkDuplicate: true })
    : null;
  const phoneError = touched.regPhone ? validatePhoneNumber(regPhone) : null;
  const passwordError = touched.regPassword ? validatePassword(regPassword) : null;
  const confirmPasswordError = touched.regConfirmPassword
    ? validateConfirmPassword(regConfirmPassword, regPassword)
    : null;

  // Form validity check (all required fields non-empty and satisfying validation)
  const isRegistrationValid = isRegistrationFormValid({
    fullName: regFullName,
    email: regEmail,
    phoneNumber: regPhone,
    password: regPassword,
    confirmPassword: regConfirmPassword,
  });

  // In-place mode toggles (inputs are preserved, not discarded)
  const handleSwitchToRegister = (): void => {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    // Pre-populate registration email from login email if not yet filled
    if (loginEmail && !regEmail) {
      setRegEmail(loginEmail);
      markTouched('regEmail');
    }
    setMode('register');
    onSwitchToRegister?.();
  };

  const handleSwitchToLogin = (): void => {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    setMode('login');
    onSwitchToLogin?.();
  };

  /**
   * Handle Login Submit
   */
  const handleLoginSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginEmail || !loginPassword) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    try {
      setIsLoggingIn(true);

      // =============================================================================
      // REAL BACKEND INTEGRATION POINT (LOGIN)
      // Replace with:
      // const session = await api.auth.login({ email: loginEmail, password: loginPassword });
      // =============================================================================
      const session = await authService.login(loginEmail, loginPassword);
      onSuccess(session);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Invalid credentials or login failed. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  /**
   * Handle Registration Submit (R2, R3)
   */
  const handleRegisterSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Touch all fields to surface any remaining feedback
    setTouched({
      regFullName: true,
      regEmail: true,
      regPhone: true,
      regPassword: true,
      regConfirmPassword: true,
    });

    if (!isRegistrationValid) {
      return;
    }

    try {
      setIsRegistering(true);

      // =============================================================================
      // REAL BACKEND INTEGRATION POINT (REGISTRATION)
      // In production, replace registerMockUser with a secure backend API call:
      //
      // const response = await fetch('/api/v1/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     fullName: regFullName.trim(),
      //     email: regEmail.trim().toLowerCase(),
      //     phoneNumber: regPhone.trim(),
      //     password: regPassword, // Server securely hashes with Argon2id / bcrypt
      //     role: 'citizen',       // Enforced server-side
      //   }),
      // });
      // =============================================================================
      const newCitizen = await registerMockUser({
        fullName: regFullName,
        email: regEmail,
        phoneNumber: regPhone,
        // REAL BACKEND INTEGRATION: Production backend must securely hash this password
        password: regPassword,
      });

      // Display clear success state
      setSuccessMessage(
        `Welcome ${newCitizen.full_name}! Your citizen account has been created. Redirecting to sign in...`
      );

      // Pre-fill login email with the newly registered user's email for convenience
      setLoginEmail(newCitizen.email);

      // Clear all registration fields and touched states so a subsequent sign-up starts clean
      setRegFullName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      setRegConfirmPassword('');
      setTouched({});

      // Automatically transition back to Login mode after displaying success state
      redirectTimeoutRef.current = setTimeout(() => {
        setMode('login');
        setSuccessMessage('Account created successfully! Please enter your password to sign in.');
        onSwitchToLogin?.();
        redirectTimeoutRef.current = setTimeout(() => {
          setSuccessMessage(null);
          redirectTimeoutRef.current = null;
        }, 3500);
      }, 1100);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Registration could not be completed. Please check your details.';
      setErrorMessage(message);
    } finally {
      setIsRegistering(false);
    }
  };

  /**
   * Handle Google OAuth / Social Login
   */
  const handleGoogleLogin = async (): Promise<void> => {
    try {
      setIsGoogleLoading(true);
      setErrorMessage(null);
      await authService.loginWithGoogle();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Google sign-in could not be completed.';
      setErrorMessage(message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-[440px] bg-white dark:bg-civic-900 rounded-3xl p-8 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] border border-civic-200/90 dark:border-civic-800 transition-all duration-300">
      {/* Restrained Dot Grid in Top-Right Corner */}
      <DotGridDecoration rows={4} cols={5} />

      {/* Mode-Specific Header */}
      {mode === 'login' ? (
        <div className="mb-7 pr-12">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-accent inline-block" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-civic-500 dark:text-civic-400">
              civicFix Auth
            </span>
          </div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-civic-950 dark:text-civic-50 tracking-tight leading-tight">
            Login
          </h1>
          <p className="text-xs text-civic-500 dark:text-civic-400 mt-1 font-normal">
            Universal portal for Gandhidham citizens, staff, and administrators.
          </p>
        </div>
      ) : (
        <div className="mb-5 pr-12">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-accent inline-block" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-civic-500 dark:text-civic-400">
              Citizen Registration
            </span>
          </div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-civic-950 dark:text-civic-50 tracking-tight leading-tight">
            Sign Up
          </h1>
          <p className="text-xs text-civic-500 dark:text-civic-400 mt-1 font-normal">
            Create your citizen account to report and track Gandhidham issues.
          </p>

          {/* R2: Strictly non-selectable citizen role badge */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[11px] font-semibold">
            <ShieldCheck size={14} weight="bold" />
            <span>Assigned Role: Citizen</span>
          </div>
        </div>
      )}

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="mb-5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed animate-in fade-in">
          <CheckCircle
            size={16}
            weight="fill"
            className="text-emerald-600 flex-shrink-0 mt-0.5"
          />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-800 flex items-start gap-2.5 text-xs text-red-800 dark:text-red-200 leading-relaxed animate-in fade-in">
          <WarningCircle
            size={16}
            weight="fill"
            className="text-red-500 flex-shrink-0 mt-0.5"
          />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODE: LOGIN FORM                                                      */}
      {/* ===================================================================== */}
      {mode === 'login' ? (
        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
          <FormInput
            label="EMAIL"
            type="email"
            id="login-email"
            placeholder="username@gmail.com"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            icon={<EnvelopeSimple size={18} weight="regular" />}
            autoComplete="email"
            required
          />

          <div className="flex flex-col gap-1.5">
            <FormInput
              label="PASSWORD"
              isPassword
              id="login-password"
              placeholder="••••••••"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              icon={<LockSimple size={18} weight="regular" />}
              autoComplete="current-password"
              required
            />

            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                onClick={(): void => {
                  if (typeof window !== 'undefined' && typeof window.alert === 'function') {
                    window.alert(
                      'Password recovery link will be sent to your verified email address.'
                    );
                  } else {
                    setErrorMessage('Password recovery link will be sent to your verified email address.');
                  }
                }}
                className="text-[11px] font-medium text-civic-500 dark:text-civic-400 hover:text-accent dark:hover:text-accent transition-colors underline-offset-2 hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isLoggingIn || isGoogleLoading}
            className="mt-2 w-full py-3 px-4 bg-civic-950 hover:bg-black dark:bg-civic-100 dark:text-civic-950 dark:hover:bg-white text-white text-xs font-semibold tracking-wide rounded-xl shadow-sm hover:shadow-md transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
          >
            {isLoggingIn ? (
              <>
                <CircleNotch size={16} className="animate-spin text-civic-300 dark:text-civic-600" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight
                  size={14}
                  weight="bold"
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </>
            )}
          </button>
        </form>
      ) : (
        /* ===================================================================== */
        /* MODE: CITIZEN REGISTRATION FORM (R2)                                 */
        /* ===================================================================== */
        <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3.5">
          {/* Full Name */}
          <FormInput
            label="FULL NAME"
            type="text"
            id="register-fullname"
            placeholder="e.g. Ramesh Patel"
            value={regFullName}
            onChange={(e) => {
              setRegFullName(e.target.value);
              markTouched('regFullName');
            }}
            onBlur={() => markTouched('regFullName')}
            icon={<User size={18} weight="regular" />}
            autoComplete="name"
            error={fullNameError || undefined}
            required
          />

          {/* Email */}
          <FormInput
            label="EMAIL"
            type="email"
            id="register-email"
            placeholder="username@gmail.com"
            value={regEmail}
            onChange={(e) => {
              setRegEmail(e.target.value);
              markTouched('regEmail');
            }}
            onBlur={() => markTouched('regEmail')}
            icon={<EnvelopeSimple size={18} weight="regular" />}
            autoComplete="email"
            error={emailError || undefined}
            required
          />

          {/* Phone Number */}
          <FormInput
            label="PHONE NUMBER"
            type="tel"
            id="register-phone"
            placeholder="+91 98765 43210"
            value={regPhone}
            onChange={(e) => {
              setRegPhone(e.target.value);
              markTouched('regPhone');
            }}
            onBlur={() => markTouched('regPhone')}
            icon={<Phone size={18} weight="regular" />}
            autoComplete="tel"
            error={phoneError || undefined}
            required
          />

          {/* Password with Eye mask toggle */}
          <FormInput
            label="PASSWORD"
            isPassword
            id="register-password"
            placeholder="Minimum 8 characters (letters & numbers)"
            value={regPassword}
            onChange={(e) => {
              setRegPassword(e.target.value);
              markTouched('regPassword');
            }}
            onBlur={() => markTouched('regPassword')}
            icon={<LockSimple size={18} weight="regular" />}
            autoComplete="new-password"
            error={passwordError || undefined}
            required
          />

          {/* Confirm Password with Eye mask toggle */}
          <FormInput
            label="CONFIRM PASSWORD"
            isPassword
            id="register-confirm-password"
            placeholder="Re-enter password"
            value={regConfirmPassword}
            onChange={(e) => {
              setRegConfirmPassword(e.target.value);
              markTouched('regConfirmPassword');
            }}
            onBlur={() => markTouched('regConfirmPassword')}
            icon={<LockSimple size={18} weight="regular" />}
            autoComplete="new-password"
            error={confirmPasswordError || undefined}
            required
          />

          {/* Submit Button (disabled when required fields are empty/invalid, enters spinner on submit) */}
          <button
            type="submit"
            disabled={!isRegistrationValid || isRegistering || isGoogleLoading}
            className="mt-2 w-full py-3 px-4 bg-civic-950 hover:bg-black dark:bg-civic-100 dark:text-civic-950 dark:hover:bg-white text-white text-xs font-semibold tracking-wide rounded-xl shadow-sm hover:shadow-md transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
          >
            {isRegistering ? (
              <>
                <CircleNotch size={16} className="animate-spin text-civic-300 dark:text-civic-600" />
                <span>Creating citizen account...</span>
              </>
            ) : (
              <>
                <span>Create Citizen Account</span>
                <ArrowRight
                  size={14}
                  weight="bold"
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </>
            )}
          </button>
        </form>
      )}

      {/* Horizontal Divider */}
      <div className="relative my-6 flex items-center justify-center">
        <div className="w-full border-t border-civic-200/90 dark:border-civic-800" />
        <span className="absolute bg-white dark:bg-civic-900 px-3 text-[10px] font-bold tracking-[0.14em] uppercase text-civic-400 dark:text-civic-500 select-none">
          OR CONTINUE WITH
        </span>
      </div>

      {/* Social Login Button */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoggingIn || isRegistering || isGoogleLoading}
          className="w-full py-2.5 px-4 bg-civic-50 dark:bg-civic-800 hover:bg-civic-100 dark:hover:bg-civic-700 active:bg-civic-200 dark:active:bg-civic-600 border border-civic-200/90 dark:border-civic-700 rounded-full text-xs font-medium text-civic-800 dark:text-civic-200 transition-all duration-150 flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.99] disabled:opacity-70 cursor-pointer"
        >
          {isGoogleLoading ? (
            <CircleNotch size={16} className="animate-spin text-civic-600 dark:text-civic-300" />
          ) : (
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.29 21.41 7.37 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.29 2.59 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>
      </div>

      {/* R1: Mode Toggle Links */}
      <div className="mt-6 text-center">
        {mode === 'login' ? (
          <p className="text-xs text-civic-500 dark:text-civic-400">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={handleSwitchToRegister}
              className="font-semibold text-civic-900 dark:text-civic-100 hover:text-accent dark:hover:text-accent transition-colors underline-offset-2 hover:underline cursor-pointer"
            >
              Sign Up
            </button>
          </p>
        ) : (
          <p className="text-xs text-civic-500 dark:text-civic-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={handleSwitchToLogin}
              className="font-semibold text-civic-900 dark:text-civic-100 hover:text-accent dark:hover:text-accent transition-colors underline-offset-2 hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </p>
        )}
      </div>
    </div>
  );
};
