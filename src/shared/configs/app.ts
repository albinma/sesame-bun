import joi from 'joi';

type LogLevels = 'fatal' | 'error' | ' warn' | 'info' | 'debug' | 'trace';

const schema = joi.object({
  environment: joi
    .string()
    .required()
    .valid('development', 'test', 'production')
    .default('development'),

  timezone: joi.string().required().default('UTC'),

  http: joi
    .object({
      port: joi.number().required().default(8080),
      sessionCookieSecret: joi.string().required(),
    })
    .required(),

  logging: joi
    .object({
      level: joi
        .string()
        .required()
        .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace')
        .default('info'),
    })
    .default(),

  database: joi
    .object({
      host: joi.string().required().default('localhost'),
      database: joi.string().required().default('sesame-bun'),
      port: joi.number().required().default(5432),
      username: joi.string().required().default('postgres'),
      password: joi.string().required().default('postgres'),
    })
    .default(),

  jwt: joi
    .object({
      secret: joi.string().required(),
      algorithm: joi.string().required().default('HS256'),
      issuer: joi.string().required(),
      audience: joi.string().required(),
      expiresIn: joi.string().required(),
      refreshTokenExpiresInSeconds: joi.number().required(),
    })
    .default(),
});

export type ApplicationConfiguration = {
  environment: 'development' | 'test' | 'production';
  timezone: string;
  http: {
    port: number;
    sessionCookieSecret: string;
  };
  logging: {
    level: LogLevels;
  };
  database: {
    host: string;
    database: string;
    port: number;
    username: string;
    password: string;
  };
  jwt: {
    secret: string;
    algorithm: string;
    issuer: string;
    audience: string;
    expiresIn: string;
    refreshTokenExpiresInSeconds: number;
  };
};

export const APP_CONFIGURATION: ApplicationConfiguration = {
  environment: Bun.env.NODE_ENV as 'development' | 'test' | 'production',
  timezone: Bun.env.TZ ?? 'UTC',
  http: {
    port: Number(Bun.env.HTTP_PORT),
    sessionCookieSecret: String(Bun.env.HTTP_SESSION_COOKIE_SECRET),
  },
  logging: {
    level: String(Bun.env.LOG_LEVEL) as LogLevels,
  },
  database: {
    host: String(Bun.env.DB_HOST),
    database: String(Bun.env.DB_NAME),
    port: Number(Bun.env.DB_PORT),
    username: String(Bun.env.DB_USER),
    password: String(Bun.env.DB_PASSWORD),
  },
  jwt: {
    secret: String(Bun.env.JWT_SECRET),
    algorithm: String(Bun.env.JWT_ALGORITHM),
    issuer: String(Bun.env.JWT_ISSUER),
    audience: String(Bun.env.JWT_AUDIENCE),
    expiresIn: String(Bun.env.JWT_EXPIRES_IN),
    refreshTokenExpiresInSeconds: Number(Bun.env.JWT_REFRESH_TOKEN_EXPIRES_IN),
  },
};

const { error } = schema
  .prefs({ errors: { label: 'key' } })
  .validate(APP_CONFIGURATION);

if (error) {
  throw new Error(`App config validation error: ${error.message}`);
}
