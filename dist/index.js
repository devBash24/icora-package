#!/usr/bin/env node
import { Command } from "commander";
import { fetchIcon, fetchIconsByLibrary, listIcons } from "./api.js";
import { saveIconToFile, logError, initIconTypes, createImportsStatement, askForConfiguration } from "./utils.js";
import chalk from "chalk";
import { loadConfig, saveConfig } from "./config.js";
export const program = new Command();
// Initialize the CLI tool
program
    .command("init")
    .description("Set up Iconium configuration")
    .action(async () => {
    try {
        const { targetDirectory } = await askForConfiguration();
        const config = { targetDirectory };
        saveConfig(config);
        console.log(chalk.blue(`Icons will be saved to: ${targetDirectory}`));
        console.log(chalk.blue(`Types will be generated at: ${targetDirectory}/gen.tsx`));
        await initIconTypes(targetDirectory);
        console.log(chalk.green(`✔ Icons types initialized!`));
    }
    catch (error) {
        logError("Failed to initialize configuration.");
    }
});
// download specific icons
program
    .command("add <icons...>")
    .description("Add one or more icons to your project (format: libraryName-iconName)")
    .action(async (icons) => {
    try {
        const config = loadConfig();
        for (const icon of icons) {
            const [folder, name] = icon.split("-");
            if (!folder || !name) {
                console.log(chalk.yellow(`Skipping "${icon}": Invalid format. Use: libraryName-iconName`));
                continue;
            }
            console.log(chalk.blue(`Fetching icon: ${icon}...`));
            const responseIcon = await fetchIcon(folder, name);
            const iconFile = createImportsStatement() + "\n" + responseIcon.content;
            saveIconToFile(config.targetDirectory + `/${folder}`, `${responseIcon.name}.tsx`, iconFile);
            console.log(chalk.green(`✔ Added ${icon}`));
        }
    }
    catch (error) {
        if (error instanceof Error) {
            logError(error.message);
        }
        else {
            logError(`An unknown error occurred: ${error}`);
        }
    }
});
// List all available icon libraries
program
    .command("list")
    .description("List all available icons")
    .action(async () => {
    try {
        console.log(chalk.blue("Fetching list of icons..."));
        const icons = await listIcons();
        console.log(chalk.green("Available icons:"));
        icons.forEach((icon) => {
            console.log(`- ${icon.id} - ${icon.name}`);
        });
    }
    catch (error) {
        if (error instanceof Error) {
            logError(error.message);
        }
        else {
            logError(`An unknown error occurred: ${error}`);
        }
    }
});
// download all icons from a specific icon library
program
    .command("add-all <library>")
    .description("Add all icons available in a specific Icon Library")
    .action(async (library) => {
    try {
        console.log(chalk.blue(`Fetching icons from Icon Library: ${library}...`));
        const icons = await fetchIconsByLibrary(library);
        if (!icons) {
            console.log(chalk.yellow(`No icons found in Icon Library: ${library}`));
            return;
        }
        const config = loadConfig();
        const iconFile = createImportsStatement() + "\n" + icons.content;
        saveIconToFile(config.targetDirectory + `/${library}`, `${icons.name}.tsx`, iconFile);
    }
    catch (error) {
        if (error instanceof Error) {
            logError(error.message);
        }
        else {
            logError(`An unknown error occurred: ${error}`);
        }
    }
});
program.parse(process.argv);
