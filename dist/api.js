const API_BASE_URL = 'https://icora-api.onrender.com/api';
export const fetchIcon = async (library, name) => {
    try {
        const response = await fetch(`${API_BASE_URL}/icons?library=${library}&name=${name}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const icon = data.data;
        return icon;
    }
    catch (error) {
        throw new Error(`Failed to fetch icon "${library}-${name}". ${error}`);
    }
};
export const listIcons = async () => {
    try {
        const iconSets = [
            { id: "fa", name: "Font Awesome" },
            { id: "ai", name: "Ant Design Icons" },
            { id: "bs", name: "Bootstrap Icons" },
            { id: "bi", name: "BoxIcons" },
            { id: "cg", name: "CSS.gg Icons" },
            { id: "ci", name: "Circum Icons" },
            { id: "di", name: "DevIcons" },
            { id: "fi", name: "Feather Icons" },
            { id: "fc", name: "Flat Color Icons" },
            { id: "gi", name: "Game Icons" },
            { id: "go", name: "GitHub Octicons Icons" },
            { id: "gr", name: "Grommet-Icons" },
            { id: "hi", name: "Hero Icons" },
            { id: "im", name: "IcoMoon Free" },
            { id: "io", name: "IonIcons (version 4)" },
            { id: "io5", name: "IonIcons (version 5)" },
            { id: "md", name: "Material Design Icons" },
            { id: "ri", name: "Remix Icon" },
            { id: "si", name: "Simple Icons" },
            { id: "sl", name: "Simple Line Icons" },
            { id: "tb", name: "Tabler Icons" },
            { id: "ti", name: "TypIcons" },
            { id: "vsc", name: "VS Code Icons" },
            { id: "wi", name: "Weather Icons" }
        ];
        return iconSets;
    }
    catch (error) {
        throw new Error(`Failed to list icons. ${error}`);
    }
};
export const fetchIconsByLibrary = async (libraryName) => {
    try {
        const response = await fetch(`${API_BASE_URL}/icons/${libraryName}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.data || undefined;
    }
    catch (error) {
        throw new Error(`Failed to list icons. ${error}`);
    }
};
