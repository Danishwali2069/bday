// ═══════════════════════════════════════════════════════════════
// 🎀 BIRTHDAY CELEBRATION CONFIGURATION
// Customize the birthday girl's details, photos, and messages here!
// ═══════════════════════════════════════════════════════════════

export const BIRTHDAY_CONFIG = {
  // Birthday person's name and default age
  name: "baby",
  defaultAge: 21,

  // Main banner heading displayed across the top
  topHeading: "🎀 Happiest Birthday baby! 🎀",

  // Blow prompt hint displayed below the cake
  blowHintText: "🎂 BLOW INTO YOUR MIC — OR PRESS SPACE 🎂",

  // Final celebration messages revealed after blowing candles
  finalHeading: "Happy Birthday, Beautiful! 🎀",
  finalMessage: "May your day be filled with love, happiness, and countless beautiful memories. You deserve all the happiness in the world. 💗",

  // The 4 real photos of the birthday girl
  // Photo 1 is the large featured portrait on the left; Photos 2-4 are arranged gracefully beside it
  photos: [
    {
      id: "featured",
      src: "assets/images/birthday-girl/photo-1.jpg",
      title: "Forever Gorgeous ✨",
      date: "Birthday Queen",
      objectPosition: "center 20%",
      rotation: -3.5
    },
    {
      id: "photo-2",
      src: "assets/images/birthday-girl/photo-2.jpg",
      title: "Grace & Elegance 🌸",
      date: "Precious Moments",
      objectPosition: "center 35%",
      rotation: 5
    },
    {
      id: "photo-3",
      src: "assets/images/birthday-girl/photo-3.jpg",
      title: "Sweet Memories 💖",
      date: "Pure Joy",
      objectPosition: "center 45%",
      rotation: -3
    },
    {
      id: "photo-4",
      src: "assets/images/birthday-girl/photo-4.jpg",
      title: "Queen of Smiles ☕💕",
      date: "Sunshine Vibe",
      objectPosition: "center 30%",
      rotation: 4
    }
  ],

  // Background music settings
  music: {
    enabled: true,
    volume: 0.35,
    autoPlayOnStart: true
  },

  // Visual Theme Colors
  theme: {
    primaryPink: "#ff4081",
    softBabyPink: "#ffccd5",
    blushCream: "#fff6f6",
    lavenderLilac: "#a872a9",
    glowAccent: "#ff1493"
  }
};
