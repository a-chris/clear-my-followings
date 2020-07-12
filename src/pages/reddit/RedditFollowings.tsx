import {
    Accordion,
    AccordionHeader,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Avatar,
    Badge,
    Box,
    Button,
    Checkbox,
    Flex,
    FormLabel,
    Heading,
    Input,
    Link,
    Spinner,
    Stack,
    Switch,
    Text,
    useToast,
} from '@chakra-ui/core';
import { BoxWithSpacedChildren } from 'components/Styled';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import { useLocalStore, useObserver } from 'mobx-react-lite';
import React from 'react';
import LazyLoad from 'react-lazyload';
import { useHistory } from 'react-router-dom';
import { createBreakpoint } from 'react-use';
import snoowrap from 'snoowrap';
import colors from '../../styles/colors';
import RedditAPI from './api';

interface RedditSwitchFilter {
    id: keyof RedditFilters;
    text: string;
    onChange: () => void;
}

interface RedditFilters {
    'nsfw': boolean;
    'disabled': boolean;
    'inactive': boolean;
}

const initialFilters: RedditFilters = {
    'nsfw': false,
    'disabled': false,
    'inactive': false,
};

const useBreakpoint = createBreakpoint({ XL: 1280, L: 768, SM: 350 });

export default function RedditFollowings() {
    const history = useHistory();
    const toast = useToast();

    function onUnauthorizedError() {
        history.push('/');
        toast({
            position: 'bottom-right',
            title: 'Ops, something went wrong',
            status: 'error',
            duration: 5000,
            isClosable: true,
        });
    }

    const store = useLocalStore(() => ({
        subs: new Array<snoowrap.Subreddit>(),
        isLoading: false,
        filters: initialFilters,
        toggleNsfw() {
            store.filters.nsfw = !store.filters.nsfw;
        },
        async toggleDisabled() {
            if (store.isLoading) return;

            store.filters.disabled = !store.filters.disabled;
            if (store.filters.disabled) {
                store.isLoading = true;
                const users = store.subsToDisplay
                    .filter((sub) => sub.display_name.startsWith('u_'))
                    .map((u) => u.display_name);

                RedditAPI.findDisabledUsers(users)
                    .then((disabledUsers) => {
                        store.isLoading = false;
                        store.disabledUsers = disabledUsers;
                    })
                    .catch(onUnauthorizedError);
            }
        },
        async toggleInactive() {
            if (store.isLoading) return;

            store.filters.inactive = !store.filters.inactive;
            if (store.filters.inactive) {
                store.isLoading = true;
            }
            const users = store.subsToDisplay
                .filter((sub) => sub.display_name.startsWith('u_'))
                .map((u) => u.display_name);
            RedditAPI.findInactiveUsers(users)
                .then((inactiveUsers) => {
                    store.isLoading = false;
                    store.inactiveUsers = inactiveUsers;
                })
                .catch(onUnauthorizedError);
        },
        search: '',
        onSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
            store.search = e.target.value ?? '';
        },
        checkedSubs: new Set<string>(),
        onCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
            const { checked, name } = e.target;
            if (checked != null && name != null) {
                if (checked) store.checkedSubs.add(name);
                else store.checkedSubs.delete(name);
            }
        },
        disabledUsers: new Set<string>(),
        inactiveUsers: new Set<string>(),
        get subsToDisplay() {
            let filteredSubs = store.subs;
            if (store.search !== '') {
                filteredSubs = store.subs.filter((s: snoowrap.Subreddit) =>
                    s.display_name_prefixed
                        .toLowerCase()
                        .includes(store.search.toLowerCase())
                );
            }
            if (Object.values(store.filters).every((f) => f !== true)) {
                return filteredSubs;
            }
            return filteredSubs.filter((sub) => {
                let result: boolean = true;
                if (store.filters.nsfw === true) {
                    result = result && sub.over18;
                }
                if (store.filters.disabled === true && !store.isLoading) {
                    result =
                        result && store.disabledUsers.has(sub.display_name);
                }
                if (store.filters.inactive === true && !store.isLoading) {
                    result =
                        result && store.inactiveUsers.has(sub.display_name);
                }
                return result;
            });
        },
    }));

    React.useEffect(() => {
        // store.subs = (devSubs as unknown) as snoowrap.Subreddit[];
        const getSubscriptions = async () => {
            store.isLoading = true;
            try {
                const subs = await RedditAPI.get()
                    .getSubscriptions()
                    .fetchAll();
                store.subs = _.sortBy(subs, 'display_name_prefixed');
            } catch (error) {
                onUnauthorizedError();
            } finally {
                store.isLoading = false;
            }
        };
        getSubscriptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSelectAll = React.useCallback(() => {
        const visibleNames = store.subsToDisplay?.map((s) => s.display_name);
        if (visibleNames != null) {
            visibleNames.forEach((s) => store.checkedSubs.add(s));
        }
    }, [store.checkedSubs, store.subsToDisplay]);

    const onUnselectAll = React.useCallback(() => {
        const visibleNames = store.subsToDisplay?.map((s) => s.display_name);
        if (visibleNames != null) {
            _.intersection(
                Array.from(store.checkedSubs),
                visibleNames
            ).forEach((s) => store.checkedSubs.delete(s));
        }
    }, [store.checkedSubs, store.subsToDisplay]);

    const onStopFollowing = React.useCallback(() => {
        const subNames = Array.from(store.checkedSubs).map(memoizedGetSubName);
        Promise.all(
            Array.from(subNames).map((sub) =>
                RedditAPI.get().getSubreddit(sub).unsubscribe()
            )
        )
            .then((unfollowedSubs) => {
                unfollowedSubs.forEach((unfollowedSub) => {
                    const idx = store.subs.findIndex(
                        (s) => s.display_name === unfollowedSub.display_name
                    );
                    store.subs.splice(idx, 1);
                });
            })
            .catch(() => history.push('/'));
    }, [history, store.checkedSubs, store.subs]);

    const FILTERS: RedditSwitchFilter[] = [
        {
            text: 'NSFW',
            id: 'nsfw',
            onChange: store.toggleNsfw,
        },
        {
            text: 'Users disabled',
            id: 'disabled',
            onChange: store.toggleDisabled,
        },
        {
            text: 'Inactive since 6 months',
            id: 'inactive',
            onChange: store.toggleInactive,
        },
    ];

    return useObserver(() => (
        <Stack d='flex' align='center'>
            <Box w={['90%', '70%', null, '50%']}>
                <BoxWithSpacedChildren space='10px' pb='70px'>
                    <Input
                        placeholder='Filter subscriptions...'
                        onChange={store.onSearchChange}
                    />
                    <Accordion allowToggle defaultIndex={1}>
                        <AccordionItem defaultIsOpen={false}>
                            <AccordionHeader>
                                <Flex w='100%' justify='space-between'>
                                    <Text>Filters</Text>
                                    <AccordionIcon />
                                </Flex>
                            </AccordionHeader>
                            <AccordionPanel>
                                {FILTERS.map((filter) => (
                                    <Flex
                                        w='100%'
                                        justify='space-between'
                                        key={filter.id}>
                                        <FormLabel htmlFor={filter.id}>
                                            {filter.text}
                                        </FormLabel>
                                        <Switch
                                            id={filter.id}
                                            name={filter.id}
                                            size='lg'
                                            isChecked={store.filters[filter.id]}
                                            color='orange'
                                            onChange={filter.onChange}
                                        />
                                    </Flex>
                                ))}
                            </AccordionPanel>
                        </AccordionItem>
                    </Accordion>
                    {store.isLoading ? (
                        <Flex h='100%' dir='row' justify='center'>
                            <Spinner
                                mt='50%'
                                thickness='4px'
                                speed='0.5s'
                                emptyColor='gray.200'
                                color={colors.reddit_orange}
                                size='xl'
                            />
                        </Flex>
                    ) : (
                        <>
                            {store.subsToDisplay.map((s) => (
                                <LazyLoad once height='auto' key={s.name}>
                                    <SubredditListItem
                                        sub={s}
                                        checkedSubs={store.checkedSubs}
                                        onCheckboxChange={
                                            store.onCheckboxChange
                                        }
                                    />
                                </LazyLoad>
                            ))}
                        </>
                    )}
                </BoxWithSpacedChildren>
            </Box>
            <Flex
                align='center'
                position='fixed'
                bottom='0'
                w='100%'
                h='50px'
                backgroundColor='orange.400'
                zIndex={100}>
                <Flex justify='space-evenly' w='100%'>
                    <Button size='sm' onClick={onSelectAll}>
                        SELECT ALL
                    </Button>
                    <Button size='sm' onClick={onUnselectAll}>
                        UNSELECT ALL
                    </Button>
                    <Button
                        size='sm'
                        isDisabled={store.checkedSubs.size === 0}
                        onClick={onStopFollowing}>
                        STOP FOLLOWING
                    </Button>
                </Flex>
            </Flex>
        </Stack>
    ));
}

interface SubredditListItemProps {
    sub: snoowrap.Subreddit;
    checkedSubs: Set<string>;
    onCheckboxChange: (e: any) => void;
}

function SubredditListItem(props: SubredditListItemProps) {
    const { sub, checkedSubs, onCheckboxChange } = props;
    const breakpoint = useBreakpoint();

    return (
        <Flex
            w='100%'
            justifyContent='space-between'
            p='2'
            pl={['3', null, '6']}
            pr={['3', null, '6']}
            border='1px solid gray'
            rounded='md'
            key={sub.name}>
            <Flex align='center'>
                <LazyLoad>
                    <Avatar
                        src={sub.icon_img}
                        name={sub.display_name_prefixed}
                        size='md'
                        mr={['10px', null, '20px']}
                    />
                </LazyLoad>
                <Heading as='h3' size={breakpoint === 'SM' ? 'sm' : 'md'}>
                    <Link
                        href={memoizedGetSubLink(sub.display_name)}
                        isExternal>
                        {memoizedEllipseSubName(
                            sub.display_name_prefixed,
                            sub.over18
                        )}
                    </Link>
                </Heading>
                {sub.over18 === true && (
                    <Badge ml={['10px', null, '20px']} variantColor='orange'>
                        NSFW
                    </Badge>
                )}
            </Flex>
            <Checkbox
                isChecked={checkedSubs.has(sub.display_name)}
                variantColor='red'
                name={sub.display_name}
                size={breakpoint === 'SM' ? 'md' : 'lg'}
                onChange={onCheckboxChange}
            />
        </Flex>
    );
}

const memoizedGetSubLink = memoizeOne(calculateSubLink);

const memoizedGetSubName = memoizeOne(getSubName);

const memoizedEllipseSubName = memoizeOne(ellipseSubName);

function getSubName(displayName: string): string {
    return displayName.startsWith('u_')
        ? displayName.substring(2)
        : displayName;
}

function calculateSubLink(subName: string): string {
    const profile = subName.startsWith('u_')
        ? `user/${subName.substring(2)}`
        : `r/${subName}`;

    return `https://www.reddit.com/${profile}`;
}

function ellipseSubName(subName: string, nsfw: boolean): string {
    const maxLength = nsfw ? 18 : 23;
    return subName.length > maxLength
        ? `${subName.substring(0, maxLength)}...`
        : subName;
}
