import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as compression from 'compression';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    abortOnError: false,
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Enable global validation pipe to ensure all incoming data is properly validated and transformed.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable helmet for security headers.
  app.use(helmet());

  // Enable cookie parser for parsing cookies.
  app.use(cookieParser());

  // Enable compression for performance.
  app.use(compression());

  // Set global prefix for all routes.
  app.setGlobalPrefix('api');

  // Enable CORS.
  app.enableCors({
    origin: configService.get<string>('CLIENT_URL'),
    credentials: true,
  });

  // Start the server.
  await app.listen(configService.get<number>('PORT') ?? 3001, () => {
    logger.log(`Server is running on: ${app.getUrl()}`);
  });
}
bootstrap();
