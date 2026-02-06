import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue,
  Text,
  Spinner,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { authAPI, logout } from '../../services/api';
import { useUser } from '../../contexts/UserContext';

const Header: React.FC = () => {
  const { user, loading } = useUser();
  const bgColor = useColorModeValue('#1e1e1e', '#1e1e1e');
  const borderColor = useColorModeValue('#333333', '#333333');

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      window.location.href = '/';
    }
  };

  return (
    <Box
      as="header"
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      px={4}
      py={4}
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Flex justify="space-between" align="center" maxW="container.xl" mx="auto">
        <Heading size="lg" color="green.400" cursor="pointer" onClick={() => window.location.href = '/'}>
          CommitQuest
        </Heading>
        
        <Flex align="center" gap={4}>
          <Button 
            colorScheme="green" 
            variant="ghost" 
            _hover={{ bg: 'green.500', color: 'white' }}
            onClick={() => window.location.href = '/support'}
          >
            Support
          </Button>
          {loading ? (
            <Spinner size="sm" color="green.400" />
          ) : (
            <>
              {user ? (
                <Menu>
                  <MenuButton
                    as={Button}
                    rightIcon={<ChevronDownIcon />}
                    variant="ghost"
                    px={3}
                    color="white"
                    _hover={{ bg: 'green.500', color: 'white' }}
                    _active={{ bg: 'green.600' }}
                  >
                    <Avatar 
                      size="sm" 
                      name={user.character?.name || 'User'} 
                      src={user.character?.avatar_url || ''} 
                      mr={2} 
                    />
                    <Text>{user.character?.name || 'User'}</Text>
                  </MenuButton>
                  <MenuList bg="#2a2a2a" borderColor="#333333" boxShadow="lg">
                    <MenuItem color="white" _hover={{ bg: 'green.500' }}>Profile</MenuItem>
                    <MenuItem color="white" _hover={{ bg: 'green.500' }}>Settings</MenuItem>
                    <MenuDivider borderColor="#333333" />
                    <MenuItem onClick={handleLogout} color="white" _hover={{ bg: 'green.500' }}>Logout</MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <Button colorScheme="green" onClick={() => window.location.href = '/login'}>
                  Login
                </Button>
              )}
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header; 