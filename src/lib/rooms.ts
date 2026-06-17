import roomJoglo from "@/assets/room-joglo.webp";
import roomPavilion from "@/assets/room-pavilion.webp";
import roomRoyal from "@/assets/room-royal.webp";
import galleryPool from "@/assets/gallery-pool.webp";
import galleryGarden from "@/assets/gallery-garden.webp";
import galleryRestaurant from "@/assets/gallery-restaurant.webp";

import marmeImage from "@/assets/marme-image.webp";
import marmeGallery1 from "@/assets/marme-galery-1.webp";
import marmeGallery2 from "@/assets/marme-galery-2.webp";
import marmeGallery3 from "@/assets/marme-galery-3.webp";

import arasaImage from "@/assets/arasa-image.webp";
import arasaGallery1 from "@/assets/arasa-galery-1.webp";
import arasaGallery2 from "@/assets/arasa-galery-2.webp";
import arasaGallery3 from "@/assets/arasa-galery-3.webp";

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
  baseGuests: number;
  maxGuests: number;
  bathrooms: number;
  view: string;
  price: number; // IDR per night
  features: string[];
  amenities: string[];
};

export const rooms: Room[] = [
  {
    slug: "marme-villa",
    img: marmeImage,
    gallery: [marmeGallery1, marmeGallery2, marmeGallery3],
    name: "Marme Villa",
    tagline: "Paviliun kerajaan tahun 1920-an yang lahir kembali.",
    desc: "Langit-langit ukir tinggi dan tempat tidur jati berkelambu empat di bawah balok pendalungan antik.",
    longDesc: [
      "Terletak di dalam Joglo warisan sejarah yang asli, suite ini menawarkan pilar saka guru tinggi yang diukir dengan tangan dari kayu jati berusia seabad, beranda pribadi yang menghadap ke kolam koi, dan bak mandi batu berendam dalam yang dibingkai oleh sekat ukir Jepara.",
      "Tempat tidur king berkelambu empat, linen lurik tenunan lokal, dan perpustakaan seni Jawa yang dikuratori menjadikan suite ini sebagai tempat peristirahatan kami yang paling intim.",
    ],
    size: "65 m²",
    bed: "4",
    baseGuests: 12,
    maxGuests: 20,
    bathrooms: 1,
    view: "Kolam Koi & Taman",
    price: 3500000,
    features: ["Arsitektur Joglo warisan budaya", "Beranda pribadi", "Bak mandi batu berendam", "Termasuk sarapan harian"],
    amenities: ["Wi-Fi gratis", "AC", "Mini bar", "Mesin espresso", "Smart TV", "Brankas kamar"],
  },
  {
    slug: "arasa-villa",
    img: arasaImage,
    gallery: [arasaGallery1, arasaGallery2, arasaGallery3],
    name: "Arasa Villa by Marme",
    tagline: "Kolam rendam pribadi di bawah pohon kamboja.",
    desc: "Kolam rendam pribadi dan daybed luar ruangan yang dibingkai oleh sekat ukir jepara.",
    longDesc: [
      "Sebuah paviliun berkonsep terbuka yang ditata di sekitar kolam rendam pribadi dan daybed luar ruangan, dengan bak mandi teraso berdiri bebas yang diposisikan untuk menangkap cahaya sore hari.",
      "Keindahan dalam dan luar ruangan menyatu dengan lembut di sini — pintu geser setinggi langit-langit terbuka lebar ke taman tropis pribadi Anda.",
    ],
    size: "85 m²",
    bed: "5",
    baseGuests: 12,
    maxGuests: 20,
    bathrooms: 1,
    view: "Taman Pribadi & Kolam Rendam",
    price: 5400000,
    features: ["Kolam rendam pribadi", "Daybed luar ruangan", "Taman tropis berpagar", "Pelayan pribadi bersiap"],
    amenities: ["Wi-Fi gratis", "AC", "Mini bar", "Mesin espresso", "Smart TV", "Pancuran luar ruangan"],
  },
];

export const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export const getRoom = (slug: string) => rooms.find((r) => r.slug === slug);
