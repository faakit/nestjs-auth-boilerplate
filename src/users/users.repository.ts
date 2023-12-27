import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from './user-roles.enum';
import { randomBytes } from 'crypto';
import { genSalt, hash } from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { CredentialsDto } from '../auth/dto/credentials.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(
    @InjectRepository(User)
    repository: Repository<User>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async createUser(
    createUserDto: CreateUserDto,
    role: UserRole,
  ): Promise<User> {
    const { email, name, password } = createUserDto;

    const salt = await genSalt();

    const user = this.create({
      name,
      email,
      role,
      status: true,
      confirmationToken:
        role === UserRole.ADMIN ? null : randomBytes(32).toString('hex'),
      salt,
      password: await hash(password, salt),
    });

    try {
      await user.save();

      delete user.password;
      delete user.salt;
      delete user.confirmationToken;

      return user;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('E-mail já cadastrado!');
      } else {
        throw new InternalServerErrorException('Erro interno do servidor!');
      }
    }
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const { role, status, email, name, password } = updateUserDto;

    const user = await this.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado!');
    }

    user.name = name ? name : user.name;
    user.email = email ? email : user.email;
    user.role = role ? role : user.role;
    user.status = status === undefined ? user.status : status;

    if (password) {
      const salt = await genSalt();

      user.salt = salt;
      user.password = await hash(password, salt);
    }

    try {
      await user.save();
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('E-mail já cadastrado!');
      } else {
        throw new InternalServerErrorException('Erro interno do servidor!');
      }
    }
  }

  async checkCredentials(credentialsDto: CredentialsDto): Promise<User> {
    const { email, password } = credentialsDto;

    const user = await this.findOne({ where: { email, status: true } });

    if (user && (await user.checkPassword(password))) {
      return user;
    }

    return null;
  }

  async findUsers(queryDto: FindUsersQueryDto) {
    queryDto.status = queryDto.status === undefined ? true : queryDto.status;
    queryDto.page = queryDto.page < 1 ? 1 : queryDto.page;
    queryDto.limit = queryDto.limit > 100 ? 100 : queryDto.limit;

    const { email, name, status, role } = queryDto;
    const query = this.createQueryBuilder('user');
    query.where('user.status = :status', { status });

    if (email) {
      query.andWhere('user.email ILIKE :email', { email: `%${email}%` });
    }

    if (name) {
      query.andWhere('user.name ILIKE :name', { name: `%${name}%` });
    }

    if (role) {
      query.andWhere('user.role = :role', { role });
    }

    console.log(queryDto.page, queryDto.limit);
    query.skip((queryDto.page - 1) * queryDto.limit);
    query.take(+queryDto.limit);
    query.orderBy(queryDto.sort ? JSON.parse(queryDto.sort) : undefined);
    query.select(['user.name', 'user.email', 'user.role', 'user.status']);

    const [users, total] = await query.getManyAndCount();

    return { users, total };
  }
}
