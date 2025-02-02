import * as fs from "fs";
import * as path from "path";
const CONFIG_FILE = path.join(process.cwd(), ".iconiumrc");
// Load configuration from the `.iconiumrc` file
export const loadConfig = () => {
    if (!fs.existsSync(CONFIG_FILE)) {
        return { targetDirectory: "src/assets/icons", }; // Default directory
    }
    const configContent = fs.readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(configContent);
};
// Save configuration to the `.iconiumrc` file
export const saveConfig = (config) => {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
};
