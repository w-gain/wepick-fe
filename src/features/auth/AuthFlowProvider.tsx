import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { AuthFlowContext, type AuthStatus, type LoginIntent } from './authFlow';

export function AuthFlowProvider({
  children,
  initialStatus = 'unknown',
  resolveInitialStatus,
}: {
  children: ReactNode;
  initialStatus?: AuthStatus;
  resolveInitialStatus?: () => Promise<AuthStatus>;
}) {
  const [status, setStatus] = useState<AuthStatus>(initialStatus);
  const [pendingIntent, setPendingIntent] = useState<LoginIntent | null>(null);
  const [sessionAttempt, setSessionAttempt] = useState(0);

  useEffect(() => {
    if (initialStatus !== 'unknown' || !resolveInitialStatus) return;

    let active = true;
    void resolveInitialStatus()
      .then((resolvedStatus) => {
        if (active) setStatus(resolvedStatus);
      })
      .catch(() => {
        if (active) setStatus('unavailable');
      });

    return () => {
      active = false;
    };
  }, [initialStatus, resolveInitialStatus, sessionAttempt]);

  const retrySession = useCallback(() => {
    setStatus('unknown');
    setSessionAttempt((attempt) => attempt + 1);
  }, []);
  const beginLogin = useCallback((intent: LoginIntent) => setPendingIntent(intent), []);
  const cancelLogin = useCallback(() => setPendingIntent(null), []);
  const consumeLoginIntent = useCallback(() => {
    const intent = pendingIntent;
    setPendingIntent(null);
    return intent;
  }, [pendingIntent]);

  const value = useMemo(
    () => ({
      status,
      pendingIntent,
      setStatus,
      retrySession,
      beginLogin,
      consumeLoginIntent,
      cancelLogin,
    }),
    [status, pendingIntent, retrySession, beginLogin, consumeLoginIntent, cancelLogin],
  );

  return <AuthFlowContext.Provider value={value}>{children}</AuthFlowContext.Provider>;
}
