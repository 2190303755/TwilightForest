import {
	BlockProperties,
	MinecraftEntityTypes,
	MinecraftBlockTypes,
	MinecraftEffectTypes,
	MinecraftEnchantmentTypes,
	EntityInventoryComponent ,
	EntityFireImmuneComponent,
	ItemDurabilityComponent,
	ItemEnchantsComponent
} from "@minecraft/server";

export function setSelectedItem(player, item) {
	player.getComponent(EntityInventoryComponent.componentId).container.setItem(player.selectedSlot, item);
}

export function getSelectedItem(player) {
	return player.getComponent(EntityInventoryComponent.componentId).container.getItem(player.selectedSlot);
}

export function setOnFireIfPossible(target, seconds) {
	if (!target.getEffect(MinecraftEffectTypes.fireResistance) && !target.hasComponent(EntityFireImmuneComponent.componentId)) target.setOnFire(seconds);
}

function decreaseDurabilityImpl(component, chance, max, amount) {
	if (amount > 0 && component.damage < max) {
		if (Math.random() * 100 <= chance) {
			component.damage++;
		}
		decreaseDurabilityImpl(component, chance, amount - 1);
	}
}

export function decreaseDurability(item, amount) {
	const level = item.getComponent(ItemEnchantsComponent.componentId).enchantments.hasEnchantment(MinecraftEnchantmentTypes.unbreaking);
	const component = item.getComponent(ItemDurabilityComponent.componentId);
	if (component) {
		decreaseDurabilityImpl(component, component.getDamageChance(level), component.maxDurability, amount);
	}
}

export function litBlock(block) {
	const permutation = block.permutation;
	let result = false;
	let property;
	switch(block.typeId) {
		case MinecraftBlockTypes.tnt.id:
			block.setType(MinecraftBlockTypes.air);
			block.dimension.spawnEntity(MinecraftEntityTypes.tnt.id, block.location);
			return true;
		case MinecraftBlockTypes.campfire.id:
		case MinecraftBlockTypes.soulCampfire.id:
			property = permutation.getProperty(BlockProperties.extinguished);
			if (property && property.value) {
				property.value = false;
				result = true;
			}
			break;
		default:
			property = permutation.getProperty(BlockProperties.lit);
			if (property && !property.value) {
				property.value = result = true;
			}
			break;
	}
	if (result) {
		block.setPermutation(permutation);
	}
	return result;
}