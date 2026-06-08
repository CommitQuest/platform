import React from 'react';
import { Box, Container } from '@chakra-ui/react';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg="commitQuest.background">
      <Header />
      <Navigation />
      <Box flex="1" py={8}>
        <Container maxW="container.xl">
          {children}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout; 