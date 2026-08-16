import { useId, type ReactNode } from 'react';

import * as styles from './ScenarioListTooltip.css';

interface ScenarioListTooltipProps {
  content: string;
  children: ReactNode;
}

const ScenarioListTooltip = ({ content, children }: ScenarioListTooltipProps) => {
  const tooltipId = useId();

  return (
    <span className={styles.trigger} tabIndex={0} aria-describedby={tooltipId}>
      {children}
      <span id={tooltipId} className={styles.content} role="tooltip">
        {content}
      </span>
    </span>
  );
};

export default ScenarioListTooltip;
