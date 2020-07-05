import {
    Accordion,
    AccordionHeader,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Avatar,
    Box,
    Button,
    Checkbox,
    Flex,
    FormLabel,
    Heading,
    Input,
    Spinner,
    Stack,
    Switch,
    Tag,
    Text,
} from '@chakra-ui/core';
import { BoxWithSpacedChildren } from 'components/Styled';
// import devSubs from 'dev/subs.json';
import _ from 'lodash';
import React from 'react';
import snoowrap from 'snoowrap';
import RedditAPI from './api';

interface RedditSwitchFilter {
    id: keyof RedditFilters;
    text: string;
}

interface RedditFilters {
    'switch-nsfw': boolean;
    'switch-disabled': boolean;
    'switch-inactive': boolean;
}

const FILTERS: RedditSwitchFilter[] = [
    {
        text: 'NSFW',
        id: 'switch-nsfw',
    },
    {
        text: 'Accounts disabled',
        id: 'switch-disabled',
    },
    {
        text: 'Inactive since 6 months',
        id: 'switch-inactive',
    },
];

const initialFilters: RedditFilters = {
    'switch-nsfw': false,
    'switch-disabled': false,
    'switch-inactive': false,
};

export default function RedditFollowings() {
    const [subReddits, setSubReddits] = React.useState<snoowrap.Subreddit[]>();
    const [subRedditsToDisplay, setSubRedditsToDisplay] = React.useState<
        snoowrap.Subreddit[]
    >();
    const [searchValue, setSearchValue] = React.useState<string>();
    const [filters, setFilters] = React.useState(initialFilters);
    const [checkedSubs, setCheckedSubs] = React.useState<Set<string>>(
        new Set()
    );
    const [disabledUsers, setDisabledUsers] = React.useState<Set<string>>(
        new Set()
    ); // save display_name
    const [isLoading, setLoading] = React.useState(true);

    React.useEffect(() => {
        console.log('useEffect');
        // const reddit = new snoowrap({
        //     userAgent: USER_AGENT,
        //     accessToken: loadToken('reddit')!!,
        // });

        const getSubscriptions = async () => {
            const subs = await RedditAPI.get().getSubscriptions().fetchAll();
            console.log('TCL: getSubscriptions -> subReddits', subs);
            setSubReddits(_.sortBy(subs, 'display_name_prefixed'));
            setLoading(false);
        };
        // getSubscriptions();

        // ((reddit.getSubscriptions().fetchAll() as unknown) as Promise<
        //     snoowrap.Subreddit[]
        // >).then((subs) => {
        //     const sortedSubs = _.sortBy(subs, 'display_name_prefixed');
        //     setSubReddits(sortedSubs);

        //     const users = sortedSubs
        //         .filter((sub) => sub.display_name.startsWith('u_'))
        //         .map((u) => u.display_name);
        //     console.log('TCL: RedditFollowings -> users', users);

        //     // TODO: handle 401
        //     Promise.all(
        //         users.map((u) =>
        //             reddit.getUser(u.substring(2)).getSubmissions()
        //         )
        //     ).then((lists) => {
        //         const disabled: string[] = [];
        //         lists.forEach((submissions, index) => {
        //             if (submissions.length === 0) {
        //                 disabled.push(users[index]);
        //             }
        //         });
        //         console.log('TCL: RedditFollowings -> disabled', disabled);
        //         setDisabledUsers(new Set(disabled));
        //     });
        // });

        // const castedDevSubs = (devSubs as unknown) as snoowrap.Subreddit[];
        // setSubReddits(castedDevSubs);

        // const users = castedDevSubs
        //     .filter((sub) => sub.display_name.startsWith('u_'))
        //     .map((u) => u.display_name);
        // console.log('TCL: RedditFollowings -> users', users);
    }, []);

    function applyFilters(subs?: snoowrap.Subreddit[]): snoowrap.Subreddit[] {
        return (subs || []).filter((sub) => {
            if (Object.values(filters).find((f) => f === true)) {
                let result: boolean = true;
                if (filters['switch-nsfw'] === true) {
                    result = result && sub.over18;
                }
                if (filters['switch-disabled'] === true) {
                    // TODO: improve this
                    result = result && disabledUsers.has(sub.display_name);
                }
                if (filters['switch-inactive'] === true) {
                    // TODO
                    result = result && true;
                }
                return result;
            }
            return true;
        });
    }

    React.useEffect(() => {
        const subRedditsFilteredBySearch =
            searchValue == null
                ? subReddits
                : subReddits?.filter((s) =>
                      s.display_name_prefixed
                          .toLowerCase()
                          .includes(searchValue.toLowerCase())
                  );

        setSubRedditsToDisplay(applyFilters(subRedditsFilteredBySearch));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subReddits, searchValue, filters, disabledUsers]);

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        if (value != null) {
            setSearchValue(value);
        }
    };

    const onFilterChange = (e: React.ChangeEvent<any>) => {
        const { checked, name } = e.target;
        if (checked != null && name != null) {
            setFilters((curr) => ({ ...curr, [name]: checked }));
            if (name === 'switch-disabled' && checked === true) {
                const users = (subReddits ?? [])
                    .filter((sub) => sub.display_name.startsWith('u_'))
                    .map((u) => u.display_name);
                Promise.all(
                    users.map((u) =>
                        RedditAPI.get().getUser(u.substring(2)).getSubmissions()
                    )
                ).then((lists) => {
                    const disabled: string[] = [];
                    lists.forEach((submissions, index) => {
                        if (submissions.length === 0) {
                            disabled.push(users[index]);
                        }
                    });
                    console.log('TCL: RedditFollowings -> disabled', disabled);
                    setDisabledUsers(new Set(disabled));
                });
            }
        }
    };

    const onCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked, name } = e.target;
        console.log('TCL: onCheckboxChange -> checked, name', checked, name);
        if (checked != null && name != null) {
            setCheckedSubs((curr) =>
                checked
                    ? new Set([...curr, name])
                    : new Set(_.without(Array.from(curr), name))
            );
        }
    };

    const onSelectAll = React.useCallback(() => {
        console.log('TCL: RedditFollowings -> onSelectAll');
        console.log(
            'TCL: RedditFollowings -> subRedditsToDisplay',
            subRedditsToDisplay
        );
        const visibleNames = subRedditsToDisplay?.map((s) => s.display_name);
        if (visibleNames != null) {
            setCheckedSubs((curr) => new Set([...curr, ...visibleNames]));
        }
    }, [subRedditsToDisplay]);

    const onUnselectAll = React.useCallback(() => {
        console.log('TCL: RedditFollowings -> onUnselectAll');
        const visibleNames = subRedditsToDisplay?.map((s) => s.display_name);
        if (visibleNames != null) {
            setCheckedSubs(
                (curr) => new Set(_.difference(Array.from(curr), visibleNames))
            );
        }
    }, [subRedditsToDisplay]);

    const onStopFollowing = React.useCallback(() => {
        console.log('TCL: RedditFollowings -> checkedSubs', checkedSubs);
        const subNames = Array.from(checkedSubs).map((sub) =>
            sub.startsWith('u_') ? sub.substring(2) : sub
        );
        Promise.all(
            Array.from(subNames).map((sub) =>
                RedditAPI.get().getSubreddit(sub).unsubscribe()
            )
        ).then(() => {});
    }, [checkedSubs]);

    return (
        <Stack d='flex' align='center'>
            <Box w={['90%', '70%', null, '50%']}>
                <BoxWithSpacedChildren space='10px'>
                    <Flex justify='space-between'>
                        <Box />
                        <Button
                            size='sm'
                            isDisabled={checkedSubs.size === 0}
                            onClick={onStopFollowing}>
                            STOP FOLLOWING
                        </Button>
                        <Button size='sm' onClick={onSelectAll}>
                            SELECT ALL
                        </Button>
                        <Button size='sm' onClick={onUnselectAll}>
                            UNSELECT ALL
                        </Button>
                    </Flex>
                    <Input
                        placeholder='Filter subscriptions...'
                        onChange={onSearchChange}
                    />
                    <Accordion allowToggle>
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
                                            onChange={onFilterChange}
                                        />
                                    </Flex>
                                ))}
                            </AccordionPanel>
                        </AccordionItem>
                    </Accordion>
                    {isLoading ? (
                        <Flex h='100%' dir='row' justify='center'>
                            <Spinner
                                thickness='4px'
                                speed='0.5s'
                                emptyColor='gray.200'
                                color='blue.500'
                                size='xl'
                            />
                        </Flex>
                    ) : (
                        <>
                            {subRedditsToDisplay?.map((s) => (
                                <Flex
                                    w='100%'
                                    justifyContent='space-between'
                                    p='1'
                                    pl='6'
                                    pr='6'
                                    border='1px solid gray'
                                    rounded='md'
                                    key={s.name}>
                                    <Flex align='center'>
                                        <Avatar
                                            src={s.icon_img}
                                            name={s.display_name_prefixed}
                                            mr='20px'
                                        />
                                        <Heading as='h3' size='md'>
                                            {s.display_name_prefixed}
                                        </Heading>
                                        {s.over18 === true && (
                                            <Tag
                                                ml='20px'
                                                variantColor='orange'
                                                size='sm'>
                                                NSFW
                                            </Tag>
                                        )}
                                    </Flex>
                                    <Checkbox
                                        isChecked={checkedSubs.has(
                                            s.display_name
                                        )}
                                        variantColor='red'
                                        name={s.display_name}
                                        size='lg'
                                        onChange={onCheckboxChange}
                                    />
                                </Flex>
                            ))}
                        </>
                    )}
                </BoxWithSpacedChildren>
            </Box>
        </Stack>
    );
}
