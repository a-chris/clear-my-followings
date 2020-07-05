import { CSSReset, theme, ThemeProvider } from '@chakra-ui/core';
import CallbackReceiver from 'pages/reddit/CallbackReceiver';
import React, { Suspense } from 'react';
import { Route, Router, Switch } from 'react-router-dom';
import './App.css';
import Homepage from './pages/Homepage';

const RedditFollowings = React.lazy(() =>
    import('pages/reddit/RedditFollowings')
);

function App(props: { history: any }) {
    const { history } = props;
    return (
        <div className='App'>
            <ThemeProvider theme={theme}>
                <CSSReset />
                <Router history={history}>
                    <Switch>
                        <Route exact path='/' component={Homepage} />
                        <Route
                            exact
                            path='/reddit/authorize_callback'
                            component={CallbackReceiver}
                        />
                        <Route
                            exact
                            path='/reddit/followings'
                            render={() => (
                                <Suspense fallback={<div>Loading...</div>}>
                                    <RedditFollowings />
                                </Suspense>
                            )}
                        />
                    </Switch>
                </Router>
            </ThemeProvider>
        </div>
    );
}

export default App;
