import { useEffect, useState } from 'react';

import { Button } from '@components/Button';
import TextField from '@components/inputField/TextField';
import Modal from '@components/modal';

import * as styles from './CameraFormModal.css';

import type { Camera } from '../types/cameras';

type FormState = {
  name: string;
  buildingName: string;
  floor: string;
  zone: string;
  rtspUrl: string;
  ipAddress: string;
  fps: string;
  username: string;
  password: string;
};

const INITIAL_FORM: FormState = {
  name: '',
  buildingName: '',
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
  buildingName: camera.buildingName,
  floor: String(camera.floor),
  zone: camera.zone,
  rtspUrl: camera.rtspUrl,
  ipAddress: camera.ipAddress,
  fps: String(camera.fps),
  username: camera.username,
  password: camera.password,
});

interface CameraFormModalProps {
  open: boolean;
  onClose: () => void;
  camera?: Camera;
  onConfirm: (data: Omit<Camera, 'id' | 'status'>) => void;
}

const CameraFormModal = ({ open, onClose, camera, onConfirm }: CameraFormModalProps) => {
  const isEdit = Boolean(camera);
  const [form, setForm] = useState<FormState>(camera ? cameraToForm(camera) : INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  useEffect(() => {
    if (open) {
      setForm(camera ? cameraToForm(camera) : INITIAL_FORM);
      setErrors({});
    }
  }, [open, camera]);

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const next: Partial<FormState> = {};
    if (!form.name.trim()) next.name = '카메라 이름을 입력해 주세요';
    if (!form.buildingName.trim()) next.buildingName = '건물명을 입력해 주세요';
    if (!form.floor.trim()) next.floor = '층수를 입력해 주세요';
    else if (!/^-?\d+$/.test(form.floor.trim())) next.floor = '올바른 층수를 입력해 주세요';
    if (!form.zone.trim()) next.zone = '구역을 입력해 주세요';
    if (!form.rtspUrl.trim()) next.rtspUrl = 'RTSP URL을 입력해 주세요';
    else if (!form.rtspUrl.trim().startsWith('rtsp://')) next.rtspUrl = 'rtsp://로 시작해야 합니다';
    if (!form.ipAddress.trim()) next.ipAddress = 'IP 주소를 입력해 주세요';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    onConfirm({
      name: form.name.trim(),
      buildingId: camera?.buildingId ?? 0,
      buildingName: form.buildingName.trim(),
      floor: Number(form.floor),
      zone: form.zone.trim(),
      rtspUrl: form.rtspUrl.trim(),
      ipAddress: form.ipAddress.trim(),
      fps: form.fps.trim() ? Number(form.fps) : 0,
      username: form.username.trim(),
      password: form.password,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? '카메라 수정' : '카메라 추가'}
      description={isEdit ? `'${camera!.name}' 정보를 수정합니다` : '새 카메라 정보를 입력합니다'}
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
          <TextField
            label="건물명 *"
            placeholder="A동 본관"
            value={form.buildingName}
            onChange={handleChange('buildingName')}
            errorMessage={errors.buildingName}
          />
          <TextField
            label="층수 *"
            placeholder="1 (지하는 -1)"
            value={form.floor}
            onChange={handleChange('floor')}
            errorMessage={errors.floor}
          />
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
