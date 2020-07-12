export const USER_AGENT = 'clear-my-followings';
export const CLIENT_ID_INSTALLED =
    process.env.REACT_APP_CLIENT_ID_INSTALLED || '';
export const STATE = 'user';
export const REDIRECT_URL = `${process.env.REACT_APP_REDIRECT_BASE_URL}/reddit/authorize_callback`;
export const SCOPES = 'mysubreddits,read,history,subscribe';

export const REDDIT_LOGIN = `https://www.reddit.com/api/v1/authorize?client_id=${CLIENT_ID_INSTALLED}&response_type=code&state=${STATE}&redirect_uri=${REDIRECT_URL}&duration=temporary&scope=${SCOPES}`;
