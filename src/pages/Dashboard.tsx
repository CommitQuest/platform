import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  GridItem,
  VStack,
  HStack,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  Badge,
  Progress,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useDisclosure,
} from '@chakra-ui/react';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { assetsAPI, characterAPI } from '../services/api';
import AvatarOptionPicker, { AvatarOption, sortAvatarOptions } from '../components/character/AvatarOptionPicker';
import AvatarScene from '../components/character/AvatarScene';
import { UserInventory } from '../types';

interface ClassOption {
  id: number;
  name: string;
  description?: string;
}

interface SpeciesOption {
  id: number;
  name: string;
  description?: string;
  avatar_options?: AvatarOption[];
}

const resolveAvatarOptionId = (options: AvatarOption[], preferredId?: number | null) => {
  const sortedOptions = sortAvatarOptions(options);
  if (sortedOptions.length === 0) return null;
  if (preferredId && sortedOptions.some((option) => option.id === preferredId)) return preferredId;
  return sortedOptions[0].id;
};

const getInventoryItem = (inventoryItem: UserInventory) => inventoryItem.items ?? inventoryItem.item ?? inventoryItem;
const isVisualEquippedItem = (inventoryItem: UserInventory) =>
  inventoryItem.equipped === true &&
  (getInventoryItem(inventoryItem).has_visual ?? inventoryItem.has_visual) === true &&
  !!(getInventoryItem(inventoryItem).asset_variant ?? inventoryItem.asset_variant);

