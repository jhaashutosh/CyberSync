const crypto = require("crypto");
const bcrypt = require("bcrypt");

// Function to hash a password using a specified algorithm
const hashFunction = (password, algorithm) => {
  if (algorithm === "bcrypt") {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  } else {
    return crypto.createHash(algorithm).update(password).digest("hex");
  }
};

// Function to attempt to detect the hash algorithm
const detectHashAlgorithm = (hash) => {
  const hashLength = hash.length;

  if (hashLength === 64) {
    return "sha256";
  } else if (hashLength === 40) {
    return "sha1";
  } else if (hashLength === 32) {
    return "md5";
  } else if (hash.startsWith("$2a$10$")) {
    return "bcrypt";
  }

  return null; // Unknown or unsupported algorithm
};

// Function to divide the array into chunks
const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

module.exports = {
  hashFunction,
  detectHashAlgorithm,
  chunkArray,
};
