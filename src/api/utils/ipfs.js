/* eslint-disable no-restricted-syntax */
import IPFS from "ipfs";
import logger from "../middleware/logger";

let IPFSNative;

module.exports = {
  ipfs: async () => {
    try {
      IPFSNative = await IPFS.create();
      return IPFSNative;
    } catch (e) {
      logger.error(e);
    }
  },
  ipfsGet: async (ipfsHash) => {
    try {
      const stream = IPFSNative.cat(ipfsHash);
      let data = "";
      for await (const chunk of stream) {
        data += chunk.toString();
      }
      return JSON.parse(data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  },
};
// eslint-disable-next-line no-unused-expressions
async () => Promise.resolve(ipfs())();
