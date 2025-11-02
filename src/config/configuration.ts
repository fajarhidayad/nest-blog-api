export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET,
    accessTokenExpirationTime: parseInt(
      process.env.JWT_ACCESS_EXPIRATION_TIME ?? '15',
      10,
    ),
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
    refreshTokenExpirationTime: parseInt(
      process.env.JWT_REFRESH_EXPIRATION_TIME ?? '60',
      10,
    ),
  },
});
