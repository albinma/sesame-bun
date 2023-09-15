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
});

schema.validate(Bun.env).error;

export type ApplicationConfiguration = {
  environment: 'development' | 'test' | 'production';
  timezone: string;
  http: {
    port: number;
  };
  logging: {
    level: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  };
};

const APP_CONFIGURATION: ApplicationConfiguration = {
  environment: Bun.env.NODE_ENV as 'development' | 'test' | 'production',
  timezone: Bun.env.TZ ?? 'UTC',
  http: {
    port: Number(Bun.env.HTTP_PORT),
  },
  logging: {
    level: Bun.env.LOG_LEVEL,
  },
};

const { error } = schema
  .prefs({ errors: { label: 'key' } })
  .validate(APP_CONFIGURATION);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export { APP_CONFIGURATION };
