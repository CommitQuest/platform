import React from 'react';
import { ChakraProvider, Box, Spinner, Text, VStack } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Character from './pages/Character';
import Friends from './pages/Friends';
import Shop from './pages/Shop';
import Downloads from './pages/Downloads';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import CharacterOnboarding from './pages/CharacterOnboarding';
import { isLoggedIn } from './services/api';
import theme from './theme';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const LoadingScreen: React.FC = () => (
  <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="commitQuest.background">
    <VStack spacing={4}>
      <Spinner size="xl" color="green.400" />
      <Text color="green.400">Checking your adventure log...</Text>
    </VStack>
  </Box>
);

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { loading, needsCharacter } = useUser();

  if (loading) return <LoadingScreen />;
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (needsCharacter) return <Navigate to="/onboarding/character" replace />;

  return <Layout>{children}</Layout>;
};

const CharacterOnboardingRoute: React.FC = () => {
  const { loading, session, needsCharacter } = useUser();

  if (loading) return <LoadingScreen />;
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (session && !needsCharacter) return <Navigate to="/dashboard" replace />;

  return <CharacterOnboarding />;
};

function App() {
  return (
    <ChakraProvider theme={theme}>
      <UserProvider>
        <Router>
          <Box minH="100vh">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/web/auth/callback" element={<AuthCallback />} />
              <Route path="/onboarding/character" element={<CharacterOnboardingRoute />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/character" element={
                <ProtectedRoute>
                  <Character />
                </ProtectedRoute>
              } />
              <Route path="/friends" element={
                <ProtectedRoute>
                  <Friends />
                </ProtectedRoute>
              } />
              <Route path="/shop" element={
                <ProtectedRoute>
                  <Shop />
                </ProtectedRoute>
              } />
              <Route path="/downloads" element={
                <Layout>
                  <Downloads />
                </Layout>
              } />
            </Routes>
          </Box>
        </Router>
      </UserProvider>
    </ChakraProvider>
  );
}

export default App;
