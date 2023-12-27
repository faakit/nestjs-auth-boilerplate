import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './users.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from './user-roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  createAdminUser(createUserDto: CreateUserDto) {
    if (createUserDto.password !== createUserDto.passwordConfirmation) {
      throw new UnprocessableEntityException(
        'A confirmação deve ser igual à senha.',
      );
    }

    return this.userRepository.createUser(createUserDto, UserRole.ADMIN);
  }
}
