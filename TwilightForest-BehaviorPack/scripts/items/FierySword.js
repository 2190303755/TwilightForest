import { world } from '@minecraft/server';
import {
	setSelectedItem,
	getSelectedItem,
	setOnFireIfPossible,
	decreaseDurability,
	litBlock
} from 'Util';

const TypeID = 'twilightforest:fiery_sword';

function entityHit(args) {
	const target = args.hitEntity;
	const source = args.entity;
	if (target && source.typeId == 'minecraft:player' && getSelectedItem(source).typeId == TypeID) {
		setOnFireIfPossible(target, 15);
	}
}

function itemUseOn(args) {
	const itemStack = args.item;
	const player = args.source;
	if (itemStack.typeId == TypeID) {
		if (litBlock(player.dimension.getBlock(args.blockLocation))) {
			decreaseDurability(itemStack, 1);
			setSelectedItem(player, itemStack);
		}
	}
}

export function subscribe() {
	world.events.entityHit.subscribe(entityHit);
	world.events.itemUseOn.subscribe(itemUseOn);
}

export function unsubscribe() {
	world.events.entityHit.unsubscribe(entityHit);
	world.events.itemUseOn.unsubscribe(itemUseOn);
}