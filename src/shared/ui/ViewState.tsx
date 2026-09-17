import { Button } from './Button';

export function LoadingState({ label = '불러오는 중이에요' }: { label?: string }) {
  return (
    <div className="view-state" role="status">
      <span className="view-state__spinner" />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="view-state">
      <div className="view-state__symbol" aria-hidden="true">
        ○
      </div>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

export function ErrorState({
  title = '불러오지 못했어요',
  description,
  onRetry,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div className="view-state" role="alert">
      <div className="view-state__symbol" aria-hidden="true">
        !
      </div>
      <strong>{title}</strong>
      <p>{description}</p>
      {onRetry && (
        <Button variant="secondary" size="medium" onClick={onRetry}>
          다시 시도
        </Button>
      )}
    </div>
  );
}
