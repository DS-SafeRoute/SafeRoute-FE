import { spawnSync } from 'node:child_process';

process.loadEnvFile('.env');

const url = process.env.SWAGGER_URL;

if (!url) {
  throw new Error('.env에 SWAGGER_URL이 정의되어 있지 않습니다.');
}

const result = spawnSync(
  'pnpm',
  [
    'exec',
    'swagger-typescript-api',
    'generate',
    '-p',
    url,
    '-o',
    'src/shared/apis/__generated__',
    '--no-client',
    '--modular',
    '--clean-output',
    '--sort-types',
    '--extract-request-body',
    '--extract-response-body',
  ],
  // shell: true 없으면 Windows에서 pnpm(.CMD 셸 스크립트)을 못 찾고 ENOENT로 조용히 실패함
  { stdio: 'inherit', shell: true },
);

// 자식 프로세스가 아예 못 떴을 때(spawn 자체 실패)는 result.status가 null이라 그냥 exit(1)만
// 하면 원인이 안 보임 — 무슨 에러였는지 찍어주고 종료
if (result.error) {
  console.error('[api:generate] 프로세스 실행 실패:', result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
