import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
export const createImportsStatement = () => {
    return `import { IconBaseProps, GenIcon } from '../gen';`;
};
export const saveIconToFile = (targetDirectory, fileName, content) => {
    const filePath = path.join(process.cwd(), targetDirectory, fileName);
    // Ensure the target directory exists
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    // Write the icon content to a file
    fs.writeFileSync(filePath, content);
    console.log(chalk.green(`✔ Icon saved to ${filePath}`));
};
export const initIconTypes = async (targetDirectory) => {
    try {
        // Create the @lib/icons directory structure
        const libPath = path.join(process.cwd(), targetDirectory);
        // Create directories
        fs.mkdirSync(libPath, { recursive: true });
        // Create the index.ts file
        const indexPath = path.join(libPath, 'gen.tsx');
        fs.writeFileSync(indexPath, ICONS_LIB_CONTENT);
    }
    catch (error) {
        logError("Failed to initialize icon library.");
    }
};
export const logError = (message) => {
    console.error(chalk.red(`✖ ${message}`));
};
export async function askForConfiguration() {
    const { default: inquirer } = await import('inquirer');
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'targetDirectory',
            message: 'Enter the directory path for icons (press Enter for default):',
            default: 'src/assets/icons'
        },
    ]);
    return answers;
}
export const ICONS_LIB_CONTENT = `import * as React from "react";

export interface IconTree {
    tag: string;
    attr: {
        [key: string]: string;
    };
    child: IconTree[];
}

export function GenIcon(data: IconTree) {
    return (props: IconBaseProps): React.JSX.Element => {
        return IconBase({
            attr: { ...data.attr },
            ...props,
            children: data.child.map((child, i) => 
                React.createElement(child.tag, { 
                    key: i,
                    ...child.attr
                })
            )
        });
    };
}

export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
    children?: React.ReactNode;
    size?: string | number;
    color?: string;
    title?: string;
}

export type IconType = (props: IconBaseProps) => React.JSX.Element;

export function IconBase(props: IconBaseProps & { attr?: Record<string, string> }): React.JSX.Element {
    const { children, size, color, title, attr, ...svgProps } = props;
    const computedSize = size || '1em';
    return (
        <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            {...attr}
            {...svgProps}
            height={computedSize}
            width={computedSize}
            xmlns="http://www.w3.org/2000/svg"
        >
            {title && <title>{title}</title>}
            {children}
        </svg>
    );
}`;
