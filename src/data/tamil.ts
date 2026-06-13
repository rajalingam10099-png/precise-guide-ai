// Tamil learning content for Kural AI.
// Each item maps to the Lesson screen format from the requirements:
// letter, exampleWord (Tamil), English meaning, Hindi meaning, emoji image.

export type LessonItem = {
  id: string;
  letter: string;
  word: string;
  english: string;
  hindi: string;
  emoji: string;
};

export const uyirEzhuthu: LessonItem[] = [
  { id: "u1", letter: "அ", word: "அணில்", english: "Squirrel", hindi: "गिलहरी", emoji: "🐿️" },
  { id: "u2", letter: "ஆ", word: "ஆடு", english: "Goat", hindi: "बकरी", emoji: "🐐" },
  { id: "u3", letter: "இ", word: "இலை", english: "Leaf", hindi: "पत्ता", emoji: "🍃" },
  { id: "u4", letter: "ஈ", word: "ஈ", english: "Fly", hindi: "मक्खी", emoji: "🪰" },
  { id: "u5", letter: "உ", word: "உரல்", english: "Mortar", hindi: "ओखली", emoji: "🪨" },
  { id: "u6", letter: "ஊ", word: "ஊஞ்சல்", english: "Swing", hindi: "झूला", emoji: "🛝" },
  { id: "u7", letter: "எ", word: "எலி", english: "Mouse", hindi: "चूहा", emoji: "🐭" },
  { id: "u8", letter: "ஏ", word: "ஏணி", english: "Ladder", hindi: "सीढ़ी", emoji: "🪜" },
  { id: "u9", letter: "ஐ", word: "ஐந்து", english: "Five", hindi: "पाँच", emoji: "5️⃣" },
  { id: "u10", letter: "ஒ", word: "ஒட்டகம்", english: "Camel", hindi: "ऊँट", emoji: "🐪" },
  { id: "u11", letter: "ஓ", word: "ஓடம்", english: "Boat", hindi: "नाव", emoji: "⛵" },
  { id: "u12", letter: "ஔ", word: "ஔடதம்", english: "Medicine", hindi: "दवा", emoji: "💊" },
];

export const meiEzhuthu: LessonItem[] = [
  { id: "m1", letter: "க்", word: "கல்", english: "Stone", hindi: "पत्थर", emoji: "🪨" },
  { id: "m2", letter: "ங்", word: "அங்கம்", english: "Part", hindi: "अंग", emoji: "🫱" },
  { id: "m3", letter: "ச்", word: "சட்டை", english: "Shirt", hindi: "कमीज़", emoji: "👕" },
  { id: "m4", letter: "ஞ்", word: "ஞாயிறு", english: "Sunday", hindi: "रविवार", emoji: "☀️" },
  { id: "m5", letter: "ட்", word: "டப்பா", english: "Box", hindi: "डिब्बा", emoji: "📦" },
  { id: "m6", letter: "ண்", word: "மண்", english: "Soil", hindi: "मिट्टी", emoji: "🌱" },
  { id: "m7", letter: "த்", word: "தண்ணீர்", english: "Water", hindi: "पानी", emoji: "💧" },
  { id: "m8", letter: "ந்", word: "நரி", english: "Fox", hindi: "लोमड़ी", emoji: "🦊" },
  { id: "m9", letter: "ப்", word: "பல்", english: "Tooth", hindi: "दाँत", emoji: "🦷" },
  { id: "m10", letter: "ம்", word: "மரம்", english: "Tree", hindi: "पेड़", emoji: "🌳" },
  { id: "m11", letter: "ய்", word: "யானை", english: "Elephant", hindi: "हाथी", emoji: "🐘" },
  { id: "m12", letter: "ர்", word: "ரயில்", english: "Train", hindi: "रेलगाड़ी", emoji: "🚂" },
  { id: "m13", letter: "ல்", word: "லட்டு", english: "Laddu", hindi: "लड्डू", emoji: "🍬" },
  { id: "m14", letter: "வ்", word: "வண்டி", english: "Cart", hindi: "गाड़ी", emoji: "🛺" },
  { id: "m15", letter: "ழ்", word: "மழை", english: "Rain", hindi: "बारिश", emoji: "🌧️" },
  { id: "m16", letter: "ள்", word: "வாள்", english: "Sword", hindi: "तलवार", emoji: "🗡️" },
  { id: "m17", letter: "ற்", word: "ஆறு", english: "River", hindi: "नदी", emoji: "🏞️" },
  { id: "m18", letter: "ன்", word: "மீன்", english: "Fish", hindi: "मछली", emoji: "🐟" },
];

// Word builder puzzles: split a word into letter chunks.
export type WordPuzzle = {
  id: string;
  parts: string[];
  answer: string;
  english: string;
  hindi: string;
  emoji: string;
};

export const wordPuzzles: WordPuzzle[] = [
  { id: "w1", parts: ["ஆ", "டு"], answer: "ஆடு", english: "Goat", hindi: "बकरी", emoji: "🐐" },
  { id: "w2", parts: ["ம", "ர", "ம்"], answer: "மரம்", english: "Tree", hindi: "पेड़", emoji: "🌳" },
  { id: "w3", parts: ["ய", "னை"], answer: "யனை", english: "Elephant (practice)", hindi: "हाथी", emoji: "🐘" },
  { id: "w4", parts: ["மீ", "ன்"], answer: "மீன்", english: "Fish", hindi: "मछली", emoji: "🐟" },
  { id: "w5", parts: ["ம", "ழை"], answer: "மழை", english: "Rain", hindi: "बारिश", emoji: "🌧️" },
  { id: "w6", parts: ["ந", "ரி"], answer: "நரி", english: "Fox", hindi: "लोमड़ी", emoji: "🦊" },
];

export type Difficulty = "easy" | "medium" | "hard";

export function getQuizPool(difficulty: Difficulty): LessonItem[] {
  if (difficulty === "easy") return uyirEzhuthu;
  if (difficulty === "medium") return meiEzhuthu;
  return [...uyirEzhuthu, ...meiEzhuthu];
}

export const allLessons = [...uyirEzhuthu, ...meiEzhuthu];
