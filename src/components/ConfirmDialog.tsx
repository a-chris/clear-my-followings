import {
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    useDisclosure,
} from '@chakra-ui/core';
import React from 'react';

interface ConfirmDialogProps {
    trigger: (onClick: () => void) => React.ReactNode;
    onConfirm: () => void;
    onCancel?: () => void;
}

ConfirmDialog.defaultProps = {
    onCancel: () => {},
};

export default function ConfirmDialog(props: ConfirmDialogProps) {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            {props.trigger(onOpen)}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent borderRadius='5px'>
                    <ModalHeader>Clear my followings</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>
                            Are you sure you want to unfollow these users?
                        </Text>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant='ghost'
                            variantColor='red'
                            mr={4}
                            onClick={() => {
                                onClose();
                                if (props.onCancel) props.onCancel();
                            }}>
                            Cancel
                        </Button>
                        <Button
                            variant='solid'
                            variantColor='green'
                            onClick={() => {
                                onClose();
                                props.onConfirm();
                            }}>
                            Confirm
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
