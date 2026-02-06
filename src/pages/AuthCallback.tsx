import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
} from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setError(error);
      return;
    }

    if (token) {
      localStorage.setItem('commitquest_token', token);
      localStorage.setItem('commitquest_logged_in', 'true');
      setStatus('success');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } else {
      setStatus('error');
      setError('No authentication token received');
    }
  }, [searchParams, navigate]);

  const handleRetry = () => {
    navigate('/login');
  };

  if (status === 'loading') {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="#121212">
        <Container maxW="md">
          <VStack spacing={6}>
            <Spinner size="xl" color="green.400" />
            <Heading size="lg" color="green.400">
              Completing Login...
            </Heading>
            <Text color="gray.300" textAlign="center">
              Please wait while we complete your authentication.
            </Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (status === 'error') {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="#121212">
        <Container maxW="md">
          <VStack spacing={6}>
            <Alert status="error" bg="#2d1b1b" borderColor="red.500">
              <AlertIcon />
              <Box>
                <AlertTitle>Authentication Failed</AlertTitle>
                <AlertDescription>
                  {error === 'access_denied' && 'You denied access to your GitHub account.'}
                  {error === 'no_code' && 'No authorization code received from GitHub.'}
                  {error === 'token_exchange_failed' && 'Failed to exchange authorization code for token.'}
                  {error === 'no_access_token' && 'No access token received from GitHub.'}
                  {error === 'database_error' && 'Failed to save user data to database.'}
                  {error === 'session_error' && 'Failed to create user session.'}
                  {error === 'callback_failed' && 'OAuth callback processing failed.'}
                  {!['access_denied', 'no_code', 'token_exchange_failed', 'no_access_token', 'database_error', 'session_error', 'callback_failed'].includes(error) && 
                    `Authentication error: ${error}`}
                </AlertDescription>
              </Box>
            </Alert>
            <Button colorScheme="green" onClick={handleRetry}>
              Try Again
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="#121212">
      <Container maxW="md">
        <VStack spacing={6}>
          <Alert status="success" bg="#1a2a2a" borderColor="green.500">
            <AlertIcon />
            <Box>
              <AlertTitle>Login Successful!</AlertTitle>
              <AlertDescription>
                You have been successfully authenticated. Redirecting to dashboard...
              </AlertDescription>
            </Box>
          </Alert>
          <Spinner size="md" color="green.400" />
        </VStack>
      </Container>
    </Box>
  );
};

export default AuthCallback; 