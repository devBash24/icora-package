import { API_BASE_URL, DEFAULT_FETCH_TIMEOUT_MS, RETRYABLE_STATUS_CODES } from "./constants.js";
import { ApiError, NetworkError } from "./errors.js";
import type { IconPayload } from "./types.js";

export interface ApiClientOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

interface ApiEnvelope<T> {
  data?: T;
  message?: string;
}

async function readErrorMessage(response: Response): Promise<string> {
  const text = await response.text();

  if (!text) {
    return `Request failed with status ${response.status}.`;
  }

  try {
    const parsed = JSON.parse(text) as ApiEnvelope<unknown>;

    return parsed.message ?? text;
  } catch {
    return text;
  }
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? API_BASE_URL;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS;
  }

  async fetchIcon(library: string, name: string): Promise<IconPayload> {
    const payload = await this.requestJson<IconPayload>(
      `/icons?library=${encodeURIComponent(library)}&name=${encodeURIComponent(name)}`,
    );

    if (!payload?.name || !payload?.content) {
      throw new ApiError(
        `The API returned an invalid icon payload for "${library}-${name}".`,
        "Try again later or report the issue if it keeps happening.",
      );
    }

    return payload;
  }

  async fetchIconsByLibrary(library: string): Promise<IconPayload> {
    const payload = await this.requestJson<IconPayload>(`/icons/${encodeURIComponent(library)}`);

    if (!payload?.name || !payload?.content) {
      throw new ApiError(
        `The API returned an invalid library payload for "${library}".`,
        "Try again later or report the issue if it keeps happening.",
      );
    }

    return payload;
  }

  async healthCheck(): Promise<void> {
    await this.fetchIcon("ai", "AiOutlineUserAdd");
  }

  private async requestJson<T>(requestPath: string): Promise<T> {
    try {
      return await this.requestJsonOnce<T>(requestPath);
    } catch (error) {
      if (error instanceof NetworkError) {
        return this.requestJsonOnce<T>(requestPath);
      }

      throw error;
    }
  }

  private async requestJsonOnce<T>(requestPath: string): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    let response: Response;

    try {
      response = await this.fetchImpl(`${this.baseUrl}${requestPath}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });
    } catch (error) {
      throw new NetworkError(
        `Failed to reach the Icora API at ${this.baseUrl}.`,
        "Check your internet connection and try again.",
        { cause: error instanceof Error ? error : undefined },
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const message = await readErrorMessage(response);

      if (response.status === 404) {
        throw new ApiError(
          message || "The requested icon was not found.",
          "Verify the icon name or run `iconium list` to confirm the library.",
        );
      }

      if (response.status === 429) {
        throw new ApiError(
          "The Icora API rate limit was reached.",
          "Wait a moment and retry the command.",
        );
      }

      if (RETRYABLE_STATUS_CODES.has(response.status)) {
        throw new NetworkError(
          `The Icora API is temporarily unavailable (${response.status}).`,
          "Retry in a moment.",
        );
      }

      throw new ApiError(
        message || `The Icora API returned status ${response.status}.`,
        "Try again later. If the problem persists, check the API service.",
      );
    }

    try {
      const data = (await response.json()) as ApiEnvelope<T>;

      if (data?.data === undefined) {
        throw new ApiError(
          "The Icora API response did not include a data field.",
          "Try again later or report the API response issue.",
        );
      }

      return data.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        "Failed to parse the Icora API response.",
        "Try again later or report the issue if it keeps happening.",
        { cause: error instanceof Error ? error : undefined },
      );
    }
  }
}
