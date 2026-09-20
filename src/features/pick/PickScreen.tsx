import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import type { Choice, Opinion, Pick } from '../../shared/contracts';
import {
  Button,
  BackIcon,
  EmptyState,
  ErrorState,
  LoadingState,
  ResultBar,
  MoonIcon,
  ShareIcon,
  useToast,
  VoteChoice,
} from '../../shared/ui';
import type { LoginIntent } from '../auth/authFlow';
import { useAuthFlow } from '../auth/authFlow';
import { LoginRequiredSheet } from '../auth/LoginRequiredSheet';
import { OpinionDeleteDialog } from './OpinionDeleteDialog';
import { OpinionEditorSheet } from './OpinionEditorSheet';
import { useOpinions, usePick, useVote } from './api';

type PickScreenProps = { pickId?: string };

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' }).format(
    new Date(`${value}T00:00:00`),
  );
}

function PickHeader({ detail }: { detail: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { notify } = useToast();

  return (
    <header className="pick-header">
      {detail ? (
        <button className="pick-header__back" type="button" onClick={() => navigate(-1)}>
          <BackIcon />
          <span>Pick 상세</span>
          <span className="sr-only">뒤로가기</span>
        </button>
      ) : (
        <span className="pick-header__brand">WePick</span>
      )}
      <div className="pick-header__actions">
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
        <button
          className="pick-header__action"
          type="button"
          aria-label="Pick 공유"
          onClick={async () => {
            const url = window.location.href;
            if (navigator.share) {
              await navigator.share({ title: 'WePick', url }).catch(() => undefined);
            } else {
              await navigator.clipboard?.writeText(url);
              notify({ tone: 'success', title: '링크를 복사했어요.' });
            }
          }}
        >
          <ShareIcon />
        </button>
      </div>
      <span className="sr-only">{location.pathname}</span>
    </header>
  );
}

function PickMeta({ pick, detail }: { pick: Pick; detail: boolean }) {
  return (
    <div className="pick-meta">
      <span className="pick-meta__category">취향·일상</span>
      <span>{detail ? '지난 Pick' : '오늘의 Pick'}</span>
      <time dateTime={pick.representativeDate}>{formatDate(pick.representativeDate)}</time>
    </div>
  );
}

function OpinionCard({
  opinion,
  onLike,
  onEdit,
  onDelete,
}: {
  opinion: Opinion;
  onLike?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <article className="opinion-card">
      <div className="opinion-card__topline">
        <span className={`choice-label choice-label--${opinion.choice.toLowerCase()}`}>
          {opinion.choice}
        </span>
        <span>{opinion.author.nickname}</span>
        <time dateTime={opinion.createdAt}>{opinion.edited ? '수정됨' : '최근'}</time>
      </div>
      <p>{opinion.body}</p>
      {opinion.ownedByMe ? (
        <div className="opinion-card__actions">
          <button className="opinion-card__edit" type="button" onClick={onEdit}>
            수정
          </button>
          <button className="opinion-card__delete" type="button" onClick={onDelete}>
            삭제
          </button>
        </div>
      ) : (
        <button className="opinion-card__like" type="button" onClick={onLike}>
          {opinion.likedByMe ? '♥' : '♡'} {opinion.likeCount}
        </button>
      )}
    </article>
  );
}

type OpinionEditorState = {
  mode: 'create' | 'edit';
  opinion?: Opinion;
};

function ResultAndOpinions({ pick }: { pick: Pick }) {
  const opinionsQuery = useOpinions(pick.id, Boolean(pick.result));
  const [filter, setFilter] = useState<'all' | Choice>('all');
  const [loginIntent, setLoginIntent] = useState<LoginIntent | null>(null);
  const [editor, setEditor] = useState<OpinionEditorState | null>(null);
  const [deleteOpinion, setDeleteOpinion] = useState<Opinion | null>(null);
  const location = useLocation();
  const { status } = useAuthFlow();
  const { notify } = useToast();
  const opinions = opinionsQuery.data?.items ?? [];
  const filteredOpinions =
    filter === 'all' ? opinions : opinions.filter((opinion) => opinion.choice === filter);
  const forceCreateScenario =
    import.meta.env.DEV && new URLSearchParams(location.search).get('opinion') === 'create';
  const ownedOpinion = forceCreateScenario
    ? undefined
    : (opinions.find((opinion) => opinion.ownedByMe) ??
      Object.values(pick.representativeOpinions).find((opinion) => opinion?.ownedByMe));

  function openEditor(nextEditor: OpinionEditorState) {
    if (status === 'authenticated') {
      setEditor(nextEditor);
      return;
    }
    setLoginIntent({
      action: 'write-opinion',
      returnTo: `${location.pathname}${location.search}`,
      targetId: pick.id,
      draft: nextEditor.opinion?.body,
    });
  }

  function likeOpinion(opinion: Opinion) {
    if (status === 'authenticated') {
      notify({ tone: 'info', title: '현재 지원하지 않는 기능이에요.' });
      return;
    }
    setLoginIntent({
      action: 'like-opinion',
      returnTo: `${location.pathname}${location.search}`,
      targetId: opinion.id,
    });
  }

  function requestDelete(opinion: Opinion) {
    if (status === 'authenticated') {
      setDeleteOpinion(opinion);
      return;
    }
    setLoginIntent({
      action: 'delete-opinion',
      returnTo: `${location.pathname}${location.search}`,
      targetId: opinion.id,
    });
  }

  return (
    <section className="pick-results" aria-labelledby="pick-results-title">
      <h2 id="pick-results-title" className="sr-only">
        투표 결과
      </h2>
      {pick.result && (
        <ResultBar
          result={pick.result}
          selectedChoice={pick.userVote}
          labels={{ A: pick.options[0].label, B: pick.options[1].label }}
        />
      )}
      <div className="representative-opinions">
        {(['A', 'B'] as const).map((choice) => {
          const opinion = pick.representativeOpinions[choice];
          return opinion ? (
            <OpinionCard
              key={choice}
              opinion={opinion}
              onLike={() => likeOpinion(opinion)}
              onEdit={() => openEditor({ mode: 'edit', opinion })}
              onDelete={() => requestDelete(opinion)}
            />
          ) : (
            <div className="representative-opinions__empty" key={choice}>
              <span className={`choice-label choice-label--${choice.toLowerCase()}`}>{choice}</span>
              <span>아직 의견이 없어요</span>
            </div>
          );
        })}
      </div>
      <Button
        variant="secondary"
        className="pick-results__opinion-button"
        onClick={() =>
          openEditor(ownedOpinion ? { mode: 'edit', opinion: ownedOpinion } : { mode: 'create' })
        }
      >
        {ownedOpinion ? '내 의견 수정' : '의견 남기기'}
      </Button>
      <div className="opinion-list">
        <div className="opinion-list__header">
          <h3>서로의 이유</h3>
          <span className="opinion-list__count">
            {pick.result?.totalVotes.toLocaleString()}명 참여
          </span>
          <div className="filter-tabs" role="tablist" aria-label="의견 필터">
            {(['all', 'A', 'B'] as const).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={filter === item}
                className={filter === item ? 'is-active' : ''}
                onClick={() => setFilter(item)}
              >
                {item === 'all' ? '전체' : item}
              </button>
            ))}
          </div>
        </div>
        {opinionsQuery.isLoading && <LoadingState label="의견을 불러오는 중이에요" />}
        {opinionsQuery.isError && (
          <ErrorState
            description="의견을 불러오지 못했어요."
            onRetry={() => opinionsQuery.refetch()}
          />
        )}
        {!opinionsQuery.isLoading && !opinionsQuery.isError && filteredOpinions.length === 0 && (
          <EmptyState title="아직 의견이 없어요" description="첫 의견을 남겨보세요." />
        )}
        {filteredOpinions.map((opinion) => (
          <OpinionCard
            key={opinion.id}
            opinion={opinion}
            onLike={() => likeOpinion(opinion)}
            onEdit={() => openEditor({ mode: 'edit', opinion })}
            onDelete={() => requestDelete(opinion)}
          />
        ))}
      </div>
      <LoginRequiredSheet
        open={loginIntent !== null}
        actionLabel={
          loginIntent?.action === 'like-opinion'
            ? '의견 공감'
            : loginIntent?.action === 'delete-opinion'
              ? '의견 삭제'
              : '의견 남기기'
        }
        intent={
          loginIntent ?? {
            action: 'write-opinion',
            returnTo: location.pathname,
            targetId: pick.id,
          }
        }
        onOpenChange={(open) => {
          if (!open) setLoginIntent(null);
        }}
      />
      <OpinionEditorSheet
        open={editor !== null}
        mode={editor?.mode ?? 'create'}
        choice={editor?.opinion?.choice ?? pick.userVote ?? 'A'}
        optionLabel={
          pick.options.find(
            (option) => option.choice === (editor?.opinion?.choice ?? pick.userVote ?? 'A'),
          )?.label ?? ''
        }
        initialBody={editor?.opinion?.body}
        onOpenChange={(open) => {
          if (!open) setEditor(null);
        }}
        onSubmit={() => {
          setEditor(null);
          notify({ tone: 'info', title: '현재 지원하지 않는 기능이에요.' });
        }}
      />
      <OpinionDeleteDialog
        open={deleteOpinion !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteOpinion(null);
        }}
        onDelete={() => {
          setDeleteOpinion(null);
          notify({ tone: 'info', title: '현재 지원하지 않는 기능이에요.' });
        }}
      />
    </section>
  );
}

