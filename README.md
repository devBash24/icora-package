# Icora

A comprehensive collection of icons for your next project. Visit our [documentation website](https://icora.vercel.app/) for more details.

## Installation

1. Initialize Icora in your project:
```bash
npx icora@latest init

```


This will prompt you for:
- Icons directory (default: `src/assets/icons`)
- Types path (default: `@/src/lib/`)

## Usage

### Add Individual Icon

Add a specific icon to your project:

```bash
npx icora add <library-iconName>
```


Example:
```bash
npx icora add ai-AiFillDelete
```


### Add All Icons from Library

Add all icons from a specific library:

```bash
npx icora add-all <library>
```


Example:
```bash
npx icora add-all ai
```



## Available Icon Libraries

- `fa` - Font Awesome
- `ai` - Ant Design Icons
- `bs` - Bootstrap Icons
- `bi` - BoxIcons
- `cg` - CSS.gg Icons
- `ci` - Circum Icons
- `di` - DevIcons
- `fi` - Feather Icons
- `fc` - Flat Color Icons
- `gi` - Game Icons
- `go` - GitHub Octicons Icons
- `gr` - Grommet-Icons
- `hi` - Hero Icons
- `im` - IcoMoon Free
- `io` - IonIcons (version 4)
- `io5` - IonIcons (version 5)
- `md` - Material Design Icons
- `ri` - Remix Icon
- `si` - Simple Icons
- `sl` - Simple Line Icons
- `tb` - Tabler Icons
- `ti` - TypIcons
- `vsc` - VS Code Icons
- `wi` - Weather Icons

## Configuration

After initialization, your configuration will be saved in `.Icorarc.json`. You can manually edit this file to update paths:

```json
{
  "targetDirectory": "src/assets/icons",
  "typesPath": "@/src/lib/"
}
```

## Documentation

For more detailed documentation, examples, and API references, visit our [documentation website](https://icora.vercel.app/).

## License

MIT