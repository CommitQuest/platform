import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('#121212', '#121212');
  const textColor = useColorModeValue('gray.300', 'gray.300');

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="container.xl" py={20}>
        <VStack spacing={12} textAlign="center">
          {/* Hero Section */}
          <VStack spacing={8}>
            <Heading
              size="2xl"
              bgGradient="linear(to-r, green.400, green.300)"
              bgClip="text"
              fontWeight="extrabold"
            >
              CommitQuest
            </Heading>
            <Text fontSize="xl" color={textColor} maxW="2xl">
              Transform your coding journey into an epic adventure! Level up your character 
              with every commit, earn achievements, and compete with friends in this 
              GitHub-powered RPG experience.
            </Text>
            <HStack spacing={4}>
              <Button
                size="lg"
                colorScheme="green"
                onClick={() => navigate('/login')}
              >
                Start Your Adventure
              </Button>
              <Button
                size="lg"
                variant="outline"
                colorScheme="green"
                onClick={() => navigate('/dashboard')}
              >
                View Demo
              </Button>
            </HStack>
          </VStack>

          {/* Features Section */}
          <VStack spacing={8} w="full">
            <Heading size="lg" color="green.400">
              Features
            </Heading>
            <HStack spacing={8} flexWrap="wrap" justify="center">
              <VStack
                bg="#1e1e1e"
                p={6}
                borderRadius="lg"
                maxW="300px"
                textAlign="center"
                border="1px"
                borderColor="#333333"
              >
                <Text fontSize="lg" fontWeight="bold" color="green.400">
                  🎮 RPG Character
                </Text>
                <Text color={textColor}>
                  Create and customize your character with unique classes, species, and equipment.
                </Text>
              </VStack>
              
              <VStack
                bg="#1e1e1e"
                p={6}
                borderRadius="lg"
                maxW="300px"
                textAlign="center"
                border="1px"
                borderColor="#333333"
              >
                <Text fontSize="lg" fontWeight="bold" color="green.400">
                  🏆 Achievements
                </Text>
                <Text color={textColor}>
                  Earn badges and achievements for your coding milestones and contributions.
                </Text>
              </VStack>
              
              <VStack
                bg="#1e1e1e"
                p={6}
                borderRadius="lg"
                maxW="300px"
                textAlign="center"
                border="1px"
                borderColor="#333333"
              >
                <Text fontSize="lg" fontWeight="bold" color="green.400">
                  👥 Social Features
                </Text>
                <Text color={textColor}>
                  Connect with friends, view leaderboards, and compete in challenges.
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default LandingPage; 