import BuildingIcon from '@assets/icons/ic-building.svg?react';
import DashBoardIcon from '@assets/icons/ic-dashboard.svg?react';
import FileTextIcon from '@assets/icons/ic-filetext.svg?react';
import HomeIcon from '@assets/icons/ic-home.svg?react';
import LayersIcon from '@assets/icons/ic-layers.svg?react';
import MapIcon from '@assets/icons/ic-map.svg?react';
import VideoIcon from '@assets/icons/ic-video.svg?react';

import { ROUTES } from '@constants/path';

export const sidebarItems = [
  { label: '홈', icon: HomeIcon, path: ROUTES.HOME },
  { label: '시나리오 설정', icon: DashBoardIcon, path: ROUTES.SCENARIO_LIST },
  {
    label: '관리',
    icon: LayersIcon,
    items: [
      { label: '건물 관리', icon: BuildingIcon, path: ROUTES.BUILDINGS },
      { label: '도면 관리', icon: MapIcon, path: ROUTES.FLOOR_PLANS },
    ],
  },
  { label: '훈련 분석', icon: VideoIcon, path: ROUTES.TRAINING_ANALYSIS },
  {
    label: '분석 보고서',
    icon: FileTextIcon,
    path: ROUTES.REPORTS_ROOT,
  },
];
