import type { FormEvent } from 'react';

import { useNavigate } from 'react-router';

import LogoIcon from '@assets/icons/logo.svg?react';

import { Button } from '@components/Button';
import TextField from '@components/inputField/TextField';

import { ROUTES } from '@constants/path';

import * as styles from './SignupPage.css';

const SignupPage = () => {
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(ROUTES.LOGIN);
  };

  return (
    <main className={styles.page}>
      <form className={styles.signupCard} onSubmit={handleSubmit}>
        <a className={styles.brand} href={`/${ROUTES.LANDING}`} aria-label="SAFE ROUTE 홈">
          <LogoIcon className={styles.logoIcon} />
          <span>SAFE ROUTE</span>
        </a>

        <h1 className={styles.title}>회원가입</h1>

        <div className={styles.fieldGroup}>
          <TextField label="기관명 *" placeholder="예: 00고등학교" autoComplete="organization" />
          <TextField label="관리자 이름 *" placeholder="홍길동" autoComplete="name" />
          <TextField
            label="이메일 *"
            type="email"
            placeholder="admin@example.com"
            autoComplete="email"
          />
          <TextField
            helperText="영문, 숫자, 특수문자 포함 8자 이상"
            label="비밀번호 *"
            type="password"
            autoComplete="new-password"
          />
          <TextField label="비밀번호 확인 *" type="password" autoComplete="new-password" />
        </div>

        <Button fullWidth size="lg" type="submit" variant="primary">
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
