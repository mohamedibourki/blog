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
import { ForgotPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: 5,
      ttl: 60 * 5 * 1000,
    },
  })
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const result = await this.authService.register(registerDto);
    const { accessToken, refreshToken, ...rest } = result;

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict' as const,
      maxAge: 60 * 60 * 15 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict' as const,
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });

    return res.status(201).json({ ...rest });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: 5,
      ttl: 60 * 5 * 1000,
    },
  })
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(loginDto);
    const { accessToken, refreshToken, ...rest } = result;

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict' as const,
      maxAge: 60 * 60 * 15 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict' as const,
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });

    return res.status(200).json({ ...rest });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res() res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.status(200).json({ message: 'User logged out successfully' });
  }

  // google auth
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.googleLoginCallback(req as any);
    const { accessToken, refreshToken, ...rest } = result;

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict' as const,
      maxAge: 60 * 60 * 15 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict' as const,
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });

    return res.status(200).json({ ...rest });
  }

  // verify email
  @Post('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  // forget password
  @Post('forget-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: 1,
      ttl: 60 * 1000,
    },
  })
  forgetPassword(@Body() forgetPasswordDto: ForgotPasswordDto) {
    return this.authService.forgetPassword(forgetPasswordDto);
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
    const { accessToken, refreshToken, ...rest } = result;

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict' as const,
      maxAge: 60 * 60 * 15 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict' as const,
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });

    return res.status(200).json({ ...rest });
  }
}
