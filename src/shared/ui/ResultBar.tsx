import type { Choice, VoteResult } from '../contracts';

type ResultBarProps = {
  result: VoteResult;
  selectedChoice?: Choice | null;
};

export function ResultBar({ result, selectedChoice }: ResultBarProps) {
  const a = result.options.A;
  const b = result.options.B;

  return (
    <section
      className="result-bar"
      aria-label={`투표 결과, 전체 ${result.totalVotes.toLocaleString()}표`}
    >
      <div className="result-bar__labels">
        <span className={selectedChoice === 'A' ? 'is-selected' : ''}>
          A {a.percent}% · {a.count.toLocaleString()}표
        </span>
        <span className={selectedChoice === 'B' ? 'is-selected' : ''}>
          B {b.percent}% · {b.count.toLocaleString()}표
        </span>
      </div>
      <div className="result-bar__track" aria-hidden="true">
        <span className="result-bar__a" style={{ width: `${a.percent}%` }} />
        <span className="result-bar__b" style={{ width: `${b.percent}%` }} />
      </div>
    </section>
  );
}
