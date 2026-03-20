import inquirer from "inquirer";
import { DEFAULT_TARGET_DIRECTORY } from "./constants.js";

export async function askForTargetDirectory(): Promise<string> {
  const answers = await inquirer.prompt<{ targetDirectory: string }>([
    {
      type: "input",
      name: "targetDirectory",
      message: "Enter the directory path for icons:",
      default: DEFAULT_TARGET_DIRECTORY,
    },
  ]);

  return answers.targetDirectory;
}
