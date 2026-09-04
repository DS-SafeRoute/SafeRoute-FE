import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';

import LogoIcon from '@assets/icons/logo.svg?react';

import { Button } from '@components/Button';
import TextField from '@components/inputField/TextField';
import useToast from '@components/toast/useToast';

import { ROUTES } from '@constants/path';

import { useSignupMutation } from './api/useSignupMutation';
import { signupFormSchema } from './schemas/signupFormSchema';
import * as styles from './SignupPage.css';

import type { SignupFormValues } from './schemas/signupFormSchema';

const SignupPage = () => {
  const navigate = useNavigate();
  const signupMutation = useSignupMutation();
  const { show } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      organization: '',
      managerName: '',
      email: '',
      password: '',
      passwordConfirm: '',
    },
  });

  const handleSignup = handleSubmit(async (values) => {
    try {
      await signupMutation.mutateAsync({
        email: values.email,
        password: values.password,
        role: 'MANAGER',
        schoolName: values.organization,
        username: values.managerName,
      });

      show({ title: '회원가입이 완료되었습니다.', variant: 'success' });
      navigate(ROUTES.LOGIN);
    } catch {
      show({
        title: '회원가입에 실패했습니다.',
        variant: 'error',
      });
    }
  });

  return (
    <main className={styles.page}>
      <form noValidate className={styles.signupCard} onSubmit={handleSignup}>
        <Link className={styles.brand} to={ROUTES.LANDING} aria-label="SAFE ROUTE 홈">
          <LogoIcon className={styles.logoIcon} />
          <span>SAFE ROUTE</span>
        </Link>

        <h1 className={styles.title}>회원가입</h1>

        <div className={styles.fieldGroup}>
          <TextField
            required
            label="기관명 *"
            placeholder="예: 00고등학교"
            autoComplete="organization"
            errorMessage={errors.organization?.message}
            disabled={signupMutation.isPending}
            {...register('organization')}
          />
          <TextField
            required
            label="관리자 이름 *"
            placeholder="홍길동"
            autoComplete="name"
            errorMessage={errors.managerName?.message}
            disabled={signupMutation.isPending}
            {...register('managerName')}
          />
          <TextField
            required
            label="이메일 *"
            type="email"
            placeholder="admin@example.com"
            autoComplete="email"
            errorMessage={errors.email?.message}
            disabled={signupMutation.isPending}
            {...register('email')}
          />
          <TextField
            required
            helperText="영문, 숫자, 특수문자 포함 8자 이상"
            label="비밀번호 *"
            type="password"
            autoComplete="new-password"
            errorMessage={errors.password?.message}
            disabled={signupMutation.isPending}
            {...register('password')}
          />
          <TextField
            required
            label="비밀번호 확인 *"
            type="password"
            autoComplete="new-password"
            errorMessage={errors.passwordConfirm?.message}
            disabled={signupMutation.isPending}
            {...register('passwordConfirm')}
          />
        </div>

        <Button
          fullWidth
          size="lg"
          type="submit"
          variant="primary"
          isLoading={signupMutation.isPending}
        >
          회원가입
        </Button>

        <p className={styles.loginGuide}>
          이미 계정이 있으신가요?
          <button
            className={styles.loginButton}
            type="button"
            onClick={() => navigate(ROUTES.LOGIN)}
          >
            로그인
          </button>
        </p>
      </form>
    </main>
  );
};

export default SignupPage;
