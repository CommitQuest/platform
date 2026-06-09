import React from 'react';
import {
  Box,
  Container,
  Text,
  Link,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';

const Footer: React.FC = () => {
  const bgColor = useColorModeValue('commitQuest.background', 'commitQuest.background');
  const borderColor = useColorModeValue('green.400', 'green.400');

  return (
    <Box
      as="footer"
      bg={bgColor}
      borderTop="2px"
      borderColor={borderColor}
      py={6}
      mt="auto"
      position="relative"
      zIndex={5}
    >
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <Text fontSize="sm" color="green.400">
            © 2026 CommitQuest. Thank you to everyone along the way!
          </Text>
          
          <Flex gap={6} fontSize="sm">
            <Link 
              href="https://github.com" 
              isExternal 
              color="green.400" 
              _hover={{ color: 'green.300', textDecoration: 'underline' }}
              transition="color 0.2s"
            >
              GitHub
            </Link>
            <Link 
              href="https://discord.gg/XuKJJBAuKH" 
              isExternal 
              color="green.400" 
              _hover={{ color: 'green.300', textDecoration: 'underline' }}
              transition="color 0.2s"
            >
              Support
            </Link>
          </Flex>
        </Flex>
        <Box borderTop="1px solid" borderColor="green.800" mt={4} pt={4}>
          <Text fontSize="xs" color="green.500" textAlign={{ base: 'center', md: 'left' }}>
            Character art from{' '}
            <Link
              href="https://krishna-palacio.itch.io/"
              isExternal
              color="green.400"
              _hover={{ color: 'green.300', textDecoration: 'underline' }}
            >
              Krishna Palacio&apos;s Minifantasy series
            </Link>
            .
          </Text>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 