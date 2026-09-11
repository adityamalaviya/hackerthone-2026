import React from 'react';
import { LoginCard } from './LoginCard';
import { UserSession } from '../../lib/appwrite';

export interface RegisterCardProps {
  onSwitchToLogin: () => void;
  onSuccess: (session: UserSession) => void;
}

/**
 * RegisterCard provides backward-compatible registration card export
 * backed by the unified, validated authentication card component.
 */
export const RegisterCard: React.FC<RegisterCardProps> = ({
  onSwitchToLogin,
  onSuccess,
}): React.JSX.Element => {
  return (
    <LoginCard
      initialMode="register"
      onSwitchToLogin={onSwitchToLogin}
      onSuccess={onSuccess}
    />
  );
};
