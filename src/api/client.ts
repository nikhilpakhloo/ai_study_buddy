import { getAuth, getIdToken } from "@react-native-firebase/auth";
import { AxiosHeaders, create, type InternalAxiosRequestConfig } from "axios";

import { APP_STRINGS } from "@/constants/strings";

const API_TIMEOUT_MS = 10_000;

const clientConfig = {
  baseURL: process.env.EXPO_PUBLIC_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
} as const;

export const publicApiClient = create(clientConfig);
export const apiClient = create(clientConfig);

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (!apiClient.defaults.baseURL) {
      throw new Error(APP_STRINGS.api.missingBaseUrl);
    }

    const user = getAuth().currentUser;

    if (!user) {
      throw new Error(APP_STRINGS.auth.authenticationRequired);
    }

    const idToken = await getIdToken(user);
    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", `Bearer ${idToken}`);
    config.headers = headers;

    return config;
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(error),
);

publicApiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(error),
);
