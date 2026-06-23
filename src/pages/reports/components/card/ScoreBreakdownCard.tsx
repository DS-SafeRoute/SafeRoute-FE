import ReportCard from './ReportCard';
import * as styles from './ScoreBreakdownCard.css';

import type { ReportScoreItem } from '../../types/report';

interface ScoreBreakdownCardProps {
  scores: ReportScoreItem[];
}

const clampScore = (score: number) => Math.min(100, Math.max(0, score));

const ScoreBreakdownCard = ({ scores }: ScoreBreakdownCardProps) => (
  <ReportCard title="평가 항목별 점수" className={styles.scoreCard}>
    <ul className={styles.scoreList}>
      {scores.map((item) => {
        const scoreWidth = clampScore(item.score);

        return (
          <li key={item.label}>
            <div className={styles.scoreHeader}>
              <span className={styles.scoreLabel}>
                {item.label} <span className={styles.weight}>({item.weight})</span>
              </span>
              <strong className={styles.value}>
                {item.score}
                <span className={styles.denominator}>/ 100</span>
              </strong>
            </div>
            <div className={styles.track} aria-hidden="true">
              <div
                className={[styles.barBase, styles.barColor[item.color]].join(' ')}
                style={{ width: `${scoreWidth}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  </ReportCard>
);

export default ScoreBreakdownCard;
