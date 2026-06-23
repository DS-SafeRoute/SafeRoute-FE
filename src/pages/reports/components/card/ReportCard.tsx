import type { ReactNode } from 'react';

import * as styles from './ReportCard.css';

interface ReportCardProps {
  title?: string;
  className?: string;
  children: ReactNode;
}

const ReportCard = ({ title, className, children }: ReportCardProps) => (
  <section className={[styles.card, className].filter(Boolean).join(' ')}>
    {title && <h2 className={styles.cardTitle}>{title}</h2>}
    {children}
  </section>
);

export default ReportCard;
