import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  Image,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  SimpleGrid,
  Tooltip,
  Button,
} from '@chakra-ui/react';
import { useUser } from '../contexts/UserContext';
import { assetsAPI } from '../services/api';
import { UserInventory, InventoryResponse, Item } from '../types';
import { generateBackgroundLayers, generateForegroundLayers } from '../utils/backgroundLayers';
import AvatarScene from '../components/character/AvatarScene';

interface OwnedBackground {
  id: number;
  background_1?: string;
  background_2?: string;
  background_3?: string;
  background_4?: string;
  foregound_1?: string;
  foreground_1?: string;
  foreground_2?: string;
  cost?: number;
  inventory_id: number;
  equipped: boolean;
}

const getInventoryItem = (inventoryItem: UserInventory): Partial<Item & UserInventory> =>
  (inventoryItem.items ?? inventoryItem.item ?? inventoryItem) as Partial<Item & UserInventory>;
const getInventoryItemId = (inventoryItem: UserInventory) => getInventoryItem(inventoryItem).id ?? inventoryItem.item_id;
const getInventoryItemType = (inventoryItem: UserInventory) =>
  getInventoryItem(inventoryItem).item_type ?? inventoryItem.item_type ?? inventoryItem.asset_type;
const getInventoryItemName = (inventoryItem: UserInventory) => getInventoryItem(inventoryItem).name ?? inventoryItem.name ?? 'Unknown item';
const getInventoryItemDescription = (inventoryItem: UserInventory) =>
  getInventoryItem(inventoryItem).description ?? inventoryItem.description ?? '';
const getInventoryItemRarity = (inventoryItem: UserInventory) => getInventoryItem(inventoryItem).rarity ?? inventoryItem.rarity ?? 'common';
const getInventoryItemIcon = (inventoryItem: UserInventory) => {
  const item = getInventoryItem(inventoryItem);
  return item.asset_variant?.preview_url ?? inventoryItem.asset_variant?.preview_url ?? item.file_path;
};
const isVisualItem = (inventoryItem: UserInventory) =>
  (getInventoryItem(inventoryItem).has_visual ?? inventoryItem.has_visual) === true;

