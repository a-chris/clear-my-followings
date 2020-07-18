import { ColorModeProvider, CSSReset, ThemeProvider } from '@chakra-ui/core';
import Header from 'components/Header';
import CallbackReceiver from 'pages/reddit/CallbackReceiver';
import React, { Suspense } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import About from './pages/about/About';
import Home from './pages/home/Home';
import customTheme from './styles/theme';

const RedditFollowings = React.lazy(() =>
    import('pages/reddit/RedditFollowings')
);

export default function App() {
    return (
        <div className='App'>
            <ThemeProvider theme={customTheme}>
                <ColorModeProvider>
                    <CSSReset />
                    <BrowserRouter>
                        <Header />
                        <div style={{ paddingTop: '80px' }}>
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
                                            fallback={<div>Loading...</div>}>
                                            <RedditFollowings />
                                        </Suspense>
                                    )}
                                />
                                <Route exact path='/about' component={About} />
                                <Route component={Home} />
                            </Switch>
                        </div>
                    </BrowserRouter>
                </ColorModeProvider>
            </ThemeProvider>
        </div>
    );
}
