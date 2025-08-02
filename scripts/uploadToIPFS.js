require('dotenv').config();
const pinataSDK = require('@pinata/sdk');
const fs        = require('fs');
const path      = require('path');

// === Config ===
const FILE_PATH = path.resolve(__dirname, '../data/violations.json');
const CID_PATH = path.resolve(__dirname, '../uploads/violations.cid');
const JWT = (process.env.PINATA_JWT || '').trim();

// === Checks ===
if (!fs.existsSync(FILE_PATH)) {
  console.error('❌  File not found:', FILE_PATH);
  process.exit(1);
}
if (!JWT) {
  console.error('❌  Missing PINATA_JWT in .env');
  process.exit(1);
}

// === Upload ===
const pinata = new pinataSDK({ pinataJWTKey: JWT });

(async () => {
  try {
    console.log('📤 Uploading violations.json to Pinata IPFS…');
    const fileStream = fs.createReadStream(FILE_PATH);

    const res = await pinata.pinFileToIPFS(fileStream, {
      pinataMetadata: { name: 'violations.json' },
    });

    const cid = res.IpfsHash;
    const url = `https://gateway.pinata.cloud/ipfs/${cid}`;

    // === Save to uploads/violations.cid ===
    fs.mkdirSync(path.dirname(CID_PATH), { recursive: true });
    fs.writeFileSync(CID_PATH, cid + "\n");

    console.log('✅ Upload succeeded!');
    console.log('CID:', cid);
    console.log('Gateway URL:', url);
    console.log(`📁 Saved CID to ${CID_PATH}`);
  } catch (err) {
    console.error('❌ Upload failed:', err.message || err);
  }
})();
