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
import { BoxWithSpacedChildren } from 'components/Styled';
import { BigCheckbox } from 'components/StyledComponents';
import _ from 'lodash';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { createBreakpoint, useSet } from 'react-use';
import snoowrap from 'snoowrap';
import colors from 'styles/colors';
import { BadgeContainer } from '../../components/StyledComponents';
import RedditAPI from './api';
import {
    memoizedEllipseSubName,
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
    const { colorMode } = useColorMode();
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
    const [checkedSubs, { add: addCS, has: hasCS, remove: removeCS }] = useSet<
        string
    >(new Set());

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
        // const dSubs = (devSubs as unknown) as snoowrap.Subreddit[];
        // setSubs(_.sortBy(dSubs, 'display_name_prefixed'));
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
        console.count();
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

    const FILTERS: RedditSwitchFilter[] = [
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
                    <Flex>
                        <Button
                            size='sm'
                            rounded='md'
                            variant='outline'
                            variantColor='black'
                            _hover={{
                                backgroundColor:
                                    colorMode === 'light' ? 'white' : 'black',
                            }}
                            onClick={onSelectAll}>
                            SELECT ALL
                        </Button>
                        <Box w='20px' />
                        <Button
                            size='sm'
                            rounded='md'
                            variant='outline'
                            variantColor='black'
                            _hover={{
                                backgroundColor:
                                    colorMode === 'light' ? 'white' : 'black',
                            }}
                            onClick={onUnselectAll}>
                            UNSELECT ALL
                        </Button>
                    </Flex>
                    <BadgeContainer badge={checkedSubs.size}>
                        <Button
                            size='sm'
                            rounded='md'
                            variant='outline'
                            variantColor='black'
                            _hover={{ backgroundColor: 'red.500' }}
                            isDisabled={checkedSubs.size === 0}
                            onClick={onStopFollowing}>
                            STOP FOLLOWING
                        </Button>
                    </BadgeContainer>
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

const SubredditListItem = React.memo((props: SubredditListItemProps) => {
    const { sub } = props;
    const breakpoint = useBreakpoint();
    const { colorMode } = useColorMode();

    return (
        <Flex
            w='100%'
            justifyContent='space-between'
            p='2'
            px='6'
            rounded='sm'
            backgroundColor={
                colorMode === 'light' ? 'gray.100' : colors.black_almost
            }
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
                isChecked={props.isChecked}
                vColor={colors.reddit_orange}
                my='auto'
                borderColor='lightslategray'
                name={sub.display_name}
                onChange={props.onCheckboxChange}
            />
        </Flex>
    );
});

RedditFollowings.whyDidYouRender = true;
