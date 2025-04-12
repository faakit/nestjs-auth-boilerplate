/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { QueryRunner, Repository } from 'typeorm';
import { genSalt, hash } from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { UserRole } from 'src/shared/enums/roles.enum';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    repository: Repository<UserEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async createUser(
    createUserDto: { email: string; password: string },
    role: UserRole = UserRole.USER,
    queryRunner: QueryRunner,
  ): Promise<UserEntity> {
    const { email, password } = createUserDto;

    const salt = await genSalt();

    const user = this.create({
      email,
      role,
      salt,
      password: await hash(password, salt),
    });

    try {
      await queryRunner.manager.save(user);

      delete user.password;
      delete user.salt;

      return user;
    } catch (error) {
      // type the typeorm postgres error to fix type errors

      if (
        error.detail.includes('already exists') &&
        error.detail.includes('email')
      ) {
        throw new ConflictException('E-mail já cadastrado!');
      } else {
        throw new InternalServerErrorException('Erro interno do servidor!');
      }
    }
  }

  async updateUser(
    id: number,
    updateUserDto: { email?: string; password?: string },
    queryRunner: QueryRunner,
  ) {
    const { password, email } = updateUserDto;

    const user = await this.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado!');
    }

    user.email = email ? email : user.email;

    if (password) {
      const salt = await genSalt();

      user.salt = salt;
      user.password = await hash(password, salt);
    }

    try {
      await queryRunner.manager.save(user);
    } catch (error) {
      if (
        error.detail.includes('already exists') &&
        error.detail.includes('email')
      ) {
        throw new ConflictException('E-mail já cadastrado!');
      } else {
        throw new InternalServerErrorException('Erro interno do servidor!');
      }
    }
  }

  async checkCredentials(credentialsDto: {
    email: string;
    password: string;
  }): Promise<UserEntity | null> {
    const { email, password } = credentialsDto;

    const user = await this.findOne({ where: { email } });

    if (user && (await user.checkPassword(password))) {
      return user;
    }

    return null;
  }

  async findUserById(
    id: number,
    options?: { includeProfile?: boolean; includeStorage?: boolean },
  ) {
    const relations: string[] = [];

    if (options?.includeProfile) {
      relations.push('profile');
    }
    if (options?.includeStorage) {
      relations.push('storage');
    }

    const user = await this.findOne({
      where: { id },
      select: ['email', 'role', 'id', 'createdAt', 'updatedAt'],
      relations,
    });

    return user;
  }

  async findUsers(
    queryDto: {
      page: number;
      limit: number;
      sort?: string;
      email?: string;
      role?: UserRole;
    },
    status: boolean,
  ) {
    queryDto.page = queryDto.page < 1 ? 1 : queryDto.page;
    queryDto.limit = queryDto.limit > 100 ? 100 : queryDto.limit;

    const { email, role } = queryDto;
    const query = this.createQueryBuilder('user');
    query.where('user.status = :status', { status });

    if (email) {
      query.andWhere('user.email ILIKE :email', { email: `%${email}%` });
    }

    if (role) {
      query.andWhere('user.role = :role', { role });
    }

    query.skip((queryDto.page - 1) * queryDto.limit);
    query.take(+queryDto.limit);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    query.orderBy(queryDto.sort ? JSON.parse(queryDto.sort) : undefined);
    query.select(['user.name', 'user.email', 'user.role', 'user.status']);

    const [users, total] = await query.getManyAndCount();

    return { users, total };
  }
}
