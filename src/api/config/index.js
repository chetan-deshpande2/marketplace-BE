import dontenv from "dotenv";
dontenv.config();

module.exports = {
  db: {
    str: process.env.MONGODB_URL,
    options: {
      auto_reconnect: true,
      poolSize: 200,
      useNewUrlParser: true,
      readPreference: "primaryPreferred",
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    },
  },
  jwtToken: process.env.JWT_SECRETKEY,
};
