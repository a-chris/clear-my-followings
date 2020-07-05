import { loadToken, saveToken } from 'cache/StorageHelper';
import queryString from 'query-string';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import snoowrap from 'snoowrap';
import { CLIENT_ID_INSTALLED, REDIRECT, USER_AGENT } from 'utils/const';

export default function CallbackReceiver() {
    const history = useHistory();
    const { search } = useLocation();
    const query = queryString.parse(search);

    console.log('TCL: CallbackReceiver -> search', query);
    if (query.code != null && loadToken('reddit') !== query.code) {
        saveToken('reddit', query.code.toString());
    }

    React.useEffect(() => {
        console.log('TCL: CallbackReceiver -> useEffect');
        snoowrap
            .fromAuthCode({
                code: loadToken('reddit')!!,
                userAgent: USER_AGENT,
                clientId: CLIENT_ID_INSTALLED,
                redirectUri: REDIRECT,
            })
            .then((reddit) => {
                console.log('TCL: CallbackReceiver -> reddit', reddit);
                saveToken('reddit', reddit.accessToken);
                history.push('/reddit/followings');
            })
            .catch((reason: any) => {
                if (reason.toString().includes('invalid_grant')) {
                    // already grant authorization
                    history.push('/reddit/followings');
                }
            });
    }, [history]);

    return <div>CallbackReceiver</div>;
}
