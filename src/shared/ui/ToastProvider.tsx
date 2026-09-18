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
  const [active, setActive] = useState<Notice[]>([]);
  const [suspended, setSuspended] = useState(false);
  const id = useRef(0);

  const notify = useCallback(
    (notice: Omit<Notice, 'id'>) => {
      if (suspended) return;
      const duplicate = active.some(
        (item) => item.title === notice.title && item.description === notice.description,
      );
      if (duplicate) return;

      const next = { ...notice, id: ++id.current };
      setActive((items) => [next, ...items]);
    },
    [active, suspended],
  );

  const clear = useCallback(() => setActive([]), []);

  return (
    <ToastContext.Provider value={{ notify, clear, setSuspended }}>
      <Toast.Provider swipeDirection="down">
        {children}
        {active.map((notice) => (
          <Toast.Root
            key={notice.id}
            className={`app-toast app-toast--${notice.tone}`}
            open
            duration={notice.tone === 'error' ? 5000 : 3000}
            onOpenChange={(open) => {
              if (!open) setActive((items) => items.filter((item) => item.id !== notice.id));
            }}
          >
            <span className="app-toast__status" aria-hidden="true">
              <ToastStatusIcon tone={notice.tone} />
            </span>
            <div className="app-toast__content">
              <Toast.Title>{notice.title}</Toast.Title>
              {notice.description && <Toast.Description>{notice.description}</Toast.Description>}
            </div>
            <Toast.Close className="icon-button" aria-label="알림 닫기">
              <CloseIcon />
            </Toast.Close>
          </Toast.Root>
        ))}
        <Toast.Viewport className="toast-viewport" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}
