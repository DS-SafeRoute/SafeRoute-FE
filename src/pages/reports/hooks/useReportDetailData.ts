import { useGetBuildingsQuery } from '@apis/buildings/useBuildingsQuery';
import { useTrainingReportQuery } from '@apis/reports/useReports';
import { useGetScenariosQuery } from '@apis/scenarios/useScenariosQuery';
import { useMyProfileQuery } from '@apis/users/useMyProfileQuery';

import {
  formatTrainingDate,
  toCumulativeEvacuation,
  toRecentEvacuationTimes,
  toRecommendations,
  toReportScores,
  toReportSummary,
} from '../utils/report';

// 훈련 보고서 상세 데이터 조회
export const useReportDetailData = (reportId: string) => {
  const reportQuery = useTrainingReportQuery(reportId);
  const scenariosQuery = useGetScenariosQuery();
  const buildingsQuery = useGetBuildingsQuery();
  const profileQuery = useMyProfileQuery();
  const report = reportQuery.data;
  const scenario = scenariosQuery.data?.find((item) => item.reportId === reportId);
  const targetBuilding = buildingsQuery.data?.find(
    (building) => building.id === scenario?.buildingId,
  );
  const content = report
    ? {
        report,
        trainingName: scenario?.name,
        meta: [
          { label: '학교명', value: profileQuery.data?.schoolName || '-' },
          { label: '훈련명', value: scenario?.name || '-' },
          { label: '실행 날짜', value: formatTrainingDate(scenario?.scheduledAt) },
          { label: '대상 건물', value: targetBuilding?.name || '-' },
          {
            label: '총 참가 인원',
            value:
              scenario?.expectedParticipants === undefined
                ? '-'
                : `${scenario.expectedParticipants}명`,
          },
        ],
        summary: toReportSummary(report),
        scores: toReportScores(report),
        evacuationAccumulation: toCumulativeEvacuation(report),
        recentEvacuationTimes: toRecentEvacuationTimes(report),
        recommendations: toRecommendations(report),
      }
    : null;

  return {
    content,
    isPending:
      reportQuery.isPending ||
      scenariosQuery.isPending ||
      buildingsQuery.isPending ||
      profileQuery.isPending,
    isError: reportQuery.isError,
    refetchReport: reportQuery.refetch,
  };
};
