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
  Spinner,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { authAPI, logout } from '../../services/api';
import { useUser } from '../../contexts/UserContext';

const Header: React.FC = () => {
  const { user, loading } = useUser();
  const bgColor = useColorModeValue('commitQuest.background', 'commitQuest.background');
  const borderColor = useColorModeValue('green.400', 'green.400');

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
      borderBottom="2px"
      borderColor={borderColor}
      px={4}
      py={4}
      position="sticky"
      top={0}
      zIndex={11}
    >
      <Flex justify="space-between" align="center" maxW="container.xl" mx="auto">
        <Heading size="md" color="green.400" cursor="pointer" onClick={() => window.location.href = '/'}>
          CommitQuest
        </Heading>
        
        <Flex align="center" gap={4}>
          <Button 
            colorScheme="green" 
            variant="ghost" 
            _hover={{ bg: 'green.400', color: 'commitQuest.background' }}
            onClick={() => {}}
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
                    border="2px solid"
                    borderColor="green.500"
                    color="green.400"
                    _hover={{ bg: 'green.400', color: 'commitQuest.background' }}
                    _active={{ bg: 'green.600' }}
                  >
                    <Avatar 
                      size="sm" 
                      name={user.character?.name || 'User'} 
                      src={user.character?.avatar_url || ''} 
                      mr={2} 
                      sx={{
                        img: {
                          objectFit: 'cover',
                          objectPosition: 'center',
                          transform: 'scale(4)',
                        }
                      }}
                    />
                  </MenuButton>
                  <MenuList bg="commitQuest.panel" borderColor="green.400" boxShadow="0 0 16px rgba(0, 255, 65, 0.18)">
                    <MenuItem bg="commitQuest.panel" color="green.400" _hover={{ bg: 'green.400', color: 'commitQuest.background' }}>Profile</MenuItem>
                    {/* <MenuItem bg="commitQuest.panel" color="green.400" _hover={{ bg: 'green.400', color: 'commitQuest.background' }}>Settings</MenuItem> */}
                    <MenuDivider borderColor="green.700" />
                    <MenuItem bg="commitQuest.panel" onClick={handleLogout} color="green.400" _hover={{ bg: 'green.400', color: 'commitQuest.background' }}>Logout</MenuItem>
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