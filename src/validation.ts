import path from "node:path";
import { DEFAULT_TARGET_DIRECTORY } from "./constants.js";
import { ValidationError } from "./errors.js";
import { SUPPORTED_LIBRARY_IDS } from "./libraries.js";

const ICON_TOKEN_PATTERN = /^([a-z0-9]+)-([A-Za-z0-9][A-Za-z0-9_]*)$/;
const SAFE_SEGMENT_PATTERN = /^[A-Za-z0-9_-]+$/;

export function parseIconToken(icon: string): { library: string; iconName: string } {
  const match = ICON_TOKEN_PATTERN.exec(icon.trim());

  if (!match) {
    throw new ValidationError(
      `Invalid icon identifier "${icon}". Expected format: library-iconName.`,
      "Use a supported library id such as `ai` and a component name such as `AiFillDelete`.",
    );
  }

  return {
    library: match[1],
    iconName: match[2],
  };
}

export function validateLibrary(library: string): string {
  if (!SUPPORTED_LIBRARY_IDS.has(library)) {
    throw new ValidationError(
      `Unsupported library "${library}".`,
      "Run `iconium list` to view the supported libraries.",
    );
  }

  return library;
}

export function validateTargetDirectory(targetDirectory: string): string {
  const normalized = targetDirectory.trim() || DEFAULT_TARGET_DIRECTORY;

  if (normalized.includes("\0")) {
    throw new ValidationError("Target directory contains invalid null characters.");
  }

  return normalized;
}

export function validateSafePathSegment(segment: string, label: string): string {
  if (!SAFE_SEGMENT_PATTERN.test(segment)) {
    throw new ValidationError(
      `Unsafe ${label} "${segment}".`,
      `The ${label} must only contain letters, numbers, underscores, or hyphens.`,
    );
  }

  return segment;
}

export function resolveOutputDirectory(cwd: string, output?: string): string {
  return path.resolve(cwd, validateTargetDirectory(output ?? DEFAULT_TARGET_DIRECTORY));
}
