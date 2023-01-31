import {
  world,
  system,
  EntityMarkVariantComponent,
  EntityHealthComponent,
  EntitySkinIdComponent
} from "@minecraft/server";

const SubscriptionMap = new Map();
const CreationSubscriptionOptions = {
  entityTypes: ['twilightforest:lich'],
  eventTypes: ['twilightforest:on_target_acquired']
};
const ShieldSubscriptionOptions = {
  entityTypes: ['twilightforest:lich'],
  eventTypes: ['twilightforest:on_shield_broken']
};
const ShadowCloneQueryOptions = {
  type: 'twilightforest:lich',
  tags: ['ShadowClone'],
  maxDistance: 48
};
const CreateMinionQueryOptions = {
  type: 'twilightforest:lich_minion',
  maxDistance: 16
};
const LichDieEventOptions = {
  entityTypes: ['twilightforest:lich']
};

class CreationSubscription {
  constructor(entity) {
    this.id = entity.id;
    this.entity = entity;
    SubscriptionMap.set(this.id, this);
  }
  #spawnCreation(typeId, options, amount) {
    const id = this.id;
    const entity = this.entity;
    const location = entity.location;
    const dimension = entity.dimension;
    const creations = dimension.getEntities(Object.assign({ location: location }, options));
    let sum = 0;
    for (const creation of creations) {
      sum += creation.hasTag(id);
    }
    if (sum < amount) {
      const creation = dimension.spawnEntity(typeId, location);
      creation.addTag(id);
      return creation;
    }
    return undefined;
  }
  action(shadowCooldown, minionCooldown) {
    const entity = this.entity;
    const location = entity.location;
    if (entity.target && entity.getComponent(EntityHealthComponent.componentId).current > 0) {
      if (shadowCooldown > 0) {
        shadowCooldown -= 1;
      } else {
        const creation = this.#spawnCreation('twilightforest:lich<twilightforest:is_shadow>', ShadowCloneQueryOptions, 2);
        if (creation) {
          shadowCooldown = 45;
          creation.runCommandAsync(`spreadplayers ${location.x} ${location.z} 0 8 @s`);
        }
      }
      if (minionCooldown > 0) {
        minionCooldown -= 1
      } else if (entity.getComponent(EntityMarkVariantComponent.componentId).value) {
        const creation = this.#spawnCreation('twilightforest:lich_minion', CreateMinionQueryOptions, 3);
        if (creation) {
          entity.triggerEvent('twilightforest:on_summon_minion');
          minionCooldown = 20;
          creation.runCommandAsync(`spreadplayers ${location.x} ${location.z} 0 2 @s`);
        }
      }
      system.run(() => { this.action(shadowCooldown, minionCooldown); });
    } else {
      SubscriptionMap.delete(this.id);
    }
    try {
    } catch (e) {
      SubscriptionMap.delete(this.id);
    }
  }
}

function onLichDie(args) {
  const entity = args.deadEntity;
  if (!entity.hasTag('ShadowClone')) {
    for (const creation of entity.dimension.getEntities(Object.assign({ location: entity.location }, ShadowCloneQueryOptions))) {
      if (creation.hasTag('ShadowClone')) {
        creation.triggerEvent('twilightforest:despawn');
      }
    }
  }
}

function onTargetAcquired(args) {
  new CreationSubscription(args.entity).action(0, 0);
}

function onShieldBroken(args) {
  const entity = args.entity;
  const health = args.entity.getComponent(EntityHealthComponent.componentId);
  const shields = args.entity.getComponent(EntitySkinIdComponent.componentId);
  shields.value -= 1;
  if (shields.value) {
    health.setCurrent(health.value * shields.value / 6);
  } else {
    health.resetToMaxValue();
    entity.triggerEvent('twilightforest:check_minions');
    entity.runCommandAsync('replaceitem entity @s slot.weapon.mainhand 0 twilightforest:zombie_scepter');
  }
}

export function subscribe() {
  world.events.entityDie.subscribe(onLichDie, LichDieEventOptions);
  world.events.dataDrivenEntityTriggerEvent.subscribe(onTargetAcquired, CreationSubscriptionOptions);
  world.events.dataDrivenEntityTriggerEvent.subscribe(onShieldBroken, ShieldSubscriptionOptions);
}

export function unsubscribe() {
  world.events.entityDie.unsubscribe(onLichDie);
  world.events.dataDrivenEntityTriggerEvent.unsubscribe(onTargetAcquired);
  world.events.dataDrivenEntityTriggerEvent.unsubscribe(onShieldBroken);
}