export interface CliConfig {
  version: 1;
  targetDirectory: string;
}

export interface LoadedConfig {
  config: CliConfig;
  source: "canonical" | "legacy" | "default";
  path?: string;
}

export interface IconPayload {
  name: string;
  content: string;
}

export interface AddCommandOptions {
  output?: string;
  dryRun?: boolean;
  force?: boolean;
  skipExisting?: boolean;
}

export interface InitCommandOptions {
  output?: string;
}

export interface WriteResult {
  filePath: string;
  status: "written" | "skipped";
}
