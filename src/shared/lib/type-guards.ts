import { TLauncher } from "../types/game.types";
import { GameProduct, Product, TCarouselItem } from "../types/product.types";
import { TServicePlatform } from "../types/service.types";

export function isProduct(item: TCarouselItem): item is Product {
    return 'productType' in item && 'price' in item;
}

// Проверяет, является ли элемент GameProduct
export function isGameProduct(item: TCarouselItem): item is GameProduct & { game: { launcher: TLauncher } | null } {
    return isProduct(item) && item.productType === 'GAME';
}

// Проверяет, является ли элемент ServicePlatform
export function isServicePlatform(item: TCarouselItem): item is TServicePlatform {
    return 'category' in item && !('productType' in item);
}

// Проверяет, является ли элемент Launcher
export function isLauncher(item: TCarouselItem): item is TLauncher {
    return !('productType' in item) && !('category' in item) && !('description' in item);
}