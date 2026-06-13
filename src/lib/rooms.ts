import roomJoglo from "@/assets/room-joglo.jpg";
import roomPavilion from "@/assets/room-pavilion.jpg";
import roomRoyal from "@/assets/room-royal.jpg";
import galleryPool from "@/assets/gallery-pool.jpg";
import galleryGarden from "@/assets/gallery-garden.jpg";
import galleryRestaurant from "@/assets/gallery-restaurant.jpg";

export type Room = {
  slug: string;
  img: string;
  gallery: string[];
  name: string;
  tagline: string;
  desc: string;
  longDesc: string[];
  size: string;
  bed: string;
  guests: number;
  bathrooms: number;
  view: string;
  price: number; // IDR per night
  features: string[];
  amenities: string[];
};

export const rooms: Room[] = [
  {
    slug: "joglo-suite",
    img: roomJoglo,
    gallery: [roomJoglo, galleryGarden, galleryRestaurant],
    name: "Joglo Suite",
    tagline: "A 1920s royal pavilion, reborn.",
    desc: "Soaring carved ceilings and a four-poster teak bed beneath antique pendalungan beams.",
    longDesc: [
      "Set within the original heritage Joglo, this suite features soaring saka guru pillars hand-carved from century-old teak, a private veranda overlooking the koi pond, and a deep stone soaking tub framed by carved Jepara screens.",
      "A four-poster king bed, locally woven lurik linens, and a curated library of Javanese art make this our most intimate retreat.",
    ],
    size: "65 m²",
    bed: "King",
    guests: 2,
    bathrooms: 1,
    view: "Koi Pond & Garden",
    price: 3500000,
    features: ["Heritage Joglo architecture", "Private veranda", "Stone soaking tub", "Daily breakfast included"],
    amenities: ["Free Wi-Fi", "Air conditioning", "Mini bar", "Espresso machine", "Smart TV", "In-room safe"],
  },
  {
    slug: "garden-pavilion",
    img: roomPavilion,
    gallery: [roomPavilion, galleryPool, galleryGarden],
    name: "Garden Pavilion",
    tagline: "A private plunge pool beneath frangipani trees.",
    desc: "A private plunge pool and outdoor daybed framed by hand-carved jepara screens.",
    longDesc: [
      "An open-plan pavilion arranged around a private plunge pool and outdoor daybed, with a freestanding terrazzo bath positioned to catch the late afternoon light.",
      "Indoor and outdoor blur softly here — full-height sliding doors open onto a walled tropical garden of your own.",
    ],
    size: "85 m²",
    bed: "King",
    guests: 2,
    bathrooms: 1,
    view: "Private Garden & Plunge Pool",
    price: 5400000,
    features: ["Private plunge pool", "Outdoor daybed", "Walled tropical garden", "Butler on call"],
    amenities: ["Free Wi-Fi", "Air conditioning", "Mini bar", "Espresso machine", "Smart TV", "Outdoor shower"],
  },
  {
    slug: "royal-villa",
    img: roomRoyal,
    gallery: [roomRoyal, galleryPool, galleryRestaurant],
    name: "Royal Two-Bedroom Villa",
    tagline: "A heritage residence with a butler and rice-paddy views.",
    desc: "Two-storey heritage residence with rice-paddy views and a private butler.",
    longDesc: [
      "Our flagship residence — two king bedrooms, a private 12-metre infinity pool, a hand-carved pendopo pavilion for in-villa dining, and an upstairs terrace with sweeping rice-paddy views.",
      "Comes with a dedicated butler, private chef on request, and complimentary daily wellness ritual at our spa.",
    ],
    size: "180 m²",
    bed: "2 Kings",
    guests: 4,
    bathrooms: 2,
    view: "Rice Paddies & Volcano",
    price: 7600000,
    features: ["12 m infinity pool", "Private butler", "Pendopo dining pavilion", "Daily spa ritual"],
    amenities: ["Free Wi-Fi", "Air conditioning", "Two mini bars", "Espresso machine", "Smart TVs", "Wine cellar"],
  },
];

export const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export const getRoom = (slug: string) => rooms.find((r) => r.slug === slug);
