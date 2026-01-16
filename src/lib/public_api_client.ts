/**
 * Public API Client
 * For unauthenticated requests to public endpoints
 * Use this when endpoints don't require authentication
 */

import axios from "axios";

const publicApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

const publicApi = axios.create({
  baseURL: publicApiBaseUrl,
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
});

export default publicApi;
