import { Button, Flex, useColorMode } from '@chakra-ui/core';
import ConfirmDialog from 'components/ConfirmDialog';
import { BadgeContainer } from 'components/StyledComponents';
import React from 'react';
import {
    MdCheckBox,
    MdCheckBoxOutlineBlank,
    MdIndeterminateCheckBox,
} from 'react-icons/md';
import { THEME } from 'utils/theme';

interface ListFooterProps {
    totalItemsCount: number;
    selectedItemsCount: number;
    onSelectAll: () => void;
    onUnselectAll: () => void;
    onStopFollowing: () => void;
}

export default function ListFooter(props: ListFooterProps) {
    return (
        <Flex
            flexShrink={0}
            align='center'
            position='sticky'
            bottom='0'
            mt='auto'
            w='100%'
            h='50px'
            backgroundColor='orange.400'
            zIndex={100}>
            <Flex justify='space-evenly' w='100%'>
                <SelectAllButton
                    total={props.totalItemsCount}
                    selected={props.selectedItemsCount}
                    onSelectAll={props.onSelectAll}
                    onUnselectAll={props.onUnselectAll}
                />
                <ConfirmDialog
                    onConfirm={props.onStopFollowing}
                    trigger={(onClick) => (
                        <BadgeContainer badge={props.selectedItemsCount}>
                            <Button
                                size='sm'
                                rounded='md'
                                variant='outline'
                                variantColor='black'
                                _hover={{
                                    backgroundColor: 'red.500',
                                }}
                                isDisabled={props.selectedItemsCount === 0}
                                onClick={onClick}>
                                STOP FOLLOWING
                            </Button>
                        </BadgeContainer>
                    )}
                />
            </Flex>
        </Flex>
    );
}

interface SelectAllButtonProps {
    total: number;
    selected: number;
    onSelectAll: () => void;
    onUnselectAll: () => void;
}

function SelectAllButton(props: SelectAllButtonProps) {
    const { colorMode } = useColorMode();

    let icon = MdCheckBoxOutlineBlank;
    if (props.selected > 0 && props.selected < props.total) {
        icon = MdIndeterminateCheckBox;
    } else if (props.total !== 0 && props.selected === props.total) {
        icon = MdCheckBox;
    }

    return (
        <Button
            size='sm'
            rounded='md'
            variant='outline'
            variantColor='black'
            _hover={{
                backgroundColor: colorMode === THEME.LIGHT ? 'white' : 'black',
            }}
            iconSpacing='0.2rem'
            leftIcon={icon}
            onClick={
                props.selected > 0 ? props.onUnselectAll : props.onSelectAll
            }>
            UNSELECT ALL
        </Button>
    );
}
