import { useMemo, useState } from 'react';

import clsx from 'clsx';

import { TRAINING_SESSION_STATUS } from '@apis/trainingSessions/trainingSessionConstants';
import { useTrainingSessionSocket } from '@apis/trainingSessions/useTrainingSessionSocket';
import { useTrainingSessionsQuery } from '@apis/trainingSessions/useTrainingSessionsQuery';

import ArrowRightIcon from '@assets/icons/ic-arrow-right.svg?react';
import UsersIcon from '@assets/icons/ic-multi-user.svg?react';

import { Button } from '@components/Button';

import AnalysisTabNav from './components/AnalysisTabNav/AnalysisTabNav';
import CameraCard from './components/CameraCard/CameraCard';
import MonitoringSidebar from './components/MonitoringSidebar/MonitoringSidebar';
import { mockAiVisionStatus, mockStreamCameras } from './mocks/trainingAnalysisData';
import * as styles from './TrainingMonitoringPage.css';

import type { StreamCamera } from './types/trainingAnalysis';

type CameraFilter = '전체' | '실시간' | '객체감지';

const FILTERS: CameraFilter[] = ['전체', '실시간', '객체감지'];

const TrainingMonitoringPage = () => {
  const [filter, setFilter] = useState<CameraFilter>('전체');
  const [selectedCamera, setSelectedCamera] = useState<StreamCamera | null>(null);
  const { data: runningSessions = [] } = useTrainingSessionsQuery(TRAINING_SESSION_STATUS.RUNNING);
  const sessionId = runningSessions[0]?.sessionId;
  useTrainingSessionSocket({ sessionId });

  const filteredCameras = useMemo(() => {
    if (filter === '실시간') return mockStreamCameras.filter((c) => c.status === 'online');
    if (filter === '객체감지') return mockStreamCameras.filter((c) => c.detectedCount > 0);
    return mockStreamCameras;
  }, [filter]);

  const handleCameraSelect = (cam: StreamCamera) => {
    setSelectedCamera((prev) => (prev?.id === cam.id ? null : cam));
  };

  return (
    <div className={styles.container}>
      <AnalysisTabNav />

      <div className={styles.body}>
        {selectedCamera ? (
          /* ── 상세 뷰 ── */
          <>
            <MonitoringSidebar
              aiStatus={mockAiVisionStatus}
              cameras={mockStreamCameras}
              activeCameraId={selectedCamera.id}
              onCameraSelect={handleCameraSelect}
            />
            <div className={styles.detailMain}>
              {/* 액션 바 */}
              <div className={styles.detailActionBar}>
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => setSelectedCamera(null)}
                >
                  <ArrowRightIcon className={styles.backIcon} width={16} height={16} />
                  전체 목록
                </button>
                <div className={styles.detailControls}>
                  <Button variant="primary" size="sm">
                    AI 분석 시작
                  </Button>
                  <button type="button" className={styles.iconBtn} aria-label="재생">
                    ▶
                  </button>
                  <button type="button" className={styles.iconBtn} aria-label="일시정지">
                    ⏸
                  </button>
                </div>
              </div>

              {/* 카메라 이름 + 메타 */}
              <div className={styles.detailHeader}>
                <span className={styles.detailCameraName}>
                  {selectedCamera.name} – {selectedCamera.zone}
                </span>
                <span className={styles.detailMetaRow}>
                  {selectedCamera.status === 'online'
                    ? `${selectedCamera.fps} fps / ${selectedCamera.latencyMs}ms latency`
                    : '신호 없음'}
                </span>
              </div>

              {/* 영상 영역 */}
              <div className={styles.detailVideo}>
                {selectedCamera.status === 'online' && (
                  <div className={styles.liveStreamBadge}>
                    <span className={styles.liveDot} />
                    LIVE STREAM
                  </div>
                )}

                {selectedCamera.status === 'online' && (
                  <div className={styles.detailPersonCount}>
                    <UsersIcon width={13} height={13} />
                    감지원: {selectedCamera.detectedCount}
                  </div>
                )}

                {selectedCamera.status === 'offline' && (
                  <div className={styles.offlineOverlay}>신호 없음</div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* ── 그리드 뷰 ── */
          <>
            <MonitoringSidebar
              aiStatus={mockAiVisionStatus}
              cameras={mockStreamCameras}
              onCameraSelect={handleCameraSelect}
            />
            <div className={styles.mainArea}>
              <div className={styles.toolbar}>
                <span className={styles.toolbarTitle}>카메라 {filteredCameras.length}개</span>
                <div className={styles.filterGroup}>
                  {FILTERS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      className={clsx(styles.filterBtn, filter === f && styles.filterBtnActive)}
                      onClick={() => setFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.gridScroll}>
                <div className={styles.cameraGrid}>
                  {filteredCameras.map((cam) => (
                    <CameraCard key={cam.id} camera={cam} onClick={handleCameraSelect} />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TrainingMonitoringPage;
