import { createParamDecorator } from '@nestjs/common';
import { User } from '../../../shared/entities/user.entity';

export const GetUser = createParamDecorator((data, request): User => {
  return request.args[0].user;
});
