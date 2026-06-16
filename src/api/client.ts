import { getAuth, getIdToken } from "@react-native-firebase/auth";
import {
  AxiosHeaders,
  create,
  isAxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

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

export function setApiBearerToken(idToken: string) {
  const authorization = `Bearer ${idToken}`;
  apiClient.defaults.headers.common.Authorization = authorization;
  publicApiClient.defaults.headers.common.Authorization = authorization;
}

function getApiError(error: unknown) {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    const status = error.response?.status;

    if (data && typeof data === "object") {
      const message = "message" in data ? data.message : undefined;
      const apiError = "error" in data ? data.error : undefined;

      if (typeof message === "string") {
        const errorMessage = status ? `${message} (${status})` : message;
        return new Error(errorMessage);
      }

      if (typeof apiError === "string") {
        const errorMessage = status ? `${apiError} (${status})` : apiError;
        return new Error(errorMessage);
      }
    }

    if (status) {
      return new Error(`Request failed with status ${status}`);
    }
  }

  return error;
}

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
    setApiBearerToken(idToken);
    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", `Bearer ${idToken}`);
    config.headers = headers;

    return config;
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(getApiError(error)),
);

publicApiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(getApiError(error)),
);
