import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { EmailService } from 'src/email/email.service';

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
        global: true,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    GoogleStrategy,
  ],
})
export class AuthModule {}
