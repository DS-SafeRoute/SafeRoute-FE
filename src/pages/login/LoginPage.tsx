import type { FormEvent } from 'react';
import { useState } from 'react';

import { useNavigate } from 'react-router';

import LogoIcon from '@assets/icons/logo.svg?react';

import { Button } from '@components/Button';
import TextField from '@components/inputField/TextField';

import { ROUTES } from '@constants/path';

import { loginFeatures } from './constants/login';
import * as styles from './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isAutoLogin, setIsAutoLogin] = useState(true);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(ROUTES.HOME);
  };

  return (
    <main className={styles.page}>
      <section className={styles.content} aria-label="로그인">
        <div className={styles.intro}>
          <a className={styles.brand} href={`/${ROUTES.LANDING}`} aria-label="SAFE ROUTE 홈">
            <LogoIcon className={styles.logoIcon} />
            <span>SAFE ROUTE</span>
          </a>

          <h1 className={styles.title}>
            실시간 데이터 기반
            <br />
            화재 대피 훈련 및
            <br />
            평가 시스템
          </h1>

          <p className={styles.description}>
            AI 비전과 IoT 센서로 모든 훈련을 자동 평가하고,
            <br />
            개선 권고사항을 즉시 받아보세요.
          </p>

          <ul className={styles.featureList} aria-label="주요 기능">
            {loginFeatures.map(({ Icon, title }) => (
              <li className={styles.featureItem} key={title}>
                <span className={styles.featureIcon}>
                  <Icon className={styles.featureIconSvg} />
                </span>
                <span>{title}</span>
              </li>
            ))}
          </ul>
        </div>

        <form className={styles.loginCard} onSubmit={handleSubmit}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>로그인</h2>
          </div>

          <div className={styles.fieldGroup}>
            <TextField label="이메일" type="email" autoComplete="username" />
            <TextField label="비밀번호" type="password" autoComplete="current-password" />
          </div>

          <div className={styles.formOptions}>
            <label className={styles.checkboxLabel}>
              <input
                checked={isAutoLogin}
                className={styles.checkbox}
                type="checkbox"
                onChange={(event) => setIsAutoLogin(event.target.checked)}
              />
              자동 로그인
            </label>
            <button className={styles.textButton} type="button">
              비밀번호 찾기
            </button>
          </div>

          <Button fullWidth size="lg" type="submit" variant="primary">
            로그인
          </Button>

          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <p>또는</p>
            <span className={styles.dividerLine} />
          </div>

          <p className={styles.signupGuide}>
            계정이 없으신가요?
            <button
              className={styles.signupButton}
              type="button"
              onClick={() => navigate(ROUTES.SIGNUP)}
            >
              회원가입
            </button>
          </p>
        </form>
      </section>
    </main>
  );
};

export default LoginPage;
