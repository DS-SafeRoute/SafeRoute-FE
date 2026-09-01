import { matchPath, type Location } from 'react-router';

import type { GNBProps } from '@components/gnb/GNB';

import { ROUTES } from '@constants/path';

type GNBConfig = Pick<GNBProps, 'breadcrumbs' | 'title' | 'description'>;

const DEFAULT_GNB_CONFIG = {
  title: 'SAFE ROUTE',
  description: '안전 관리 시스템',
} as const satisfies GNBConfig;

const SCENARIO_SETTINGS_GNB_CONFIG = {
  title: '시나리오 설정',
  description: '화재 발생 위치를 확인하고 시나리오를 시작합니다',
} as const satisfies GNBConfig;

const GNB_CONFIGS = [
  {
    path: ROUTES.HOME,
    config: {
      title: '홈',
      description: '화재 대피 훈련 현황을 한눈에 확인하세요.',
    },
  },
  {
    path: ROUTES.SCENARIO_CREATE,
    config: SCENARIO_SETTINGS_GNB_CONFIG,
  },
  {
    path: ROUTES.SCENARIO_DETAIL,
    config: SCENARIO_SETTINGS_GNB_CONFIG,
  },
  {
    path: ROUTES.SCENARIO_LIST,
    config: {
      title: '시나리오 설정',
      description: '등록된 훈련 시나리오를 확인하고 관리합니다',
    },
  },
  {
    path: ROUTES.BUILDINGS,
    config: {
      breadcrumbs: [{ label: '관리' }],
      title: '건물 관리',
      description: '등록된 건물과 시설을 관리합니다',
    },
  },
  {
    path: ROUTES.FLOOR_PLANS,
    config: {
      breadcrumbs: [{ label: '관리' }],
      title: '도면 관리',
      description: '등록된 건물별 도면을 확인하고 관리할 수 있습니다',
    },
  },
  {
    path: ROUTES.FLOOR_PLANS_DETAIL,
    config: {
      breadcrumbs: [{ label: '관리' }, { label: '도면 관리' }],
      title: '도면 관리 상세',
      description: '층별 도면을 확인하고 관리합니다',
    },
  },
  {
    path: ROUTES.TRAINING_ANALYSIS,
    config: {
      breadcrumbs: [{ label: '훈련 분석' }],
      title: '영상 분석',
      description: '훈련 영상을 업로드하거나 실시간 CCTV를 분석합니다',
    },
  },
  {
    path: ROUTES.TRAINING_MONITORING,
    config: {
      breadcrumbs: [{ label: '훈련 분석' }],
      title: '모니터링',
      description: '실시간 카메라 스트림을 확인합니다',
    },
  },
  {
    path: ROUTES.REPORTS,
    config: {
      title: '분석 보고서',
      description: '훈련 분석 보고서를 확인합니다',
    },
  },
] as const satisfies readonly { path: string; config: GNBConfig }[];

export const getGNBConfig = (location: Location): GNBConfig =>
  GNB_CONFIGS.find(({ path }) => matchPath({ path, end: true }, location.pathname))?.config ??
  DEFAULT_GNB_CONFIG;
