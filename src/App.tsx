import React from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Character from './pages/Character';
import Friends from './pages/Friends';
import Shop from './pages/Shop';
import Downloads from './pages/Downloads';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import theme from './theme';

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
              <Route path="/dashboard" element={
                <Layout>
                  <Dashboard />
                </Layout>
              } />
              <Route path="/character" element={
                <Layout>
                  <Character />
                </Layout>
              } />
              <Route path="/friends" element={
                <Layout>
                  <Friends />
                </Layout>
              } />
              <Route path="/shop" element={
                <Layout>
                  <Shop />
                </Layout>
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
