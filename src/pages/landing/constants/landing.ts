import type { FunctionComponent, SVGProps } from 'react';

import CameraIcon from '@assets/icons/ic-camera.svg?react';
import LayersIcon from '@assets/icons/ic-layers.svg?react';
import MapIcon from '@assets/icons/ic-map.svg?react';
import WifiIcon from '@assets/icons/ic-wifi.svg?react';

type FeatureTone = 'blue' | 'purple' | 'green' | 'yellow';
type FeatureIcon = FunctionComponent<SVGProps<SVGSVGElement>>;

interface LandingFeature {
  title: string;
  description: string;
  Icon: FeatureIcon;
  tone: FeatureTone;
}

export const LANDING_FEATURES = [
  {
    title: '실시간 CCTV 모니터링',
    description: 'AI 비전 분석을 통한 혼잡 밀집도와 실시간 추적',
    Icon: CameraIcon,
    tone: 'blue',
  },
  {
    title: 'IoT 센서 통합',
    description: '유동률 점검 상태와 환경 모니터링 시스템 연동',
    Icon: WifiIcon,
    tone: 'purple',
  },
  {
    title: 'AI 기반 경로 분석',
    description: '기존 대피 경로 분석 및 신규 권장 경로 산정',
    Icon: MapIcon,
    tone: 'green',
  },
  {
    title: '디지털 트윈 맵',
    description: '3D 건물 모델 기반 실시간 상황 공유 가시화',
    Icon: LayersIcon,
    tone: 'yellow',
  },
] as const satisfies readonly LandingFeature[];
