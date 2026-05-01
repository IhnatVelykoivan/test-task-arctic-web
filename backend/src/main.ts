import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Tiny request logger so we can confirm what the browser actually sends.
  app.use((req: { method: string; originalUrl: string }, res: { on: (event: string, cb: () => void) => void; statusCode: number }, next: () => void) => {
    const start = Date.now();
    res.on('finish', () => {
      // eslint-disable-next-line no-console
      console.log(`[req] ${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - start}ms)`);
    });
    next();
  });

  app.setGlobalPrefix('api');

  // Allow the configured FRONTEND_URL plus the common localhost aliases
  // (localhost / 127.0.0.1 / 0.0.0.0 on the same port) so the dev UI works
  // regardless of which hostname the developer happens to open.
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  const corsOrigins = Array.from(
    new Set([
      frontendUrl,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://0.0.0.0:3000',
    ]),
  );
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Lead Tracker API')
    .setDescription('Mini-CRM for managing leads and their comments')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`Lead Tracker API listening on http://localhost:${port}/api`);
}

bootstrap();
