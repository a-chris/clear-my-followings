import {
    ColorModeProvider,
    CSSReset,
    theme,
    ThemeProvider,
} from '@chakra-ui/core';
import Header from 'components/Header';
import CallbackReceiver from 'pages/reddit/CallbackReceiver';
import React, { Suspense } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Homepage from './pages/Homepage';
// import RedditFollowings from './pages/reddit/RedditFollowings';

const RedditFollowings = React.lazy(() =>
    import('pages/reddit/RedditFollowings')
);

function App() {
    return (
        <div className='App'>
            <ThemeProvider theme={theme}>
                <ColorModeProvider>
                    <CSSReset />
                    <BrowserRouter>
                        <Header />
                        <Switch>
                            <Route exact path='/' component={Homepage} />
                            <Route
                                exact
                                path='/reddit/authorize_callback'
                                component={CallbackReceiver}
                            />
                            <Route
                                exact
                                path='/reddit'
                                render={() => (
                                    <Suspense fallback={<div>Loading...</div>}>
                                        <RedditFollowings />
                                    </Suspense>
                                )}
                            />
                        </Switch>
                    </BrowserRouter>
                </ColorModeProvider>
            </ThemeProvider>
        </div>
    );
}

export default App;
