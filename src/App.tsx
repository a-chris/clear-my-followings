import {
    Box,
    ColorModeProvider,
    CSSReset,
    Text,
    ThemeProvider,
} from '@chakra-ui/core';
import Header from 'components/Header';
import CallbackReceiver from 'pages/reddit/CallbackReceiver';
import React, { Suspense } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { useMedia } from 'react-use';
import About from './pages/about/About';
import Home from './pages/home/Home';
import customTheme from './styles/theme';

const RedditFollowings = React.lazy(() =>
    import('pages/reddit/RedditFollowings')
);

if (process.env.NODE_ENV === 'development') {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React, {
        trackAllPureComponents: true,
    });
}

export default function App() {
    const soTheme = useMedia('(prefers-color-scheme: dark)') ? 'dark' : 'light';

    return (
        <div className='App'>
            <ThemeProvider theme={customTheme}>
                <ColorModeProvider value={soTheme}>
                    <CSSReset />
                    <BrowserRouter>
                        <Header />

                        <Box pt='90px'>
                            <Switch>
                                <Route
                                    exact
                                    path='/reddit/authorize_callback'
                                    component={CallbackReceiver}
                                />
                                <Route
                                    exact
                                    path='/reddit'
                                    render={() => (
                                        <Suspense
                                            fallback={<Text>Loading...</Text>}>
                                            <RedditFollowings />
                                        </Suspense>
                                    )}
                                />
                                <Route exact path='/about' component={About} />
                                <Route component={Home} />
                            </Switch>
                        </Box>
                    </BrowserRouter>
                </ColorModeProvider>
            </ThemeProvider>
        </div>
    );
}
