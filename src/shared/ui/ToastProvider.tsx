import * as Toast from '@radix-ui/react-toast';
import { type ReactNode, useCallback, useRef, useState } from 'react';

import { CheckIcon, CloseIcon, ErrorIcon, InfoIcon } from './icons';
import { type Notice, ToastContext } from './ToastContext';

function ToastStatusIcon({ tone }: Pick<Notice, 'tone'>) {
  if (tone === 'success') return <CheckIcon />;
  if (tone === 'error') return <ErrorIcon />;
  if (tone === 'loading') return <span className="app-toast__spinner" />;
  return <InfoIcon />;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [suspended, setSuspended] = useState(false);
  const id = useRef(0);

  const notify = useCallback((notice: Omit<Notice, 'id'>) => {
    setNotices((items) => {
      const duplicate = items.some(
        (item) => item.title === notice.title && item.description === notice.description,
      );
      if (duplicate) return items;

      const next = { ...notice, id: ++id.current };
      return [...items, next];
    });
  }, []);

  const clear = useCallback(() => setNotices([]), []);
  const activeNotice = suspended ? undefined : notices[0];

  return (
    <ToastContext.Provider value={{ notify, clear, setSuspended }}>
      <Toast.Provider swipeDirection="down">
        {children}
        {activeNotice && (
          <Toast.Root
            key={activeNotice.id}
            className={`app-toast app-toast--${activeNotice.tone}`}
            open
            duration={activeNotice.tone === 'error' ? 5000 : 3000}
            onOpenChange={(open) => {
              if (!open) setNotices((items) => items.slice(1));
            }}
          >
            <span className="app-toast__status" aria-hidden="true">
              <ToastStatusIcon tone={activeNotice.tone} />
            </span>
            <div className="app-toast__content">
              <Toast.Title>{activeNotice.title}</Toast.Title>
              {activeNotice.description && (
                <Toast.Description>{activeNotice.description}</Toast.Description>
              )}
            </div>
            <Toast.Close className="icon-button" aria-label="알림 닫기">
              <CloseIcon />
            </Toast.Close>
          </Toast.Root>
        )}
        <Toast.Viewport className="toast-viewport" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}
