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

  contractAddress: {
    rinkebyNftAddress: process.env.POLYGON_NFT_ADDRESS,
    rinkebyMarketplaceAddress: process.env.POLYGON_MARKETPLACE_ADDRESS,
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
};
