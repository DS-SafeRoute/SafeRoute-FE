import { z } from 'zod';

import { emailSchema, loginPasswordSchema } from '@shared/schemas/authSchema';

export const loginFormSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
