import { z } from 'zod';

import { emailSchema, signupPasswordSchema } from '@shared/schemas/authSchema';

export const signupFormSchema = z
  .object({
    organization: z
      .string()
      .min(5, '기관명은 5자 이상이어야 합니다.')
      .max(20, '기관명은 20자 이하여야 합니다.'),
    managerName: z
      .string()
      .min(2, '관리자 이름은 2자 이상이어야 합니다.')
      .max(20, '관리자 이름은 20자 이하여야 합니다.'),
    email: emailSchema,
    password: signupPasswordSchema,
    passwordConfirm: z.string().min(1, '비밀번호 확인을 입력해 주세요.'),
  })
  .refine(({ password, passwordConfirm }) => password === passwordConfirm, {
    path: ['passwordConfirm'],
    message: '비밀번호가 일치하지 않습니다.',
  });

export type SignupFormValues = z.infer<typeof signupFormSchema>;
