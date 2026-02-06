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
import { getBackendUrl } from '../services/api';

const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const DEFAULT_SCOPE = 'read:user user:email';

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
    const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
    // Direct to GitHub OAuth so the user never hits the backend URL (avoids "dangerous site" / stuck on Heroku)
    if (clientId && clientId.trim()) {
      const backendUrl = getBackendUrl();
      const redirectUri = `${backendUrl}/api/auth/web/callback`;
      const returnUrl = typeof window !== 'undefined' ? `${window.location.origin}/web/auth/callback` : '';
      const state = btoa(JSON.stringify({ r: returnUrl, n: Math.random().toString(36).slice(2) }));
      const params = new URLSearchParams({
        client_id: clientId.trim(),
        redirect_uri: redirectUri,
        scope: process.env.REACT_APP_GITHUB_SCOPE?.trim() || DEFAULT_SCOPE,
        state,
      });
      window.location.href = `${GITHUB_AUTH_URL}?${params.toString()}`;
      return;
    }
    // Fallback: backend starts the flow. Tell backend where to send the user after login (so you land on localhost:3000, not Heroku).
    const returnTo = typeof window !== 'undefined' ? `${window.location.origin}/web/auth/callback` : '';
    const params = new URLSearchParams();
    if (returnTo) params.set('return_to', returnTo);
    const query = params.toString();
    window.location.href = `${getBackendUrl()}/api/auth/web/github${query ? `?${query}` : ''}`;
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