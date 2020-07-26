import {
    Box,
    ColorModeProvider,
    CSSReset,
    Text,
    ThemeProvider,
} from '@chakra-ui/core';
import 'animate.css/animate.css';
import Header from 'components/Header';
import About from 'pages/about/About';
import Home from 'pages/home/Home';
import CallbackReceiver from 'pages/reddit/CallbackReceiver';
import React, { Suspense } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useMedia } from 'react-use';
import styled from 'styled-components';
import customTheme from 'styles/theme';

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
                        <Body>
                            <TransitionGroup component={null}>
                                <Switch>
                                    <Route
                                        exact
                                        path='/reddit/authorize_callback'
                                        component={CallbackReceiver}
                                    />
                                    <AnimatedRoute
                                        exact
                                        path='/reddit'
                                        render={() => (
                                            <Suspense
                                                fallback={
                                                    <Text>Loading...</Text>
                                                }>
                                                <RedditFollowings />
                                            </Suspense>
                                        )}
                                    />
                                    <AnimatedRoute
                                        exact
                                        path='/about'
                                        component={About}
                                    />
                                    <AnimatedRoute component={Home} />
                                </Switch>
                            </TransitionGroup>
                        </Body>
                    </BrowserRouter>
                </ColorModeProvider>
            </ThemeProvider>
        </div>
    );
}

type AnimatedRouteProps = {
    path?: string;
    exact?: boolean;
    component?: React.ReactNode;
    render?: () => JSX.Element;
};

function AnimatedRoute(props: AnimatedRouteProps) {
    return (
        <Route exact={props.exact} path={props.path}>
            {({ match }) => (
                <CSSTransition
                    in={match != null}
                    timeout={{ enter: 500, exit: 0 }}
                    classNames='slide'
                    key={props.path}>
                    {props.component != null ? (
                        props.component
                    ) : props.render != null ? (
                        props.render()
                    ) : (
                        <></>
                    )}
                </CSSTransition>
            )}
        </Route>
    );
}

const Body = styled(Box)`
    height: calc(100% - 80px);
    padding-top: 10px;

    & > div {
        height: 100%;
    }
`;