function PickStateShell({ detail, children }: { detail: boolean; children: React.ReactNode }) {
  return (
    <section className="pick-screen pick-screen--state">
      <div className="mobile-status-bar" aria-hidden="true">
        <span>9:41</span>
        <span>▴ ◔ ▣</span>
      </div>
      <PickHeader detail={detail} />
      <div className="pick-state-content">{children}</div>
    </section>
  );
}

export function PickScreen({ pickId }: PickScreenProps) {
  const detail = Boolean(pickId);
  const query = usePick(pickId);
  const vote = useVote(query.data?.id ?? pickId ?? 'today');
  const [choice, setChoice] = useState<Choice | null>(null);
  const { notify } = useToast();

  if (query.isLoading)
    return (
      <PickStateShell detail={detail}>
        <LoadingState label="Pick을 불러오는 중이에요" />
      </PickStateShell>
    );
  if (query.isError || !query.data) {
    return (
      <PickStateShell detail={detail}>
        <ErrorState
          title="Pick을 불러오지 못했어요"
          description="잠시 후 다시 시도해 주세요."
          onRetry={() => query.refetch()}
        />
      </PickStateShell>
    );
  }

  const pick = query.data;
  const voted = Boolean(pick.userVote);
  const selectedChoice = voted ? pick.userVote : choice;

  async function submitVote() {
    if (!choice || vote.isPending) return;
    try {
      await vote.mutateAsync(choice);
      notify({ tone: 'success', title: '투표를 반영했어요.' });
    } catch {
      notify({
        tone: 'error',
        title: '투표를 반영하지 못했어요.',
        description: '다시 시도해 주세요.',
      });
    }
  }

  return (
    <section className="pick-screen" aria-labelledby="pick-question">
      <div className="mobile-status-bar" aria-hidden="true">
        <span>9:41</span>
        <span>▴ ◔ ▣</span>
      </div>
      <PickHeader detail={detail} />
      <PickMeta pick={pick} detail={detail} />
      <div className="pick-screen__question">
        <h1 id="pick-question">{pick.question}</h1>
      </div>
      {!voted ? (
        <div className="pick-vote-area">
          <div className="pick-options">
            {pick.options.map((option) => (
              <VoteChoice
                key={option.choice}
                choice={option.choice}
                label={option.label}
                selected={selectedChoice === option.choice}
                disabled={vote.isPending}
                onSelect={setChoice}
              />
            ))}
          </div>
          <p className="pick-vote-area__hint">
            {vote.isPending
              ? '투표를 반영하고 있어요'
              : selectedChoice
                ? '선택을 확인하고 투표해 주세요'
                : '하나를 고른 뒤 투표하기를 눌러주세요'}
          </p>
          <Button disabled={!selectedChoice || vote.isPending} onClick={submitVote}>
            {vote.isPending ? '투표를 반영하고 있어요' : '투표하기'}
          </Button>
        </div>
      ) : (
        <ResultAndOpinions pick={pick} />
      )}
    </section>
  );
}
