import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Profile } from 'passport';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  private async _updateRefreshTokenHash(userId: string, refreshToken: string) {
    const hash = await argon2.hash(refreshToken);
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: hash },
    });
  }

  private async _generateTokens(userId: string, email: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId, email },
      { expiresIn: '15m' },
    );
    const refreshToken = this.jwtService.sign(
      { sub: userId, email },
      { expiresIn: '7d' },
    );
    return { accessToken, refreshToken };
  }

  async resetPassword(token: string, dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpires: { gt: new Date() } },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    const hashedPassword = await argon2.hash(dto.password);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return { message: 'Password has been reset successfully.' };
  }

  async forgetPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await this.prisma.user.update({
        where: { id: user.id },
        data: { resetToken: token, resetTokenExpires: expires },
      });

      const link = `${process.env.FRONTEND_URL}/reset-password/${token}`;
      await this.emailService.sendEmail(
        user.username,
        user.email,
        'Reset Your Password',
        `Please use the following link to reset your password: ${link}`,
      );
    }

    return {
      message:
        'If a user with that email exists, a password reset link has been sent.',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password || !(await argon2.verify(user.password, dto.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    const { accessToken, refreshToken } = await this._generateTokens(
      user.id,
      user.email,
    );
    await this._updateRefreshTokenHash(user.id, refreshToken);

    return { accessToken, refreshToken, user };
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already in use');
    }

    const hashedPassword = await argon2.hash(dto.password);

    const newUser = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
      },
    });

    const { accessToken, refreshToken } = await this._generateTokens(
      newUser.id,
      newUser.email,
    );
    await this._updateRefreshTokenHash(newUser.id, refreshToken);

    return { accessToken, refreshToken, user: newUser };
  }

  async refreshTokens(userId: string, rt: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const rtMatches = await argon2.verify(user.hashedRefreshToken, rt);
    if (!rtMatches) {
      throw new ForbiddenException('Access Denied');
    }

    const { accessToken, refreshToken } = await this._generateTokens(
      user.id,
      user.email,
    );
    await this._updateRefreshTokenHash(user.id, refreshToken);

    return { accessToken, refreshToken, user };
  }

  async socialLogin(user: any) {
    const { accessToken, refreshToken } = await this._generateTokens(
      user.id,
      user.email,
    );
    await this._updateRefreshTokenHash(user.id, refreshToken);

    return { accessToken, refreshToken, user };
  }

  async validateGoogleUser(profile: Profile) {
    if (!profile || !profile.emails || profile.emails.length === 0) {
      throw new BadRequestException('No email found in Google profile');
    }

    const email = profile.emails[0].value;
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          username: profile.displayName || email,
          displayName: profile.displayName,
          avatarUrl: profile.photos?.[0]?.value,
        },
      });
    }
    return user;
  }

  async logout(userId: string) {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRefreshToken: {
          not: null,
        },
      },
      data: {
        hashedRefreshToken: null,
      },
    });
    return { message: 'Logout successful' };
  }
}

