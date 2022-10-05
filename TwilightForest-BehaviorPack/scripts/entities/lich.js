import {
	world,
	system,
	EntityDataDrivenTriggerEventOptions,
} from "@minecraft/server";

const SubscriptionMap = new Map()
const CreationSubscriptionOptions = new EntityDataDrivenTriggerEventOptions()
CreationSubscriptionOptions.entityTypes = ['twilightforest:lich']
CreationSubscriptionOptions.eventTypes = ['twilightforest:on_target_acquired']
const ShieldSubscriptionOptions = new EntityDataDrivenTriggerEventOptions()
ShieldSubscriptionOptions.entityTypes = ['twilightforest:lich']
ShieldSubscriptionOptions.eventTypes = ['twilightforest:on_shield_broken']
const CreateShadowQueryOptions = {
	type: 'twilightforest:lich',
	tags: 'ShadowClone',
	maxDistance: 48
}
const CreateMinionQueryOptions = {
	type: 'twilightforest:lich_minion',
	maxDistance: 16
}

class CreationSubscription {
	constructor(entity) {
		this.id = entity.id
		this.entity = entity
		SubscriptionMap.set(this.id, this)
	}
	#spawnCreation(typeId, options, amount, onCreated = null) {
		let dimension = this.entity.dimension
		let creations = dimension.getEntities(Object.assign({ location: this.entity.headLocation }, options))
		let sum = 0
		for (let creation of creations) {
			sum += creation.hasTag(this.id)
		}
		if (sum < amount) {
			let location = this.entity.location
			let creation = dimension.spawnEntity(typeId, location)
			creation.addTag(this.id)
			if (onCreated instanceof Function) {
				onCreated(creation, location)
			}
		}
	}
	delete() {
		SubscriptionMap.delete(this.id)
	}
	run(shadowCooldown, minionCooldown) {
		try {
			if (this.entity.target && this.entity.getComponent('minecraft:health').current > 0) {
				if (shadowCooldown > 0) {
					shadowCooldown -= 1
				} else if (shadowCooldown == 0) {
					this.#spawnCreation('twilightforest:lich<twilightforest:is_shadow>', CreateShadowQueryOptions, 2, (creation, location) => {
						creation.runCommandAsync(`spreadplayers ${location.x} ${location.z} 0 8 @s`)
						shadowCooldown = 45
					})
				}
				if (minionCooldown > 0) {
					minionCooldown -= 1
				} else if (minionCooldown == 0 && this.entity.getComponent('minecraft:mark_variant').value) {
					this.#spawnCreation('twilightforest:lich_minion', CreateMinionQueryOptions, 3, (creation, location) => {
						creation.runCommandAsync(`spreadplayers ${location.x} ${location.z} 0 2 @s`)
						this.entity.triggerEvent('twilightforest:on_summon_minion')
						minionCooldown = 20
					})
				}
				system.run(() => {
					let subscription = SubscriptionMap.get(this.id)
					if (subscription) {
						subscription.run(shadowCooldown, minionCooldown)
					}
				})
			} else {
				this.delete()
			}
		} catch {
			this.delete()
		}
	}
}

function onTargetAcquired(args) {
	let entity = args.entity
	new CreationSubscription(entity).run(0, 0)
}

function onShieldBroken(args) {
	try {
		let health = args.entity.getComponent('minecraft:health')
		let shields = args.entity.getComponent('minecraft:skin_id')
		shields.value -= 1
		if (shields.value) {
			health.setCurrent(health.value * shields.value / 6)
		} else {
			health.resetToMaxValue()
			args.entity.triggerEvent('twilightforest:check_minions')
			args.entity.runCommandAsync('replaceitem entity @s slot.weapon.mainhand 0 twilightforest:zombie_scepter')
		}
	} catch { }
}

function subscribe() {
	world.events.dataDrivenEntityTriggerEvent.subscribe(onTargetAcquired, CreationSubscriptionOptions)
	world.events.dataDrivenEntityTriggerEvent.subscribe(onShieldBroken, ShieldSubscriptionOptions)
}

function unsubscribe() {
	world.events.dataDrivenEntityTriggerEvent.unsubscribe(onTargetAcquired)
	world.events.dataDrivenEntityTriggerEvent.unsubscribe(onShieldBroken)
}
export { subscribe, unsubscribe };