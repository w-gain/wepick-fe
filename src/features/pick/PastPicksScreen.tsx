import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { dataMode } from '../../app/enableMocking';
import { MoonIcon, EmptyState, ErrorState, LoadingState, useToast } from '../../shared/ui';
import { usePastPicks, type PastPicksItem } from './api';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' }).format(
    new Date(`${value}T00:00:00`),
  );
}

function PastPickCard({ item }: { item: PastPicksItem }) {
  const navigate = useNavigate();
  const { notify } = useToast();
  if (item.source === 'current-be') {
    return (
      <button
        type="button"
        className="past-pick-card"
        aria-label={`${formatDate(item.representativeDate)} ${item.question}, 참여 여부 확인 불가, 상세 보기 준비 중`}
        onClick={() => notify({ tone: 'info', title: 'Pick 상세는 준비 중이에요.' })}
      >
        <span className="past-pick-card__badge" aria-hidden="true">
          ○
        </span>
        <span className="past-pick-card__body">
          <span className="past-pick-card__meta">{formatDate(item.representativeDate)}</span>
          <strong>{item.question}</strong>
          <span className="past-pick-card__status">참여 여부를 확인할 수 없어요</span>
        </span>
      </button>
    );
  }

  const pick = item.pick;
  const choice = pick.userVote;

  return (
    <button
      type="button"
      className="past-pick-card"
      aria-label={`${formatDate(pick.representativeDate)} ${pick.question}, ${choice ? `${choice} 선택` : '미참여'}`}
      onClick={() => navigate(`/picks/${pick.id}`)}
    >
      <span
        className={`past-pick-card__badge${choice ? ` past-pick-card__badge--${choice.toLowerCase()}` : ''}`}
      >
        {choice ?? '○'}
      </span>
      <span className="past-pick-card__body">
        <span className="past-pick-card__meta">
          {formatDate(pick.representativeDate)}
          {pick.category && ` · ${pick.category.label}`}
        </span>
        <strong>{pick.question}</strong>
        <span className={`past-pick-card__status${choice ? ' is-voted' : ''}`}>
          {choice ? `참여 · ${choice} 선택` : '미참여 · 투표하면 결과가 공개돼요'}
        </span>
      </span>
      <span className="past-pick-card__arrow" aria-hidden="true">
        ›
      </span>
    </button>
  );
}

export function PastPicksScreen() {
  const query = usePastPicks();
  const { hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } = query;
  const sentinelRef = useRef<HTMLDivElement>(null);
  const seen = new Set<string>();
  const items = (query.data?.pages.flatMap((page) => page.items) ?? []).filter((item) => {
    const id = item.source === 'mock' ? item.pick.id : item.id;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || isFetchNextPageError) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void fetchNextPage();
      },
      { rootMargin: '200px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  return (
    <section className="past-picks-screen" aria-labelledby="past-picks-title">
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
        <h1 id="past-picks-title">지난 Pick</h1>
        <p>
          {dataMode === 'mock' ? '지나간 질문도 계속 참여할 수 있어요' : '지난 질문을 둘러보세요'}
        </p>
      </div>
      {query.isLoading && <LoadingState label="지난 Pick을 불러오는 중이에요" />}
      {query.isError && !query.data && (
        <ErrorState
          title="지난 Pick을 불러오지 못했어요"
          description="잠시 후 다시 시도해 주세요."
          onRetry={() => query.refetch()}
        />
      )}
      {query.data && items.length === 0 && !query.hasNextPage && (
        <EmptyState
          title="아직 지난 Pick이 없어요"
          description="오늘의 Pick에서 먼저 참여해 보세요."
        />
      )}
      {query.data && (items.length > 0 || query.hasNextPage) && (
        <div className="past-pick-list" aria-label="지난 Pick 목록">
          <span className="sr-only" aria-live="polite">
            지난 Pick {items.length}개
          </span>
          {items.map((item) => (
            <PastPickCard key={item.source === 'mock' ? item.pick.id : item.id} item={item} />
          ))}
          {query.hasNextPage && (
            <div ref={sentinelRef} className="past-pick-list__sentinel" aria-hidden="true" />
          )}
          {query.isFetchingNextPage && <LoadingState label="목록을 더 불러오는 중이에요" />}
          {query.isFetchNextPageError && (
            <ErrorState
              title="목록을 더 불러오지 못했어요"
              description="다시 시도해 주세요."
              onRetry={() => query.fetchNextPage()}
            />
          )}
          {!query.hasNextPage && <p className="past-pick-list__end">지난 Pick을 모두 확인했어요</p>}
        </div>
      )}
    </section>
  );
}
