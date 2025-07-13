import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { GoogleStrategy } from './strategies/google.strategie';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: 'secretKey',
      signOptions: { expiresIn: '15m' },
    }),
    PrismaModule,
    MailModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'google' }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy],
})
export class AuthModule {}
