import { type ReactNode, useCallback, useMemo, useState } from 'react';

import { AuthFlowContext, type AuthStatus, type LoginIntent } from './authFlow';

export function AuthFlowProvider({
  children,
  initialStatus = 'unknown',
}: {
  children: ReactNode;
  initialStatus?: AuthStatus;
}) {
  const [status, setStatus] = useState<AuthStatus>(initialStatus);
  const [pendingIntent, setPendingIntent] = useState<LoginIntent | null>(null);

  const beginLogin = useCallback((intent: LoginIntent) => setPendingIntent(intent), []);
  const cancelLogin = useCallback(() => setPendingIntent(null), []);
  const consumeLoginIntent = useCallback(() => {
    const intent = pendingIntent;
    setPendingIntent(null);
    return intent;
  }, [pendingIntent]);

  const value = useMemo(
    () => ({ status, pendingIntent, setStatus, beginLogin, consumeLoginIntent, cancelLogin }),
    [status, pendingIntent, beginLogin, consumeLoginIntent, cancelLogin],
  );

  return <AuthFlowContext.Provider value={value}>{children}</AuthFlowContext.Provider>;
}
