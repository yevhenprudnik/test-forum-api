import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT || 3000;
  const HOST = process.env.HOST;

  await app.listen(PORT, () => {
    console.log(`http://${HOST}:${PORT}`);
  });
}
bootstrap();
