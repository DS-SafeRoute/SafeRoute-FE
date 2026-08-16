import type { ReactNode } from 'react';

import { sideCardTitle } from '@pages/scenarioSettings/ScenarioSettingsPage.css';

import * as styles from './RecommendationCard.css';

interface RecommendationCardProps {
  icon: ReactNode;
  title?: string;
  message: string;
}

const RecommendationCard = ({ icon, title = 'AI 추천', message }: RecommendationCardProps) => (
  <section className={styles.card}>
    <div className={styles.titleRow}>
      {icon}
      <h2 className={sideCardTitle}>{title}</h2>
    </div>
    <p className={styles.message}>{message}</p>
  </section>
);

export default RecommendationCard;
