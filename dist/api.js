import { API_BASE_URL, DEFAULT_FETCH_TIMEOUT_MS, RETRYABLE_STATUS_CODES } from "./constants.js";
import { ApiError, NetworkError } from "./errors.js";
async function readErrorMessage(response) {
    const text = await response.text();
    if (!text) {
        return `Request failed with status ${response.status}.`;
    }
    try {
        const parsed = JSON.parse(text);
        return parsed.message ?? text;
    }
    catch {
        return text;
    }
}
export class ApiClient {
    baseUrl;
    fetchImpl;
    timeoutMs;
    constructor(options = {}) {
        this.baseUrl = options.baseUrl ?? API_BASE_URL;
        this.fetchImpl = options.fetchImpl ?? fetch;
        this.timeoutMs = options.timeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS;
    }
    async fetchIcon(library, name) {
        const payload = await this.requestJson(`/icons?library=${encodeURIComponent(library)}&name=${encodeURIComponent(name)}`);
        if (!payload?.name || !payload?.content) {
            throw new ApiError(`The API returned an invalid icon payload for "${library}-${name}".`, "Try again later or report the issue if it keeps happening.");
        }
        return payload;
    }
    async fetchIconsByLibrary(library) {
        const payload = await this.requestJson(`/icons/${encodeURIComponent(library)}`);
        if (!payload?.name || !payload?.content) {
            throw new ApiError(`The API returned an invalid library payload for "${library}".`, "Try again later or report the issue if it keeps happening.");
        }
        return payload;
    }
    async healthCheck() {
        await this.fetchIcon("ai", "AiOutlineUserAdd");
    }
    async requestJson(requestPath) {
        try {
            return await this.requestJsonOnce(requestPath);
        }
        catch (error) {
            if (error instanceof NetworkError) {
                return this.requestJsonOnce(requestPath);
            }
            throw error;
        }
    }
    async requestJsonOnce(requestPath) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
        let response;
        try {
            response = await this.fetchImpl(`${this.baseUrl}${requestPath}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                signal: controller.signal,
            });
        }
        catch (error) {
            throw new NetworkError(`Failed to reach the Icora API at ${this.baseUrl}.`, "Check your internet connection and try again.", { cause: error instanceof Error ? error : undefined });
        }
        finally {
            clearTimeout(timeout);
        }
        if (!response.ok) {
            const message = await readErrorMessage(response);
            if (response.status === 404) {
                throw new ApiError(message || "The requested icon was not found.", "Verify the icon name or run `iconium list` to confirm the library.");
            }
            if (response.status === 429) {
                throw new ApiError("The Icora API rate limit was reached.", "Wait a moment and retry the command.");
            }
            if (RETRYABLE_STATUS_CODES.has(response.status)) {
                throw new NetworkError(`The Icora API is temporarily unavailable (${response.status}).`, "Retry in a moment.");
            }
            throw new ApiError(message || `The Icora API returned status ${response.status}.`, "Try again later. If the problem persists, check the API service.");
        }
        try {
            const data = (await response.json());
            if (data?.data === undefined) {
                throw new ApiError("The Icora API response did not include a data field.", "Try again later or report the API response issue.");
            }
            return data.data;
        }
        catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError("Failed to parse the Icora API response.", "Try again later or report the issue if it keeps happening.", { cause: error instanceof Error ? error : undefined });
        }
    }
}
//# sourceMappingURL=api.js.map