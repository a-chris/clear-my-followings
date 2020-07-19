import {
    Box,
    Button,
    Divider,
    Heading,
    Link,
    List,
    ListIcon,
    ListItem,
} from '@chakra-ui/core';
import React from 'react';
import { AiFillGithub } from 'react-icons/ai';
import { FaReact } from 'react-icons/fa';
import { FiMinimize2 } from 'react-icons/fi';
import { RiTimeLine } from 'react-icons/ri';
import styled from 'styled-components';
import { GITHUB_REPO, REDDIT_LOGIN } from '../../utils/const';

export default function Home() {
    return (
        <Box pt={['20px', '40px', '60px']}>
            <Box ml='auto' mr='auto' w='fit-content' maxW='80%'>
                <Heading as='h1' fontSize='xl' lineHeight='1.5'>
                    <span style={{ fontSize: '4rem', lineHeight: '1' }}>F</span>
                    ind inactive and deleted users <DesktopBr />
                    to clear your Reddit followings!
                </Heading>
            </Box>
            <Box
                w='fit-content'
                maxW='80%'
                m='auto'
                justifyContent='center'
                mt={['20px', null, '60px']}>
                <Divider />
                <Heading as='h2' size='xl'>
                    Privacy first
                </Heading>
                <List spacing={2} mt='20px'>
                    <ListItem>
                        <StyledListIcon icon={FaReact} />
                        Everything is on your browser
                    </ListItem>
                    <ListItem>
                        <StyledListIcon icon={FiMinimize2} />
                        Only the minimum amount of account permissions is
                        required
                    </ListItem>
                    <ListItem>
                        <StyledListIcon icon={RiTimeLine} />
                        The permissions lasts just an hour
                    </ListItem>
                    <ListItem>
                        <StyledListIcon icon={AiFillGithub} />
                        The code is open source,{' '}
                        <Link href={GITHUB_REPO} isExternal fontWeight='bold'>
                            give a look
                        </Link>
                    </ListItem>
                </List>
                <Button
                    variant='solid'
                    variantColor='orange'
                    color='black'
                    mt={['20px', null, '60px']}>
                    <Link
                        href={REDDIT_LOGIN}
                        _hover={undefined}
                        _focus={undefined}>
                        Login with Reddit
                    </Link>
                </Button>
            </Box>
        </Box>
    );
}

const DesktopBr = styled.br`
    @media (max-width: 500px) {
        display: none;
    }
`;

const StyledListIcon = styled(ListIcon).attrs({
    size: '20px',
})``;