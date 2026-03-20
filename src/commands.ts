import path from "node:path";
import { Command, Option } from "commander";
import { DEFAULT_CONFIG, PACKAGE_NAME } from "./constants.js";
import { ApiClient } from "./api.js";
import { loadConfig, saveConfig } from "./config.js";
import { toIcoraError, ValidationError } from "./errors.js";
import { ensureGeneratorFile, writeIconComponent } from "./files.js";
import { ICON_LIBRARIES } from "./libraries.js";
import { logError, logInfo, logSuccess, logWarning } from "./logger.js";
import { askForTargetDirectory } from "./prompt.js";
import type { AddCommandOptions, CliConfig, InitCommandOptions } from "./types.js";
import { parseIconToken, resolveOutputDirectory, validateLibrary, validateTargetDirectory } from "./validation.js";

interface CommandContext {
  cwd: string;
  apiClient: ApiClient;
}

const defaultContext = (): CommandContext => ({
  cwd: process.cwd(),
  apiClient: new ApiClient(),
});

function resolveWriteOptions(options: AddCommandOptions): { dryRun: boolean; overwrite: boolean; skipExisting: boolean } {
  if (options.force && options.skipExisting) {
    throw new ValidationError(
      "The `--force` and `--skip-existing` options cannot be used together.",
      "Choose either overwrite or skip behavior for existing files.",
    );
  }

  return {
    dryRun: Boolean(options.dryRun),
    overwrite: Boolean(options.force),
    skipExisting: Boolean(options.skipExisting),
  };
}

function resolveConfig(cwd: string, output?: string): CliConfig {
  const loaded = loadConfig(cwd);

  if (loaded.source === "legacy" && loaded.path) {
    logWarning(`Using legacy config file ${path.basename(loaded.path)}. Run \`iconium init\` to migrate to .iconiumrc.json.`);
  }

  if (loaded.source === "default") {
    logWarning(`No config file found. Using default target directory: ${DEFAULT_CONFIG.targetDirectory}`);
  }

  return {
    ...loaded.config,
    targetDirectory: validateTargetDirectory(output ?? loaded.config.targetDirectory),
  };
}

async function runWithHandling(task: () => Promise<void>): Promise<void> {
  try {
    await task();
  } catch (error) {
    const icoraError = toIcoraError(error);
    logError(icoraError);
    process.exitCode = icoraError.exitCode;
  }
}

export async function handleInitCommand(options: InitCommandOptions, context: CommandContext = defaultContext()): Promise<void> {
  return runWithHandling(async () => {
    const targetDirectory = validateTargetDirectory(options.output ?? (await askForTargetDirectory()));
    const config: CliConfig = { version: 1, targetDirectory };
    const configPath = saveConfig(context.cwd, config);
    const rootDirectory = resolveOutputDirectory(context.cwd, targetDirectory);
    const result = ensureGeneratorFile(rootDirectory);

    logSuccess(`Saved config to ${configPath}`);
    logInfo(`Icons will be written to ${rootDirectory}`);
    logSuccess(`${result.status === "written" ? "Created" : "Verified"} ${result.filePath}`);
  });
}

export async function handleAddCommand(
  icons: string[],
  options: AddCommandOptions,
  context: CommandContext = defaultContext(),
): Promise<void> {
  return runWithHandling(async () => {
    const writeOptions = resolveWriteOptions(options);
    const config = resolveConfig(context.cwd, options.output);
    const rootDirectory = resolveOutputDirectory(context.cwd, config.targetDirectory);
    const generatorResult = ensureGeneratorFile(rootDirectory, writeOptions);
    let failures = 0;

    if (generatorResult.status === "written") {
      logSuccess(`${writeOptions.dryRun ? "Would create" : "Created"} ${generatorResult.filePath}`);
    }

    for (const icon of icons) {
      try {
        const parsed = parseIconToken(icon);
        validateLibrary(parsed.library);
        logInfo(`Fetching ${parsed.library}-${parsed.iconName}...`);
        const payload = await context.apiClient.fetchIcon(parsed.library, parsed.iconName);
        const result = writeIconComponent(rootDirectory, parsed.library, payload.name, payload.content, writeOptions);

        if (result.status === "skipped") {
          logWarning(`Skipped existing file ${result.filePath}`);
        } else if (writeOptions.dryRun) {
          logSuccess(`Would write ${result.filePath}`);
        } else {
          logSuccess(`Added ${parsed.library}-${payload.name}`);
        }
      } catch (error) {
        failures += 1;
        logError(toIcoraError(error));
      }
    }

    if (failures > 0) {
      process.exitCode = 1;
    }
  });
}

