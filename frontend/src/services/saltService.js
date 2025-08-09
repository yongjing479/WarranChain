// src/services/saltService.js
import axios from "axios";

/**
 * Fetches the salt for zkLogin from the backend.
 * @param {string} jwt - The user's JWT (Google or OIDC).
 * @param {string} address - The wallet address (Sui address).
 * @returns {Promise<string>} - The salt string.
 */
export async function fetchSalt(jwt, address) {
  const response = await axios.post("http://localhost:3001/get-salt", {
    jwt,
    address,
  });
  return response.data.salt;
}
