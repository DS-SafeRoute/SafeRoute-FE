import StatusBadge from '@components/chip/StatusBadge';
import type { StatusBadgeColor } from '@components/chip/StatusBadge';

import * as styles from './RecommendationsCard.css';

import type { RecommendationItem } from '../../types/report';

const priorityLabels = {
  high: '높음',
  medium: '중간',
  low: '낮음',
} as const satisfies Record<RecommendationItem['level'], string>;

const priorityColors = {
  high: 'red',
  medium: 'yellow',
  low: 'blue',
} as const satisfies Record<RecommendationItem['level'], StatusBadgeColor>;

interface RecommendationsCardProps {
  items: RecommendationItem[];
}

const RecommendationsCard = ({ items }: RecommendationsCardProps) => (
  <section className={styles.card}>
    <h2 className={styles.title}>개선 권고사항</h2>
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.id} className={styles.item}>
          <div className={styles.itemHeader}>
            <StatusBadge label={priorityLabels[item.level]} color={priorityColors[item.level]} />
            <strong className={styles.itemTitle}>{item.title}</strong>
          </div>
          <p className={styles.description}>{item.description}</p>
        </li>
      ))}
    </ul>
  </section>
);

export default RecommendationsCard;