export async function handleAddAllCommand(
  library: string,
  options: AddCommandOptions,
  context: CommandContext = defaultContext(),
): Promise<void> {
  return runWithHandling(async () => {
    const writeOptions = resolveWriteOptions(options);
    validateLibrary(library);
    const config = resolveConfig(context.cwd, options.output);
    const rootDirectory = resolveOutputDirectory(context.cwd, config.targetDirectory);
    ensureGeneratorFile(rootDirectory, writeOptions);

    logInfo(`Fetching all icons for ${library}...`);
    const payload = await context.apiClient.fetchIconsByLibrary(library);
    const result = writeIconComponent(rootDirectory, library, payload.name, payload.content, writeOptions);

    if (result.status === "skipped") {
      logWarning(`Skipped existing file ${result.filePath}`);
      return;
    }

    logSuccess(writeOptions.dryRun ? `Would write ${result.filePath}` : `Added ${library} icon bundle.`);
  });
}

export async function handleListCommand(): Promise<void> {
  await runWithHandling(async () => {
    logInfo("Available icon libraries:");

    for (const iconSet of ICON_LIBRARIES) {
      console.log(`- ${iconSet.id} - ${iconSet.name}`);
    }
  });
}

export async function handleDoctorCommand(
  options: Pick<AddCommandOptions, "output">,
  context: CommandContext = defaultContext(),
): Promise<void> {
  return runWithHandling(async () => {
    const config = resolveConfig(context.cwd, options.output);
    const rootDirectory = resolveOutputDirectory(context.cwd, config.targetDirectory);
    const loaded = loadConfig(context.cwd);

    logInfo("Running Icora CLI diagnostics...");
    console.log(`- Config source: ${loaded.source}`);
    console.log(`- Target directory: ${rootDirectory}`);
    ensureGeneratorFile(rootDirectory, { dryRun: true });
    console.log("- Write check: ok");
    await context.apiClient.healthCheck();
    console.log("- API check: ok");
    logSuccess("Doctor completed successfully.");
  });
}

function withSharedAddOptions(command: Command): Command {
  return command
    .addOption(new Option("-o, --output <dir>", "override the configured output directory"))
    .addOption(new Option("--dry-run", "preview work without writing files"))
    .addOption(new Option("--force", "overwrite existing generated files"))
    .addOption(new Option("--skip-existing", "keep existing files and skip conflicts"));
}

export function createProgram(context: CommandContext = defaultContext()): Command {
  const program = new Command();

  program.name(PACKAGE_NAME).description("Icora icon generator CLI").showHelpAfterError();

  program
    .command("init")
    .description("Create or update the Icora config and generator file")
    .addOption(new Option("-o, --output <dir>", "set the target icon directory without prompting"))
    .action(async (options: InitCommandOptions) => handleInitCommand(options, context));

  withSharedAddOptions(
    program
      .command("add")
      .argument("<icons...>", "one or more icon identifiers in library-iconName format")
      .description("Add one or more icons to your project"),
  ).action(async (icons: string[], options: AddCommandOptions) => handleAddCommand(icons, options, context));

  withSharedAddOptions(
    program
      .command("add-all")
      .argument("<library>", "icon library id")
      .description("Add the generated icon bundle for a library"),
  ).action(async (library: string, options: AddCommandOptions) => handleAddAllCommand(library, options, context));

  program.command("list").description("List supported icon libraries").action(handleListCommand);

  program
    .command("doctor")
    .description("Validate config, write access, and API reachability")
    .addOption(new Option("-o, --output <dir>", "override the configured output directory"))
    .action(async (options: Pick<AddCommandOptions, "output">) => handleDoctorCommand(options, context));

  return program;
}
