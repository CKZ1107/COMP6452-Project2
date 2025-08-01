require('dotenv').config();
const pinataSDK = require('@pinata/sdk');
const fs        = require('fs');
const path      = require('path');

/**
 * Absolute path of the file you want to pin.
 * Adjust to match your project layout.
 */
const FILE_PATH = path.resolve(__dirname, '../data/violations.json');


// Basic pre-flight checks

if (!fs.existsSync(FILE_PATH)) {
  console.error('❌  File not found:', FILE_PATH);
  process.exit(1);
}

const JWT = (process.env.PINATA_JWT || '').trim();
if (!JWT) {
  console.error('❌  Missing PINATA_JWT in .env');
  process.exit(1);
}


// Create Pinata client using a v3 JWT

const pinata = new pinataSDK({ pinataJWTKey: JWT });

(async () => {
  try {
    console.log('Uploading file to Pinata IPFS…');

    // Stream the file to avoid loading it entirely into memory
    const fileStream = fs.createReadStream(FILE_PATH);

    // Optional metadata – totally safe to omit
    const options = {
      pinataMetadata: {
        name: 'violations.json'
      }
    };

    const res = await pinata.pinFileToIPFS(fileStream, options);

    console.log('Upload succeeded!');
    console.log('CID:', res.IpfsHash);
    console.log(`Gateway URL: https://gateway.pinata.cloud/ipfs/${res.IpfsHash}`);
  } catch (err) {
    console.error('Upload failed:', err);
  }
})();




















