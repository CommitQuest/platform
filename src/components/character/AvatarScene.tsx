import React from 'react';
import { Box, Image } from '@chakra-ui/react';
import { BackgroundLayersSource } from '../../utils/backgroundLayers';
import { UserInventory } from '../../types';

type AvatarSceneState = 'idle' | 'celebration';
type RenderLayer = 'front' | 'back' | 'both';

interface AvatarSceneProps {
  background?: BackgroundLayersSource | null;
  character: {
    name?: string;
    avatar_url?: string;
    avatar_assets?: {
      idle?: string;
      celebration?: string;
    };
  };
  equippedItems?: UserInventory[];
  state?: AvatarSceneState;
  spriteScale?: number;
  spriteOffsetY?: number;
}

const BACKGROUND_KEYS = ['background_1', 'background_2', 'background_3', 'background_4'] as const;

const getForegroundUrl = (
  background: BackgroundLayersSource | null | undefined,
  key: 'foreground_1' | 'foreground_2'
) => {
  if (!background) return undefined;
  if (key === 'foreground_1') return background.foreground_1 ?? background.foregound_1;
  return background.foreground_2;
};

const getItemData = (inventoryItem: UserInventory) => inventoryItem.items ?? inventoryItem.item ?? inventoryItem;

const getRenderLayer = (inventoryItem: UserInventory): RenderLayer | undefined => {
  const item = getItemData(inventoryItem);
  return item.render_layer ?? inventoryItem.render_layer;
};

const getAssetVariant = (inventoryItem: UserInventory) => {
  const item = getItemData(inventoryItem);
  return item.asset_variant ?? inventoryItem.asset_variant ?? null;
};

const isVisualEquippedItem = (inventoryItem: UserInventory) => {
  const item = getItemData(inventoryItem);
  return inventoryItem.equipped === true && (item.has_visual ?? inventoryItem.has_visual) === true && !!getAssetVariant(inventoryItem);
};

const getItemLayerUrl = (
  inventoryItem: UserInventory,
  layer: 'back' | 'front',
  state: AvatarSceneState
) => {
  const assetVariant = getAssetVariant(inventoryItem);
  const renderLayer = getRenderLayer(inventoryItem);

  if (!assetVariant || !renderLayer) return null;

  if (layer === 'back') {
    if (renderLayer === 'back') {
      return state === 'celebration'
        ? assetVariant.celebration_url ?? assetVariant.idle_url ?? null
        : assetVariant.idle_url ?? null;
    }
    if (renderLayer === 'both') {
      return state === 'celebration'
        ? assetVariant.back_celebration_url ?? assetVariant.back_idle_url ?? null
        : assetVariant.back_idle_url ?? null;
    }
    return null;
  }

  if (renderLayer === 'front' || renderLayer === 'both') {
    return state === 'celebration'
      ? assetVariant.celebration_url ?? assetVariant.idle_url ?? null
      : assetVariant.idle_url ?? null;
  }

  return null;
};

const AvatarScene: React.FC<AvatarSceneProps> = ({
  background,
  character,
  equippedItems = [],
  state = 'idle',
  spriteScale = 1,
  spriteOffsetY = 0,
}) => {
  const visualItems = equippedItems.filter(isVisualEquippedItem);
  const spriteTransform = `translateY(${spriteOffsetY}px) scale(${spriteScale})`;
  const avatarUrl =
    state === 'celebration'
      ? character.avatar_assets?.celebration ?? character.avatar_assets?.idle ?? character.avatar_url
      : character.avatar_assets?.idle ?? character.avatar_url;

  const renderSpriteLayer = (src: string | null | undefined, alt: string, zIndex: number, key: string) => {
    if (!src) return null;

    return (
      <Image
        key={key}
        src={src}
        alt={alt}
        position="absolute"
        left={0}
        bottom={0}
        width="100%"
        height="100%"
        objectFit="contain"
        transform={spriteTransform}
        transformOrigin="center center"
        pointerEvents="none"
        zIndex={zIndex}
      />
    );
  };

  return (
    <Box position="absolute" inset={0} overflow="hidden" isolation="isolate" zIndex={0}>
      {BACKGROUND_KEYS.map((key, index) => {
        const layerUrl = background?.[key];
        if (!layerUrl) return null;

        return (
          <Box
            key={key}
            position="absolute"
            inset={0}
            backgroundImage={`url(${layerUrl})`}
            backgroundSize="cover"
            backgroundPosition="center top"
            backgroundRepeat="no-repeat"
            zIndex={index + 1}
          />
        );
      })}

      {visualItems.map((item, index) =>
        renderSpriteLayer(getItemLayerUrl(item, 'back', state), '', 6 + index, `back-${item.inventory_id ?? item.id}`)
      )}

      {renderSpriteLayer(avatarUrl, character.name || 'Avatar', 20, 'avatar')}

      {visualItems.map((item, index) =>
        renderSpriteLayer(getItemLayerUrl(item, 'front', state), '', 30 + index, `front-${item.inventory_id ?? item.id}`)
      )}

      {(['foreground_1', 'foreground_2'] as const).map((key, index) => {
        const layerUrl = getForegroundUrl(background, key);
        if (!layerUrl) return null;

        return (
          <Box
            key={key}
            position="absolute"
            inset={0}
            backgroundImage={`url(${layerUrl})`}
            backgroundSize="cover"
            backgroundPosition="center top"
            backgroundRepeat="no-repeat"
            zIndex={40 + index}
          />
        );
      })}
    </Box>
  );
};

export default AvatarScene;
