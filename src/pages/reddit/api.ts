import snoowrap from 'snoowrap';
import { loadToken } from '../../cache/StorageHelper';
import { USER_AGENT } from '../../utils/const';
import { digest } from '../../utils/hash';

const DISABLED_USERS = 'disabled_users';
const SUBMISSIONS_HASH = 'submissions_hash';

export default class RedditAPI {
    private static reddit: snoowrap;

    public static get(): snoowrap {
        if (!this.reddit) {
            this.reddit = new snoowrap({
                userAgent: USER_AGENT,
                accessToken: loadToken('reddit')!!,
            });
        }
        return this.reddit;
    }
}

export function getDisabledUsers(): string[] | null {
    const cache = localStorage.getItem(DISABLED_USERS);
    if (cache == null) return null;
    try {
        return JSON.parse(cache);
    } catch (error) {
        return null;
    }
}

export function setDisabledUsers(usernames: string[]) {
    localStorage.setItem(DISABLED_USERS, JSON.stringify(usernames));
}

export function saveSubmissionsHash(subs: string[]) {
    const hash = digest(subs.join(''));
    localStorage.setItem(SUBMISSIONS_HASH, hash.toString());
}

export function loadSubmissionsHash(): string | null {
    return localStorage.getItem(SUBMISSIONS_HASH);
}
