/**
 * Nicknames are picked by the teacher's screen from these lists, never typed by
 * a student, so no real name or unkind word can reach the projector. Every
 * combination of a colour and an animal reads as a harmless name.
 */
export const NICKNAME_COLOURS = [
  "Amber", "Blue", "Bronze", "Coral", "Copper", "Crimson", "Golden", "Green",
  "Indigo", "Jade", "Lemon", "Lilac", "Mint", "Orange", "Pearl", "Plum",
  "Ruby", "Sage", "Scarlet", "Silver", "Teal", "Violet",
] as const;

export const NICKNAME_ANIMALS = [
  "Badger", "Beaver", "Bison", "Cheetah", "Dolphin", "Eagle", "Falcon", "Ferret",
  "Gecko", "Hare", "Hedgehog", "Heron", "Koala", "Lemur", "Lynx", "Meerkat",
  "Moose", "Narwhal", "Otter", "Owl", "Panda", "Penguin", "Puffin", "Robin",
  "Seal", "Squirrel", "Swift", "Tiger", "Toucan", "Walrus", "Wombat", "Wren",
] as const;

/** Returns a nickname not already in `taken`. `random` returns a number in [0, 1). */
export function pickNickname(taken: ReadonlySet<string>, random: () => number = Math.random): string {
  const total = NICKNAME_COLOURS.length * NICKNAME_ANIMALS.length;
  const start = Math.floor(random() * total);
  for (let step = 0; step < total; step += 1) {
    const index = (start + step * 7919) % total;
    const name = `${NICKNAME_COLOURS[index % NICKNAME_COLOURS.length]} ${NICKNAME_ANIMALS[Math.floor(index / NICKNAME_COLOURS.length)]}`;
    if (!taken.has(name)) return name;
  }
  // More players than names: never reached with the relay's 60-player limit.
  return `Player ${taken.size + 1}`;
}
