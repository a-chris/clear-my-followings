import { Box, Flex, Image, Link, Stack, Text } from '@chakra-ui/core';
import React from 'react';

const TECHNOLOGIES = [
    {
        name: 'Chakra UI',
        link: 'https://chakra-ui.com/',
        img:
            'https://github.com/chakra-ui/chakra-ui/raw/master/logo/logo-colored.svg',
    },
    {
        name: 'snoowrap',
        link: 'https://github.com/not-an-aardvark/snoowrap',
    },
    {
        name: 'MobX',
        link: 'https://mobx.js.org/',
        img: 'https://mobx.js.org/img/mobx.png',
        addNameToImg: true,
    },
    {
        name: 'Caddy',
        link: 'https://caddyserver.com/',
        img:
            'https://user-images.githubusercontent.com/1128849/36338535-05fb646a-136f-11e8-987b-e6901e717d5a.png',
    },
];

export default function About() {
    return (
        <Stack d='flex' align='center'>
            <Box
                w={['50%', null, '40%']}
                mt='80px'
                fontSize='xl'
                lineHeight='1.5'
                textAlign='left'>
                I created this site mostly because I got tired to find inactive
                users in my followings and I felt very unsatisfied with the
                current followings management of Reddit, so here we go.
            </Box>
            <Box mt='60px'>
                <Box
                    d='grid'
                    gridTemplateColumns='repeat(2, 1fr)'
                    gridGap='40px'>
                    {TECHNOLOGIES.map((t) => (
                        <Flex alignItems='center' key={t.name}>
                            <Link href={t.link} isExternal>
                                {t.img ? (
                                    t.addNameToImg ? (
                                        <Flex dir='row'>
                                            <Image
                                                width='50px'
                                                mr='20px'
                                                src={t.img}
                                                alt={t.name}
                                            />
                                            <Text
                                                fontWeight='bold'
                                                fontSize='4xl'>
                                                MobX
                                            </Text>
                                        </Flex>
                                    ) : (
                                        <Image
                                            width='200px'
                                            src={t.img}
                                            alt={t.name}
                                        />
                                    )
                                ) : (
                                    <Text fontWeight='bold' fontSize='4xl'>
                                        {t.name}
                                    </Text>
                                )}
                            </Link>
                        </Flex>
                    ))}
                </Box>
            </Box>
            <Text mt='60px' textAlign='center' fontWeight='bold'>
                written with{' '}
                <span role='img' aria-label='hearth'>
                    ❤️
                </span>{' '}
                and Typescript
            </Text>
        </Stack>
    );
}
