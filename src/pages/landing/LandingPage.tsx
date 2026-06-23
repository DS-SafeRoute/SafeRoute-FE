import { useNavigate } from 'react-router';

import ArrowRightIcon from '@assets/icons/ic-arrow-right.svg?react';
import PlayIcon from '@assets/icons/ic-play.svg?react';
import LogoIcon from '@assets/icons/logo.svg?react';

import { Button } from '@components/Button';

import { ROUTES } from '@constants/path';

import { landingFeatures } from './constants/landing';
import * as styles from './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href={`/${ROUTES.LANDING}`} aria-label="SAFE ROUTE 홈">
          <LogoIcon className={styles.logoIcon} />
          <span>SAFE ROUTE</span>
        </a>

        <div className={styles.authActions}>
          <Button
            className={styles.loginButton}
            size="md"
            variant="ghost"
            onClick={() => navigate(ROUTES.LOGIN)}
          >
            로그인
          </Button>
          <Button size="md" variant="primary" onClick={() => navigate(ROUTES.SIGNUP)}>
            회원가입
          </Button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <span className={styles.badge}>AI · IoT · Digital Twin</span>
          <h1 className={styles.title}>
            AI 기반
            <br />
            실시간 화재 대피 훈련 관리
          </h1>
          <p className={styles.description}>
            CCTV AI 비전 분석과 IoT 센서를 활용한 실시간 군중 밀집도 모니터링으로
            <br />
            효과적인 대피 훈련과 능동적 경로 안내를 실현합니다.
          </p>

          <div className={styles.ctaGroup}>
            <a className={styles.primaryCta} href={ROUTES.HOME}>
              시스템 접속
              <ArrowRightIcon />
            </a>
            <button className={styles.secondaryCta} type="button">
              <PlayIcon />
              데모 영상
            </button>
          </div>
        </section>

        <section className={styles.featureGrid} aria-label="주요 기능">
          {landingFeatures.map(({ Icon, ...feature }) => (
            <article className={styles.featureCard} key={feature.title}>
              <span className={styles.iconBox[feature.tone]}>
                <Icon />
              </span>
              <div className={styles.featureText}>
                <h2>{feature.title}</h2>
                <p>{feature.description}</p>
              </div>
            </article>
          ))}
        </section>
      </main>

      <footer className={styles.footer}>
        <p>© 2026 Safe Route Inc. All rights reserved.</p>
        <div className={styles.footerLinks}>
          <a>이용약관</a>
          <span aria-hidden="true">·</span>
          <a>개인정보처리방침</a>
          <span aria-hidden="true">·</span>
          <a>고객지원</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
