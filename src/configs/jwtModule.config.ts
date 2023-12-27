import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtModuleConfig = (): JwtModuleOptions => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not found');
  }

  return {
    secret: process.env.JWT_SECRET,
    signOptions: {
      expiresIn: '7d',
    },
  };
};
