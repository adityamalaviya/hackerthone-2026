# CivicFix Gandhidham — Architecture & Module Index

Welcome to the CivicFix codebase for Gandhidham Municipal Corporation.
This platform provides a smart civic issue reporting and resolution system for citizens, municipal staff, and administrators.

## System Architecture

```
src/
├── components/          # Shared and domain-specific UI components
│   ├── auth/            # Authentication & registration components (LoginCard, FormInput, DotGridDecoration)
│   ├── admin/           # Administrative portal and audit views
│   └── staff/           # Municipal staff triage and resolution workflows
├── lib/                 # Core utilities, validation, API clients, and mock stores
│   ├── authValidation.ts # Single-source client-side registration and authentication validation
│   ├── mockUsers.ts     # Shared cross-platform user store (web & mobile compatible)
│   ├── appwrite.ts      # Appwrite backend integration and session management
│   └── admin/           # Administrative data services and mock statistics
├── styles/              # Design tokens and global CSS styles
│   └── tokens.ts        # Centralized palette and typography design tokens
├── types/               # Shared TypeScript domain contracts
│   ├── auth.ts          # UserSession, MockUser, CitizenMockUser, and registration input types
│   └── admin.ts         # Administrative and reporting types
└── data/                # Municipal reference datasets (localities, initial issues)
```

## Core Principles & Coding Standards (GLOBAL_RULES.md)

1. **Type Safety**: TypeScript strict mode with zero `any`, zero `as unknown as`, and fully typed function signatures.
2. **Component Discipline**: Functional components only, zero class components, clean hook lifecycles.
3. **Styling & Design Tokens**: Tailwind CSS token usage only; dark mode variants required on all elements.
4. **Icons**: `@phosphor-icons/react` exclusively.
5. **Cross-Platform Compatibility**: Pure TypeScript logic in `src/lib/` is runtime-agnostic for both web (React/Vite) and mobile (React Native/Expo).
