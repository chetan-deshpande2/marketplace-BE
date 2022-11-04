import { config } from "dotenv";

config();

module.exports = {
  db: {
    str: "mongodb+srv://chetan:KNvB5Rz7uShdziA6@cluster0.yb0xzst.mongodb.net/?retryWrites=true&w=majority",
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
  redisObj: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    db: process.env.REDIS_DB,
  },
  twilioObj: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    verifyService: process.env.TWILIO_VERIFY_SERVICE,
    twilioPhone: process.env.TWILIO_PHONE,
    twilioEmailVerifyService: process.env.TWILIO_EMAIL_VERIFY_SERVICE,
  },
  contractAddress: {
    rinkebyNftAddress: process.env.RINKEBY_NFT_ADDRESS,
    rinkebyMarketplaceAddress: process.env.RINKEBY_MARKETPLACE_ADDRESS,
  },
  circleObject: {
    circleToken: process.env.CIRCLE_SANDBOX_AUTH_TOKEN,
    circleSandboxUrl: process.env.CIRCLE_SANDBOX_URL,
    circleProductionUrl: process.env.CIRCLE_PRODUCTION_URL,
  },
  owlracleObject: {
    gasPriceAPIKey: process.env.OWLRACLE_GASPRICE_APIKEY,
    gasPriceAPISecret: process.env.OWLRACLE_GASPRICE_APISECRET,
  },
  S3: {
    ACCESSKEYID: process.env.AWS_S3_ACCESS_KEY,
    SECRETACCESSKEY: process.env.AWS_S3_SECRET_ACCESS_KEY,
    ACL: "public-read",
    BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
    BUCKET_REGION: process.env.AWS_S3_BUCKET_REGION,
  },
  sendgridObj: {
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  },
  BRANCH_IO_CONFIG: {
    key: process.env.BRANCH_IO_KEY,
    secret: process.env.BRANCH_IO_SECRET,
  },
};
