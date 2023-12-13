const crypto = require("crypto");
const bcrypt = require("bcrypt");

const hashFunctionSha256 = (data) => {
  const sha256Hash = crypto.createHash("sha256").update(data).digest("hex");
  console.log("sha256: ", sha256Hash);
};

const hashFunctionSha1 = (data) => {
  const sha1Hash = crypto.createHash("sha1").update(data).digest("hex");
  console.log("sha1: ", sha1Hash);
};

const hashFunctionMd5 = (data) => {
  const md5Hash = crypto.createHash("md5").update(data).digest("hex");
  console.log("md5: ", md5Hash);
};

const hashFunctionbcrypt = (data) => {
  const salt = bcrypt.genSaltSync(10);
  const bcryptHash = bcrypt.hashSync(data, salt);
  console.log("bcrypt: ", bcryptHash);
};

function callHash(pass) {
  hashFunctionSha256(pass);
  hashFunctionSha1(pass);
  hashFunctionMd5(pass);
  hashFunctionbcrypt(pass);
}

callHash("12345678");
