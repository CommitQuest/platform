import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Card,
  CardBody,
  CardHeader,
  Avatar,
  Button,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { Search2Icon } from '@chakra-ui/icons';
import { useUser } from '../contexts/UserContext';
import api from '../services/api';
import type { User, Friendship, FriendRequest, LeaderboardEntry, GithubConnection } from '../types';

// Normalize API responses (backend may return different shapes)
const getFriendsList = (data: any): Friendship[] =>
  Array.isArray(data?.friends) ? data.friends : Array.isArray(data) ? data : [];
const getRequestsReceived = (data: any): FriendRequest[] =>
  Array.isArray(data?.received) ? data.received : [];
const getRequestsSent = (data: any): FriendRequest[] =>
  Array.isArray(data?.sent) ? data.sent : [];
// Normalize leaderboard entry so we always have character_name / character_avatar_url from whatever the backend sends
function normalizeLeaderboardEntry(raw: any): LeaderboardEntry {
  const characterName =
    raw.character_name ??
    raw.character?.name ??
    raw.user_character?.name;
  const characterAvatarUrl =
    raw.character_avatar_url ??
    raw.character?.avatar_url ??
    raw.user_character?.avatar_url;
  return {
    rank: raw.rank,
    user_id: raw.user_id,
    github_username: raw.github_username ?? '',
    avatar_url: raw.avatar_url,
    character_name: characterName || undefined,
    character_avatar_url: characterAvatarUrl || undefined,
    value: raw.value ?? 0,
    metric: raw.metric ?? 'experience_gained',
  };
}

const getLeaderboardEntries = (data: any): LeaderboardEntry[] => {
  const raw = Array.isArray(data?.entries)
    ? data.entries
    : Array.isArray(data?.leaderboard)
      ? data.leaderboard
      : Array.isArray(data)
        ? data
        : [];
  return raw.map(normalizeLeaderboardEntry);
};
const getGithubConnections = (data: any): GithubConnection[] =>
  Array.isArray(data?.connections) ? data.connections : Array.isArray(data?.users)
    ? (data.users as User[]).map((u) => ({ user: u, connection_type: 'mutual' as const }))
    : [];
const getSearchResults = (data: any): User[] =>
  Array.isArray(data?.users) ? data.users : Array.isArray(data) ? data : [];

