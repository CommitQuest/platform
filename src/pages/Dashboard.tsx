import React, { useState, useEffect } from 'react';
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
  Image,
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
import { characterAPI } from '../services/api';
import { generateBackgroundLayers, generateForegroundLayers } from '../utils/backgroundLayers';

interface ClassOption {
  id: number;
  name: string;
  description?: string;
}

interface SpeciesOption {
  id: number;
  name: string;
  description?: string;
}

const Dashboard: React.FC = () => {
  const { user, background, loading, error, refreshUser } = useUser();
  const navigate = useNavigate();
  const cardBg = useColorModeValue('#1e1e1e', '#1e1e1e');
  const borderColor = useColorModeValue('#333333', '#333333');

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editName, setEditName] = useState('');
  const [editClassId, setEditClassId] = useState<string>('');
  const [editSpeciesId, setEditSpeciesId] = useState<string>('');
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [species, setSpecies] = useState<SpeciesOption[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // When edit modal opens, populate form and fetch class/species options
  useEffect(() => {
    if (!isOpen || !user?.character) return;
    const c = user.character;
    setEditName(c.name);
    setEditClassId(c.classes?.id?.toString() ?? '');
    setEditSpeciesId(c.species?.id?.toString() ?? '');
    setEditError(null);
    (async () => {
      try {
        const [classesRes, speciesRes] = await Promise.all([
          characterAPI.getClasses(),
          characterAPI.getSpecies(),
        ]);
        setClasses(classesRes.classes ?? []);
        setSpecies(speciesRes.species ?? []);
      } catch {
        setEditError('Failed to load options');
      }
    })();
  }, [isOpen, user?.character]);

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
          <Text color="gray.300">Loading your character data...</Text>
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
        <Alert status="info" mb={4} bg="#1a2a2a" borderColor="green.500">
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
            {generateBackgroundLayers(background)}
            <Image
              zIndex={10}
              src={character.avatar_url}
              alt="Avatar"
              position="relative"
              style={{ top: '40px' }}
            />
            {generateForegroundLayers(background)}
          </Box>

          {/* Character Card */}
          <Card bg={cardBg} border="1px" borderColor={borderColor} flex="1">
            <CardBody>
              <VStack align="start" spacing={4}>
                <HStack justify="space-between" w="full">
                  <HStack>
                    <Heading size="lg" color="white">{character.name}</Heading>
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
                <Text color="gray.300">
                  {character.species?.name || 'Unknown'} {character.classes?.name || 'Unknown'}
                </Text>
                <VStack align="start" spacing={1} w="full">
                  <Text fontSize="sm" color="gray.400">
                    Experience: {currentXP} / {xpNeeded}
                  </Text>
                  <Progress 
                    value={xpProgress} 
                    colorScheme="green" 
                    size="sm" 
                    w="full"
                    bg="gray.700"
                  />
                </VStack>
                <Stat>
                  <StatLabel color="gray.300">Gold</StatLabel>
                  <StatNumber color="yellow.400">{user.gold || 0}</StatNumber>
                </Stat>
              </VStack>
            </CardBody>
          </Card>
        </HStack>

        {/* Stats Grid */}
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={6}>
          <GridItem>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel color="gray.300">Total Commits</StatLabel>
                  <StatNumber color="white">{user.totalCommits}</StatNumber>
                  <StatHelpText color="gray.400">All time</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel color="gray.300">Current Streak</StatLabel>
                  <StatNumber color="green.400">{user.streakCount}</StatNumber>
                  <StatHelpText color="gray.400">Days</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel color="gray.300">Experience Gained</StatLabel>
                  <StatNumber color="blue.400">{user.experienceGained}</StatNumber>
                  <StatHelpText color="gray.400">Total XP</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel color="gray.300">Achievements</StatLabel>
                  <StatNumber color="white">{user.achievements.length}</StatNumber>
                  <StatHelpText color="gray.400">Earned</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Recent Activity and Achievements */}
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
          <GridItem>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <VStack align="start" spacing={4}>
                  <Heading size="md" color="white">Achievements</Heading>
                  <VStack align="start" spacing={3} w="full" maxH="250px" overflowY="auto">
                    {user.achievements.map((achievement) => (
                      <Box key={achievement.id} w="full" p={3} bg="#2a2a2a" borderRadius="md" border="1px" borderColor="green.500">
                        <Text fontWeight="bold" color="green.400">{achievement.name}</Text>
                        <Text fontSize="sm" color="gray.300">{achievement.description}</Text>
                        <Text fontSize="xs" color="gray.400">{achievement.type}</Text>
                      </Box>
                    ))}
                    {user.achievements.length === 0 && (
                      <Text color="gray.400" fontSize="sm">No achievements earned yet. Keep coding to earn your first achievement!</Text>
                    )}
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <VStack align="start" spacing={4}>
                  <Heading size="md" color="white">Character Info</Heading>
                  <VStack align="start" spacing={3} w="full">
                    <Box w="full" p={3} bg="#2a2a2a" borderRadius="md" border="1px" borderColor="gray.600">
                      <Text fontWeight="bold" color="white">Class</Text>
                      <Text fontSize="sm" color="gray.300">{character.classes?.name || 'Unknown'}</Text>
                      <Text fontSize="xs" color="gray.400">{character.classes?.description || ''}</Text>
                    </Box>
                    <Box w="full" p={3} bg="#2a2a2a" borderRadius="md" border="1px" borderColor="gray.600">
                      <Text fontWeight="bold" color="white">Species</Text>
                      <Text fontSize="sm" color="gray.300">{character.species?.name || 'Unknown'}</Text>
                      <Text fontSize="xs" color="gray.400">{character.species?.description || ''}</Text>
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
        <ModalContent bg={cardBg} border="1px" borderColor={borderColor}>
          <ModalHeader color="white">Edit Character</ModalHeader>
          <ModalCloseButton color="gray.400" />
          <ModalBody>
            <VStack spacing={4}>
              {editError && (
                <Alert status="error" w="full" size="sm" bg="#2d1b1b" borderColor="red.500">
                  <AlertIcon />
                  <Text fontSize="sm">{editError}</Text>
                </Alert>
              )}
              <FormControl>
                <FormLabel color="gray.300">Character name</FormLabel>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Character name"
                  bg="#2a2a2a"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.500' }}
                />
              </FormControl>
              <FormControl>
                <FormLabel color="gray.300">Class</FormLabel>
                <Select
                  value={editClassId}
                  onChange={(e) => setEditClassId(e.target.value)}
                  bg="#2a2a2a"
                  borderColor="gray.600"
                  color="white"
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
                <FormLabel color="gray.300">Species</FormLabel>
                <Select
                  value={editSpeciesId}
                  onChange={(e) => setEditSpeciesId(e.target.value)}
                  bg="#2a2a2a"
                  borderColor="gray.600"
                  color="white"
                  placeholder="Select species"
                >
                  {species.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor="gray.700">
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