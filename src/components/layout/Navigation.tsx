import React from 'react';
import { Box, Button, Flex, useColorModeValue } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bgColor = useColorModeValue('commitQuest.background', 'commitQuest.background');
  const borderColor = useColorModeValue('green.400', 'green.400');

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Inventory', path: '/character' },
    { label: 'Shop', path: '/shop' },
    { label: 'Friends', path: '/friends' },
    { label: 'Download', path: '/downloads' },
  ];

  return (
    <Box bg={bgColor} borderBottom="2px" borderColor={borderColor} px={4}>
      <Flex maxW="container.xl" mx="auto" gap={1}>
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant={location.pathname === item.path ? 'solid' : 'ghost'}
            colorScheme="green"
            onClick={() => navigate(item.path)}
            borderRadius="none"
            borderBottom="2px"
            borderColor={location.pathname === item.path ? 'green.400' : 'transparent'}
            color={location.pathname === item.path ? 'commitQuest.background' : 'green.400'}
            _hover={{
              bg: 'green.400',
              color: 'commitQuest.background',
            }}
          >
            {item.label}
          </Button>
        ))}
      </Flex>
    </Box>
  );
};

export default Navigation; 