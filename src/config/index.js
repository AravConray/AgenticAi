const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const env = process.env.NODE_ENV || 'development';

const config = {
  env,
  port: parseInt(process.env.PORT, 10) || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'octodock',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'defaultsecret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  services: {
    mailer: {
      host: process.env.MAIL_HOST || 'smtp.example.com',
      port: parseInt(process.env.MAIL_PORT, 10) || 587,
      auth: {
        user: process.env.MAIL_USER || 'user@example.com',
        pass: process.env.MAIL_PASS || 'pass',
      },
    },
  },
};

module.exports = config;
