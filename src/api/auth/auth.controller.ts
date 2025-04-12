import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CredentialsDto } from '../dto/credentials.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

@Controller('auth')
@UsePipes(new ValidationPipe({ transform: true }))
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signin')
  async signIn(@Body() credentialsDto: CredentialsDto) {
    return await this.authService.signIn(credentialsDto);
  }

  @Post('/refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.refreshToken(refreshTokenDto.refreshToken);
  }
}
