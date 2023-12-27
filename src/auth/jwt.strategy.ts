import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserRepository } from '../users/users.repository';
import { jwtModuleConfig } from '../configs/jwtModule.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtModuleConfig().secret,
    });
  }

  async validate(payload: { id: number }) {
    const { id } = payload;

    const user = await this.userRepository.findOne({
      where: { id },
      select: ['status', 'email', 'name', 'role'],
    });

    if (!user) throw new UnauthorizedException('Usuário não encontrado!');
    if (!user.status) throw new UnauthorizedException('Usuário bloqueado!');

    return user;
  }
}
