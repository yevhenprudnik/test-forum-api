import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use( cookieParser() );

  const PORT = process.env.PORT || 3000;
  const HOST = process.env.HOST;

  await app.listen(PORT, () => {
    console.log(`http://${HOST}:${PORT}`);
  });
}
bootstrap();
