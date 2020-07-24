import { Checkbox } from '@chakra-ui/core';
import styled from 'styled-components';

export const BigCheckbox = styled(Checkbox)<{
    breakpoint: string;
    isChecked: boolean;
    vColor: string;
}>`
    &&& > div {
        // workaround to give a custom size
        width: ${(props) => (props.breakpoint === 'SM' ? '1.25rem' : '1.5rem')};
        height: ${(props) =>
            props.breakpoint === 'SM' ? '1.25rem' : '1.5rem'};
        // workaround to give a custom bg color on dark theme
        background-color: ${(props) => (props.isChecked ? props.vColor : '')};
        border-color: ${(props) => (props.isChecked ? props.vColor : '')};
    }
`;
