import React from 'react';
import { Box, Button, Image, SimpleGrid, VStack } from '@chakra-ui/react';

export interface AvatarOption {
  id: number;
  idle_url: string;
  celebration_url?: string;
  preview_swatch_hex?: string | null;
  display_order?: number;
}

interface AvatarOptionPickerProps {
  options: AvatarOption[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

const AvatarOptionPicker: React.FC<AvatarOptionPickerProps> = ({ options, selectedId, onSelect }) => {
  if (options.length === 0) return null;

  const sortedOptions = [...options].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  return (
    <SimpleGrid columns={{ base: 3, sm: 4, md: 6 }} spacing={3} w="full">
      {sortedOptions.map((option) => {
        const selected = option.id === selectedId;

        return (
          <Button
            key={option.id}
            type="button"
            aria-label="Select avatar appearance"
            onClick={() => onSelect(option.id)}
            variant="unstyled"
            h="auto"
            p={0}
            border="2px"
            borderColor={selected ? 'green.200' : 'green.700'}
            borderRadius="md"
            bg={selected ? 'rgba(0, 255, 65, 0.12)' : 'commitQuest.surface'}
            boxShadow={selected ? '0 0 18px rgba(0, 255, 65, 0.25)' : 'none'}
            _hover={{ borderColor: 'green.300', transform: 'translateY(-2px)' }}
            _focusVisible={{ boxShadow: '0 0 0 3px rgba(0, 255, 65, 0.35)' }}
            overflow="hidden"
          >
            <VStack spacing={0}>
              <Box w="full" aspectRatio="1" display="flex" alignItems="center" justifyContent="center" bg="commitQuest.panel">
                <Image
                  src={option.idle_url}
                  alt=""
                  boxSize="full"
                  objectFit="contain"
                  p={2}
                />
              </Box>
            </VStack>
          </Button>
        );
      })}
    </SimpleGrid>
  );
};

export default AvatarOptionPicker;
