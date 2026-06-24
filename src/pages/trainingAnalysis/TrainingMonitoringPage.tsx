import { useState } from 'react';

import clsx from 'clsx';
import { useNavigate } from 'react-router';

import UsersIcon from '@assets/icons/ic-multi-user.svg?react';

import { ROUTES } from '@constants/path';

import AnalysisTabNav from './components/AnalysisTabNav/AnalysisTabNav';
import MonitoringSidebar from './components/MonitoringSidebar/MonitoringSidebar';
import { mockAiVisionStatus, mockStreamCameras } from './mocks/trainingAnalysisData';
import * as styles from './TrainingMonitoringPage.css';

type FilterType = '전체' | '실시간' | '객체감지';

const TrainingMonitoringPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('전체');

  const filteredCameras =
    filter === '실시간'
      ? mockStreamCameras.filter((c) => c.status === 'online')
      : filter === '객체감지'
        ? mockStreamCameras.filter((c) => c.detectedCount > 0)
        : mockStreamCameras;

  return (
    <div className={styles.container}>
      <AnalysisTabNav />

      <div className={styles.body}>
        <div className={styles.mainArea}>
          {/* 툴바 */}
          <div className={styles.toolbar}>
            <span className={styles.toolbarTitle}>카메라 {filteredCameras.length}개</span>
            <div className={styles.filterGroup}>
              {(['전체', '실시간', '객체감지'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  className={clsx(styles.filterBtn, filter === f && styles.filterBtnActive)}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* 카메라 그리드 */}
          <div className={styles.cameraGrid}>
            {filteredCameras.map((cam) => (
              <div
                key={cam.id}
                className={styles.cameraCard}
                onClick={() =>
                  void navigate(ROUTES.TRAINING_MONITORING_DETAIL.replace(':cameraId', cam.id))
                }
              >
                {/* 영상 영역 */}
                <div className={styles.cardVideo}>
                  <div className={styles.cardBadgeRow}>
                    {cam.status === 'online' ? (
                      <div className={styles.liveBadge}>
                        <span className={styles.liveDot} />
                        LIVE
                      </div>
                    ) : (
                      <div className={styles.offlineBadge}>OFFLINE</div>
                    )}
                    {cam.status === 'online' && (
                      <div className={styles.cardPersonCount}>
                        <UsersIcon width={11} height={11} />
                        {cam.detectedCount}
                      </div>
                    )}
                  </div>
                  {cam.status === 'offline' && (
                    <div className={styles.offlineOverlay}>신호 없음</div>
                  )}
                </div>

                {/* 카드 하단 정보 */}
                <div className={styles.cardInfo}>
                  <div>
                    <div className={styles.cardName}>{cam.name}</div>
                    <div className={styles.cardZone}>{cam.zone}</div>
                  </div>
                  {cam.status === 'online' && (
                    <div className={styles.cardMeta}>
                      {cam.fps}fps · {cam.latencyMs}ms
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 우측 사이드바 */}
        <MonitoringSidebar aiStatus={mockAiVisionStatus} cameras={mockStreamCameras} />
      </div>
    </div>
  );
};

export default TrainingMonitoringPage;
