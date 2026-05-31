export type FoodKey = "donuts" | "mousse" | "icecream" | "cupcake";
export type ToyKey = "mouse" | "softblocks" | "plushdino" | "crystalball";

export type RewardItem =
  | { type: "food"; key: FoodKey; label: string; image: string }
  | { type: "toy"; key: ToyKey; label: string; image: string };

export type BundleReward = { type: "bundle"; items: RewardItem[] };

const foodOptions: Array<Extract<RewardItem, { type: "food" }>> = [
  { type: "food", key: "donuts", label: "Donut", image: "/assets/nulla/foods/donut.png" },
  { type: "food", key: "mousse", label: "Mousse", image: "/assets/nulla/foods/mousse.png" },
  { type: "food", key: "icecream", label: "Ice Cream", image: "/assets/nulla/foods/icecream.png" },
  { type: "food", key: "cupcake", label: "Cupcake", image: "/assets/nulla/foods/cupcake.png" },
];

const toyOptions: Array<Extract<RewardItem, { type: "toy" }>> = [
  { type: "toy", key: "mouse", label: "Mouse", image: "/assets/nulla/toys/mouse.png" },
  { type: "toy", key: "softblocks", label: "Soft Blocks", image: "/assets/nulla/toys/softblocks.png" },
  { type: "toy", key: "plushdino", label: "Plush Dino", image: "/assets/nulla/toys/plushdino.png" },
  { type: "toy", key: "crystalball", label: "Crystal Ball", image: "/assets/nulla/toys/crystalball.png" },
];

const getRandomInt = (min: number, max: number) => {
  const low = Math.ceil(min);
  const high = Math.floor(max);
  return Math.floor(Math.random() * (high - low + 1)) + low;
};

const pickRandomFood = (): Extract<RewardItem, { type: "food" }> => {
  const pick = foodOptions[Math.floor(Math.random() * foodOptions.length)];
  return pick;
};

const pickRandomToy = (): Extract<RewardItem, { type: "toy" }> => {
  const pick = toyOptions[Math.floor(Math.random() * toyOptions.length)];
  return pick;
};

export const buildBundleReward = (): BundleReward => {
  const bundleSize = getRandomInt(3, 6);
  const items: RewardItem[] = [];

  for (let i = 0; i < bundleSize; i += 1) {
    items.push(Math.random() < 0.5 ? pickRandomFood() : pickRandomToy());
  }

  return { type: "bundle", items };
};
