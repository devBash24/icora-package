import chalk from "chalk";
import type { IcoraError } from "./errors.js";

export function logInfo(message: string): void {
  console.log(chalk.blue(message));
}

export function logSuccess(message: string): void {
  console.log(chalk.green(message));
}

export function logWarning(message: string): void {
  console.warn(chalk.yellow(message));
}

export function logError(error: IcoraError): void {
  console.error(chalk.red(`✖ [${error.code}] ${error.message}`));

  if (error.suggestion) {
    console.error(chalk.yellow(`Next step: ${error.suggestion}`));
  }
}
