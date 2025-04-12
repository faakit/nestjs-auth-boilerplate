import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../users/users.repository';
import { UserRole } from '../../shared/enums/user-role.enum';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../../shared/entities/user.entity';
import { CredentialsDto } from '../dto/credentials.dto';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { UserStorageRepository } from '../user-storages/user-storages.repository';
import { UserProfileRepository } from '../user-profile/user-profiles.repository';
import { TokenType } from 'src/shared/enums/token-type.enum';
import { JwtPayload } from 'src/shared/interfaces/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(UserStorageRepository)
    private readonly userStorageRepository: UserStorageRepository,
    @InjectRepository(UserProfileRepository)
    private readonly userProfileRepository: UserProfileRepository,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userRepository.createUser(
        createUserDto,
        UserRole.USER,
        queryRunner,
      );
      await this.userProfileRepository.createUserProfile(
        user.id,
        createUserDto,
        queryRunner,
      );
      await this.userStorageRepository.createUserStorage(user.id, queryRunner);

      await queryRunner.commitTransaction();
      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.logger.error({ message: 'Error creating user', error });

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async signIn(credentialsDto: CredentialsDto) {
    const user = await this.userRepository.checkCredentials(credentialsDto);

    if (!user || user.role === UserRole.MEDIC)
      throw new UnauthorizedException('Credenciais inválidas!');

    return await this.generateToken(user.id, user.role);
  }

  async refreshToken(oldToken: string) {
    const decoded = this.jwtService.decode(oldToken) as {
      id: number;
      type: TokenType;
    };

    if (!decoded) throw new UnauthorizedException('Token inválido!');
    if (decoded.type !== TokenType.REFRESH_TOKEN)
      throw new UnauthorizedException('Token inválido!');

    const user = await this.userRepository.findOne({
      where: { id: decoded.id },
    });

    if (!user || user.role === UserRole.MEDIC)
      throw new UnauthorizedException('Token inválido!');

    return await this.generateToken(user.id, user.role);
  }

  private async generateToken(
    id: number,
    role: UserRole.ADMIN | UserRole.USER,
  ) {
    const accessToken = await this.jwtService.signAsync({
      id,
      role,
      type: TokenType.ACCESS_TOKEN,
    } as JwtPayload);

    const refreshToken = await this.jwtService.signAsync(
      {
        id,
        role,
        type: TokenType.REFRESH_TOKEN,
      } as JwtPayload,
      {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
      },
    );

    return { accessToken, refreshToken };
  }

  async generateMedicToken(userId: number, medicAccessId: number) {
    const accessToken = await this.jwtService.signAsync(
      {
        id: userId,
        medicAccessId,
        role: UserRole.MEDIC,
        type: TokenType.ACCESS_TOKEN,
      } as JwtPayload,
      { expiresIn: process.env.JWT_MEDIC_ACCESS_TOKEN_EXPIRES_IN },
    );

    return { accessToken };
  }
}
