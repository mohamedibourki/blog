import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: 500034234,
      ttl: 60 * 5 * 1000,
    },
  })
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const result = await this.authService.register(registerDto);
    const { ...rest } = result;

    return res.status(201).json({ ...rest });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: 10000000,
      ttl: 60 * 5 * 1000,
    },
  })
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(loginDto);
    const { accessToken, refreshToken, ...rest } = result;

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 15 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });

    return res.status(200).json({ ...rest });
  }

  // @Post('logout')
  // @Throttle({
  //   default: {
  //     limit: 10000000,
  //     ttl: 60 * 5 * 1000,
  //   },
  // })
  // logout(@Res() res: Response) {
  //   res.clearCookie('accessToken');
  //   res.clearCookie('refreshToken');

  //   return res.status(200).json({ message: 'User logged out successfully' });
  // }

  // google auth
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.googleLoginCallback(req as any);
    const { accessToken, refreshToken } = result;

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 15 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });

    return res.redirect(
      `${this.configService.get<string>('CLIENT_URL') || 'http://localhost:3000'}/dashboard`,
    );
  }

  // verify email
  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    const result = await this.authService.verifyEmail(token);
    const { accessToken, refreshToken, ...rest } = result;

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 15 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });

    return res.status(200).json({ ...rest });
  }

  // forgot password
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: 1,
      ttl: 60 * 1000,
    },
  })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Get('reset-password')
  @HttpCode(HttpStatus.OK)
  async verifyResetPasswordToken(@Query('token') token: string) {
    return this.authService.verifyResetPasswordToken(token);
  }

  // reset password
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(
    @Query('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(token, resetPasswordDto);
  }

  // refresh token
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.refreshToken(req as any);

    return res.status(200).json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  }

  // verify token
  @Post('verify-token')
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Body() body: { token: string }, @Res() res: Response) {
    const result = this.authService.verifyToken(body.token);

    if (result) return res.status(200).json({ valid: true, userId: result });
    return res.status(401).json({ valid: false, userId: null });
  }

  // me
  @Get('me')
  @HttpCode(HttpStatus.OK)
  getMe(@Req() req: Request) {
    const result = this.authService.getMe(req as any);
    return result;
  }
}
