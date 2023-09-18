import joi from 'joi';

type Client = {
  clientId: string;
  clientSecret: string;
};

type ClientConfiguration = {
  allowedClients: Client[];
};

const schema = joi.object({
  allowedClients: joi
    .array()
    .items(
      joi.object({
        clientId: joi.string().required(),
        clientSecret: joi.string().required(),
      }),
    )
    .required(),
});

export const CLIENT_CONFIGURATION: ClientConfiguration = {
  allowedClients: [
    {
      clientId: String(Bun.env.PANTHER_CLIENT_ID),
      clientSecret: String(Bun.env.PANTHER_CLIENT_SECRET),
    },
  ],
};

const { error } = schema
  .prefs({ errors: { label: 'key' } })
  .validate(CLIENT_CONFIGURATION);

if (error) {
  throw new Error(`Client config validation error: ${error.message}`);
}