const Inventory: React.FC = () => {
  const { user, background, loading, error, refreshBackground } = useUser();
  const [inventory, setInventory] = useState<UserInventory[]>([]);
  const [backgrounds, setBackgrounds] = useState<OwnedBackground[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [backgroundsLoading, setBackgroundsLoading] = useState(true);
  const [equippingId, setEquippingId] = useState<number | null>(null);
  const [itemActionId, setItemActionId] = useState<number | null>(null);
  const [, setInventoryError] = useState<string | null>(null);
  
  const cardBg = useColorModeValue('commitQuest.panel', 'commitQuest.panel');
  const borderColor = useColorModeValue('green.400', 'green.400');

  const handleEquipBackground = async (backgroundId: number) => {
    try {
      setEquippingId(backgroundId);
      await assetsAPI.equipBackground(backgroundId);
      setBackgrounds(prev =>
        prev.map(b => ({ ...b, equipped: b.id === backgroundId }))
      );
      
    } catch (err) {
      console.error('Failed to equip background:', err);
    } finally {
      setEquippingId(null);
      refreshBackground();
    }
  };

  const refreshInventory = async () => {
    const response: InventoryResponse = await assetsAPI.getUserInventory();
    setInventory(response.items ?? response.inventory ?? []);
    if (response.backgrounds) {
      setBackgrounds(response.backgrounds);
    }
    setInventoryError(null);
  };

  const handleToggleItemEquip = async (inventoryItem: UserInventory) => {
    const item = getInventoryItem(inventoryItem);
    const itemId = getInventoryItemId(inventoryItem);
    if (!itemId || !isVisualItem(inventoryItem)) return;

    try {
      setItemActionId(itemId);
      if (inventoryItem.equipped) {
        await assetsAPI.unequipItem(itemId);
      } else {
        await assetsAPI.equipItem(itemId, item.slot ?? inventoryItem.slot);
      }
      await refreshInventory();
    } catch (err) {
      console.error('Failed to update item equipment:', err);
      setInventoryError('Failed to update item equipment');
    } finally {
      setItemActionId(null);
    }
  };

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      if (!user) return;
      
      try {
        setInventoryLoading(true);
        await refreshInventory();
      } catch (err) {
        console.error('Error fetching inventory:', err);
        setInventoryError('Failed to load inventory');
        setInventory([]);
      } finally {
        setInventoryLoading(false);
      }
    };

    fetchInventory();
  }, [user]);

  // Fetch backgrounds
  useEffect(() => {
    const fetchBackgrounds = async () => {
      if (!user) return;
      try {
        setBackgroundsLoading(true);
        const res = await assetsAPI.getBackgrounds();
        setBackgrounds(res.backgrounds || []);
      } catch (err) {
        console.error('Error fetching backgrounds:', err);
        setBackgrounds([]);
      } finally {
        setBackgroundsLoading(false);
      }
    };
    fetchBackgrounds();
  }, [user]);

  // Filter inventory by asset type
  const equippedVisualItems = inventory.filter((item) => item.equipped === true && isVisualItem(item));
  const items = inventory.filter(item => getInventoryItemType(item) === 'item');
  const apparel = inventory.filter(item => getInventoryItemType(item) === 'apparel');
  const auras = inventory.filter(item => getInventoryItemType(item) === 'aura');
  const companions = inventory.filter(item => getInventoryItemType(item) === 'companion');

  // Get rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'gray';
      case 'uncommon': return 'green';
      case 'rare': return 'yellow';
      case 'legendary': return 'purple';
      case 'mythic': return 'orange';
      default: return 'gray';
    }
  };

  // Render inventory section
  const renderInventorySection = (title: string, items: UserInventory[], emptyMessage: string) => (
    <Card bg={cardBg} border="2px" borderColor={borderColor}>
      <CardBody>
        <VStack align="start" spacing={4}>
          <Heading size="md" color="green.400">{title}</Heading>
          
          {inventoryLoading ? (
            <Box display="flex" justifyContent="center" w="full" py={4}>
              <VStack spacing={2}>
                <Spinner size="md" color="green.400" />
                <Text color="green.400" fontSize="sm">Loading...</Text>
              </VStack>
            </Box>
          ) : items.length === 0 ? (
            <Box textAlign="center" w="full" py={4}>
              <Text color="green.400" fontSize="sm">
                {emptyMessage}
              </Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 2, md: 3, lg: 4, xl: 6 }} spacing={4} w="full">
              {items.map((inventoryItem) => {
                const itemColor = getRarityColor(getInventoryItemRarity(inventoryItem));
                const itemId = getInventoryItemId(inventoryItem);
                const iconUrl = getInventoryItemIcon(inventoryItem);
                return (
                  <Card 
                    key={inventoryItem.inventory_id ?? inventoryItem.id} 
                    bg="commitQuest.surface" 
                    border="1px" 
                    borderColor={itemColor + '.500'}
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                    transition="all 0.2s"
                    size="sm"
                  >
                    <CardBody p={3}>
                      <VStack spacing={2}>
                        {iconUrl && (
                          <Image 
                            src={iconUrl} 
                            alt={getInventoryItemName(inventoryItem)}
                            borderRadius="md"
                            width="80px"
                            height="80px"
                            transform="scale(2)"
                            objectFit="cover"
                            fallbackSrc="https://via.placeholder.com/60x60/2a2a2a/666666?text=Item"
                          />
                        )}
                        
                        <VStack spacing={1} textAlign="center">
                          <Tooltip label={getInventoryItemDescription(inventoryItem)} placement="top">
                            <Text fontWeight="bold" color="green.400" fontSize="xs" noOfLines={1}>
                              {getInventoryItemName(inventoryItem)}
                            </Text>
                          </Tooltip>
                          
                          <Badge colorScheme={itemColor} size="xs">
                            {getInventoryItemRarity(inventoryItem)}
                          </Badge>
                          
                          {getInventoryItem(inventoryItem).cost && (
                            <Text color="yellow.400" fontSize="xs" fontWeight="bold">
                              {getInventoryItem(inventoryItem).cost} Gold
                            </Text>
                          )}
                          {isVisualItem(inventoryItem) && (
                            <Button
                              size="xs"
                              colorScheme="green"
                              variant={inventoryItem.equipped ? 'solid' : 'outline'}
                              isLoading={itemActionId === itemId}
                              onClick={() => handleToggleItemEquip(inventoryItem)}
                            >
                              {inventoryItem.equipped ? 'Unequip' : 'Equip'}
                            </Button>
                          )}
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                );
              })}
            </SimpleGrid>
          )}
        </VStack>
      </CardBody>
    </Card>
  );

  // Show loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="green.400" />
          <Text color="green.400">Loading your inventory...</Text>
        </VStack>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box>
        <Alert status="error" mb={4} bg="#2d1b1b" borderColor="red.500">
          <AlertIcon />
          <Text>Failed to load inventory data: {error}</Text>
        </Alert>
      </Box>
    );
  }

  // Show no user state
  if (!user) {
    return (
      <Box>
        <Alert status="info" mb={4} bg="commitQuest.panel" borderColor="green.500">
          <AlertIcon />
          <Text>Please log in to view your inventory.</Text>
        </Alert>
      </Box>
    );
  }

  // Show no character state
  const character = user.character;
  if (!character) {
    return (
      <Box>
        <Alert status="warning" mb={4} bg="#2a2a1a" borderColor="yellow.500">
          <AlertIcon />
          <Text>No character found. Please create a character first.</Text>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header with Character Info and Apparel */}
        <HStack spacing={6} align="stretch">
          <Box
            borderRadius="md"
            border="2px"
            borderColor="green.500"
            maxW="240px"
            maxH="240px"
            minW="240px"
            minH="240px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            position="relative"
            overflow="hidden"
          >
            <AvatarScene
              background={background}
              character={character}
              equippedItems={equippedVisualItems}
              spriteOffsetY={40}
            />
          </Box>

          {/* Character Info */}
          <Card bg={cardBg} border="2px" borderColor={borderColor} flex="1">
            <CardBody>
              <VStack align="start" spacing={3}>
                <HStack>
                  <Heading size="lg" color="green.400">{character.name}</Heading>
                  <Badge colorScheme="green" fontSize="md">
                    Level {user.level}
                  </Badge>
                </HStack>
                
                <Text color="green.400">
                  {character.species?.name || 'Unknown'} {character.classes?.name || 'Unknown'}
                </Text>
                
                <Stat>
                  <StatLabel color="green.400">Gold</StatLabel>
                  <StatNumber color="yellow.400" fontSize="2xl">{user.gold || 0}</StatNumber>
                </Stat>
              </VStack>
            </CardBody>
          </Card>
        </HStack>

        {renderInventorySection(
          "Apparel",
          apparel,
          "No apparel items found. Visit the shop to buy some!"
        )}

        {renderInventorySection(
          "Auras",
          auras,
          "No auras found. Visit the shop to buy some!"
        )}

        {renderInventorySection(
          "Companions",
          companions,
          "No companions found. Visit the shop to buy some!"
        )}

        {/* Items Section */}
        {renderInventorySection(
          "Items", 
          items, 
          "No items found. Visit the shop to buy some!"
        )}

        {/* Backgrounds Section */}
        <Card bg={cardBg} border="2px" borderColor={borderColor}>
          <CardBody>
            <VStack align="start" spacing={4}>
              <Heading size="md" color="green.400">Backgrounds</Heading>
              
              {backgroundsLoading ? (
                <Box display="flex" justifyContent="center" w="full" py={4}>
                  <VStack spacing={2}>
                    <Spinner size="md" color="green.400" />
                    <Text color="green.400" fontSize="sm">Loading...</Text>
                  </VStack>
                </Box>
              ) : backgrounds.length === 0 ? (
                <Box textAlign="center" w="full" py={4}>
                  <Text color="green.400" fontSize="sm">
                    No backgrounds found. Visit the shop to buy some!
                  </Text>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 2, md: 3, lg: 4, xl: 5 }} spacing={4} w="full">
                  {backgrounds.map((bg) => (
                    <Card
                      key={bg.inventory_id}
                      bg="commitQuest.surface"
                      border="2px"
                      borderColor={bg.equipped ? 'green.500' : borderColor}
                      _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                      transition="all 0.2s"
                      overflow="hidden"
                    >
                      <Box
                        position="relative"
                        width="100%"
                        minH="100px"
                        aspectRatio="1"
                        overflow="hidden"
                      >
                        {generateBackgroundLayers(bg)}
                        {generateForegroundLayers(bg)}
                      </Box>
                      <CardBody p={3}>
                        <VStack spacing={2}>
                          {bg.equipped ? (
                            <Badge colorScheme="green" w="full" textAlign="center">
                              Equipped
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              colorScheme="green"
                              w="full"
                              isLoading={equippingId === bg.id}
                              onClick={() => handleEquipBackground(bg.id)}
                            >
                              Equip
                            </Button>
                          )}
                          {bg.cost != null && (
                            <Text color="yellow.400" fontSize="xs" fontWeight="bold">
                              {bg.cost} Gold
                            </Text>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default Inventory; 