import type { Persona } from "./types";

export const PERSONAS: Persona[] = [
  {
    id: "maya",
    name: "Maya Okonkwo",
    role: "The midterm regular",
    comesFor: "A quiet table and something that isn't soda-sweet",
    bio: "Third-year, corner booth, laptop stickers. She has written two papers here and will write a third if the parfait doesn't put her to sleep.",
    emoji: "📚",
    blush: "#f3d6b8",
    weights: {
      tart: 2,
      coffee: 2,
      light: 2,
      healthy: 1,
      fruit: 1,
      novel: 1,
      sweet: -2,
      rich: -1,
      bakeryClone: -3,
    },
    vetoAllergens: [],
    priceSensitivity: 0.85,
    noveltyHunger: 0.55,
    bakerySkepticism: 0.9,
    quotes: {
      rave: [
        "I would skip the dining hall for this. The {favorite} actually wakes me up.",
        "This is the first parfait that doesn't taste like a candle. {favorite} is doing real work.",
      ],
      like: [
        "I'd order this between classes. {favorite} keeps it from being dessert-for-babies.",
        "Solid study fuel. Not a sugar crash waiting to happen.",
      ],
      meh: [
        "It's fine? I'd still come for the outlet. The {concern} is a little much for a Tuesday.",
        "I wouldn't walk past The Bakery for this. Needs more bite.",
      ],
      pass: [
        "Too sweet. I can get that next door for cheaper and I already don't.",
        "This would put me in a lecture coma. Hard pass on the {concern}.",
      ],
      veto: [
        "I can't eat this. {concern}. I'll take a black coffee and the booth, thanks.",
      ],
    },
  },
  {
    id: "noah",
    name: "Noah Ellison",
    role: "Awkward first date",
    comesFor: "Something shareable that photographs well and does not drip",
    bio: "He reserved the window two-top. He needs a parfait that gives them something to talk about besides internships.",
    emoji: "🌷",
    blush: "#f4cfc4",
    weights: {
      photogenic: 3,
      fruit: 1,
      creamy: 1,
      floral: 1,
      novel: 1,
      nostalgic: 1,
      bitter: -2,
      coffee: -1,
      bakeryClone: -2,
    },
    vetoAllergens: [],
    priceSensitivity: 0.45,
    noveltyHunger: 0.6,
    bakerySkepticism: 0.55,
    quotes: {
      rave: [
        "Okay this looks like a postcard. I would absolutely split the {favorite} and pretend I planned it.",
        "This is a conversation. The {favorite} is unexpected in a good, not-scary way.",
      ],
      like: [
        "Cute enough to order. I can work with {favorite}. Please do not make it messy.",
        "I'd feel fine putting this between us. Pretty, not try-hard.",
      ],
      meh: [
        "It's a parfait. We'd still talk about the weather. The {concern} is a little loud.",
        "Looks fine in person, mid on a story. Needs a jewel on top.",
      ],
      pass: [
        "I am not serving this on a first date. The {concern} feels like a dare.",
        "This is either too plain or too weird. There is no in-between and I need the in-between.",
      ],
      veto: [
        "Can't risk an allergy on date one. {concern}. We will get tea.",
      ],
    },
  },
  {
    id: "helen",
    name: "Helen Cho",
    role: "Friday reunion",
    comesFor: "The taste of the years they still meet here",
    bio: "Thirty years of Fridays. She wants fall in a glass, not a science project. If it tastes like childhood, she will order a second for the table.",
    emoji: "🧣",
    blush: "#e8d4b8",
    weights: {
      nostalgic: 3,
      seasonal: 2,
      creamy: 2,
      nutty: 1,
      sweet: 1,
      rich: 1,
      novel: -2,
      bitter: -2,
      bakeryClone: -1,
    },
    vetoAllergens: [],
    priceSensitivity: 0.35,
    noveltyHunger: 0.15,
    bakerySkepticism: 0.4,
    quotes: {
      rave: [
        "Oh. That's the one. I can taste the {favorite} from the sidewalk.",
        "Don't change a thing. I will bring the girls. The {favorite} is exactly right.",
      ],
      like: [
        "Very nice, very fall. {favorite} reminds me of the old menu.",
        "I would order this after the library. Comfortable. Not showing off.",
      ],
      meh: [
        "A little fashionable for us. The {concern} is trying too hard.",
        "It's pretty. I still want the apple one you used to make.",
      ],
      pass: [
        "This is not our parfait. Too much {concern}. We'll split a coffee cake.",
        "I don't come here to be surprised. I come here to be known.",
      ],
      veto: [
        "One of us can't have that. {concern}. Put a slice of loaf on the table instead.",
      ],
    },
  },
  {
    id: "theo",
    name: "Theo Marin",
    role: "The flavor hunter",
    comesFor: "A reason to say The Bakery is for tourists",
    bio: "Writes little tasting notes in a phone. Will walk past a chain for a garnish that makes sense. If it is pumpkin-spice-shaped, he will post about it meanly.",
    emoji: "✍️",
    blush: "#d7c4b0",
    weights: {
      novel: 3,
      floral: 2,
      bitter: 2,
      coffee: 1,
      photogenic: 1,
      seasonal: 1,
      bakeryClone: -4,
      sweet: -2,
    },
    vetoAllergens: [],
    priceSensitivity: 0.15,
    noveltyHunger: 1,
    bakerySkepticism: 1,
    quotes: {
      rave: [
        "Finally. The {favorite} has a point of view. This could actually embarrass next door.",
        "I would tell people to come here for this. The {favorite} is not a seasonal sticker.",
      ],
      like: [
        "Interesting. {favorite} is the part I would mention. Don't sand it down.",
        "Better than the chain. Still one notch short of a destination.",
      ],
      meh: [
        "I have had this idea before. The {concern} is doing chain work.",
        "Competent. Forgettable. The opposite of a comeback.",
      ],
      pass: [
        "This is The Bakery with better lighting. The {concern} gave it away.",
        "I would not cross the street. There is no idea here.",
      ],
      veto: [
        "The {concern} takes it off my list entirely.",
      ],
    },
  },
  {
    id: "priya",
    name: "Priya Shah",
    role: "After yoga",
    comesFor: "Fruit that still feels like a treat",
    bio: "Walks over in cool-down. She will pay for something that tastes clean. If it is a sugar bomb, she goes home to leftover mango.",
    emoji: "🌿",
    blush: "#cfe0d0",
    weights: {
      healthy: 3,
      tart: 2,
      fruit: 2,
      light: 2,
      floral: 1,
      sweet: -2,
      rich: -2,
      bakeryClone: -2,
    },
    vetoAllergens: [],
    priceSensitivity: 0.5,
    noveltyHunger: 0.4,
    bakerySkepticism: 0.5,
    quotes: {
      rave: [
        "This is the rare dessert I would eat at 11am. {favorite} keeps it bright.",
        "Yes. Fresh, not heavy. I would become a pest about the {favorite}.",
      ],
      like: [
        "I would order this after class. {favorite} feels considered.",
        "Lighter than it looks. That matters.",
      ],
      meh: [
        "A bit rich for me. The {concern} sits in the glass.",
        "Pretty, but I would only finish half.",
      ],
      pass: [
        "This is a nap in a cup. Too much {concern}.",
        "I'll admire it from the sidewalk.",
      ],
      veto: [
        "Not for me — {concern}.",
      ],
    },
  },
  {
    id: "sam",
    name: "Sam Rivera",
    role: "Coach after practice",
    comesFor: "Something that eats like a reward",
    bio: "Whistle still around his neck. He wants caramel, crunch, and enough of it. Novelty is optional. Hunger is not.",
    emoji: "🏅",
    blush: "#f0d0a8",
    weights: {
      sweet: 2,
      rich: 2,
      crunchy: 2,
      chocolate: 2,
      nutty: 1,
      creamy: 1,
      light: -2,
      healthy: -1,
      bitter: -1,
      floral: -1,
    },
    vetoAllergens: [],
    priceSensitivity: 0.4,
    noveltyHunger: 0.2,
    bakerySkepticism: 0.25,
    quotes: {
      rave: [
        "That's a real dessert. The {favorite} slaps. I'm getting two if we win Saturday.",
        "I would bring the team. {favorite} is the part you fight over.",
      ],
      like: [
        "Yeah, I'd smash this. {favorite} is doing the job.",
        "Good size, good crunch. Not fussy.",
      ],
      meh: [
        "A little dainty. {concern} is for someone else.",
        "I would still eat it. I would not crave it.",
      ],
      pass: [
        "This is garnish. Where's the dessert? The {concern} is not food.",
        "I'll grab a muffin. This won't survive the bus ride.",
      ],
      veto: [
        "Can't do {concern}. Get me a brownie.",
      ],
    },
  },
];

export const PERSONA_MAP = Object.fromEntries(
  PERSONAS.map((persona) => [persona.id, persona]),
) as Record<string, Persona>;
