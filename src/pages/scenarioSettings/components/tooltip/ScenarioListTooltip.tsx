import { cloneElement, useId, type ReactElement } from 'react';

import * as styles from './ScenarioListTooltip.css';

interface ScenarioListTooltipProps {
  content: string;
  children: ReactElement<{ 'aria-describedby'?: string }>;
}

const ScenarioListTooltip = ({ content, children }: ScenarioListTooltipProps) => {
  const tooltipId = useId();

  return (
    <span className={styles.trigger}>
      {cloneElement(children, { 'aria-describedby': tooltipId })}
      <span id={tooltipId} className={styles.content} role="tooltip">
        {content}
      </span>
    </span>
  );
};

export default ScenarioListTooltip;
