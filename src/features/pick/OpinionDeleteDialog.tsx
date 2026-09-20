import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useEffect, useState } from 'react';

import { Button, TrashIcon, useToast } from '../../shared/ui';

type OpinionDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => Promise<void> | void;
};

type OpenOpinionDeleteDialogProps = Omit<OpinionDeleteDialogProps, 'open'>;

function OpenOpinionDeleteDialog({ onOpenChange, onDelete }: OpenOpinionDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { clear, setSuspended } = useToast();

  useEffect(() => {
    clear();
    setSuspended(true);
    return () => setSuspended(false);
  }, [clear, setSuspended]);

  async function deleteOpinion() {
    if (deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await onDelete();
    } catch {
      setError('의견을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.');
      setDeleting(false);
    }
  }

  return (
    <AlertDialog.Root open onOpenChange={(nextOpen) => !deleting && onOpenChange(nextOpen)}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          className="dialog-overlay"
          onClick={() => !deleting && onOpenChange(false)}
        />
        <AlertDialog.Content
          className="confirm-dialog opinion-delete-dialog"
          aria-describedby="opinion-delete-description"
        >
          <span className="opinion-delete-dialog__icon" aria-hidden="true">
            <TrashIcon />
          </span>
          <AlertDialog.Title>의견을 삭제할까요?</AlertDialog.Title>
          <AlertDialog.Description id="opinion-delete-description">
            삭제한 의견은 복구할 수 없어요.
            <br />
            투표 기록은 그대로 유지돼요.
          </AlertDialog.Description>
          {error && (
            <p className="opinion-delete-dialog__error" role="alert">
              {error}
            </p>
          )}
          <div className="confirm-dialog__actions opinion-delete-dialog__actions">
            <AlertDialog.Cancel asChild>
              <Button variant="secondary" disabled={deleting}>
                취소
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button variant="danger" disabled={deleting} onClick={deleteOpinion}>
                {deleting ? '삭제 중…' : '삭제'}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

export function OpinionDeleteDialog({ open, ...props }: OpinionDeleteDialogProps) {
  return open ? <OpenOpinionDeleteDialog {...props} /> : null;
}
