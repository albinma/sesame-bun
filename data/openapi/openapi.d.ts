/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  '/auth/begin': {
    /**
     * Begins the authentication process
     * @description Begins the authentication process by providing the public address of the user. System will return a random nonce used for signature validation.
     */
    post: operations['authentication.Begin'];
  };
  '/auth/complete': {
    /**
     * Completes the authentication process
     * @description Completes the authentication process by providing the public address of the user and the signed signature using the nonce.
     */
    post: operations['authentication.Complete'];
  };
  '/auth/refresh': {
    /**
     * Gets a new access token using the refresh token
     * @description Refreshes the authentication process by providing the refresh token.
     */
    post: operations['authentication.Refresh'];
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    /** @description A Problem Details object (RFC 9457) */
    Problem: {
      /**
       * @description URI reference that identifies the problem type
       * @default about:blank
       */
      type: string;
      /**
       * Format: int32
       * @description HTTP status code generated by the origin server for this occurrence of the problem
       */
      status: number;
      /** @description A short, human-readable summary of the problem type */
      title: string;
      /** @description A human-readable explanation specific to this occurrence of the problem */
      detail?: string;
      /**
       * Format: uri
       * @description URI reference that identifies the specific occurrence of the problem
       */
      instance?: string;
    };
    /**
     * @example {
     *   "type": "about:blank",
     *   "status": 400,
     *   "title": "One or more validation errors occurred",
     *   "errors": [
     *     {
     *       "name": "publicAddress",
     *       "reason": "Public address is required"
     *     },
     *     {
     *       "name": "signature",
     *       "reason": "Signature is required"
     *     }
     *   ]
     * }
     */
    ValidationProblem: {
      /** @description A list of validation errors */
      errors?: components['schemas']['ValidationError'][];
    } & components['schemas']['Problem'];
    ValidationError: {
      /** @description The name of the field that caused the error */
      name?: string;
      /** @description The reason why the field caused the error */
      reason?: string;
    };
    /** @description The public address of the user */
    PublicAddress: string;
    /**
     * @example {
     *   "publicAddress": 1.0480672435017432e+48
     * }
     */
    AuthBeginRequest: {
      publicAddress: components['schemas']['PublicAddress'];
    };
    /**
     * @example {
     *   "publicAddress": 1.0480672435017432e+48,
     *   "nonce": 1311768467294899700
     * }
     */
    AuthBeginResponse: {
      publicAddress: components['schemas']['PublicAddress'];
      /** @description The nonce used for signature validation */
      nonce: string;
    };
    /**
     * @example {
     *   "publicAddress": 1.0480672435017432e+48,
     *   "signature": "0x1234567890abcdef0x1234567890abcdef0x1234567890abcdef"
     * }
     */
    AuthCompleteRequest: {
      publicAddress: components['schemas']['PublicAddress'];
      /** @description The signed message used in verification */
      message: string;
      /** @description The signature signed using the nonce */
      signature: string;
    };
    /**
     * @example {
     *   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
     *   "refreshToken": "b9fb87f2893d8fdcbf8f65f6c7069485d013808115fbb9159edd247de2551883"
     * }
     */
    AuthCompleteResponse: {
      /** @description The access token used for authentication */
      accessToken: string;
      /** @description The refresh token used for authentication */
      refreshToken: string;
    };
    /**
     * @example {
     *   "refreshToken": "b9fb87f2893d8fdcbf8f65f6c7069485d013808115fbb9159edd247de2551883"
     * }
     */
    AuthRefreshRequest: {
      /** @description The refresh token used for authentication */
      refreshToken: string;
    };
  };
  responses: {
    /** @description Request cannot be processed due to malformed request syntax */
    400: {
      content: {
        'application/problem+json': components['schemas']['ValidationProblem'];
      };
    };
    /** @description Request was not processed due to authentication failure */
    401: {
      content: {
        'application/problem+json': components['schemas']['Problem'];
      };
    };
    /** @description Request was not processed due to authorization failure */
    403: {
      content: {
        'application/problem+json': components['schemas']['Problem'];
      };
    };
    /** @description Request was not processed due to resource not found */
    404: {
      content: {
        'application/problem+json': components['schemas']['Problem'];
      };
    };
    /** @description Request was formed correctly but errors ocurred during processing */
    422: {
      content: {
        'application/problem+json': components['schemas']['Problem'];
      };
    };
    /** @description Request was not processed due to an internal server error */
    500: {
      content: {
        'application/problem+json': components['schemas']['Problem'];
      };
    };
  };
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type $defs = Record<string, never>;

export type external = Record<string, never>;

export interface operations {
  /**
   * Begins the authentication process
   * @description Begins the authentication process by providing the public address of the user. System will return a random nonce used for signature validation.
   */
  'authentication.Begin': {
    requestBody?: {
      content: {
        'application/json': components['schemas']['AuthBeginRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        content: {
          'application/json': components['schemas']['AuthBeginResponse'];
        };
      };
      400: components['responses']['400'];
      401: components['responses']['401'];
      422: components['responses']['422'];
      500: components['responses']['500'];
    };
  };
  /**
   * Completes the authentication process
   * @description Completes the authentication process by providing the public address of the user and the signed signature using the nonce.
   */
  'authentication.Complete': {
    requestBody?: {
      content: {
        'application/json': components['schemas']['AuthCompleteRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        content: {
          'application/json': components['schemas']['AuthCompleteResponse'];
        };
      };
      400: components['responses']['400'];
      401: components['responses']['401'];
      422: components['responses']['422'];
      500: components['responses']['500'];
    };
  };
  /**
   * Gets a new access token using the refresh token
   * @description Refreshes the authentication process by providing the refresh token.
   */
  'authentication.Refresh': {
    requestBody?: {
      content: {
        'application/json': components['schemas']['AuthRefreshRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        content: {
          'application/json': components['schemas']['AuthCompleteResponse'];
        };
      };
      400: components['responses']['400'];
      401: components['responses']['401'];
      422: components['responses']['422'];
      500: components['responses']['500'];
    };
  };
}
