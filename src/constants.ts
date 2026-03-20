import type { CliConfig } from "./types.js";

export const PACKAGE_NAME = "iconium";
export const DEFAULT_TARGET_DIRECTORY = "src/assets/icons";
export const CONFIG_VERSION = 1 as const;
export const CANONICAL_CONFIG_FILE = ".iconiumrc.json";
export const LEGACY_CONFIG_FILE = ".iconiumrc";
export const DEFAULT_CONFIG: CliConfig = {
  version: CONFIG_VERSION,
  targetDirectory: DEFAULT_TARGET_DIRECTORY,
};
export const API_BASE_URL = "https://icora-api.vercel.app/api";
export const DEFAULT_FETCH_TIMEOUT_MS = 10_000;
export const RETRYABLE_STATUS_CODES = new Set<number>([502, 503, 504]);
export const GEN_FILE_NAME = "gen.tsx";
export const IMPORT_STATEMENT = "import { IconBaseProps, GenIcon } from '../gen';";
export const GEN_FILE_CONTENT = `import * as React from "react";

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
          ...child.attr,
        }),
      ),
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
  const computedSize = size || "1em";

  return (
    <svg
      stroke="currentColor"
      fill={color ?? "currentColor"}
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
}
`;
