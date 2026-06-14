import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  AlertIcon,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  HStack,
  Heading,
  Image,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { FiPackage, FiShoppingBag } from 'react-icons/fi';
import { useUser } from '../contexts/UserContext';
import { assetsAPI } from '../services/api';
import type { ShopItem, ShopPurchaseResponse, ShopResponse } from '../types';

// Cast so TS accepts these as JSX components (react-icons types conflict with React 19)
const ShopIcon = FiShoppingBag as React.ComponentType<{ size?: number }>;
const PackageIcon = FiPackage as React.ComponentType<{ size?: number }>;

const ITEM_TYPES = ['apparel', 'aura', 'companion', 'item'];
const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

const formatLabel = (value: string) =>
  value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getRarityColor = (rarity: string) => {
  switch (rarity?.toLowerCase()) {
    case 'common':
      return 'gray';
    case 'uncommon':
      return 'green';
    case 'rare':
      return 'blue';
    case 'epic':
      return 'purple';
    case 'legendary':
      return 'orange';
    case 'mythic':
      return 'pink';
    default:
      return 'green';
  }
};

const Shop: React.FC = () => {
  const { user, refreshUser } = useUser();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [purchasingItemId, setPurchasingItemId] = useState<number | null>(null);
  const [localGold, setLocalGold] = useState<number | null>(null);

  const cardBg = useColorModeValue('commitQuest.panel', 'commitQuest.panel');
  const borderColor = useColorModeValue('green.400', 'green.400');
  const surfaceBg = useColorModeValue('commitQuest.surface', 'commitQuest.surface');
  const goldBalance = localGold ?? user?.gold ?? 0;

  useEffect(() => {
    if (typeof user?.gold === 'number') {
      setLocalGold(user.gold);
    }
  }, [user?.gold]);

  const loadShop = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = (await assetsAPI.getShop()) as ShopResponse;
      setShopItems(response.shop ?? []);
    } catch (err) {
      console.error('Error loading shop:', err);
      setError(err instanceof Error ? err.message : 'Failed to load shop');
      setShopItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShop();
  }, [loadShop]);

  const availableTypes = useMemo(() => {
    const types = new Set(shopItems.map((item) => item.item_type).filter(Boolean));
    return ITEM_TYPES.filter((type) => types.has(type));
  }, [shopItems]);

  const availableRarities = useMemo(() => {
    const rarities = new Set(shopItems.map((item) => item.rarity).filter(Boolean));
    return RARITY_ORDER.filter((rarity) => rarities.has(rarity));
  }, [shopItems]);

  const filteredItems = useMemo(
    () =>
      shopItems.filter((item) => {
        const matchesType = typeFilter === 'all' || item.item_type === typeFilter;
        const matchesRarity = rarityFilter === 'all' || item.rarity === rarityFilter;
        return matchesType && matchesRarity;
      }),
    [rarityFilter, shopItems, typeFilter]
  );

  const handleOpenPurchase = (item: ShopItem) => {
    setSelectedItem(item);
    onOpen();
  };

  const handlePurchase = async () => {
    if (!selectedItem) return;

    try {
      setPurchasingItemId(selectedItem.id);
      const response = (await assetsAPI.purchaseShopItem(selectedItem.id)) as ShopPurchaseResponse;

      setLocalGold(response.gold_remaining);
      setShopItems((currentItems) =>
        currentItems.map((item) =>
          item.id === selectedItem.id
            ? { ...item, owned_quantity: item.owned_quantity + 1 }
            : item
        )
      );
      onClose();
      toast({
        title: 'Item purchased',
        description: `${selectedItem.name} has been added to your inventory.`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      await refreshUser();
    } catch (err) {
      toast({
        title: 'Purchase failed',
        description: err instanceof Error ? err.message : 'Unable to complete purchase',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setPurchasingItemId(null);
    }
  };

  return (
    <Box position="relative" py={8}>
      <VStack align="stretch" spacing={6}>
        <Card bg={cardBg} border="2px" borderColor={borderColor}>
          <CardBody>
            <Stack direction={{ base: 'column', md: 'row' }} spacing={6} align={{ base: 'start', md: 'center' }}>
              <HStack spacing={4}>
                <Box
                  p={4}
                  bg={surfaceBg}
                  borderRadius="2xl"
                  border="2px solid"
                  borderColor="green.500"
                  color="green.400"
                >
                  <ShopIcon size={36} />
                </Box>
                <Box>
                  <Heading size="lg" color="green.400">
                    Adventurer&apos;s Shop
                  </Heading>
                  <Text color="green.300">
                    Spend gold on gear, companions, auras, and collectibles.
                  </Text>
                </Box>
              </HStack>

              <Box flex="1" />

              <Box
                px={5}
                py={3}
                bg={surfaceBg}
                border="1px solid"
                borderColor="yellow.400"
                borderRadius="xl"
                minW="170px"
              >
                <Text color="green.400" fontSize="sm">
                  Your Gold
                </Text>
                <Text color="yellow.400" fontSize="2xl" fontWeight="bold">
                  {goldBalance}
                </Text>
              </Box>
            </Stack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardBody>
            <Stack direction={{ base: 'column', md: 'row' }} spacing={4} align={{ base: 'stretch', md: 'end' }}>
              <Box>
                <Text color="green.400" fontSize="sm" mb={1}>
                  Item Type
                </Text>
                <Select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  borderColor="green.500"
                  color="green.400"
                >
                  <option value="all">All types</option>
                  {availableTypes.map((type) => (
                    <option key={type} value={type}>
                      {formatLabel(type)}
                    </option>
                  ))}
                </Select>
              </Box>

              <Box>
                <Text color="green.400" fontSize="sm" mb={1}>
                  Rarity
                </Text>
                <Select
                  value={rarityFilter}
                  onChange={(event) => setRarityFilter(event.target.value)}
                  borderColor="green.500"
                  color="green.400"
                >
                  <option value="all">All rarities</option>
                  {availableRarities.map((rarity) => (
                    <option key={rarity} value={rarity}>
                      {formatLabel(rarity)}
                    </option>
                  ))}
                </Select>
              </Box>

              <Box flex="1" />

              <Button variant="outline" colorScheme="green" onClick={loadShop} isLoading={loading}>
                Refresh Shop
              </Button>
            </Stack>
          </CardBody>
        </Card>

        {loading ? (
          <Box display="flex" justifyContent="center" py={16}>
            <VStack spacing={4}>
              <Spinner size="xl" color="green.400" />
              <Text color="green.400">Loading shop inventory...</Text>
            </VStack>
          </Box>
        ) : error ? (
          <Alert status="error" bg="#2d1b1b" borderColor="red.500">
            <AlertIcon />
            <VStack align="start" spacing={2}>
              <Text color="green.400">Failed to load shop: {error}</Text>
              <Button size="sm" colorScheme="green" onClick={loadShop}>
                Try Again
              </Button>
            </VStack>
          </Alert>
        ) : filteredItems.length === 0 ? (
          <Alert status="info" bg={cardBg} borderColor="green.500">
            <AlertIcon />
            <Text color="green.400">No shop items match those filters.</Text>
          </Alert>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5}>
            {filteredItems.map((item) => {
              const rarityColor = getRarityColor(item.rarity);
              const isOwned = item.owned_quantity > 0;
              const isOutOfStock = item.quantity_available === 0;
              const cannotAfford = goldBalance < item.price_gold;
              const isPurchasing = purchasingItemId === item.id;
              const isDisabled = isOwned || isOutOfStock || cannotAfford || isPurchasing;
              const previewUrl = item.asset_variant?.preview_url ?? item.asset_variant?.idle_url;

              return (
                <Card
                  key={item.id}
                  bg={cardBg}
                  border="2px"
                  borderColor={`${rarityColor}.500`}
                  overflow="hidden"
                  boxShadow="0 0 18px rgba(0, 255, 65, 0.08)"
                >
                  <CardBody>
                    <VStack align="stretch" spacing={4} h="full">
                      <Box
                        bg={surfaceBg}
                        borderRadius="xl"
                        border="1px solid"
                        borderColor="green.800"
                        h="180px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        overflow="hidden"
                      >
                        {previewUrl ? (
                          <Image src={previewUrl} alt={item.name} maxH="160px" maxW="100%" objectFit="contain" />
                        ) : (
                          <VStack color="green.700">
                            <PackageIcon size={48} />
                            <Text fontSize="sm">No preview</Text>
                          </VStack>
                        )}
                      </Box>

                      <VStack align="stretch" spacing={2} flex="1">
                        <HStack align="start">
                          <Box>
                            <Heading size="md" color="green.400">
                              {item.name}
                            </Heading>
                            <Text color="green.300" fontSize="sm">
                              {formatLabel(item.item_type)}
                              {item.slot ? ` - ${formatLabel(item.slot)}` : ''}
                            </Text>
                          </Box>
                          <Box flex="1" />
                          {isOwned && <Badge colorScheme="green">Owned</Badge>}
                        </HStack>

                        <Text color="green.200" fontSize="sm" noOfLines={3}>
                          {item.description}
                        </Text>

                        <HStack spacing={2} flexWrap="wrap">
                          <Badge colorScheme={rarityColor}>{formatLabel(item.rarity)}</Badge>
                          {item.has_visual && <Badge colorScheme="cyan">Visual</Badge>}
                          {item.quantity_available !== null && (
                            <Badge colorScheme="orange">{item.quantity_available} left</Badge>
                          )}
                        </HStack>
                      </VStack>

                      <Divider borderColor="green.800" />

                      <HStack>
                        <Box>
                          <Text color="green.400" fontSize="xs">
                            Price
                          </Text>
                          <Text color="yellow.400" fontSize="xl" fontWeight="bold">
                            {item.price_gold} Gold
                          </Text>
                        </Box>
                        <Box flex="1" />
                        <Button
                          colorScheme="green"
                          onClick={() => handleOpenPurchase(item)}
                          isDisabled={isDisabled}
                          isLoading={isPurchasing}
                        >
                          {isOwned ? 'Owned' : cannotAfford ? 'Need Gold' : 'Buy'}
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              );
            })}
          </SimpleGrid>
        )}
      </VStack>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent bg={cardBg} border="2px solid" borderColor="green.500">
            <AlertDialogHeader color="green.400">Confirm purchase</AlertDialogHeader>
            <AlertDialogBody color="green.200">
              {selectedItem
                ? `Buy ${selectedItem.name} for ${selectedItem.price_gold} gold?`
                : 'Buy this item?'}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} variant="ghost" colorScheme="green">
                Cancel
              </Button>
              <Button
                colorScheme="green"
                ml={3}
                onClick={handlePurchase}
                isLoading={selectedItem ? purchasingItemId === selectedItem.id : false}
              >
                Buy
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Shop;
