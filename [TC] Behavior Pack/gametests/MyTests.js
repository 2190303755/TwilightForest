import * as GameTest from "GameTest";
import { Blocks } from "Minecraft";

const FiveSecondsInTicks = 5 * 20;

///
// Concrete Tests
///
GameTest.register(
  "MyTests",
  "concrete_solidifies_in_shallow_water",
  (test) => {
    test.setBlock(Blocks.concretepowder(), 1, 3, 1);

    test.succeedWhen((test) => {
      test.assertBlockPresent(Blocks.concrete(), 1, 2, 1);
    });
  }
).maxTicks(FiveSecondsInTicks);

GameTest.register("MyTests", "concrete_solidifies_in_deep_water", (test) => {
  test.setBlock(Blocks.concretepowder(), 1, 4, 1);

  test.succeedWhen((test) => {
    test.assertBlockPresent(Blocks.concrete(), 1, 2, 1);
  });
}).maxTicks(FiveSecondsInTicks);

GameTest.register("MyTests", "concrete_solidifies_next_to_water", (test) => {
  test.setBlock(Blocks.concretepowder(), 1, 3, 1);

  test.succeedWhen((test) => {
    test.assertBlockPresent(Blocks.concrete(), 1, 2, 1);
  });
}).maxTicks(FiveSecondsInTicks);

GameTest.register("MyTests", "sand_fall_boats", (test) => {
  test.setBlock(Blocks.sand(), 1, 4, 1);

  test.succeedWhen((test) => {
    test.assertBlockPresent(Blocks.sand(), 1, 2, 1);
  });
}).maxTicks(FiveSecondsInTicks);

///
// Turtle Egg Tests
///

GameTest.register("MyTests", "turtle_eggs_survive_xp", (test) => {
  const xpOrb = "minecraft:xp_orb";
  test.spawn(xpOrb, 1, 3, 1);
  test.spawn(xpOrb, 1, 3, 1);
  test.spawn(xpOrb, 1, 3, 1);
  test.spawn(xpOrb, 1, 3, 1);
  test.spawn(xpOrb, 1, 3, 1);
  test.spawn(xpOrb, 1, 3, 1);
  test.spawn(xpOrb, 1, 3, 1);
  test.spawn(xpOrb, 1, 3, 1);

  // Fail if the turtle egg dies
  test.failIf((test) => {
    test.assertBlockPresent(Blocks.air(), 1, 2, 1);
  });

  // Succeed after 4 seconds
  test.runAfterDelay(4 * 20, (test) => {
    test.succeed();
  });
}).maxTicks(FiveSecondsInTicks);

GameTest.register("MyTests", "turtle_eggs_survive_item", (test) => {
  test.pressButton(2, 4, 0);

  // Fail if the turtle egg dies
  test.failIf((test) => {
    test.assertBlockPresent(Blocks.air(), 1, 2, 1);
  });

  // Succeed after 4 seconds
  test.runAfterDelay(4 * 20, (test) => {
    test.succeed();
  });
}).maxTicks(FiveSecondsInTicks);
