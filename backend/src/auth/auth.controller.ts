import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Param,
  Get,
  UseGuards,
}
from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

import { ForgetPasswordDto } from './dto/forget-password.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';



@Controller('auth')
export class AuthController {
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleLoginCallback(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.socialLogin(req.user);
    this.setAuthCookies(res, accessToken, refreshToken);
    return { user };
  }

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
  }

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } = await this.authService.register(dto);
    this.setAuthCookies(res, accessToken, refreshToken);
    return { user };
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.login(dto);
    this.setAuthCookies(res, accessToken, refreshToken);
    return { user };
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refreshTokens(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const { sub, refreshToken } = req.user;
    const { accessToken, refreshToken: newRefreshToken, user } = await this.authService.refreshTokens(sub, refreshToken);
    this.setAuthCookies(res, accessToken, newRefreshToken);
    return { user };
  }

  @UseGuards(AccessTokenGuard)
  @Post('logout')
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.sub);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return { message: 'Logout successful' };
  }

  @Post('forget-password')
  async forgetPassword(@Body() dto: ForgetPasswordDto) {
    return this.authService.forgetPassword(dto.email);
  }

  @Post('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(token, dto);
  }

  @UseGuards(AccessTokenGuard)
  @Get('profile')
  getProfile(@Req() req: any) {
    return req.user;
  }
}


