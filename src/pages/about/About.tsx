import { Box, Flex, Grid, Image, Link, Stack, Text } from '@chakra-ui/core';
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
        <Stack d='flex' align='center' pb='20px'>
            <Box
                w={['80%', '50%', null, '40%']}
                mt={['20px', '60px']}
                fontSize='lg'
                lineHeight='1.5'>
                <Text>
                    I created this site mostly because I got tired to find
                    inactive users in my followings and I felt very unsatisfied
                    with the current followings management of Reddit.
                </Text>
            </Box>
            <Box mt={['30px', null, '60px']}>
                <Grid
                    templateColumns={['1fr', null, 'repeat(2, 1fr)']}
                    gap={['20px', null, '40px']}>
                    {TECHNOLOGIES.map((t) => (
                        <Flex
                            alignItems='center'
                            justify={['center', null]}
                            key={t.name}>
                            <Link href={t.link} isExternal _hover={undefined}>
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
                </Grid>
            </Box>
            <Text
                mt={['20px', null, '60px']}
                textAlign='center'
                fontWeight='bold'>
                written with{' '}
                <span role='img' aria-label='hearth'>
                    ❤️
                </span>{' '}
                and Typescript
            </Text>
        </Stack>
    );
}
