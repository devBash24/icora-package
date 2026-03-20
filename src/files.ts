import fs from "node:fs";
import path from "node:path";
import { GEN_FILE_CONTENT, GEN_FILE_NAME, IMPORT_STATEMENT } from "./constants.js";
import { FileSystemError, ValidationError } from "./errors.js";
import type { WriteResult } from "./types.js";
import { validateSafePathSegment } from "./validation.js";

export interface WriteFileOptions {
  dryRun?: boolean;
  overwrite?: boolean;
  skipExisting?: boolean;
}

function assertInsideRoot(rootDirectory: string, targetPath: string): void {
  const relative = path.relative(rootDirectory, targetPath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new ValidationError(
      `Resolved path "${targetPath}" is outside the target directory.`,
      "Choose a target directory inside the current project.",
    );
  }
}

function writeFileAtomically(filePath: string, content: string): void {
  const tempFile = `${filePath}.tmp-${process.pid}-${Date.now()}`;

  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(tempFile, content, "utf8");
    fs.renameSync(tempFile, filePath);
  } catch (error) {
    throw new FileSystemError(
      `Failed to write file at ${filePath}.`,
      "Check that the target directory exists and is writable.",
      { cause: error instanceof Error ? error : undefined },
    );
  }
}

export function createIconFileContent(content: string): string {
  return `${IMPORT_STATEMENT}\n\n${content.trimEnd()}\n`;
}

export function ensureGeneratorFile(rootDirectory: string, options: WriteFileOptions = {}): WriteResult {
  const filePath = path.join(rootDirectory, GEN_FILE_NAME);
  const existingContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : undefined;

  if (existingContent === GEN_FILE_CONTENT) {
    return { filePath, status: "skipped" };
  }

  if (!options.dryRun) {
    writeFileAtomically(filePath, GEN_FILE_CONTENT);
  }

  return { filePath, status: "written" };
}

export function writeIconComponent(
  rootDirectory: string,
  library: string,
  iconName: string,
  content: string,
  options: WriteFileOptions = {},
): WriteResult {
  const safeLibrary = validateSafePathSegment(library, "library id");
  const safeName = validateSafePathSegment(iconName, "icon name");
  const targetDirectory = path.join(rootDirectory, safeLibrary);
  const filePath = path.join(targetDirectory, `${safeName}.tsx`);

  assertInsideRoot(rootDirectory, filePath);

  if (fs.existsSync(filePath)) {
    if (options.skipExisting) {
      return { filePath, status: "skipped" };
    }

    if (!options.overwrite) {
      throw new FileSystemError(
        `Refusing to overwrite existing file ${filePath}.`,
        "Re-run with `--force` to overwrite or `--skip-existing` to leave the file unchanged.",
      );
    }
  }

  if (!options.dryRun) {
    writeFileAtomically(filePath, createIconFileContent(content));
  }

  return { filePath, status: "written" };
}
