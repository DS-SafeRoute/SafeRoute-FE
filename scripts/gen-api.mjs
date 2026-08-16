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
  { stdio: 'inherit' },
);

process.exit(result.status ?? 1);
