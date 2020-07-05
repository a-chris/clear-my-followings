import { Box, Button, Link } from '@chakra-ui/core';
import React from 'react';
import { REDDIT_LOGIN } from 'utils/const';

export default function Homepage() {
    return (
        <Box justifyContent='center'>
            <Button variant='ghost'>
                <Link href={REDDIT_LOGIN}>ACCEDI CON Reddit</Link>
            </Button>
        </Box>
    );
}
