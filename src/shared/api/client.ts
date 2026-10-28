import axios from "axios";
import { setupInterceptors } from "./interceptors";

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,

  timeout: 10000,

  headers: {
    "Content-Type": "application/json",
  },

  paramsSerializer: {
    serialize: (params) => {
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          return;
        }

        if (Array.isArray(value)) {
          if (value.length > 0) {
            searchParams.set(key, value.join(","));
          }

          return;
        }

        searchParams.set(key, String(value));
      });

      return searchParams.toString();
    },
  },
});

setupInterceptors(client);
export default client;
