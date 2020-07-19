import { Box, Heading, Text } from '@chakra-ui/core';
import { loadToken, saveToken } from 'cache/StorageHelper';
import queryString from 'query-string';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import snoowrap from 'snoowrap';
import { CLIENT_ID_INSTALLED, REDIRECT_URL, USER_AGENT } from 'utils/const';

export default function CallbackReceiver() {
    const history = useHistory();
    const { search } = useLocation();
    const query = queryString.parse(search);

    if (query.code != null && loadToken('reddit') !== query.code) {
        saveToken('reddit', query.code.toString());
    }

    React.useEffect(() => {
        snoowrap
            .fromAuthCode({
                code: loadToken('reddit')!!,
                userAgent: USER_AGENT,
                clientId: CLIENT_ID_INSTALLED,
                redirectUri: REDIRECT_URL,
            })
            .then((reddit) => {
                saveToken('reddit', reddit.accessToken);
                history.replace('/reddit');
            })
            .catch((reason: any) => {
                if (reason.toString().includes('invalid_grant')) {
                    // already grant authorization
                    history.replace('/reddit');
                }
            });
    }, [history]);

    return (
        <Box pt='10rem'>
            <Heading as='h1' size='lg'>
                You should not see this text
            </Heading>
            <Text mt='2rem' lineHeight='2'>
                Something went wrong while redirecting you to the right page.
                <br />
                If you are using Firefox please turn off the anti-tracking
                feature to solve this issue.
            </Text>
        </Box>
    );
}
