import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from './user-roles.enum';
import { randomBytes } from 'crypto';
import { genSalt, hash } from 'bcrypt';

@Injectable()
export class UserRepository extends Repository<User> {
  async createUser(
    createUserDto: CreateUserDto,
    role: UserRole,
  ): Promise<User> {
    const { email, name, password } = createUserDto;

    const user = this.create({
      name,
      email,
      role,
      status: true,
      confirmationToken: randomBytes(32).toString('hex'),
      salt: await genSalt(),
      password: await hash(password, await genSalt()),
    });

    try {
      await user.save();

      delete user.password;
      delete user.salt;

      return user;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Email already exists');
      } else {
        throw new InternalServerErrorException('Internal server error');
      }
    }
  }
}
