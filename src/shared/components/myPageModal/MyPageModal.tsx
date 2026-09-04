import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';

import type {
  UpdateUserProfileRequest,
  UserProfileResponse,
} from '@apis/__generated__/data-contracts';

import { Button } from '@components/Button';
import TextField from '@components/inputField/TextField';
import Modal from '@components/modal';

import * as styles from './MyPageModal.css';

type MyPageForm = Required<
  Pick<UpdateUserProfileRequest, 'username' | 'phoneNumber' | 'email' | 'schoolName'>
>;

export interface MyPageModalProps {
  open: boolean;
  profile?: UserProfileResponse;
  isLoading?: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (form: MyPageForm) => Promise<void>;
}

const getInitialForm = (profile?: UserProfileResponse): MyPageForm => ({
  username: profile?.username ?? '',
  phoneNumber: profile?.phoneNumber ?? '',
  email: profile?.email ?? '',
  schoolName: profile?.schoolName ?? '',
});

const MyPageModal = ({
  open,
  profile,
  isLoading = false,
  isSaving = false,
  onClose,
  onSave,
}: MyPageModalProps) => {
  const [form, setForm] = useState<MyPageForm>(() => getInitialForm(profile));
  const initialForm = getInitialForm(profile);
  const isDirty = (Object.keys(initialForm) as (keyof MyPageForm)[]).some(
    (field) => form[field] !== initialForm[field],
  );

  useEffect(() => {
    if (!open) return;
    setForm(getInitialForm(profile));
  }, [open, profile]);

  const handleChange = (field: keyof MyPageForm) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading || isSaving || !isDirty) return;

    await onSave(form);
  };

  const handleClose = () => {
    if (!isSaving) onClose();
  };

  return (
    <Modal
      open={open}
      size="md"
      title="마이페이지"
      footer={
        <>
          <Button
            fullWidth
            size="lg"
            type="button"
            variant="ghost"
            disabled={isSaving}
            onClick={handleClose}
          >
            취소
          </Button>
          <Button
            fullWidth
            size="lg"
            type="submit"
            form="my-page-form"
            isLoading={isSaving}
            disabled={isLoading || !isDirty}
          >
            저장
          </Button>
        </>
      }
      onClose={handleClose}
    >
      <form className={styles.form} id="my-page-form" onSubmit={handleSubmit}>
        <TextField
          label="이름"
          value={form.username}
          disabled={isLoading || isSaving}
          onChange={handleChange('username')}
        />
        <TextField
          label="전화번호"
          value={form.phoneNumber}
          disabled={isLoading || isSaving}
          onChange={handleChange('phoneNumber')}
        />
        <TextField
          label="이메일주소"
          type="email"
          value={form.email}
          disabled={isLoading || isSaving}
          onChange={handleChange('email')}
        />
        <TextField
          label="기관명"
          value={form.schoolName}
          disabled={isLoading || isSaving}
          onChange={handleChange('schoolName')}
        />
      </form>
    </Modal>
  );
};

export default MyPageModal;
