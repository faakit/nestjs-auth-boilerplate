import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserRepository } from '../users/users.repository';
import { jwtModuleConfig } from '../../configs/jwtModule.config';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { JwtPayload } from 'src/shared/interfaces/jwt';
import { MedicAccessesRepository } from '../medic-accesses/medic-accesses.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(MedicAccessesRepository)
    private readonly medicAccessesRepository: MedicAccessesRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtModuleConfig().secret,
    });
  }

  async validate(payload: JwtPayload) {
    const { id, role } = payload;

    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'role'],
    });

    if (!user) throw new UnauthorizedException('Usuário não encontrado!');

    if (role === UserRole.MEDIC) {
      const medicAccess = await this.medicAccessesRepository.findOne({
        where: { id: payload.medicAccessId || 0, user: { id } },
      });

      if (!medicAccess || medicAccess.isRevoked)
        throw new UnauthorizedException('Acesso negado!');

      return { id, role: UserRole.MEDIC };
    }

    return user;
  }
}
