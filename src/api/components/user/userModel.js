const mongoose = require("mongoose");
import db from "../../connections/db";

const userSchema = mongoose.Schema({
  sWalletAddress: {
    type: String,
    // unique: true,
    require: true,
  },
  sUserName: {
    type: String,
    default: "",
  },
  sEmail: {
    type: String,
  },
  oName: {
    sFirstname: String,
    sLastname: String,
  },
  sRole: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  sCreated: {
    type: Date,
    default: Date.now,
  },
  sStatus: String,
  sHash: String,
  sBio: String,
  sWebsite: String,
  sProfilePicUrl: String,
  sImageName: String,
  sHash: String,
  user_followings: [
    {
      type: mongoose.Schema.ObjectId,
    },
  ],
  user_followers_size: { type: Number, default: 0 },
});
// userSchema.set( 'toJSON', { getters: true } )
export default db.model("User", userSchema);
