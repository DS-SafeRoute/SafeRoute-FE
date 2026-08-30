import { useState } from 'react';

import { Button } from '@components/Button';
import Modal from '@components/modal';

import * as styles from './IoTLightSettingsModal.css';

import type { IoTLight } from '../api/iotLightsApi';

export interface SelectOption {
  id: string;
  label: string;
}

type LightDirection = 'LEFT' | 'RIGHT' | 'OFF';

interface IoTLightSettingsModalProps {
  open: boolean;
  onClose: () => void;
  light: IoTLight;
  nodeOptions: SelectOption[];
  edgeOptions: SelectOption[];
  onToggleEnabled: (enabled: boolean) => void;
  onDirectionChange: (direction: LightDirection) => void;
  onGuidanceSave: (decisionNodeId: string, leftEdgeId: string, rightEdgeId: string) => void;
  onPiEndpointSave: (piEndpoint: string) => void;
}

const IoTLightSettingsModal = ({
  open,
  onClose,
  light,
  nodeOptions,
  edgeOptions,
  onToggleEnabled,
  onDirectionChange,
  onGuidanceSave,
  onPiEndpointSave,
}: IoTLightSettingsModalProps) => {
  const [decisionNodeId, setDecisionNodeId] = useState(light.decisionNodeId ?? '');
  const [leftEdgeId, setLeftEdgeId] = useState(light.leftEdgeId ?? '');
  const [rightEdgeId, setRightEdgeId] = useState(light.rightEdgeId ?? '');
  const [piEndpoint, setPiEndpoint] = useState(light.piEndpoint ?? '');

  const canSaveGuidance = !!decisionNodeId && !!leftEdgeId && !!rightEdgeId;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="유도등 설정"
      description={light.name}
      footer={
        <Button variant="ghost" fullWidth onClick={onClose}>
          닫기
        </Button>
      }
    >
      <div className={styles.section}>
        <span className={styles.sectionTitle}>활성화 상태</span>
        <div className={styles.rowButtons}>
          <button
            type="button"
            className={
              light.enabled
                ? `${styles.toggleButton} ${styles.toggleButtonActive}`
                : styles.toggleButton
            }
            onClick={() => onToggleEnabled(true)}
          >
            사용 가능
          </button>
          <button
            type="button"
            className={
              !light.enabled
                ? `${styles.toggleButton} ${styles.toggleButtonActive}`
                : styles.toggleButton
            }
            onClick={() => onToggleEnabled(false)}
          >
            사용 불가능
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionTitle}>방향</span>
        <div className={styles.rowButtons}>
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => onDirectionChange('LEFT')}
          >
            왼쪽
          </button>
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => onDirectionChange('RIGHT')}
          >
            오른쪽
          </button>
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => onDirectionChange('OFF')}
          >
            끄기
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionTitle}>가이던스(경로 안내) 설정</span>
        <span className={styles.hint}>
          판단 노드에서 왼쪽/오른쪽 어느 엣지로 안내할지 지정합니다.
        </span>
        <select
          className={styles.select}
          value={decisionNodeId}
          onChange={(e) => setDecisionNodeId(e.target.value)}
        >
          <option value="">판단 노드 선택</option>
          {nodeOptions.map((n) => (
            <option key={n.id} value={n.id}>
              {n.label}
            </option>
          ))}
        </select>
        <select
          className={styles.select}
          value={leftEdgeId}
          onChange={(e) => setLeftEdgeId(e.target.value)}
        >
          <option value="">왼쪽 엣지 선택</option>
          {edgeOptions.map((edge) => (
            <option key={edge.id} value={edge.id}>
              {edge.label}
            </option>
          ))}
        </select>
        <select
          className={styles.select}
          value={rightEdgeId}
          onChange={(e) => setRightEdgeId(e.target.value)}
        >
          <option value="">오른쪽 엣지 선택</option>
          {edgeOptions.map((edge) => (
            <option key={edge.id} value={edge.id}>
              {edge.label}
            </option>
          ))}
        </select>
        <div className={styles.saveRow}>
          <Button
            size="sm"
            disabled={!canSaveGuidance}
            onClick={() => onGuidanceSave(decisionNodeId, leftEdgeId, rightEdgeId)}
          >
            가이던스 저장
          </Button>
        </div>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionTitle}>Pi 엔드포인트</span>
        <input
          className={styles.textInput}
          value={piEndpoint}
          onChange={(e) => setPiEndpoint(e.target.value)}
          placeholder="http://192.168.0.10:8080"
        />
        <div className={styles.saveRow}>
          <Button
            size="sm"
            disabled={!piEndpoint.trim()}
            onClick={() => onPiEndpointSave(piEndpoint.trim())}
          >
            저장
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default IoTLightSettingsModal;
