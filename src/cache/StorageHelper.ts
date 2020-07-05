type AppName = 'reddit' | 'twitter';

export function saveToken(app: AppName, authToken: string) {
    localStorage.setItem(app, authToken);
}

export function loadToken(app: AppName): string | null {
    return localStorage.getItem(app);
}

export function deleteToken(app: AppName) {
    localStorage.removeItem(app);
}
