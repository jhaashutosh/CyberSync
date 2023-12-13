// utils.js

const { hashFunction } = require("../controllers/passwordController");

const processPasswordChunk = async (
  actualHash,
  detectedAlgorithm,
  passwordsChunk
) => {

  let crackedPassword = null;

  const promises = passwordsChunk.map((password) => {
    return new Promise((resolve) => {
      const hash = hashFunction(password, detectedAlgorithm);
      if (hash === actualHash && crackedPassword === null) {
        crackedPassword = password;
      }
      resolve({
        crackedPassword: password,
        isCracked: hash === actualHash,
      });
    });
  });

  const results = await Promise.all(promises);

  // Filter out only the cracked password
  const crackedResult = results.find((result) => result.isCracked);

  return crackedResult;
};


module.exports = processPasswordChunk;
