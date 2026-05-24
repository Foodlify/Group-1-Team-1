export const USER_TYPE = {
  CUSTOMER: 'customer',
  ADMIN:    'admin',
} as const;

export type UserTypeCode = typeof USER_TYPE[keyof typeof USER_TYPE];
