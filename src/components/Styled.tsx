import { Box } from '@chakra-ui/core';
import styled from 'styled-components';

interface BoxWithSpacedChildrenProps {
    space: string;
}

export const BoxWithSpacedChildren = styled(Box)<BoxWithSpacedChildrenProps>`
    & > * {
        margin-bottom: ${(props) => props.space};
    }
`;
