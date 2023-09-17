import joi from 'joi';

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
});

schema.validate(Bun.env).error;

export type ApplicationConfiguration = {
  environment: 'development' | 'test' | 'production';
  timezone: string;
  http: {
    port: number;
    sessionCookieSecret: string;
  };
  logging: {
    level: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  };
  database: {
    host: string;
    database: string;
    port: number;
    username: string;
    password: string;
  };
};

const APP_CONFIGURATION: ApplicationConfiguration = {
  environment: Bun.env.NODE_ENV as 'development' | 'test' | 'production',
  timezone: Bun.env.TZ ?? 'UTC',
  http: {
    port: Number(Bun.env.HTTP_PORT),
    sessionCookieSecret: String(Bun.env.HTTP_SESSION_COOKIE_SECRET),
  },
  logging: {
    level: Bun.env.LOG_LEVEL,
  },
  database: {
    host: Bun.env.DB_HOST ?? 'localhost',
    database: Bun.env.DB_NAME ?? 'sesame-bun',
    port: Number(Bun.env.DB_PORT),
    username: Bun.env.DB_USER ?? 'postgres',
    password: Bun.env.DB_PASSWORD ?? 'postgres',
  },
};

const { error } = schema
  .prefs({ errors: { label: 'key' } })
  .validate(APP_CONFIGURATION);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export { APP_CONFIGURATION };
