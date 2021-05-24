import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppService } from './app.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const service = app.select(AppModule).get(AppService);
  await service.start();
  await app.close();
  process.exit(0);
}

bootstrap();
