import { useEffect, useRef, useState } from 'react';

import clsx from 'clsx';

import UploadIcon from '@assets/icons/ic-upload.svg?react';

import { Button } from '@components/Button';
import Modal from '@components/modal';

import * as styles from './FloorUploadModal.css';

interface FloorUploadModalProps {
  open: boolean;
  onClose: () => void;
  buildingName: string;
  floorNum: number;
  onConfirm: (file: File) => void;
}

const formatFloor = (floorNum: number) => {
  if (floorNum > 0) return `${floorNum}층`;
  if (floorNum < 0) return `B${Math.abs(floorNum)}층`;
  return '1층';
};

const FloorUploadModal = ({
  open,
  onClose,
  buildingName,
  floorNum,
  onConfirm,
}: FloorUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileSelect = (selected: File) => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === 'image/jpeg') handleFileSelect(selected);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === 'image/jpeg') handleFileSelect(dropped);
  };

  const handleConfirm = () => {
    if (!file) return;
    onConfirm(file);
    setFile(null);
    setPreview(null);
  };

  const handleClose = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="도면 파일 업로드"
      description={`${buildingName} · ${formatFloor(floorNum)}`}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            취소
          </Button>
          <Button disabled={!file} onClick={handleConfirm}>
            업로드
          </Button>
        </>
      }
    >
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>층</span>
        <span className={styles.infoValue}>{formatFloor(floorNum)}</span>
      </div>

      {file ? (
        <div className={styles.previewWrap}>
          {preview && <img src={preview} alt="도면 미리보기" className={styles.previewImg} />}
          <span className={styles.previewName}>{file.name}</span>
          <button
            type="button"
            className={styles.changeButton}
            onClick={() => inputRef.current?.click()}
          >
            파일 변경
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          className={clsx(styles.dropzone, dragOver && styles.dropzoneActive)}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <UploadIcon width={28} height={28} className={styles.dropzoneIcon} />
          <span className={styles.dropzoneText}>클릭하거나 파일을 드래그해 주세요</span>
          <span className={styles.dropzoneHint}>JPG 형식만 지원</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg"
        className={styles.fileInput}
        onChange={handleInputChange}
      />
    </Modal>
  );
};

export default FloorUploadModal;
