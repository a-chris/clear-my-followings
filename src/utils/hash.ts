export function digest(text: string): string {
    let hash = 0;
    let i;
    let chr;
    for (i = 0; i < text.length; i++) {
        chr = text.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }
    return hash.toString();
}
