declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'test' | 'production';
      HTTP_PORT: number;
    }
  }
}

export {};
