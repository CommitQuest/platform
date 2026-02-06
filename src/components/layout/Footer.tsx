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
  const bgColor = useColorModeValue('#1e1e1e', '#1e1e1e');
  const borderColor = useColorModeValue('#333333', '#333333');

  return (
    <Box
      as="footer"
      bg={bgColor}
      borderTop="1px"
      borderColor={borderColor}
      py={6}
      mt="auto"
      position="relative"
      zIndex={5}
    >
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <Text fontSize="sm" color="gray.400">
            © 2025 CommitQuest. Thank you to Adam and everyone else along the way!
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
              href="/support" 
              color="green.400" 
              _hover={{ color: 'green.300', textDecoration: 'underline' }}
              transition="color 0.2s"
            >
              Support
            </Link>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer; 