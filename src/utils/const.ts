export const USER_AGENT = 'clear-my-followings';
export const CLIEND_ID = 'cVIcbHZYLMWeGA';
export const CLIENT_ID_INSTALLED = 'lUpdN0_rOMeKDQ';
export const STATE = 'test2';
export const REDIRECT = 'http://127.0.0.1:3000/reddit/authorize_callback';
export const SCOPES = 'mysubreddits,read,history,subscribe';

export const REDDIT_LOGIN = `https://www.reddit.com/api/v1/authorize?client_id=${CLIENT_ID_INSTALLED}&response_type=code&state=${STATE}&redirect_uri=${REDIRECT}&duration=temporary&scope=${SCOPES}`;
