/**
 * Nicknames are picked by the teacher's screen from these lists, never typed by
 * a student, so no real name or unkind word can reach the projector. Every
 * combination of a colour and an animal reads as a harmless name, and every
 * animal has a drawn avatar (avatars.tsx) on a background of its colour.
 */
export const NICKNAME_COLOURS = [
  "Amber", "Blue", "Bronze", "Coral", "Copper", "Crimson", "Golden", "Green",
  "Indigo", "Jade", "Lemon", "Lilac", "Mint", "Orange", "Pearl", "Plum",
  "Ruby", "Sage", "Scarlet", "Silver", "Teal", "Violet",
] as const;

export const NICKNAME_ANIMALS = [
  "Badger", "Bear", "Cat", "Deer", "Duck", "Fox", "Frog", "Hamster",
  "Hedgehog", "Koala", "Lion", "Llama", "Mouse", "Narwhal", "Octopus", "Otter",
  "Owl", "Panda", "Penguin", "Puffin", "Rabbit", "Raccoon", "Seal", "Tiger",
] as const;

export type NicknameColour = (typeof NICKNAME_COLOURS)[number];
export type NicknameAnimal = (typeof NICKNAME_ANIMALS)[number];

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

/** The colour and animal a nickname is made of, or null for a name that is not one of ours. */
export function nicknameParts(name: string): { colour: NicknameColour; animal: NicknameAnimal } | null {
  const [colour, animal] = name.split(" ");
  if (!(NICKNAME_COLOURS as readonly string[]).includes(colour)) return null;
  if (!(NICKNAME_ANIMALS as readonly string[]).includes(animal)) return null;
  return { colour: colour as NicknameColour, animal: animal as NicknameAnimal };
}
