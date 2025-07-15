import {
  Injectable,
  HttpException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  generateTokens(userId: string): {
    accessToken: string;
    refreshToken: string;
  } {
    const payload = { sub: userId };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async register(registerDto: RegisterDto) {
    try {
      const { username, email, password } = registerDto;
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
      });

      if (existingUser) {
        if (existingUser.email === email) {
          throw new HttpException('Email already registered', 400);
        }
        if (existingUser.username === username) {
          throw new HttpException('Username already taken', 400);
        }
      }

      const hashedPassword = await argon2.hash(password);

      const verificationToken = randomBytes(32).toString('hex');
      const verificationTokenExpiry = new Date(Date.now() + 60 * 15 * 1000);

      const newUser = await this.prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          verificationToken,
          verificationTokenExpiry,
        },
      });

      await this.mailService.sendVerificationEmail(
        newUser.email,
        verificationToken,
      );

      return {
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          isVerified: newUser.isVerified,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });
      const authError = new UnauthorizedException('Invalid email or password');
      if (!user || !user.password) throw authError;

      const isPasswordValid = await argon2.verify(user.password, password);
      if (!isPasswordValid) throw authError;

      if (!user.isVerified)
        throw new UnauthorizedException(
          'Please verify your email before logging in',
        );

      const { accessToken, refreshToken } = this.generateTokens(user.id);

      return {
        message: 'User logged in successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isVerified: user.isVerified,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  async googleLoginCallback(req: Request) {
    try {
      if (!req.user) {
        throw new UnauthorizedException('No user data from Google');
      }

      const { profile } = req.user as any;
      const { id, name, emails, photos } = profile;

      if (!emails?.[0]?.value) {
        throw new BadRequestException('No email provided by Google');
      }

      const email = emails[0].value;
      const username = `${name?.givenName || 'user'}_${Math.random().toString(36).substring(2, 9)}`;
      const avatar = photos?.[0]?.value || null;

      let user = await this.prisma.user.findFirst({
        where: {
          OR: [{ email }, { googleId: id }],
        },
        select: {
          id: true,
          username: true,
          email: true,
          googleId: true,
          isVerified: true,
          avatar: true,
        } as const,
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            username,
            email,
            avatar,
            googleId: id,
            isVerified: true,
          },
        });
      } else if (!user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: id,
            isVerified: true,
            ...(!user.avatar && { avatar }),
          },
        });
      }

      const { accessToken, refreshToken } = this.generateTokens(user.id);

      return {
        message: 'User logged in successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          isVerified: user.isVerified,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail(token: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          verificationToken: token,
          verificationTokenExpiry: {
            gte: new Date(),
          },
        },
      });
      if (!user) throw new BadRequestException('Invalid token');

      await this.prisma.user.update({
        where: {
          email: user.email,
        },
        data: {
          isVerified: true,
          verificationToken: null,
          verificationTokenExpiry: null,
        },
      });

      const { accessToken, refreshToken } = this.generateTokens(user.id);

      return {
        message: 'Email verified successfully',
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const { email } = forgotPasswordDto;

      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (!user) throw new NotFoundException('User not found');

      const resetToken = randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 60 * 15 * 1000);

      await this.prisma.user.update({
        where: {
          email,
        },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });

      await this.mailService.sendPasswordResetEmail(email, resetToken);

      return {
        message: 'Password reset email sent successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyResetPasswordToken(token: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        throw new NotFoundException('Invalid or expired reset token');
      }

      return { valid: true, email: user.email };
    } catch (error) {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

  async resetPassword(token: string, resetPasswordDto: ResetPasswordDto) {
    try {
      const { password } = resetPasswordDto;

      const user = await this.prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: {
            gte: new Date(),
          },
        },
      });
      if (!user) throw new BadRequestException('Invalid token');

      const hashedPassword = await argon2.hash(password);

      await this.prisma.user.update({
        where: {
          email: user.email,
        },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return {
        message: 'Password reset successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(req: Request) {
    try {
      const refreshTokenSaved = req.cookies.refreshToken;
      if (!refreshTokenSaved)
        throw new UnauthorizedException('Invalid credentials');

      const decoded = this.jwtService.verify(refreshTokenSaved, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      if (!decoded) throw new UnauthorizedException('Invalid credentials');

      const user = await this.prisma.user.findUnique({
        where: {
          id: decoded.sub,
        },
      });
      if (!user) throw new UnauthorizedException('Invalid credentials');

      const { accessToken, refreshToken } = this.generateTokens(user.id);

      return {
        message: 'User logged in successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isVerified: user.isVerified,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  async getMe(req: Request) {
    try {
      const user = req.user as any;
      if (!user) throw new UnauthorizedException('Invalid credentials');

      const userFromDb = await this.prisma.user.findUnique({
        where: {
          id: user.id,
        },
      });
      if (!userFromDb) throw new UnauthorizedException('Invalid credentials');

      return {
        message: 'User logged in successfully',
        user: {
          id: userFromDb.id,
          username: userFromDb.username,
          email: userFromDb.email,
          isVerified: userFromDb.isVerified,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
