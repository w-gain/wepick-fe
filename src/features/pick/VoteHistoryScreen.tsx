import { useNavigate } from 'react-router-dom';

import type { VoteHistory } from '../../shared/contracts';
import { EmptyState, ErrorState, LoadingState, MoonIcon } from '../../shared/ui';
import { useVoteHistory } from './api';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' }).format(
    new Date(value),
  );
}

function VoteHistoryCard({ item }: { item: VoteHistory['items'][number] }) {
  const navigate = useNavigate();
  const { pick } = item;

  return (
    <button
      type="button"
      className="past-pick-card vote-history-card"
      aria-label={`${formatDate(pick.representativeDate)} ${pick.question}, ${item.choice} 선택, ${formatDate(item.votedAt)} 참여`}
      onClick={() => navigate(`/picks/${pick.id}`)}
    >
      <span className={`past-pick-card__badge past-pick-card__badge--${item.choice.toLowerCase()}`}>
        {item.choice}
      </span>
      <span className="past-pick-card__body">
        <span className="past-pick-card__meta">
          {formatDate(pick.representativeDate)} · {pick.category.label}
        </span>
        <strong>{pick.question}</strong>
        <span className="past-pick-card__status is-voted">
          {item.choice} 선택 · {formatDate(item.votedAt)} 참여
        </span>
      </span>
      <span className="past-pick-card__arrow" aria-hidden="true">
        ›
      </span>
    </button>
  );
}

export function VoteHistoryScreen() {
  const query = useVoteHistory();

  return (
    <section className="past-picks-screen vote-history-screen" aria-labelledby="vote-history-title">
      <div className="mobile-status-bar" aria-hidden="true">
        <span>9:41</span>
        <span>▴ ◔ ▣</span>
      </div>
      <header className="pick-header past-picks-header">
        <span className="pick-header__brand">WePick</span>
        <button
          className="pick-header__action"
          type="button"
          aria-label="테마 전환"
          onClick={() => {
            const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
            document.documentElement.dataset.theme = next;
          }}
        >
          <MoonIcon />
        </button>
      </header>
      <div className="past-picks-intro">
        <h1 id="vote-history-title">내 투표 기록</h1>
        <p>내가 참여한 Pick을 다시 확인해요</p>
      </div>
      {query.isLoading && <LoadingState label="투표 기록을 불러오는 중이에요" />}
      {query.isError && (
        <ErrorState
          title="투표 기록을 불러오지 못했어요"
          description="잠시 후 다시 시도해 주세요."
          onRetry={() => query.refetch()}
        />
      )}
      {query.data && query.data.items.length === 0 && (
        <EmptyState
          title="아직 참여한 Pick이 없어요"
          description="오늘의 Pick에서 먼저 참여해 보세요."
        />
      )}
      {query.data && query.data.items.length > 0 && (
        <div className="past-pick-list" aria-label="내 투표 기록 목록">
          {query.data.items.map((item) => (
            <VoteHistoryCard key={item.id} item={item} />
          ))}
          {!query.data.nextCursor && (
            <p className="past-pick-list__end">투표 기록을 모두 확인했어요</p>
          )}
        </div>
      )}
    </section>
  );
}
