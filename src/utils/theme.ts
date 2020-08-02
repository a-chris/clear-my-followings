export function byColorMode(cm: string, lightValue: any, darkValue: any) {
    return cm === THEME.LIGHT ? lightValue : darkValue;
}

export enum THEME {
    LIGHT = 'light',
    DARK = 'dark',
}
