import AiReportCard from './components/card/AiReportCard';
import GradeSummaryCard from './components/card/GradeSummaryCard';
import RecommendationsCard from './components/card/RecommendationsCard';
import ScoreBreakdownCard from './components/card/ScoreBreakdownCard';
import ReportCharts from './components/chart/ReportCharts';
import {
  densityByZone,
  evacuationAccumulation,
  recentEvacuationTimes,
  recommendations,
  reportNarrative,
  reportScores,
  reportSummary,
} from './mocks/reportData';
import * as styles from './ReportsPage.css';

const ReportsPage = () => (
  <div className={styles.container}>
    <div className={styles.topGrid}>
      <GradeSummaryCard summary={reportSummary} />
      <ScoreBreakdownCard scores={reportScores} />
    </div>

    <ReportCharts
      evacuationAccumulation={evacuationAccumulation}
      densityByZone={densityByZone}
      recentEvacuationTimes={recentEvacuationTimes}
    />

    <div className={styles.bottomGrid}>
      <AiReportCard narrative={reportNarrative} />
      <RecommendationsCard items={recommendations} />
    </div>
  </div>
);

export default ReportsPage;
