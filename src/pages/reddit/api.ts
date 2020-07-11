import _ from 'lodash';
import moment from 'moment';
import snoowrap from 'snoowrap';
import { loadToken } from '../../cache/StorageHelper';
import { USER_AGENT } from '../../utils/const';

const CHECKED_DISABLED_USERS = 'checked_disabled_users';
const DISABLED_USERS = 'disabled_users';
const CHECKED_INACTIVE_USERS = 'checked_inactive_users';
const INACTIVE_USERS = 'inactive_users';

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

    public static async findDisabledUsers(
        usernames: string[]
    ): Promise<Set<string>> {
        const checkedDisabledUsers = this.loadCheckedDisabledUsers();

        const newDisabled = _.intersection(this.loadDisabledUsers(), usernames);
        const usernamesToCheck = _.difference(usernames, checkedDisabledUsers);
        if (usernamesToCheck.length === 0) {
            return new Set(newDisabled);
        }

        const listsOfSubmissions = await Promise.all(
            usernamesToCheck.map((u) =>
                RedditAPI.get().getUser(u.substring(2)).getSubmissions()
            )
        );

        listsOfSubmissions.forEach((submissions, index) => {
            if (submissions.length === 0) {
                newDisabled.push(usernames[index]);
            }
        });
        const newCdu = [...checkedDisabledUsers, ...usernames];
        localStorage.setItem(CHECKED_DISABLED_USERS, JSON.stringify(newCdu));
        localStorage.setItem(DISABLED_USERS, JSON.stringify(newDisabled));
        return new Set(newDisabled);
    }

    public static async findInactiveUsers(
        usernames: string[]
    ): Promise<Set<string>> {
        const checkedInactiveUsers = this.loadCheckedInactiveUsers();

        const newInactive = new Set(
            _.intersection(this.loadInactiveUsers(), usernames)
        );
        const usernamesToCheck = _.difference(usernames, checkedInactiveUsers);

        if (usernamesToCheck.length === 0) {
            return newInactive;
        }

        const listsOfSubmissions = await Promise.all(
            usernamesToCheck.map((u) =>
                RedditAPI.get().getUser(u.substring(2)).getSubmissions()
            )
        );

        const listsOfComments = await Promise.all(
            usernamesToCheck.map((u) =>
                RedditAPI.get().getUser(u.substring(2)).getComments()
            )
        );

        const minimumDate = moment().subtract(6, 'months');

        listsOfSubmissions.forEach((submissions, index) => {
            if (submissions.length === 0) return;
            const mostRecentSubmission = _.orderBy(
                submissions,
                ['created'],
                ['desc']
            )[0];
            const mostRecentSubmissionDate = moment.unix(
                mostRecentSubmission.created
            );
            if (mostRecentSubmissionDate.isBefore(minimumDate)) {
                newInactive.add(usernames[index]);
            }
        });

        listsOfComments.forEach((comments, index) => {
            if (comments.length === 0) return;
            const mostRecentComment = _.orderBy(
                comments,
                ['created'],
                ['desc']
            )[0];
            const mostRecentCommentDate = moment.unix(
                mostRecentComment.created
            );
            if (mostRecentCommentDate.isBefore(minimumDate)) {
                newInactive.add(usernames[index]);
            }
        });
        const newCdu = [...checkedInactiveUsers, ...usernames];
        localStorage.setItem(CHECKED_INACTIVE_USERS, JSON.stringify(newCdu));
        localStorage.setItem(INACTIVE_USERS, JSON.stringify([...newInactive]));
        return newInactive;
    }

    private static loadDisabledUsers(): string[] {
        const du = localStorage.getItem(DISABLED_USERS);
        return du == null ? [] : (JSON.parse(du) as string[]);
    }

    private static loadCheckedDisabledUsers(): string[] {
        const cdu = localStorage.getItem(CHECKED_DISABLED_USERS);
        return cdu == null ? [] : (JSON.parse(cdu) as string[]);
    }

    private static loadCheckedInactiveUsers(): string[] {
        const ciu = localStorage.getItem(CHECKED_INACTIVE_USERS);
        return ciu == null ? [] : (JSON.parse(ciu) as string[]);
    }

    private static loadInactiveUsers(): string[] {
        const iu = localStorage.getItem(INACTIVE_USERS);
        return iu == null ? [] : (JSON.parse(iu) as string[]);
    }
}
