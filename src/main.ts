import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { EnvironmentConfig } from './shared/config/environment';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get the ConfigService to load environment variables (optional)
  const configService = app.get(ConfigService);

  // Enable HTTP CORS if required for REST APIs
  app.enableCors({
    origin: configService.get<EnvironmentConfig['cors']>('cors')?.origin, // Match frontend URL
    methods: 'GET,POST,PATCH,DELETE',
    credentials: true,
  });

  const port = configService.get<EnvironmentConfig['port']>('PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}

void bootstrap();
