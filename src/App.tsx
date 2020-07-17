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
import About from './pages/about/About';
import Homepage from './pages/Homepage';

const RedditFollowings = React.lazy(() =>
    import('pages/reddit/RedditFollowings')
);

export default function App() {
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
                            <Route exact path='/about' component={About} />
                        </Switch>
                    </BrowserRouter>
                </ColorModeProvider>
            </ThemeProvider>
        </div>
    );
}
