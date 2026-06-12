import { useEffect, useState } from 'react';

import clsx from 'clsx';

import { Button } from '@components/Button';
import TextField from '@components/inputField/TextField';
import Modal from '@components/modal';

import * as styles from './CameraFormModal.css';

import type { Building } from '../../buildings/types/buildings';
import type { Camera } from '../types/cameras';

type FormState = {
  name: string;
  buildingId: string;
  floor: string;
  zone: string;
  rtspUrl: string;
  ipAddress: string;
  fps: string;
  username: string;
  password: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const INITIAL_FORM: FormState = {
  name: '',
  buildingId: '',
  floor: '',
  zone: '',
  rtspUrl: '',
  ipAddress: '',
  fps: '',
  username: '',
  password: '',
};

const cameraToForm = (camera: Camera): FormState => ({
  name: camera.name,
  buildingId: String(camera.buildingId),
  floor: String(camera.floor),
  zone: camera.zone,
  rtspUrl: camera.rtspUrl,
  ipAddress: camera.ipAddress,
  fps: String(camera.fps),
  username: camera.username,
  password: camera.password,
});

const getFloorOptions = (building: Building) => {
  const floors: { label: string; value: string }[] = [];
  for (let f = building.aboveFloors; f >= 1; f--) {
    floors.push({ label: `${f}층`, value: String(f) });
  }
  for (let f = 1; f <= building.belowFloors; f++) {
    floors.push({ label: `B${f}층`, value: String(-f) });
  }
  return floors;
};

interface CameraFormModalProps {
  open: boolean;
  onClose: () => void;
  camera?: Camera;
  buildings: Building[];
  onConfirm: (data: Omit<Camera, 'id' | 'status'>) => void;
}

const CameraFormModal = ({ open, onClose, camera, buildings, onConfirm }: CameraFormModalProps) => {
  const isEdit = Boolean(camera);
  const [form, setForm] = useState<FormState>(camera ? cameraToForm(camera) : INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (open) {
      setForm(camera ? cameraToForm(camera) : INITIAL_FORM);
      setErrors({});
    }
  }, [open, camera]);

  const selectedBuilding = buildings.find((b) => String(b.id) === form.buildingId);
  const floorOptions = selectedBuilding ? getFloorOptions(selectedBuilding) : [];

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleBuildingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, buildingId: e.target.value, floor: '' }));
    setErrors((prev) => ({ ...prev, buildingId: '', floor: '' }));
  };

  const handleFloorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, floor: e.target.value }));
    setErrors((prev) => ({ ...prev, floor: '' }));
  };

  const validate = () => {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = '카메라 이름을 입력해 주세요';
    if (!form.buildingId) next.buildingId = '건물을 선택해 주세요';
    if (!form.floor) next.floor = '층수를 선택해 주세요';
    if (!form.zone.trim()) next.zone = '구역을 입력해 주세요';
    if (!form.rtspUrl.trim()) next.rtspUrl = 'RTSP URL을 입력해 주세요';
    else if (!form.rtspUrl.trim().startsWith('rtsp://')) next.rtspUrl = 'rtsp://로 시작해야 합니다';
    if (!form.ipAddress.trim()) next.ipAddress = 'IP 주소를 입력해 주세요';
    if (form.fps.trim() && (!/^\d+$/.test(form.fps.trim()) || Number(form.fps) < 0))
      next.fps = '올바른 FPS를 입력해 주세요';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    const building = buildings.find((b) => String(b.id) === form.buildingId);
    if (!building) return;
    onConfirm({
      name: form.name.trim(),
      buildingId: building.id,
      buildingName: building.name,
      floorId: camera?.floorId ?? 0,
      floor: Number(form.floor),
      zone: form.zone.trim(),
      rtspUrl: form.rtspUrl.trim(),
      ipAddress: form.ipAddress.trim(),
      fps: form.fps.trim() ? Number(form.fps) : 0,
      username: form.username.trim(),
      password: form.password,
      isActive: camera?.isActive ?? true,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? '카메라 수정' : '카메라 추가'}
      description={isEdit ? `'${camera?.name}' 정보를 수정합니다` : '새 카메라 정보를 입력합니다'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleConfirm}>{isEdit ? '수정 완료' : '추가 완료'}</Button>
        </>
      }
    >
      <div className={styles.form}>
        <TextField
          label="카메라 이름 *"
          placeholder="CAM-101"
          value={form.name}
          onChange={handleChange('name')}
          errorMessage={errors.name}
        />

        <div className={styles.row}>
          <div className={styles.fieldWrap}>
            <label htmlFor="camera-building" className={styles.fieldLabel}>
              건물 *
            </label>
            <select
              id="camera-building"
              className={clsx(styles.select, errors.buildingId && styles.selectError)}
              value={form.buildingId}
              onChange={handleBuildingChange}
              aria-invalid={Boolean(errors.buildingId)}
              aria-describedby={errors.buildingId ? 'camera-building-error' : undefined}
            >
              <option value="">건물 선택</option>
              {buildings.map((b) => (
                <option key={b.id} value={String(b.id)}>
                  {b.name}
                </option>
              ))}
            </select>
            {errors.buildingId && (
              <span id="camera-building-error" className={styles.errorText}>
                {errors.buildingId}
              </span>
            )}
          </div>

          <div className={styles.fieldWrap}>
            <label htmlFor="camera-floor" className={styles.fieldLabel}>
              층수 *
            </label>
            <select
              id="camera-floor"
              className={clsx(styles.select, errors.floor && styles.selectError)}
              value={form.floor}
              onChange={handleFloorChange}
              disabled={!selectedBuilding}
              aria-invalid={Boolean(errors.floor)}
              aria-describedby={errors.floor ? 'camera-floor-error' : undefined}
            >
              <option value="">층수 선택</option>
              {floorOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.floor && (
              <span id="camera-floor-error" className={styles.errorText}>
                {errors.floor}
              </span>
            )}
          </div>
        </div>

        <TextField
          label="구역 *"
          placeholder="비상구 A-1층"
          value={form.zone}
          onChange={handleChange('zone')}
          errorMessage={errors.zone}
        />

        <div className={styles.section}>
          <span className={styles.sectionLabel}>스트림 정보</span>
          <TextField
            label="RTSP URL *"
            placeholder="rtsp://192.168.1.101:554/stream1"
            value={form.rtspUrl}
            onChange={handleChange('rtspUrl')}
            errorMessage={errors.rtspUrl}
          />
          <div className={styles.row}>
            <TextField
              label="IP 주소 *"
              placeholder="192.168.1.101"
              value={form.ipAddress}
              onChange={handleChange('ipAddress')}
              errorMessage={errors.ipAddress}
            />
            <TextField
              label="FPS"
              placeholder="30"
              value={form.fps}
              onChange={handleChange('fps')}
              errorMessage={errors.fps}
            />
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionLabel}>인증 정보</span>
          <div className={styles.row}>
            <TextField
              label="아이디"
              placeholder="admin"
              value={form.username}
              onChange={handleChange('username')}
            />
            <TextField
              label="비밀번호"
              type="password"
              placeholder="비밀번호"
              value={form.password}
              onChange={handleChange('password')}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CameraFormModal;
