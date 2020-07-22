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
import React from 'react';
import LazyLoad from 'react-lazyload';
import { useHistory } from 'react-router-dom';
import { createBreakpoint, useSet } from 'react-use';
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

export default function RedditFollowings() {
    const history = useHistory();
    const toast = useToast();
    const [subs, setSubs] = React.useState<snoowrap.Subreddit[]>();
    const [isLoading, setLoading] = React.useState(false);
    const [filters, setFilters] = React.useState<RedditFilters>(initialFilters);
    const [search, setSearch] = React.useState('');
    const [disabledUsers, setDisabledUsers] = React.useState<Set<string>>(
        new Set()
    );
    const [inactiveUsers, setInactiveUsers] = React.useState<Set<string>>(
        new Set()
    );
    const [
        checkedSubs,
        { add: addCS, has: hasCS, remove: removeCS },
    ] = useSet<string>(new Set());

    const onUnauthorizedError = React.useCallback(() => {
        history.push('/');
        toast({
            position: 'bottom-right',
            title: 'Ops, something went wrong',
            status: 'error',
            duration: 5000,
            isClosable: true,
        });
    }, [history, toast]);

    React.useEffect(() => {
        // store.subs = (devSubs as unknown) as snoowrap.Subreddit[];
        const getSubscriptions = async () => {
            setLoading(true);
            try {
                const fetchedSubs = await RedditAPI.get()
                    .getSubscriptions()
                    .fetchAll();
                setSubs(_.sortBy(fetchedSubs, 'display_name_prefixed'));
            } catch (error) {
                onUnauthorizedError();
            } finally {
                setLoading(false);
            }
        };
        getSubscriptions();
    }, [onUnauthorizedError]);

    const subsToDisplay: snoowrap.Subreddit[] = React.useMemo(() => {
        let filteredSubs = Array.from(subs ?? []);
        if (search !== '') {
            filteredSubs = filteredSubs.filter((s: snoowrap.Subreddit) =>
                s.display_name_prefixed
                    .toLowerCase()
                    .includes(search.toLowerCase())
            );
        }
        if (Object.values(filters).every((f) => f !== true)) {
            return filteredSubs;
        }
        return filteredSubs.filter((sub) => {
            let result: boolean = true;
            if (filters.nsfw === true) {
                result = result && sub.over18;
            }
            if (filters.disabled === true && !isLoading) {
                result = result && disabledUsers.has(sub.display_name);
            }
            if (filters.inactive === true && !isLoading) {
                result = result && inactiveUsers.has(sub.display_name);
            }
            return result;
        });
    }, [filters, isLoading, search, disabledUsers, inactiveUsers, subs]);

    const toggleNsfw = React.useCallback(() => {
        setFilters((curr) => ({ ...curr, nsfw: !curr.nsfw }));
    }, []);

    const toggleDisabled = React.useCallback(() => {
        if (isLoading) return;

        setFilters((curr) => ({ ...curr, disabled: !curr.disabled }));
        if (filters.disabled) {
            setLoading(true);
            const users = subsToDisplay
                .filter((sub) => sub.display_name.startsWith('u_'))
                .map((u) => u.display_name);

            RedditAPI.findDisabledUsers(users)
                .then((disUsers) => {
                    setLoading(false);
                    setDisabledUsers(disUsers);
                })
                .catch(onUnauthorizedError);
        }
    }, [filters.disabled, isLoading, onUnauthorizedError, subsToDisplay]);

    const toggleInactive = React.useCallback(() => {
        if (isLoading) return;

        if (!filters.inactive) {
            setLoading(true);
        }
        setFilters((curr) => ({ ...curr, inactive: !curr.inactive }));
        const users = subsToDisplay
            .filter((sub) => sub.display_name.startsWith('u_'))
            .map((u) => u.display_name);
        RedditAPI.findInactiveUsers(users)
            .then((inaUsers) => {
                setLoading(false);
                setInactiveUsers(inaUsers);
            })
            .catch(onUnauthorizedError);
    }, [filters.inactive, isLoading, onUnauthorizedError, subsToDisplay]);

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value ?? '');
    };

    const onSelectAll = React.useCallback(() => {
        // eslint-disable-next-line no-unused-expressions
        subsToDisplay?.map((s) => s.display_name).forEach((s) => addCS(s));
    }, [addCS, subsToDisplay]);

    const onUnselectAll = React.useCallback(() => {
        // eslint-disable-next-line no-unused-expressions
        subsToDisplay?.map((s) => s.display_name).forEach((s) => removeCS(s));
    }, [removeCS, subsToDisplay]);

    const onStopFollowing = React.useCallback(() => {
        const subNames = Array.from(checkedSubs).map(memoizedGetSubName);

        Promise.all(
            Array.from(subNames).map((sub) =>
                RedditAPI.get().getSubreddit(sub).unsubscribe()
            )
        )
            .then((unfollowedSubs) => {
                setSubs((curr) =>
                    _.differenceWith(
                        curr,
                        unfollowedSubs,
                        (s1, s2) => s1.display_name === s2.display_name
                    )
                );
            })
            .catch(() => history.push('/'));
    }, [checkedSubs, history]);

    const onCheckboxChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const { checked, name } = e.target;
            if (checked != null && name != null) {
                if (checked) {
                    addCS(name);
                } else {
                    removeCS(name);
                }
            }
        },
        [addCS, removeCS]
    );

    const FILTERS: RedditSwitchFilter[] = React.useMemo(
        () => [
            {
                text: 'NSFW',
                id: 'nsfw',
                onChange: toggleNsfw,
            },
            {
                text: 'Users disabled',
                id: 'disabled',
                onChange: toggleDisabled,
            },
            {
                text: 'Inactive since 6 months',
                id: 'inactive',
                onChange: toggleInactive,
            },
        ],
        [toggleDisabled, toggleInactive, toggleNsfw]
    );

    return (
        <Stack d='flex' align='center'>
            <Box w={['90%', '70%', null, '50%']}>
                <BoxWithSpacedChildren space='10px' pb='70px'>
                    <Input
                        placeholder='Filter subscriptions...'
                        onChange={onSearchChange}
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
                                            isChecked={filters[filter.id]}
                                            color='orange'
                                            onChange={filter.onChange}
                                        />
                                    </Flex>
                                ))}
                            </AccordionPanel>
                        </AccordionItem>
                    </Accordion>
                    {isLoading ? (
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
                            {subsToDisplay.map((s) => (
                                <LazyLoad once height='auto' key={s.name}>
                                    <SubredditListItem
                                        key={s.name}
                                        sub={s}
                                        isChecked={hasCS(s.display_name)}
                                        onCheckboxChange={onCheckboxChange}
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
                        isDisabled={checkedSubs.size === 0}
                        onClick={onStopFollowing}>
                        STOP FOLLOWING
                    </Button>
                </Flex>
            </Flex>
        </Stack>
    );
}

interface SubredditListItemProps {
    sub: snoowrap.Subreddit;
    isChecked: boolean;
    onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const useBreakpoint = createBreakpoint({ XL: 1280, L: 768, SM: 350 });
function SubredditListItem(props: SubredditListItemProps) {
    const { sub } = props;
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
                isChecked={props.isChecked}
                variantColor='red'
                name={sub.display_name}
                size={breakpoint === 'SM' ? 'md' : 'lg'}
                w='fit-content'
                mt='auto'
                mb='auto'
                onChange={props.onCheckboxChange}
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
