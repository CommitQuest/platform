import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Divider,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Image,
  Input,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { characterAPI } from '../services/api';
import { useUser } from '../contexts/UserContext';
import AvatarOptionPicker, { AvatarOption, sortAvatarOptions } from '../components/character/AvatarOptionPicker';

interface CharacterChoice {
  id: number;
  name: string;
  description?: string;
  base_stats?: Record<string, number | string>;
  avatar_url?: string;
  avatar_options?: AvatarOption[];
}

interface FieldErrors {
  name?: string;
  class_id?: string;
  species_id?: string;
  form?: string;
}

const NAME_PATTERN = /^[A-Za-z0-9\s'_-]+$/;

const formatStatName = (name: string) =>
  name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const extractChoices = (response: any, key: 'classes' | 'species'): CharacterChoice[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.[key])) return response[key];
  return [];
};

const ChoiceCard: React.FC<{
  choice: CharacterChoice;
  selected: boolean;
  type: 'class' | 'species';
  onSelect: () => void;
}> = ({ choice, selected, type, onSelect }) => {
  const borderColor = selected ? 'green.200' : 'green.500';
  const glow = selected ? '0 0 24px rgba(0, 255, 65, 0.28)' : 'none';
  const stats = Object.entries(choice.base_stats ?? {}).slice(0, 4);

  return (
    <Card
      as="button"
      type="button"
      onClick={onSelect}
      textAlign="left"
      bg={selected ? 'rgba(0, 255, 65, 0.1)' : 'commitQuest.surface'}
      border="2px"
      borderColor={borderColor}
      boxShadow={glow}
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-3px)', borderColor: 'green.200', boxShadow: '0 0 18px rgba(0, 255, 65, 0.18)' }}
      overflow="hidden"
      h="full"
    >
      <CardBody>
        <VStack align="start" spacing={4} h="full">
          <HStack justify="space-between" align="start" w="full">
            <VStack align="start" spacing={2}>
              <Badge colorScheme={selected ? 'green' : 'gray'}>{type}</Badge>
              <Heading size="md" color="green.400">
                {choice.name}
              </Heading>
            </VStack>
            {choice.avatar_url && (
              <Image
                src={choice.avatar_url}
                alt={choice.name}
                boxSize="64px"
                objectFit="cover"
                borderRadius="md"
                border="1px"
                borderColor="green.600"
              />
            )}
          </HStack>

          <Text color="green.200" fontSize="sm" flex="1">
            {choice.description || 'A mysterious path with secrets waiting to be discovered.'}
          </Text>

          {stats.length > 0 && (
            <SimpleGrid columns={2} spacing={2} w="full">
              {stats.map(([stat, value]) => (
                <Box key={stat} bg="commitQuest.panel" border="1px" borderColor="green.700" borderRadius="md" px={3} py={2}>
                  <Text color="green.600" fontSize="xs">
                    {formatStatName(stat)}
                  </Text>
                  <Text color="green.300" fontWeight="bold">
                    {value}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

const CharacterOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useUser();
  const cardBg = useColorModeValue('commitQuest.panel', 'commitQuest.panel');

  const [name, setName] = useState('');
  const [classes, setClasses] = useState<CharacterChoice[]>([]);
  const [species, setSpecies] = useState<CharacterChoice[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<number | null>(null);
  const [selectedAvatarOptionId, setSelectedAvatarOptionId] = useState<number | null>(null);
  const [loadingChoices, setLoadingChoices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    const loadChoices = async () => {
      try {
        setLoadingChoices(true);
        setErrors({});
        const [classesResponse, speciesResponse] = await Promise.all([
          characterAPI.getClasses(),
          characterAPI.getSpecies(),
        ]);

        const classChoices = extractChoices(classesResponse, 'classes');
        const speciesChoices = extractChoices(speciesResponse, 'species');
        setClasses(classChoices);
        setSpecies(speciesChoices);
        setSelectedClassId(classChoices[0]?.id ?? null);
        setSelectedSpeciesId(speciesChoices[0]?.id ?? null);
      } catch (err) {
        setErrors({
          form: err instanceof Error ? err.message : 'Failed to load character options',
        });
      } finally {
        setLoadingChoices(false);
      }
    };

    loadChoices();
  }, []);

  const selectedClass = useMemo(
    () => classes.find((choice) => choice.id === selectedClassId),
    [classes, selectedClassId]
  );
  const selectedSpecies = useMemo(
    () => species.find((choice) => choice.id === selectedSpeciesId),
    [species, selectedSpeciesId]
  );
  const selectedAvatarOptions = useMemo(
    () => sortAvatarOptions(selectedSpecies?.avatar_options ?? []),
    [selectedSpecies]
  );

  useEffect(() => {
    if (selectedAvatarOptions.length === 0) {
      setSelectedAvatarOptionId(null);
      return;
    }

    const selectedStillValid = selectedAvatarOptions.some((option) => option.id === selectedAvatarOptionId);
    if (!selectedStillValid) {
      setSelectedAvatarOptionId(selectedAvatarOptions[0].id);
    }
  }, [selectedAvatarOptionId, selectedAvatarOptions]);

  const validate = () => {
    const nextErrors: FieldErrors = {};
    const trimmedName = name.trim();

    if (!trimmedName) {
      nextErrors.name = 'Choose a name for your character.';
    } else if (!NAME_PATTERN.test(trimmedName)) {
      nextErrors.name = 'Use letters, numbers, spaces, apostrophes, underscores, or hyphens only.';
    }

    if (!selectedClassId) nextErrors.class_id = 'Choose a class.';
    if (!selectedSpeciesId) nextErrors.species_id = 'Choose a species.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !selectedClassId || !selectedSpeciesId) return;

    try {
      setSubmitting(true);
      setErrors({});

      await characterAPI.createCharacter({
        name: name.trim(),
        class_id: selectedClassId,
        species_id: selectedSpeciesId,
        ...(selectedAvatarOptions.length > 0 && selectedAvatarOptionId
          ? { avatar_option_id: selectedAvatarOptionId }
          : {}),
      });
      await refreshUser();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create character';
      setErrors({ form: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box minH="100vh" bg="commitQuest.background" py={{ base: 8, md: 12 }}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <VStack spacing={4} textAlign="center">
            <Badge colorScheme="green" px={3} py={1} borderRadius="full">
              First Quest
            </Badge>
            <Heading color="green.400" size={{ base: 'lg', md: 'xl' }}>
              Create Your CommitQuest Hero
            </Heading>
            <Text color="green.200" maxW="2xl">
              Every streak, pull request, and late-night bug hunt belongs to someone. Name your hero,
              pick their species, and choose the class that matches how you conquer code.
            </Text>
          </VStack>

          <Card bg={cardBg} border="2px" borderColor="green.400" boxShadow="0 0 30px rgba(0, 255, 65, 0.12)">
            <CardBody>
              <VStack spacing={8} align="stretch">
                {errors.form && (
                  <Alert status="error" bg="#2d1b1b" borderColor="red.500" borderRadius="md">
                    <AlertIcon />
                    <Text>{errors.form}</Text>
                  </Alert>
                )}

                <FormControl isInvalid={!!errors.name} isRequired>
                  <FormLabel color="green.400">Character Name</FormLabel>
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="My Goblin"
                    bg="commitQuest.surface"
                    borderColor="green.500"
                    color="green.100"
                    size="lg"
                    _placeholder={{ color: 'green.700' }}
                  />
                  {errors.name ? (
                    <FormErrorMessage>{errors.name}</FormErrorMessage>
                  ) : (
                    <FormHelperText color="green.700">
                      Letters, numbers, spaces, apostrophes, underscores, and hyphens are welcome.
                    </FormHelperText>
                  )}
                </FormControl>

                <Divider borderColor="green.800" />

                {loadingChoices ? (
                  <VStack py={12} spacing={4}>
                    <Spinner color="green.400" size="xl" />
                    <Text color="green.400">Summoning character options...</Text>
                  </VStack>
                ) : (
                  <>
                    <VStack align="stretch" spacing={4}>
                      <HStack justify="space-between" align="end">
                        <Box>
                          <Heading size="md" color="green.400">
                            Choose Species
                          </Heading>
                          <Text color="green.700" fontSize="sm">
                            Your origin shapes your story and starter stats.
                          </Text>
                        </Box>
                        {selectedSpecies && <Badge colorScheme="green">{selectedSpecies.name}</Badge>}
                      </HStack>
                      {errors.species_id && <Text color="red.300">{errors.species_id}</Text>}
                      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
                        {species.map((choice) => (
                          <ChoiceCard
                            key={choice.id}
                            choice={choice}
                            type="species"
                            selected={choice.id === selectedSpeciesId}
                            onSelect={() => setSelectedSpeciesId(choice.id)}
                          />
                        ))}
                      </SimpleGrid>
                    </VStack>

                    {selectedAvatarOptions.length > 0 && (
                      <>
                        <Divider borderColor="green.800" />

                        <VStack align="stretch" spacing={4}>
                          <Box>
                            <Heading size="md" color="green.400">
                              Choose Appearance
                            </Heading>
                            <Text color="green.700" fontSize="sm">
                              Pick the look for your selected species.
                            </Text>
                          </Box>
                          <AvatarOptionPicker
                            options={selectedAvatarOptions}
                            selectedId={selectedAvatarOptionId}
                            onSelect={setSelectedAvatarOptionId}
                          />
                        </VStack>
                      </>
                    )}

                    <Divider borderColor="green.800" />

                    <VStack align="stretch" spacing={4}>
                      <HStack justify="space-between" align="end">
                        <Box>
                          <Heading size="md" color="green.400">
                            Choose Class
                          </Heading>
                          <Text color="green.700" fontSize="sm">
                            Your class defines how your hero faces the repo wilderness.
                          </Text>
                        </Box>
                        {selectedClass && <Badge colorScheme="green">{selectedClass.name}</Badge>}
                      </HStack>
                      {errors.class_id && <Text color="red.300">{errors.class_id}</Text>}
                      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
                        {classes.map((choice) => (
                          <ChoiceCard
                            key={choice.id}
                            choice={choice}
                            type="class"
                            selected={choice.id === selectedClassId}
                            onSelect={() => setSelectedClassId(choice.id)}
                          />
                        ))}
                      </SimpleGrid>
                    </VStack>
                  </>
                )}

                <HStack justify="space-between" align={{ base: 'stretch', md: 'center' }} flexDirection={{ base: 'column', md: 'row' }}>
                  <Text color="green.700" fontSize="sm">
                    You can tune your character later from the dashboard.
                  </Text>
                  <Button
                    colorScheme="green"
                    size="lg"
                    onClick={handleSubmit}
                    isLoading={submitting}
                    loadingText="Creating"
                    isDisabled={loadingChoices || classes.length === 0 || species.length === 0}
                  >
                    Start My Quest
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default CharacterOnboarding;
