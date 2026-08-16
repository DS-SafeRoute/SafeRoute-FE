import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';

import { Button } from '@components/Button';
import TextField from '@components/inputField/TextField';
import Modal from '@components/modal';

import * as styles from './MyPageModal.css';

export interface MyPageForm {
  name: string;
  phone: string;
  email: string;
  organization: string;
}

export interface MyPageModalProps {
  open: boolean;
  onClose: () => void;
  initialName: string;
  onSave?: (form: MyPageForm) => void;
}

const getInitialForm = (name: string): MyPageForm => ({
  name,
  phone: '010-1234-5678',
  email: 'hong@example.com',
  organization: '○○고등학교',
});

const MyPageModal = ({ open, onClose, initialName, onSave }: MyPageModalProps) => {
  const [form, setForm] = useState<MyPageForm>({
    ...getInitialForm(initialName),
  });

  useEffect(() => {
    if (!open) return;
    setForm(getInitialForm(initialName));
  }, [initialName, open]);

  const handleChange = (field: keyof MyPageForm) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave?.(form);
    onClose();
  };

  return (
    <Modal
      open={open}
      size="md"
      title="마이페이지"
      footer={
        <>
          <Button fullWidth size="lg" type="button" variant="ghost" onClick={onClose}>
            취소
          </Button>
          <Button fullWidth size="lg" type="submit" form="my-page-form">
            저장
          </Button>
        </>
      }
      onClose={onClose}
    >
      <form className={styles.form} id="my-page-form" onSubmit={handleSubmit}>
        <TextField label="이름" value={form.name} onChange={handleChange('name')} />
        <TextField label="전화번호" value={form.phone} onChange={handleChange('phone')} />
        <TextField label="이메일주소" value={form.email} onChange={handleChange('email')} />
        <TextField
          label="기관명"
          value={form.organization}
          onChange={handleChange('organization')}
        />
      </form>
    </Modal>
  );
};

export default MyPageModal;
