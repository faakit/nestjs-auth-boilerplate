export const environmentConfig = () => ({
  port: process.env.PORT || 3000,
  database: {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT || 5432,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
  },
  s3: {
    endpoint: process.env.S3_ENDPOINT,
    bucketName: process.env.S3_BUCKET_NAME,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  throttler: {
    limit: process.env.THROTTLER_LIMIT,
    ttl: process.env.THROTTLER_TTL,
  },
  cors: {
    origin: process.env.CLIENT_URL_CORS,
  },
  nodeEnv: process.env.NODE_ENV,
});

export interface EnvironmentConfig {
  port: number;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  jwt: {
    secret: string;
    accessTokenExpiresIn: string;
    refreshTokenExpiresIn: string;
  };
  s3: {
    endpoint: string;
    bucketName: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  throttler: {
    limit: number;
    ttl: number;
  };
  cors: {
    origin: string;
  };
  nodeEnv: string;
}
