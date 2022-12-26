import { world } from '@minecraft/server'
import {
	setSelectedItem,
	getSelectedItem,
	setOnFireIfPossible,
	decreaseDurability,
	litBlock
} from '../util'

const TypeID = 'twilightforest:fiery_sword'

function entityHit(args) {
	const target = args.hitEntity
	const source = args.entity
	if (target && source && getSelectedItem(source).typeId == TypeID) {
		setOnFireIfPossible(target, 15)
	}
}

function itemUseOn(args) {
	const item = args.item
	const player = args.source
	if (item.typeId == TypeID) {
		if (litBlock(player.dimension.getBlock(args.blockLocation))) {
			decreaseDurability(item, 1)
			setSelectedItem(player, item)
		}
	}
}

function subscribe() {
	world.events.entityHit.subscribe(entityHit)
	world.events.itemUseOn.subscribe(itemUseOn)
}

function unsubscribe() {
	world.events.entityHit.unsubscribe(entityHit)
	world.events.itemUseOn.unsubscribe(itemUseOn)
}

export { subscribe, unsubscribe }