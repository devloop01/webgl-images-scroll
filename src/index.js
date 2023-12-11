import { App } from "./App.three";

const app = new App({
  canvas: document.querySelector("canvas.webgl"),
});

// function createSignedPath(url) {
//   // Hex-encoded key and salt
//   const key = Buffer.from("key", "hex");
//   const salt = Buffer.from("salt", "hex");

//   // URL encode the URL using Base64.urlsafe_encode64
//   const encoded_url = Buffer.from(url).toString("base64");
//   const encoded_url_chunks = encoded_url
//     .replace(/=/g, "")
//     .match(/.{1,16}/g)
//     .join("/");

//   // Construct the path
//   const path = `/${encoded_url_chunks}`;

//   // Calculate HMAC digest using SHA-256
//   const hmac = crypto.createHmac("sha256", key);
//   hmac.update(Buffer.concat([salt, Buffer.from(path)]));
//   const digest = hmac.digest();

//   // URL-safe base64 encode the digest and remove padding characters
//   const signature = Buffer.from(digest).toString("base64").replace(/=/g, "");

//   // Concatenate the signature and the original path
//   const signed_path = `/${signature}${path}`;

//   return signed_path;
// }

// const url = "https://i.imgur.com/KSLD4VV.jpeg";

// console.log(createSignedPath(url));
