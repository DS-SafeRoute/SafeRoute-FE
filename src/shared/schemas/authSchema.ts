import { z } from 'zod';

export const emailSchema = z
  .string()
  .min(1, '이메일을 입력해 주세요.')
  .email('올바른 이메일 형식이 아닙니다.');

export const loginPasswordSchema = z.string().min(1, '비밀번호를 입력해 주세요.');

export const signupPasswordSchema = z
  .string()
  .min(8, '비밀번호는 8자 이상이어야 합니다.')
  .max(100, '비밀번호는 100자 이하여야 합니다.')
  .regex(/[A-Za-z]/, '영문을 포함해 주세요.')
  .regex(/[0-9]/, '숫자를 포함해 주세요.')
  .regex(/[^A-Za-z0-9]/, '특수문자를 포함해 주세요.');
