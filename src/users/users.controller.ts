import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
  Get,
  Param,
  Patch,
  ForbiddenException,
  Query,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ReturnUserDto } from './dto/return-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './user-roles.enum';
import { RolesGuard } from '../auth/roles.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUser } from '../auth/get-user.decorator';
import { User } from './user.entity';
import { FindUsersQueryDto } from './dto/find-users-query.dto';

@Controller('users')
@UseGuards(AuthGuard(), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles([UserRole.ADMIN])
  async createAdminUser(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ): Promise<ReturnUserDto> {
    const user = await this.usersService.createAdminUser(createUserDto);

    return {
      user,
      message: 'Usuário administrador criado com sucesso!',
    };
  }

  @Get(':id')
  @Roles([UserRole.ADMIN])
  async findUserById(@Param('id') id: number): Promise<ReturnUserDto> {
    const user = await this.usersService.findUserById(id);

    return {
      user,
      message: 'Usuário encontrado.',
    };
  }

  @Patch('me')
  async updateSelf(
    @GetUser() user: User,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(user.id, updateUserDto);
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: number,
    @GetUser() user: User,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ) {
    if (
      user.role != UserRole.ADMIN &&
      (user.id != id || updateUserDto.role || updateUserDto.status)
    ) {
      throw new ForbiddenException(
        'Você não tem autorização para acessar esse recurso',
      );
    }

    await this.usersService.updateUser(id, updateUserDto);
  }

  @Get()
  @Roles([UserRole.ADMIN])
  @UsePipes(new ValidationPipe({ transform: true }))
  async findUsers(@Query() findUsersQueryDto: FindUsersQueryDto) {
    const found = await this.usersService.findUsers(findUsersQueryDto);

    return {
      found,
      message: 'Usuários encontrados.',
    };
  }
}
