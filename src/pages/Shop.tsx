import React from 'react';
import { keyframes } from '@emotion/react';
import {
  Box,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  SimpleGrid,
} from '@chakra-ui/react';
import { FiShoppingBag, FiPackage, FiTag } from 'react-icons/fi';

// Cast so TS accepts these as JSX components (react-icons types conflict with React 19)
const ShopIcon = FiShoppingBag as React.ComponentType<{ size?: number }>;
const PackageIcon = FiPackage as React.ComponentType<{ size?: number }>;
const TagIcon = FiTag as React.ComponentType<{ size?: number }>;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;


const Shop: React.FC = () => {
  const cardBg = useColorModeValue('#1e1e1e', '#1e1e1e');
  const borderColor = useColorModeValue('#333333', '#333333');

  return (
    <Box position="relative" minH="60vh" py={12}>
      {/* Decorative corner accents */}
      <Box
        position="absolute"
        top={4}
        left={4}
        w="80px"
        h="80px"
        borderTop="3px solid"
        borderLeft="3px solid"
        borderColor="green.500"
        borderRadius="lg"
        opacity={0.6}
      />
      <Box
        position="absolute"
        top={4}
        right={4}
        w="80px"
        h="80px"
        borderTop="3px solid"
        borderRight="3px solid"
        borderColor="green.500"
        borderRadius="lg"
        opacity={0.6}
      />
      <Box
        position="absolute"
        bottom={4}
        left={4}
        w="80px"
        h="80px"
        borderBottom="3px solid"
        borderLeft="3px solid"
        borderColor="green.500"
        borderRadius="lg"
        opacity={0.6}
      />
      <Box
        position="absolute"
        bottom={4}
        right={4}
        w="80px"
        h="80px"
        borderBottom="3px solid"
        borderRight="3px solid"
        borderColor="green.500"
        borderRadius="lg"
        opacity={0.6}
      />

      <VStack spacing={8} py={16}>
        {/* Floating icon */}
        <Box
          animation={`${float} 3s ease-in-out infinite`}
          p={6}
          bg={cardBg}
          borderRadius="2xl"
          border="2px solid"
          borderColor="green.500"
          boxShadow="0 0 24px rgba(72, 187, 120, 0.3)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="green.400"
        >
          <ShopIcon size={64} />
        </Box>

        <VStack spacing={2}>
          <Heading size="2xl" color="white" letterSpacing="wide">
            Shop coming soon!
          </Heading>
          <Text color="gray.400" fontSize="lg">
            We&apos;re stocking up on gear, items, and more.
          </Text>
        </VStack>

        {/* Decorative icon row */}
        <SimpleGrid columns={3} spacing={8} pt={4}>
          <Box
            p={4}
            bg={cardBg}
            borderRadius="xl"
            border="1px solid"
            borderColor={borderColor}
            textAlign="center"
            _hover={{ borderColor: 'green.500', color: 'green.400' }}
            transition="all 0.2s"
          >
            <Box mb={2} color="gray.500" _hover={{ color: 'green.400' }}>
              <PackageIcon size={32} />
            </Box>
            <Text fontSize="xs" color="gray.500">Items</Text>
          </Box>
          <Box
            p={4}
            bg={cardBg}
            borderRadius="xl"
            border="1px solid"
            borderColor={borderColor}
            textAlign="center"
            _hover={{ borderColor: 'green.500', color: 'green.400' }}
            transition="all 0.2s"
          >
            <Box mb={2} color="gray.500" _hover={{ color: 'green.400' }}>
              <TagIcon size={32} />
            </Box>
            <Text fontSize="xs" color="gray.500">Deals</Text>
          </Box>
          <Box
            p={4}
            bg={cardBg}
            borderRadius="xl"
            border="1px solid"
            borderColor={borderColor}
            textAlign="center"
            _hover={{ borderColor: 'green.500', color: 'green.400' }}
            transition="all 0.2s"
          >
            <Box mb={2} color="gray.500" _hover={{ color: 'green.400' }}>
              <ShopIcon size={32} />
            </Box>
            <Text fontSize="xs" color="gray.500">Shop</Text>
          </Box>
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default Shop;
