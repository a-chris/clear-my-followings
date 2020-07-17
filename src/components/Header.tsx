import {
    Box,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Flex,
    IconButton,
    Link,
    Tooltip,
    useColorMode,
} from '@chakra-ui/core';
import React from 'react';
import { AiFillGithub } from 'react-icons/ai';
import { FiMoon, FiSun } from 'react-icons/fi';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import colors from 'styles/colors';

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

export default function Header() {
    const location = useLocation();
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <Flex
            h='80px'
            w='100%'
            justifyContent='space-evenly'
            alignItems='center'>
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
                    aria-label='Change theme'>
                    <IconButton
                        variant='ghost'
                        aria-label='toggle color mode'
                        isRound
                        size='md'
                        icon={colorMode === 'light' ? FiMoon : FiSun}
                        onClick={toggleColorMode}
                    />
                </Tooltip>
                <Box w='20px' />
                <Tooltip
                    closeOnClick
                    label='Visit the repository'
                    aria-label='Visit the repository'>
                    <Link href='https://github.com/' isExternal>
                        <Box as={AiFillGithub} size='32px' />
                    </Link>
                </Tooltip>
            </Flex>
        </Flex>
    );
}
