import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './users.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from './user-roles.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async createAdminUser(createUserDto: CreateUserDto) {
    if (createUserDto.password !== createUserDto.passwordConfirmation) {
      throw new UnprocessableEntityException(
        'A confirmação deve ser igual à senha.',
      );
    }

    return this.userRepository.createUser(createUserDto, UserRole.ADMIN);
  }

  async findUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['name', 'email', 'role', 'status'],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return user;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    if (
      updateUserDto.password &&
      updateUserDto.password !== updateUserDto.passwordConfirmation
    ) {
      throw new UnprocessableEntityException(
        'A confirmação deve ser igual à senha.',
      );
    }

    await this.userRepository.updateUser(id, updateUserDto);
  }

  async findUsers(findUsersQueryDto: FindUsersQueryDto) {
    return await this.userRepository.findUsers(findUsersQueryDto);
  }
}
