import type { ReactNode } from 'react';

import * as styles from './RecommendationCard.css';

interface RecommendationCardProps {
  icon: ReactNode;
  message: string;
}

const RecommendationCard = ({ icon, message }: RecommendationCardProps) => (
  <section className={styles.card}>
    <div className={styles.titleRow}>
      {icon}
      <h2 className={styles.title}>AI 추천</h2>
    </div>
    <p className={styles.message}>{message}</p>
  </section>
);

export default RecommendationCard;