const Dashboard: React.FC = () => {
  const { user, background, loading, error, refreshUser } = useUser();
  const navigate = useNavigate();
  const cardBg = useColorModeValue('commitQuest.panel', 'commitQuest.panel');
  const borderColor = useColorModeValue('green.400', 'green.400');

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editName, setEditName] = useState('');
  const [editClassId, setEditClassId] = useState<string>('');
  const [editSpeciesId, setEditSpeciesId] = useState<string>('');
  const [editAvatarOptionId, setEditAvatarOptionId] = useState<number | null>(null);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [species, setSpecies] = useState<SpeciesOption[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [equippedVisualItems, setEquippedVisualItems] = useState<UserInventory[]>([]);
  const selectedEditSpecies = useMemo(
    () => species.find((sp) => sp.id.toString() === editSpeciesId),
    [species, editSpeciesId]
  );
  const selectedEditAvatarOptions = useMemo(
    () => sortAvatarOptions(selectedEditSpecies?.avatar_options ?? []),
    [selectedEditSpecies]
  );

  // When edit modal opens, populate form and fetch class/species options
  useEffect(() => {
    if (!isOpen || !user?.character) return;
    const c = user.character;
    setEditName(c.name);
    setEditClassId(c.classes?.id?.toString() ?? '');
    setEditSpeciesId(c.species?.id?.toString() ?? '');
    setEditAvatarOptionId(c.avatar_option_id ?? null);
    setEditError(null);
    (async () => {
      try {
        const [classesRes, speciesRes] = await Promise.all([
          characterAPI.getClasses(),
          characterAPI.getSpecies(),
        ]);
        const speciesOptions = speciesRes.species ?? [];
        const currentSpecies = speciesOptions.find((sp: SpeciesOption) => sp.id === c.species?.id);
        setClasses(classesRes.classes ?? []);
        setSpecies(speciesOptions);
        setEditAvatarOptionId(resolveAvatarOptionId(currentSpecies?.avatar_options ?? [], c.avatar_option_id));
      } catch {
        setEditError('Failed to load options');
      }
    })();
  }, [isOpen, user?.character]);

  useEffect(() => {
    const fetchEquippedVisualItems = async () => {
      if (!user?.character) {
        setEquippedVisualItems([]);
        return;
      }

      try {
        const response = await assetsAPI.getUserInventory();
        const inventory: UserInventory[] = response.items ?? response.inventory ?? [];
        setEquippedVisualItems(inventory.filter(isVisualEquippedItem));
      } catch (err) {
        console.error('Failed to load equipped visual items:', err);
        setEquippedVisualItems([]);
      }
    };

    fetchEquippedVisualItems();
  }, [user?.character]);

  const handleSaveCharacter = async () => {
    if (!editName.trim()) {
      setEditError('Character name is required');
      return;
    }
    setEditLoading(true);
    setEditError(null);
    try {
      await characterAPI.updateCharacter({
        name: editName.trim(),
        class_id: editClassId ? parseInt(editClassId, 10) : undefined,
        species_id: editSpeciesId ? parseInt(editSpeciesId, 10) : undefined,
        ...(selectedEditAvatarOptions.length > 0 && editAvatarOptionId
          ? { avatar_option_id: editAvatarOptionId }
          : {}),
      });
      await refreshUser();
      onClose();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update character');
    } finally {
      setEditLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="green.400" />
          <Text color="green.400">Loading your character data...</Text>
        </VStack>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box>
        <Alert status="error" mb={4} bg="#2d1b1b" borderColor="red.500">
          <AlertIcon />
          <Text>Failed to load character data: {error}</Text>
        </Alert>
      </Box>
    );
  }

  // Show no user state
  if (!user) {
    return (
      <Box>
        <Alert status="info" mb={4} bg="commitQuest.panel" borderColor="green.500">
          <AlertIcon />
          <Text>Please log in to view your character dashboard.</Text>
        </Alert>
      </Box>
    );
  }

  // Extract character data from user
  const character = user.character;
  if (!character) {
    return (
      <Box>
        <Alert status="warning" mb={4} bg="#2a2a1a" borderColor="yellow.500">
          <AlertIcon />
          <Text>No character found. Please create a character first.</Text>
        </Alert>
      </Box>
    );
  }

  // Calculate XP progress
  const xpProgress = user.levelProgress ? user.levelProgress.progress : 0;
  const currentXP = user.levelProgress ? user.levelProgress.expInCurrentLevel : 0;
  const xpNeeded = user.levelProgress ? user.levelProgress.expNeededForNextLevel : 0;

  return (
    <Box>
      <VStack spacing={8} align="stretch">
        {/* Character Overview with Avatar and Background */}
        <HStack spacing={6} align="start">
          {/* Large Avatar Box with Background Scene */}
          <Box
            borderRadius="md"
            border="2px"
            borderColor="green.500"
            maxW="240px"
            maxH="240px"
            minW="240px"
            minH="240px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            position="relative"
            overflow="hidden"
          >
            <AvatarScene
              background={background}
              character={character}
              equippedItems={equippedVisualItems}
              spriteOffsetY={40}
            />
          </Box>

          {/* Character Card */}
          <Card bg={cardBg} border="2px" borderColor={borderColor} flex="1">
            <CardBody>
              <VStack align="start" spacing={4}>
                <HStack justify="space-between" w="full">
                  <HStack>
                    <Heading size="lg" color="green.400">{character.name}</Heading>
                    <Badge colorScheme="green" fontSize="md">
                      Level {user.level}
                    </Badge>
                  </HStack>
                  <Button 
                    size="sm" 
                    colorScheme="green" 
                    variant="outline"
                    onClick={() => navigate('/character')}
                  >
                    View Inventory
                  </Button>
                </HStack>
                <Text color="green.400">
                  {character.species?.name || 'Unknown'} {character.classes?.name || 'Unknown'}
                </Text>
                <VStack align="start" spacing={1} w="full">
                  <Text fontSize="sm" color="green.400">
                    Experience: {currentXP} / {xpNeeded}
                  </Text>
                  <Progress 
                    value={xpProgress} 
                    colorScheme="green" 
                    size="sm" 
                    w="full"
                    bg="commitQuest.surface"
                  />
                </VStack>
                <Stat>
                  <StatLabel color="green.400">Gold</StatLabel>
                  <StatNumber color="yellow.400">{user.gold || 0}</StatNumber>
                </Stat>
              </VStack>
            </CardBody>
          </Card>
        </HStack>

        {/* Stats Grid */}
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={6}>
          <GridItem>
            <Card bg={cardBg} border="2px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel color="green.400">Total Commits</StatLabel>
                  <StatNumber color="green.400">{user.totalCommits}</StatNumber>
                  <StatHelpText color="green.400">All time</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card bg={cardBg} border="2px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel color="green.400">Current Streak</StatLabel>
                  <StatNumber color="green.400">{user.streakCount}</StatNumber>
                  <StatHelpText color="green.400">Days</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card bg={cardBg} border="2px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel color="green.400">Experience Gained</StatLabel>
                  <StatNumber color="green.400">{user.experienceGained}</StatNumber>
                  <StatHelpText color="green.400">Total XP</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card bg={cardBg} border="2px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel color="green.400">Achievements</StatLabel>
                  <StatNumber color="green.400">{user.achievements.length}</StatNumber>
                  <StatHelpText color="green.400">Earned</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Recent Activity and Achievements */}
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
          <GridItem>
            <Card bg={cardBg} border="2px" borderColor={borderColor}>
              <CardBody>
                <VStack align="start" spacing={4}>
                  <Heading size="md" color="green.400">Achievements</Heading>
                  <VStack align="start" spacing={3} w="full" maxH="250px" overflowY="auto">
                    {user.achievements.map((achievement) => (
                      <Box key={achievement.id} w="full" p={3} bg="commitQuest.surface" borderRadius="md" border="2px" borderColor="green.500">
                        <Text fontWeight="bold" color="green.400">{achievement.name}</Text>
                        <Text fontSize="sm" color="green.400">{achievement.description}</Text>
                        <Text fontSize="xs" color="green.400">{achievement.type}</Text>
                      </Box>
                    ))}
                    {user.achievements.length === 0 && (
                      <Text color="green.400" fontSize="sm">No achievements earned yet. Keep coding to earn your first achievement!</Text>
                    )}
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card bg={cardBg} border="2px" borderColor={borderColor}>
              <CardBody>
                <VStack align="start" spacing={4}>
                  <Heading size="md" color="green.400">Character Info</Heading>
                  <VStack align="start" spacing={3} w="full">
                    <Box w="full" p={3} bg="commitQuest.surface" borderRadius="md" border="2px" borderColor="green.400">
                      <Text fontWeight="bold" color="green.400">Class</Text>
                      <Text fontSize="sm" color="green.400">{character.classes?.name || 'Unknown'}</Text>
                      <Text fontSize="xs" color="green.400">{character.classes?.description || ''}</Text>
                    </Box>
                    <Box w="full" p={3} bg="commitQuest.surface" borderRadius="md" border="2px" borderColor="green.400">
                      <Text fontWeight="bold" color="green.400">Species</Text>
                      <Text fontSize="sm" color="green.400">{character.species?.name || 'Unknown'}</Text>
                      <Text fontSize="xs" color="green.400">{character.species?.description || ''}</Text>
                    </Box>
                    <Button
                      w="full"
                      colorScheme="green"
                      variant="outline"
                      onClick={onOpen}
                    >
                      Edit Character
                    </Button>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
        <ModalOverlay bg="blackAlpha.700" />
        <ModalContent bg={cardBg} border="2px" borderColor={borderColor}>
          <ModalHeader color="green.400">Edit Character</ModalHeader>
          <ModalCloseButton color="green.400" />
          <ModalBody>
            <VStack spacing={4}>
              {editError && (
                <Alert status="error" w="full" size="sm" bg="#2d1b1b" borderColor="red.500">
                  <AlertIcon />
                  <Text fontSize="sm">{editError}</Text>
                </Alert>
              )}
              <FormControl>
                <FormLabel color="green.400">Character name</FormLabel>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Character name"
                  bg="commitQuest.surface"
                  borderColor="green.400"
                  color="green.400"
                  _placeholder={{ color: 'green.700' }}
                />
              </FormControl>
              <FormControl>
                <FormLabel color="green.400">Class</FormLabel>
                <Select
                  value={editClassId}
                  onChange={(e) => setEditClassId(e.target.value)}
                  bg="commitQuest.surface"
                  borderColor="green.400"
                  color="green.400"
                  placeholder="Select class"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel color="green.400">Species</FormLabel>
                <Select
                  value={editSpeciesId}
                  onChange={(e) => {
                    const nextSpeciesId = e.target.value;
                    const nextSpecies = species.find((sp) => sp.id.toString() === nextSpeciesId);
                    setEditSpeciesId(nextSpeciesId);
                    setEditAvatarOptionId(resolveAvatarOptionId(nextSpecies?.avatar_options ?? [], editAvatarOptionId));
                  }}
                  bg="commitQuest.surface"
                  borderColor="green.400"
                  color="green.400"
                  placeholder="Select species"
                >
                  {species.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              {selectedEditAvatarOptions.length > 0 && (
                <FormControl>
                  <FormLabel color="green.400">Appearance</FormLabel>
                  <AvatarOptionPicker
                    options={selectedEditAvatarOptions}
                    selectedId={editAvatarOptionId}
                    onSelect={setEditAvatarOptionId}
                    imageScale={1.45}
                  />
                </FormControl>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor="green.400">
            <Button variant="ghost" colorScheme="gray" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleSaveCharacter}
              isLoading={editLoading}
              loadingText="Saving"
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Dashboard; 