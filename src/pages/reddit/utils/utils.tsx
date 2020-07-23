import memoizeOne from 'memoize-one';

export const memoizedGetSubLink = memoizeOne((subName: string): string => {
    const profile = subName.startsWith('u_')
        ? `user/${subName.substring(2)}`
        : `r/${subName}`;

    return `https://www.reddit.com/${profile}`;
});

export const memoizedGetSubName = memoizeOne((displayName: string): string => {
    return displayName.startsWith('u_')
        ? displayName.substring(2)
        : displayName;
});

export const memoizedEllipseSubName = memoizeOne(
    (subName: string, nsfw: boolean): string => {
        const maxLength = nsfw ? 18 : 23;
        return subName.length > maxLength
            ? `${subName.substring(0, maxLength)}...`
            : subName;
    }
);
