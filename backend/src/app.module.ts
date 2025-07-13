import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
  }),
  ThrottlerModule.forRoot({
    throttlers: [{
      ttl: 60,
      limit: 10,
    }]
  }),
    AuthModule,
    PrismaModule,
    MailModule,
  ],
  providers: [{
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
  }],
})
export class AppModule { }