const Friends: React.FC = () => {
  const { user: currentUserData, loading: userLoading } = useUser();
  const cardBg = useColorModeValue('#1e1e1e', '#1e1e1e');
  const borderColor = useColorModeValue('#333333', '#333333');

  const [friends, setFriends] = useState<Friendship[]>([]);
  const [mutualFriends, setMutualFriends] = useState<Friendship[]>([]);
  const [requestsReceived, setRequestsReceived] = useState<FriendRequest[]>([]);
  const [requestsSent, setRequestsSent] = useState<FriendRequest[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [githubConnections, setGithubConnections] = useState<GithubConnection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const loadFriendsData = useCallback(async () => {
    if (!api.isLoggedIn()) return;
    setError(null);
    try {
      const [friendsRes, requestsRes, leaderboardRes, connectionsRes] = await Promise.allSettled([
        api.friendsAPI.getFriends(),
        api.friendsAPI.getFriendRequests(),
        api.userAPI.getLeaderboard('experience_gained', 'week'),
        api.githubConnectionsAPI.getConnections(),
      ]);

      if (friendsRes.status === 'fulfilled') {
        setFriends(getFriendsList(friendsRes.value));
        setMutualFriends(getFriendsList((friendsRes.value as any)?.mutual) || []);
      }
      if (requestsRes.status === 'fulfilled') {
        setRequestsReceived(getRequestsReceived(requestsRes.value));
        setRequestsSent(getRequestsSent(requestsRes.value));
      }
      if (leaderboardRes.status === 'fulfilled') {
        setLeaderboard(getLeaderboardEntries(leaderboardRes.value));
      }
      if (connectionsRes.status === 'fulfilled') {
        setGithubConnections(getGithubConnections(connectionsRes.value));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load friends data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (api.isLoggedIn()) {
      setLoading(true);
      loadFriendsData();
    } else {
      setLoading(false);
    }
  }, [loadFriendsData]);

  // Fetch character name/avatar for leaderboard entries that don't have it (same as Dashboard uses)
  useEffect(() => {
    const needCharacter = leaderboard.filter((e) => e.user_id && !e.character_name);
    if (needCharacter.length === 0) return;

    const fetchCharacters = async () => {
      const results = await Promise.allSettled(
        needCharacter.map((e) => api.userAPI.getUserCharacter(e.user_id))
      );
      const byUserId: Record<number, { character_name: string; character_avatar_url?: string }> = {};
      results.forEach((res, i) => {
        if (res.status !== 'fulfilled' || !res.value) return;
        const data = res.value;
        const name = data?.character?.name ?? data?.name;
        const avatarUrl = data?.character?.avatar_url ?? data?.avatar_url;
        if (name && needCharacter[i]) {
          byUserId[needCharacter[i].user_id] = {
            character_name: name,
            character_avatar_url: avatarUrl,
          };
        }
      });
      setLeaderboard((prev) =>
        prev.map((entry) => {
          const fetched = byUserId[entry.user_id];
          if (fetched)
            return {
              ...entry,
              character_name: fetched.character_name,
              character_avatar_url: fetched.character_avatar_url,
            };
          return entry;
        })
      );
    };
    fetchCharacters();
  }, [leaderboard]);

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const data = await api.userAPI.searchUsers(q);
      setSearchResults(getSearchResults(data));
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (receiverId: number) => {
    setActionLoading((prev) => ({ ...prev, [`send-${receiverId}`]: true }));
    try {
      await api.friendsAPI.sendFriendRequest(receiverId);
      await loadFriendsData();
    } finally {
      setActionLoading((prev) => ({ ...prev, [`send-${receiverId}`]: false }));
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    setActionLoading((prev) => ({ ...prev, [`accept-${requestId}`]: true }));
    try {
      await api.friendsAPI.acceptFriendRequest(requestId);
      await loadFriendsData();
    } finally {
      setActionLoading((prev) => ({ ...prev, [`accept-${requestId}`]: false }));
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    setActionLoading((prev) => ({ ...prev, [`reject-${requestId}`]: true }));
    try {
      await api.friendsAPI.rejectFriendRequest(requestId);
      await loadFriendsData();
    } finally {
      setActionLoading((prev) => ({ ...prev, [`reject-${requestId}`]: false }));
    }
  };

  const handleRemoveFriend = async (friendId: number) => {
    setActionLoading((prev) => ({ ...prev, [`remove-${friendId}`]: true }));
    try {
      await api.friendsAPI.removeFriend(friendId);
      await loadFriendsData();
    } finally {
      setActionLoading((prev) => ({ ...prev, [`remove-${friendId}`]: false }));
    }
  };

  const friendIds = new Set(friends.map((f) => f.friend_id));
  const pendingSentIds = new Set(requestsSent.map((r) => r.receiver_id));

  if (userLoading || !api.isLoggedIn()) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="green.400" />
          <Text color="gray.300">Loading...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Heading size="lg" color="white">
          Friends
        </Heading>
        {error && (
          <Alert status="error" bg="#2d1b1b" borderColor="red.500">
            <AlertIcon />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs variant="enclosed" colorScheme="green">
          <TabList borderColor={borderColor}>
            <Tab color="gray.300">My Friends</Tab>
            <Tab color="gray.300">GitHub on CommitQuest</Tab>
            <Tab color="gray.300">Search</Tab>
            <Tab color="gray.300">Weekly Leaderboard</Tab>
          </TabList>
          <TabPanels>
            {/* My Friends */}
            <TabPanel>
              <VStack align="stretch" spacing={4}>
                {loading ? (
                  <Spinner color="green.400" />
                ) : (
                  <>
                    {requestsReceived.length > 0 && (
                      <Card bg={cardBg} border="1px" borderColor={borderColor}>
                        <CardHeader>
                          <Heading size="sm" color="white">
                            Pending requests
                          </Heading>
                        </CardHeader>
                        <CardBody pt={0}>
                          <VStack align="stretch" spacing={2}>
                            {requestsReceived.map((req) => (
                              <HStack key={req.id} justify="space-between" p={2} bg="#2a2a2a" borderRadius="md">
                                <HStack>
                                  <Avatar size="sm" src={req.sender?.avatar_url} name={req.sender?.github_username} />
                                  <Text color="white">{req.sender?.github_username}</Text>
                                </HStack>
                                <HStack>
                                  <Button
                                    size="sm"
                                    colorScheme="green"
                                    isLoading={actionLoading[`accept-${req.id}`]}
                                    onClick={() => handleAcceptRequest(req.id)}
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    isLoading={actionLoading[`reject-${req.id}`]}
                                    onClick={() => handleRejectRequest(req.id)}
                                  >
                                    Reject
                                  </Button>
                                </HStack>
                              </HStack>
                            ))}
                          </VStack>
                        </CardBody>
                      </Card>
                    )}
                    <Card bg={cardBg} border="1px" borderColor={borderColor}>
                      <CardHeader>
                        <Heading size="sm" color="white">
                          Friends {friends.length > 0 && `(${friends.length})`}
                        </Heading>
                      </CardHeader>
                      <CardBody pt={0}>
                        {friends.length === 0 ? (
                          <Text color="gray.400">No friends yet. Search for users to add friends.</Text>
                        ) : (
                          <Wrap spacing={3}>
                            {friends.map((f) => (
                              <WrapItem key={f.id}>
                                <Card size="sm" bg="#2a2a2a" border="1px" borderColor={borderColor}>
                                  <CardBody py={3} px={4}>
                                    <HStack spacing={3}>
                                      <Avatar size="md" src={f.friend?.avatar_url} name={f.friend?.github_username} />
                                      <VStack align="start" spacing={0}>
                                        <Text color="white" fontWeight="medium">
                                          {f.friend?.github_username}
                                        </Text>
                                        {typeof f.mutual_count === 'number' && f.mutual_count > 0 && (
                                          <Badge colorScheme="green" size="sm">
                                            {f.mutual_count} mutual
                                          </Badge>
                                        )}
                                        <Button
                                          size="xs"
                                          variant="ghost"
                                          colorScheme="red"
                                          isLoading={actionLoading[`remove-${f.friend_id}`]}
                                          onClick={() => handleRemoveFriend(f.friend_id)}
                                        >
                                          Remove
                                        </Button>
                                      </VStack>
                                    </HStack>
                                  </CardBody>
                                </Card>
                              </WrapItem>
                            ))}
                          </Wrap>
                        )}
                      </CardBody>
                    </Card>
                    {mutualFriends.length > 0 && (
                      <Card bg={cardBg} border="1px" borderColor={borderColor}>
                        <CardHeader>
                          <Heading size="sm" color="white">
                            Mutual friends
                          </Heading>
                          <Text fontSize="sm" color="gray.400">
                            Friends you have in common
                          </Text>
                        </CardHeader>
                        <CardBody pt={0}>
                          <Wrap spacing={3}>
                            {mutualFriends.map((f) => (
                              <WrapItem key={f.id}>
                                <HStack p={2} bg="#2a2a2a" borderRadius="md">
                                  <Avatar size="sm" src={f.friend?.avatar_url} name={f.friend?.github_username} />
                                  <Text color="white">{f.friend?.github_username}</Text>
                                </HStack>
                              </WrapItem>
                            ))}
                          </Wrap>
                        </CardBody>
                      </Card>
                    )}
                  </>
                )}
              </VStack>
            </TabPanel>

            {/* GitHub connections */}
            <TabPanel>
              <Card bg={cardBg} border="1px" borderColor={borderColor}>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Heading size="sm" color="white">
                      GitHub followers & following on CommitQuest
                    </Heading>
                    <Text color="gray.400" fontSize="sm">
                      People you follow or who follow you on GitHub and also use CommitQuest. The backend uses your
                      GitHub token to fetch followers/following and matches them with CommitQuest users.
                    </Text>
                    {loading ? (
                      <Spinner color="green.400" />
                    ) : githubConnections.length > 0 ? (
                      <Wrap spacing={3}>
                        {githubConnections.map((c) => (
                          <WrapItem key={c.user.id}>
                            <Card size="sm" bg="#2a2a2a" border="1px" borderColor={borderColor}>
                              <CardBody py={2} px={3}>
                                <HStack spacing={2}>
                                  <Avatar size="sm" src={c.user.avatar_url} name={c.user.github_username} />
                                  <VStack align="start" spacing={0}>
                                    <Text color="white" fontSize="sm">
                                      {c.user.github_username}
                                    </Text>
                                    <Badge size="sm" colorScheme="blue">
                                      {c.connection_type}
                                    </Badge>
                                  </VStack>
                                  {!friendIds.has(c.user.id) && !pendingSentIds.has(c.user.id) && (
                                    <Button
                                      size="xs"
                                      colorScheme="green"
                                      isLoading={actionLoading[`send-${c.user.id}`]}
                                      onClick={() => handleSendRequest(c.user.id)}
                                    >
                                      Add friend
                                    </Button>
                                  )}
                                </HStack>
                              </CardBody>
                            </Card>
                          </WrapItem>
                        ))}
                      </Wrap>
                    ) : (
                      <Alert status="info" bg="#1a2a2a" borderColor="green.500">
                        <AlertIcon />
                        <Box>
                          <AlertTitle color="white">No GitHub connections on CommitQuest</AlertTitle>
                        </Box>
                      </Alert>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Search */}
            <TabPanel>
              <Card bg={cardBg} border="1px" borderColor={borderColor}>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Search2Icon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        placeholder="Search by username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        bg="#2a2a2a"
                        borderColor={borderColor}
                        color="white"
                        _placeholder={{ color: 'gray.500' }}
                      />
                    </InputGroup>
                    <Button colorScheme="green" onClick={handleSearch} isLoading={searching}>
                      Search
                    </Button>
                    {searchResults.length > 0 && (
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                        {searchResults.map((u) => (
                          <HStack key={u.id} p={3} bg="#2a2a2a" borderRadius="md" justify="space-between">
                            <HStack>
                              <Avatar size="sm" src={u.avatar_url} name={u.github_username} />
                              <Text color="white">{u.github_username}</Text>
                            </HStack>
                            {u.id !== (currentUserData as any)?.id && (
                              <>
                                {friendIds.has(u.id) ? (
                                  <Badge colorScheme="green">Friends</Badge>
                                ) : pendingSentIds.has(u.id) ? (
                                  <Badge colorScheme="yellow">Request sent</Badge>
                                ) : (
                                  <Button
                                    size="sm"
                                    colorScheme="green"
                                    isLoading={actionLoading[`send-${u.id}`]}
                                    onClick={() => handleSendRequest(u.id)}
                                  >
                                    Add friend
                                  </Button>
                                )}
                              </>
                            )}
                          </HStack>
                        ))}
                      </SimpleGrid>
                    )}
                    {searchQuery.trim() && !searching && searchResults.length === 0 && (
                      <Text color="gray.400">No users found.</Text>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Weekly leaderboard */}
            <TabPanel>
              <Card bg={cardBg} border="1px" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="sm" color="white">
                    Most XP gained this week
                  </Heading>
                  <Text fontSize="sm" color="gray.400">
                    Top experience gainers in the last 7 days
                  </Text>
                </CardHeader>
                <CardBody pt={0}>
                  {loading ? (
                    <Spinner color="green.400" />
                  ) : leaderboard.length === 0 ? (
                    <Text color="gray.400">
                      No leaderboard data yet. The backend should support <code>metric=experience_gained</code> and{' '}
                      <code>timeframe=week</code> and aggregate from <code>user_stats</code> (sum experience_gained
                      where date &gt;= last 7 days).
                    </Text>
                  ) : (
                    <Table size="sm" variant="simple">
                      <Thead>
                        <Tr>
                          <Th color="gray.400">Rank</Th>
                          <Th color="gray.400">User</Th>
                          <Th color="gray.400" isNumeric>
                            XP (week)
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {leaderboard.map((entry) => (
                          <Tr key={entry.user_id}>
                            <Td color="white">#{entry.rank}</Td>
                            <Td>
                              <HStack spacing={2}>
                                <Avatar
                                  size="sm"
                                  src={entry.character_avatar_url ?? entry.avatar_url}
                                  name={entry.character_name ?? entry.github_username}
                                />
                                <VStack align="start" spacing={0}>
                                  <Text color="white" fontWeight="medium">
                                    {entry.character_name || entry.github_username}
                                  </Text>
                                  {entry.character_name && (
                                    <Text fontSize="xs" color="gray.500">
                                      @{entry.github_username}
                                    </Text>
                                  )}
                                </VStack>
                              </HStack>
                            </Td>
                            <Td color="green.400" isNumeric>
                              {entry.value?.toLocaleString() ?? entry.value}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
};

export default Friends;
