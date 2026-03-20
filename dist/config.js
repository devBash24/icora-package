import fs from "node:fs";
import path from "node:path";
import { CANONICAL_CONFIG_FILE, DEFAULT_CONFIG, LEGACY_CONFIG_FILE, } from "./constants.js";
import { ConfigError, FileSystemError } from "./errors.js";
import { validateTargetDirectory } from "./validation.js";
function parseConfig(content, filePath) {
    let parsed;
    try {
        parsed = JSON.parse(content);
    }
    catch (error) {
        throw new ConfigError(`Failed to parse ${path.basename(filePath)} as JSON.`, "Fix the JSON syntax or run `iconium init` to recreate the config.", { cause: error instanceof Error ? error : undefined });
    }
    if (!parsed || typeof parsed !== "object") {
        throw new ConfigError(`Invalid config format in ${path.basename(filePath)}.`, "The config must be a JSON object.");
    }
    const config = parsed;
    return {
        version: 1,
        targetDirectory: validateTargetDirectory(config.targetDirectory ?? DEFAULT_CONFIG.targetDirectory),
    };
}
export function getConfigPaths(cwd) {
    return {
        canonicalPath: path.join(cwd, CANONICAL_CONFIG_FILE),
        legacyPath: path.join(cwd, LEGACY_CONFIG_FILE),
    };
}
export function loadConfig(cwd) {
    const { canonicalPath, legacyPath } = getConfigPaths(cwd);
    if (fs.existsSync(canonicalPath)) {
        const content = fs.readFileSync(canonicalPath, "utf8");
        return {
            config: parseConfig(content, canonicalPath),
            source: "canonical",
            path: canonicalPath,
        };
    }
    if (fs.existsSync(legacyPath)) {
        const content = fs.readFileSync(legacyPath, "utf8");
        return {
            config: parseConfig(content, legacyPath),
            source: "legacy",
            path: legacyPath,
        };
    }
    return {
        config: DEFAULT_CONFIG,
        source: "default",
    };
}
export function saveConfig(cwd, config) {
    const { canonicalPath } = getConfigPaths(cwd);
    const tmpPath = `${canonicalPath}.tmp-${process.pid}-${Date.now()}`;
    try {
        fs.writeFileSync(tmpPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
        fs.renameSync(tmpPath, canonicalPath);
    }
    catch (error) {
        throw new FileSystemError(`Failed to write config file at ${canonicalPath}.`, "Check that the directory is writable and try again.", { cause: error instanceof Error ? error : undefined });
    }
    return canonicalPath;
}
//# sourceMappingURL=config.js.map