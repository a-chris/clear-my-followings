import {
    Accordion,
    AccordionHeader,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Avatar,
    Badge,
    Box,
    Flex,
    FormLabel,
    Heading,
    Icon,
    Input,
    InputGroup,
    InputLeftElement,
    Link,
    Spinner,
    Stack,
    Switch,
    Text,
    useColorMode,
    useToast,
} from '@chakra-ui/core';
import { useBreakpoint } from 'App';
import { deleteToken } from 'cache/StorageHelper';
import ListFooter from 'components/ListFooter';
import { BoxWithSpacedChildren } from 'components/Styled';
import { BigCheckbox } from 'components/StyledComponents';
import _ from 'lodash';
import React from 'react';
import { queryCache, useMutation, useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import { useSet } from 'react-use';
import snoowrap from 'snoowrap';
import colors from 'styles/colors';
import { byColorMode } from 'utils/theme';
import RedditAPI from './api';
import {
    memoizedEllipseSubName,
    memoizedFilterUser,
    memoizedGetSubLink,
    memoizedGetSubName,
} from './utils/utils';

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
        { add: addCS, has: hasCS, remove: removeCS, reset: clearCS },
    ] = useSet<string>(new Set());

    const onUnauthorizedError = React.useCallback(() => {
        history.push('/');
        deleteToken('reddit');
        toast({
            position: 'bottom-right',
            title: 'Ops, something went wrong',
            status: 'error',
            duration: 5000,
            isClosable: true,
        });
    }, [history, toast]);

    const { isLoading: isLoadingSubs, data: subs } = useQuery<
        snoowrap.Subreddit[],
        any
    >(
        'fetchSubs',
        async () => {
            const response = await RedditAPI.get()
                .getSubscriptions()
                .fetchAll();
            return _.sortBy(response, 'display_name_prefixed');
        },
        {
            retry: false,
            refetchOnMount: false,
            staleTime: Infinity,
            onError: onUnauthorizedError,
        }
    );

    React.useEffect(() => {
        setLoading(isLoadingSubs);
    }, [isLoadingSubs]);

    const stopFollowing = async () => {
        const unfollowedSubs = await Promise.all(
            [...checkedSubs].map((sub) =>
                RedditAPI.get()
                    .getSubreddit(memoizedGetSubName(sub))
                    .unsubscribe()
            )
        );
        return unfollowedSubs;
    };

    const [onStopFollowing] = useMutation(stopFollowing, {
        onSuccess: (unfollowedSubs) => {
            queryCache.setQueryData(
                'fetchSubs',
                _.differenceWith(
                    subs,
                    unfollowedSubs,
                    (s1, s2) => s1.display_name === s2.display_name
                )
            );
            clearCS();
        },
        onError: () => history.push('/'),
    });

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

    const onToggleNsfw = React.useCallback(() => {
        setFilters((curr) => ({ ...curr, nsfw: !curr.nsfw }));
    }, []);

    const onToggleDisabled = React.useCallback(() => {
        if (isLoading) return;

        setFilters((curr) => ({ ...curr, disabled: !curr.disabled }));
        if (!filters.disabled) {
            setLoading(true);
            const users = subsToDisplay
                .filter(memoizedFilterUser)
                .map((u) => u.display_name);

            RedditAPI.findDisabledUsers(users)
                .then((disUsers) => {
                    setLoading(false);
                    setDisabledUsers(disUsers);
                })
                .catch(onUnauthorizedError);
        }
    }, [filters.disabled, isLoading, onUnauthorizedError, subsToDisplay]);

    const onToggleInactive = React.useCallback(() => {
        if (isLoading) return;

        setFilters((curr) => ({ ...curr, inactive: !curr.inactive }));
        if (!filters.inactive) {
            setLoading(true);
            const users = subsToDisplay
                .filter((sub) => sub.display_name.startsWith('u_'))
                .map((u) => u.display_name);
            RedditAPI.findInactiveUsers(users)
                .then((inaUsers) => {
                    setLoading(false);
                    setInactiveUsers(inaUsers);
                })
                .catch(onUnauthorizedError);
        }
    }, [filters.inactive, isLoading, onUnauthorizedError, subsToDisplay]);

    const onSelectAll = React.useCallback(() => {
        // eslint-disable-next-line no-unused-expressions
        subsToDisplay?.map((s) => s.display_name).forEach((s) => addCS(s));
    }, [addCS, subsToDisplay]);

    const onUnselectAll = React.useCallback(() => {
        // eslint-disable-next-line no-unused-expressions
        subsToDisplay?.map((s) => s.display_name).forEach((s) => removeCS(s));
    }, [removeCS, subsToDisplay]);

    const onCheckboxChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const { checked, name } = e.target;
            if (checked != null && name != null) {
                if (checked) addCS(name);
                else removeCS(name);
            }
        },
        [addCS, removeCS]
    );

    const onSearchChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearch(e.target.value ?? '');
        },
        []
    );

    const FILTERS: RedditSwitchFilter[] = [
        {
            text: 'NSFW only',
            id: 'nsfw',
            onChange: onToggleNsfw,
        },
        {
            text: 'Users disabled',
            id: 'disabled',
            onChange: onToggleDisabled,
        },
        {
            text: 'Inactive since 6 months',
            id: 'inactive',
            onChange: onToggleInactive,
        },
    ];

    return (
        <Stack d='flex' align='center'>
            <Box w={['90%', '70%', null, '50%']}>
                <BoxWithSpacedChildren space='10px' pb='30px'>
                    <InputGroup>
                        <InputLeftElement>
                            <Icon name='search' color='gray.400' />
                        </InputLeftElement>
                        <Input
                            placeholder='Filter subscriptions...'
                            rounded='50px'
                            size='sm'
                            onChange={onSearchChange}
                        />
                    </InputGroup>
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
                                mt='30%'
                                thickness='4px'
                                speed='0.5s'
                                emptyColor='gray.200'
                                color={colors.reddit_orange}
                                size='xl'
                            />
                        </Flex>
                    ) : (
                        <>
                            {subsToDisplay.map((sub) => (
                                <SubredditListItem
                                    key={sub.display_name}
                                    sub={sub}
                                    isChecked={hasCS(sub.display_name)}
                                    onCheckboxChange={onCheckboxChange}
                                />
                            ))}
                        </>
                    )}
                </BoxWithSpacedChildren>
            </Box>
            <ListFooter
                totalItemsCount={subsToDisplay.length}
                selectedItemsCount={checkedSubs.size}
                onSelectAll={onSelectAll}
                onUnselectAll={onUnselectAll}
                onStopFollowing={onStopFollowing}
            />
        </Stack>
    );
}

interface SubredditListItemProps {
    sub: snoowrap.Subreddit;
    isChecked: boolean;
    onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SubredditListItem = React.memo((props: SubredditListItemProps) => {
    const { sub, isChecked, onCheckboxChange } = props;
    const breakpoint = useBreakpoint();
    const { colorMode } = useColorMode();

    return (
        <Flex
            w='100%'
            justifyContent='space-between'
            p='2'
            px='6'
            rounded='sm'
            backgroundColor={byColorMode(
                colorMode,
                'gray.100',
                colors.black_almost
            )}
            key={sub.name}>
            <Flex align='center'>
                <Avatar
                    src={sub.icon_img}
                    name={sub.display_name_prefixed}
                    size='md'
                    mr={['10px', null, '20px']}
                />
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
            <BigCheckbox
                w='fit-content'
                breakpoint={breakpoint}
                isChecked={isChecked}
                vColor={colors.reddit_orange}
                my='auto'
                borderColor='lightslategray'
                name={sub.display_name}
                onChange={onCheckboxChange}
            />
        </Flex>
    );
});

RedditFollowings.whyDidYouRender = true;
