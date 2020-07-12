import {
    Box,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Flex,
    IconButton,
    Link,
    useColorMode,
} from '@chakra-ui/core';
import React from 'react';
import { AiFillGithub } from 'react-icons/ai';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

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
                        <BreadcrumbLink href={page.path}>
                            {page.name}
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                ))}
            </Breadcrumb>
            <Flex alignItems='center'>
                <IconButton
                    variant='ghost'
                    aria-label='toggle color mode'
                    isRound
                    size='md'
                    icon={colorMode === 'light' ? FiMoon : FiSun}
                    onClick={toggleColorMode}
                />
                <Box w='20px' />
                <Link href='https://github.com/' isExternal>
                    <Box as={AiFillGithub} size='32px' />
                </Link>
            </Flex>
        </Flex>
    );
}
