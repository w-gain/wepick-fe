import * as Dialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';

import { CloseIcon } from './icons';

type SheetProps = {
  trigger: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
};

export function Sheet({ trigger, title, description, children }: SheetProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="sheet-content">
          <div className="sheet-content__handle" aria-hidden="true" />
          <header className="sheet-content__header">
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              {description && <Dialog.Description>{description}</Dialog.Description>}
            </div>
            <Dialog.Close className="icon-button" aria-label="닫기">
              <CloseIcon />
            </Dialog.Close>
          </header>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
