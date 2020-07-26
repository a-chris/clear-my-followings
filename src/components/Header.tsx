import {
    Box,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Flex,
    IconButton,
    Link,
    Text,
    Tooltip,
    useColorMode,
} from '@chakra-ui/core';
import React from 'react';
import { AiFillGithub } from 'react-icons/ai';
import { FiMoon, FiSun } from 'react-icons/fi';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import colors from 'styles/colors';
import { GITHUB_REPO } from 'utils/const';

const PAGES = [
    {
        path: '/',
        name: 'Home',
    },
    {
        path: '/reddit',
        name: 'Reddit',
    },
    {
        path: '/about',
        name: 'About',
    },
];

const CURRENT_VERSION = process.env.REACT_APP_BUILD;

export default function Header() {
    const location = useLocation();
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <Flex
            h='80px'
            w='100%'
            position='sticky'
            justifyContent='space-evenly'
            top='0'
            alignItems='center'
            bg={colorMode === 'light' ? 'white' : 'gray.800'}
            zIndex={100}
            boxShadow={
                colorMode === 'light'
                    ? '0 0 5px rgba(57, 63, 72, 0.3)'
                    : `0 2px 5px ${colors.black_almost}`
            }>
            <Breadcrumb fontWeight='medium' fontSize='md'>
                {PAGES.map((page) => (
                    <BreadcrumbItem
                        isCurrentPage={location.pathname === page.path}
                        key={page.path}>
                        <BreadcrumbLink
                            as='div'
                            style={{
                                fontWeight:
                                    location.pathname === page.path
                                        ? 'bold'
                                        : 'inherit',
                                color:
                                    location.pathname === page.path
                                        ? colors.reddit_orange
                                        : 'inherit',
                            }}>
                            <RouterLink to={page.path}>{page.name}</RouterLink>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                ))}
            </Breadcrumb>
            <Flex alignItems='center'>
                <Tooltip
                    closeOnClick
                    label='Change theme'
                    aria-label='Change theme'
                    zIndex={200}>
                    <IconButton
                        variant='ghost'
                        aria-label='toggle color mode'
                        isRound
                        size='md'
                        icon={colorMode === 'light' ? FiMoon : FiSun}
                        onClick={toggleColorMode}
                    />
                </Tooltip>
                <Tooltip
                    closeOnClick
                    label='Visit the repository'
                    aria-label='Visit the repository'
                    zIndex={200}>
                    <Link ml='20px' href={GITHUB_REPO} isExternal>
                        <Box as={AiFillGithub} size='32px' />
                    </Link>
                </Tooltip>
                <Text
                    d={['none', 'block']}
                    fontFamily='monospace'
                    fontWeight='bold'
                    ml='20px'>
                    v1.0.{CURRENT_VERSION}
                </Text>
            </Flex>
        </Flex>
    );
}
