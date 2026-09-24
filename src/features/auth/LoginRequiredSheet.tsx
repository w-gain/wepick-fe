import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';

import { Button, CloseIcon, useToast } from '../../shared/ui';
import { type LoginIntent, useAuthFlow } from './authFlow';

type LoginRequiredSheetProps = {
  open: boolean;
  actionLabel: string;
  intent: LoginIntent;
  onOpenChange: (open: boolean) => void;
};

type OpenLoginRequiredSheetProps = Omit<LoginRequiredSheetProps, 'open'>;

function OpenLoginRequiredSheet({
  actionLabel,
  intent,
  onOpenChange,
}: OpenLoginRequiredSheetProps) {
  const { clear, setSuspended } = useToast();
  const { beginLogin, cancelLogin } = useAuthFlow();
  const [loginStarted, setLoginStarted] = useState(false);

  useEffect(() => {
    clear();
    setSuspended(true);
    return () => setSuspended(false);
  }, [clear, setSuspended]);

  function startLogin() {
    beginLogin(intent);
    setLoginStarted(true);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) cancelLogin();
    onOpenChange(nextOpen);
  }

  return (
    <Dialog.Root open onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="sheet-content" aria-describedby="login-required-description">
          <div className="sheet-content__handle" aria-hidden="true" />
          <header className="sheet-content__header">
            <div className="sheet-content__header-copy">
              <Dialog.Title>로그인이 필요해요</Dialog.Title>
              <Dialog.Description id="login-required-description">
                <span className="sheet-content__description-line">
                  {`${actionLabel}은 로그인 후 이용할 수 있어요.`}
                </span>
                <span className="sheet-content__description-line">
                  로그인하면 지금 화면으로 돌아와요.
                </span>
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

export function LoginRequiredSheet({ open, ...props }: LoginRequiredSheetProps) {
  return open ? <OpenLoginRequiredSheet {...props} /> : null;
}
