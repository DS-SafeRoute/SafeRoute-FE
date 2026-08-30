import { useRef, useState } from 'react';

import { useNavigate, useParams } from 'react-router';

import { useGetBuildingsQuery } from '@apis/buildings/useBuildingsQuery';
import { useTrainingReportQuery } from '@apis/reports/useReports';
import { useGetScenariosQuery } from '@apis/scenarios/useScenariosQuery';
import { useMyProfileQuery } from '@apis/users/useMyProfileQuery';

import DownloadIcon from '@assets/icons/ic-download.svg?react';
import FileTextIcon from '@assets/icons/ic-filetext.svg?react';

import { Button } from '@components/Button';
import EmptyState from '@components/empty';
import useToast from '@components/toast/useToast';

import { ROUTES } from '@constants/path';

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

interface ReportDetailProps {
  reportId: string;
}

const ReportDetail = ({ reportId }: ReportDetailProps) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
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

const ReportsPage = () => {
  const navigate = useNavigate();
  const { reportId } = useParams<{ reportId: string }>();

  if (!reportId) {
    return (
      <div className={styles.container}>
        <EmptyState
          className={styles.pageState}
          icon={<FileTextIcon />}
          title="조회할 분석 보고서를 선택해 주세요."
          description="완료된 훈련의 보고서를 선택하거나 새 훈련 시나리오를 등록할 수 있습니다."
          action={
            <div className={styles.emptyActions}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate(ROUTES.SCENARIO_LIST)}
              >
                시나리오 목록 보기
              </Button>
              <Button type="button" onClick={() => navigate(ROUTES.SCENARIO_CREATE)}>
                시나리오 등록하러 가기
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  return <ReportDetail reportId={reportId} />;
};

export default ReportsPage;
