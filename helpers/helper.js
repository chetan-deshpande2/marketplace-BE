import ethers from 'ethers';
import EthJSUtil from 'ethereumjs-util';

import jwt from 'jsonwebtoken';
import http from 'http';

const checkAddress = async (address) => {
  return ethers.utils.getAddress(address);
};

const validateSignature = async (signatureData) => {
  try {
    const msgH = `\x19Ethereum Signed Message:\n${signData.message.length}${signData.message}`; // adding prefix
    let addrHex = signData.walletAddress;
    addrHex = addrHex.replace('0x', '').toLowerCase();
    let msgSha = EthJSUtil.keccak256(Buffer.from(msgH));
    let sigDecoded = EthJSUtil.fromRpcSig(signData.signature);
    let recoveredPub = EthJSUtil.ecrecover(
      msgSha,
      sigDecoded.v,
      sigDecoded.r,
      sigDecoded.s
    );
    let recoveredAddress = EthJSUtil.pubToAddress(recoveredPub).toString('hex');
    return addrHex === recoveredAddress;
  } catch (error) {
    return error;
  }
};

export { checkAddress, validateSignature };
