/* eslint-disable no-undef */
import mongoose from 'mongoose';
import dontenv from 'dotenv';
dontenv.config();

const connectionURI = process.env.MONGODB_URL;
const options = {
  auto_reconnect: true,
  poolSize: 200,
  useNewUrlParser: true,
  readPreference: 'primaryPreferred',
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
};
mongoose.connect(connectionURI, options);
const db = mongoose.connection;

export default db;
