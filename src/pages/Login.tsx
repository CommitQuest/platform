import React from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaGithub } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'You denied access to your GitHub account.',
  no_code: 'No authorization code received from GitHub.',
  token_exchange_failed: 'Failed to exchange authorization code for token.',
  no_access_token: 'No access token received from GitHub.',
  database_error: 'Failed to save user data.',
  session_error: 'Failed to create session.',
  callback_failed: 'OAuth callback processing failed.',
};

const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const errorParam = searchParams.get('error');
  const bgColor = useColorModeValue('#121212', '#121212');
  const cardBg = useColorModeValue('#1e1e1e', '#1e1e1e');

  const errorMessage = errorParam ? (ERROR_MESSAGES[errorParam] ?? `Authentication error: ${errorParam}`) : null;

  const handleGitHubLogin = () => {
    // Use local backend when running on localhost (local dev)
    const backendUrl =
      typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : (process.env.REACT_APP_API_URL || 'https://commit-quest-app-3914e1ae3b5a.herokuapp.com');

    window.location.href = `${backendUrl}/api/auth/web/github`;
  };

  return (
    <Box bg={bgColor} minH="100vh" display="flex" alignItems="center">
      <Container maxW="md">
        <VStack spacing={8}>
          <VStack spacing={4} textAlign="center">
            <Heading size="xl" color="green.400">
              Welcome to CommitQuest
            </Heading>
            <Text color="gray.300">
              Sign in with your GitHub account to start your coding adventure!
            </Text>
          </VStack>

          <Card w="full" bg={cardBg} border="1px" borderColor="#333333">
            <CardBody>
              <VStack spacing={6}>
                {errorMessage && (
                  <Alert status="error" bg="#2d1b1b" borderColor="red.500" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Sign-in failed</AlertTitle>
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Box>
                  </Alert>
                )}
                <Button
                  size="lg"
                  colorScheme="green"
                  onClick={handleGitHubLogin}
                  w="full"
                >
                  <Box as={FaGithub as any} mr={2} />
                  Continue with GitHub
                </Button>
                
                <Text fontSize="sm" color="gray.400" textAlign="center">
                  By signing in, you agree to our Terms of Service and Privacy Policy.
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Text fontSize="sm" color="gray.400">
            Don't have an account? Your GitHub account will be created automatically.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default Login; 