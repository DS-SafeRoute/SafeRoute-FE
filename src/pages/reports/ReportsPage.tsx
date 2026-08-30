import { useRef, useState } from 'react';

import { useParams } from 'react-router';

import { useGetBuildingsQuery } from '@apis/buildings/useBuildingsQuery';
import { useTrainingReportQuery } from '@apis/reports/useReports';
import { useGetScenariosQuery } from '@apis/scenarios/useScenariosQuery';
import { useMyProfileQuery } from '@apis/users/useMyProfileQuery';

import DownloadIcon from '@assets/icons/ic-download.svg?react';

import { Button } from '@components/Button';
import EmptyState from '@components/empty';
import useToast from '@components/toast/useToast';

import AiReportCard from './components/card/AiReportCard';
import GradeSummaryCard from './components/card/GradeSummaryCard';
import RecommendationsCard from './components/card/RecommendationsCard';
import ScoreBreakdownCard from './components/card/ScoreBreakdownCard';
import ReportCharts from './components/chart/ReportCharts';
import * as styles from './ReportsPage.css';
import { downloadReportPdf } from './utils/pdf';
import {
  formatTrainingDate,
  getReportPdfFileName,
  toCumulativeEvacuation,
  toRecentEvacuationTimes,
  toRecommendations,
  toReportScores,
  toReportSummary,
} from './utils/report';

const ReportsPage = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { reportId } = useParams<{ reportId: string }>();
  const { show } = useToast();
  const {
    data: report,
    isPending: isReportPending,
    isError: isReportError,
    refetch: refetchReport,
  } = useTrainingReportQuery(reportId);
  const { data: scenarios = [] } = useGetScenariosQuery();
  const { data: buildings = [] } = useGetBuildingsQuery();
  const { data: currentUser } = useMyProfileQuery();
  const scenario = scenarios.find((item) => item.reportId === reportId);
  const targetBuilding = buildings.find((building) => building.id === scenario?.buildingId);
  const reportMeta = [
    { label: '학교명', value: currentUser?.schoolName || '-' },
    { label: '훈련명', value: scenario?.name || '-' },
    { label: '실행 날짜', value: formatTrainingDate(scenario?.scheduledAt) },
    { label: '대상 건물', value: targetBuilding?.name || '-' },
    {
      label: '총 참가 인원',
      value:
        scenario?.expectedParticipants === undefined ? '-' : `${scenario.expectedParticipants}명`,
    },
  ];
  const reportSummary = report ? toReportSummary(report) : null;
  const reportScores = report ? toReportScores(report) : [];
  const evacuationAccumulation = report ? toCumulativeEvacuation(report) : [];
  const recentEvacuationTimes = report ? toRecentEvacuationTimes(report) : [];
  const recommendations = report ? toRecommendations(report) : [];

  const handleDownloadPdf = async () => {
    const reportElement = reportRef.current;
    if (!reportElement || isExporting) return;

    setIsExporting(true);

    try {
      await downloadReportPdf(reportElement, getReportPdfFileName(scenario?.name));
    } catch {
      show({ title: 'PDF 생성에 실패했습니다. 다시 시도해 주세요.', variant: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Button
          type="button"
          variant="outlined"
          leftIcon={<DownloadIcon />}
          onClick={() => void handleDownloadPdf()}
          isLoading={isExporting}
          disabled={!report}
        >
          PDF 다운로드
        </Button>
      </div>

      {isReportPending ? (
        <p className={styles.stateMessage}>분석 보고서를 불러오는 중...</p>
      ) : isReportError || !report || !reportSummary ? (
        <EmptyState
          className={styles.pageState}
          title="분석 보고서를 불러오지 못했습니다."
          action={
            <Button type="button" variant="ghost" onClick={() => void refetchReport()}>
              다시 시도
            </Button>
          }
        />
      ) : (
        <div ref={reportRef} className={styles.reportContent}>
          <section className={styles.reportHeader} aria-labelledby="report-document-title">
            <div className={styles.reportTitleGroup}>
              <p className={styles.reportEyebrow}>SAFE ROUTE</p>
              <h2 id="report-document-title" className={styles.reportTitle}>
                훈련 분석 보고서
              </h2>
            </div>

            <dl className={styles.reportMetaGrid}>
              {reportMeta.map((item) => (
                <div key={item.label} className={styles.reportMetaItem}>
                  <dt className={styles.reportMetaLabel}>{item.label}</dt>
                  <dd className={styles.reportMetaValue}>{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className={styles.topGrid}>
            <GradeSummaryCard summary={reportSummary} />
            <ScoreBreakdownCard scores={reportScores} />
          </div>

          <ReportCharts
            evacuationAccumulation={evacuationAccumulation}
            recentEvacuationTimes={recentEvacuationTimes}
          />

          <div className={styles.bottomGrid}>
            <AiReportCard summaryText={report.summaryText} />
            <RecommendationsCard items={recommendations} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
