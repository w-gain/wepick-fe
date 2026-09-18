import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';

import { Button, CloseIcon, useToast } from '../../shared/ui';

type LoginRequiredSheetProps = {
  open: boolean;
  actionLabel: string;
  onOpenChange: (open: boolean) => void;
};

export function LoginRequiredSheet({ open, actionLabel, onOpenChange }: LoginRequiredSheetProps) {
  const { clear, setSuspended } = useToast();
  const [loginStarted, setLoginStarted] = useState(false);

  useEffect(() => {
    if (!open) return;
    clear();
    setSuspended(true);
    setLoginStarted(false);
    return () => setSuspended(false);
  }, [clear, open, setSuspended]);

  function startLogin() {
    setLoginStarted(true);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="sheet-content" aria-describedby="login-required-description">
          <div className="sheet-content__handle" aria-hidden="true" />
          <header className="sheet-content__header">
            <div className="sheet-content__header-copy">
              <Dialog.Title>로그인이 필요해요</Dialog.Title>
              <Dialog.Description id="login-required-description">
                {actionLabel}은 로그인 후 이용할 수 있어요. 로그인하면 지금 화면으로 돌아와요.
              </Dialog.Description>
            </div>
            <Dialog.Close className="icon-button" aria-label="닫기">
              <CloseIcon />
            </Dialog.Close>
          </header>
          <Button disabled={loginStarted} onClick={startLogin}>
            {loginStarted ? '로그인 준비 중…' : '카카오로 계속하기'}
          </Button>
          <Dialog.Close asChild>
            <Button variant="ghost">취소</Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
