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
  const [active, setActive] = useState<Notice | null>(null);
  const queue = useRef<Notice[]>([]);
  const id = useRef(0);

  const showNext = useCallback(() => setActive(queue.current.shift() ?? null), []);

  const notify = useCallback(
    (notice: Omit<Notice, 'id'>) => {
      const duplicate = active?.title === notice.title && active.description === notice.description;
      const queued = queue.current.some(
        (item) => item.title === notice.title && item.description === notice.description,
      );
      if (duplicate || queued) return;

      const next = { ...notice, id: ++id.current };
      if (active) queue.current.push(next);
      else setActive(next);
    },
    [active],
  );

  return (
    <ToastContext.Provider value={{ notify }}>
      <Toast.Provider swipeDirection="down" duration={active?.tone === 'error' ? 5000 : 3000}>
        {children}
        {active && (
          <Toast.Root
            key={active.id}
            className={`app-toast app-toast--${active.tone}`}
            open
            onOpenChange={(open) => {
              if (!open) showNext();
            }}
          >
            <span className="app-toast__status" aria-hidden="true">
              <ToastStatusIcon tone={active.tone} />
            </span>
            <div className="app-toast__content">
              <Toast.Title>{active.title}</Toast.Title>
              {active.description && <Toast.Description>{active.description}</Toast.Description>}
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
