import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from './core/configs/env';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const configService: ConfigService<EnvConfig> = app.get(ConfigService);
  const host: string = configService.get('HTTP_SERVER');
  const port: number = configService.get('HTTP_PORT');

  await app.listen({ host, port });
}

bootstrap();
