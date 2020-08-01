import { Checkbox, Flex } from '@chakra-ui/core';
import React from 'react';
import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';
import colors from '../styles/colors';

export const BigCheckbox = styled(Checkbox)<{
    breakpoint: string;
    isChecked: boolean;
    vColor: string;
}>`
    && > div {
        // workaround to give a custom size
        width: ${(props) => (props.breakpoint === 'SM' ? '1.25rem' : '1.5rem')};
        height: ${(props) =>
            props.breakpoint === 'SM' ? '1.25rem' : '1.5rem'};

        // workaround to give a custom bg color on dark theme
        background-color: ${(props) =>
            props.isChecked ? props.vColor : ''} !important;
        border-color: ${(props) =>
            props.isChecked ? props.vColor : ''} !important;
    }
`;

type BadgeContainerProps = {
    children: React.ReactElement;
    badge?: number;
};

export function BadgeContainer(props: BadgeContainerProps) {
    const badgeVisible = props.badge != null && props.badge > 0;

    return (
        <Flex direction='row-reverse'>
            <CSSTransition
                in={badgeVisible}
                timeout={{ enter: 500, exit: 0 }}
                classNames='zoom'>
                <span
                    style={{
                        display: badgeVisible ? 'table' : 'none',
                        background: colors.red_dark,
                        border: '1px solid indianred',
                        borderRadius: '30px',
                        color: '#fff',
                        fontSize: '11px',
                        marginTop: '-6px',
                        minWidth: '20px',
                        padding: '2px',
                        position: 'absolute',
                        textAlign: 'center',
                        marginRight: '-10px',
                        zIndex: 2,
                    }}>
                    {props.badge}
                </span>
            </CSSTransition>
            {props.children}
        </Flex>
    );
}
