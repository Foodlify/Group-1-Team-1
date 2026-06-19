import { z } from 'zod';

export function safeString(base: z.ZodString = z.string()) {
  return base.trim().superRefine((val, ctx) => {
    if (/<[^>]*>/g.test(val)) {
      ctx.addIssue({ code: "custom", message: 'HTML tags not allowed' });
    }
    if (/&(#\d+|[a-zA-Z]+);/.test(val)) {
      ctx.addIssue({ code: "custom", message: 'HTML entities not allowed' });
    }
    if (/(['";\\]|--|\/\*|\*\/|UNION\s|SELECT\s|INSERT\s|UPDATE\s|DELETE\s|DROP\s|ALTER\s|EXEC\s|xp_)/i.test(val)) {
      ctx.addIssue({ code: "custom", message: 'Invalid characters detected' });
    }
  });
}
