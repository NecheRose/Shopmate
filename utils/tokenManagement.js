import jwt from "jsonwebtoken";
import { client } from "../lib/redis.js";


// Generate access token and refresh token
export const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30m" });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

// set accesss token and refresh token in cookies
export const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,   //prevent Cross-site scripting attack attacks(XSS)
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAMESITE === "none", 
    path: "/",       // ensures cookie is removed from the root path
    maxAge: 30 * 60 * 1000  // 30 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAMESITE === "none",
    path: "/", 
    maxAge:  7 * 24 * 60 * 60 * 1000  // 7 days 
  });
};

export const storeRefreshToken = async (userId, refreshToken) => {
  await client.set(
    `refresh_token:${userId}`,
    refreshToken,
    { EX: process.env.CLOUD_REDIS_REFRESH_TOKEN_EXPIRY } 
  );
};




