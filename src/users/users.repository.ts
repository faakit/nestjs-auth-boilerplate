import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from './user-roles.enum';
import { randomBytes } from 'crypto';
import { genSalt, hash } from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { CredentialsDto } from '../auth/dto/credentials.dto';

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

  async checkCredentials(credentialsDto: CredentialsDto): Promise<User> {
    const { email, password } = credentialsDto;

    const user = await this.findOne({ where: { email, status: true } });

    if (user && (await user.checkPassword(password))) {
      return user;
    }

    return null;
  }
}
