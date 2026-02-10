declare module "axios" {
  export interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, unknown>;
    config: unknown;
  }

  export interface AxiosRequestConfig {
    withCredentials?: boolean;
    headers?: Record<string, unknown>;
  }

  export interface AxiosError<T = any> extends Error {
    response?: AxiosResponse<T>;
  }

  export function get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>>;

  export function post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>>;

  export function put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>>;

  // delete is a reserved word, so we declare it in the axios object directly

  export function patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>>;

  export function isAxiosError(payload: unknown): payload is AxiosError;

  const axios: {
    get: typeof get;
    post: typeof post;
    put: typeof put;
    delete: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
    patch: typeof patch;
    isAxiosError: typeof isAxiosError;
  };

  export default axios;
}


