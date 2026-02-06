import React from 'react';
import { Box, Button, Flex, useColorModeValue } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bgColor = useColorModeValue('#1e1e1e', '#1e1e1e');
  const borderColor = useColorModeValue('#333333', '#333333');

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Inventory', path: '/character' },
    { label: 'Shop', path: '/shop' },
    { label: 'Friends', path: '/friends' },
  ];

  return (
    <Box bg={bgColor} borderBottom="1px" borderColor={borderColor} px={4}>
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
            color={location.pathname === item.path ? 'white' : 'gray.300'}
            _hover={{
              bg: location.pathname === item.path ? 'green.500' : 'green.500',
              color: 'white',
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