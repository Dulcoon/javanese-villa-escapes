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
    slug: "joglo-suite",
    img: roomJoglo,
    gallery: [roomJoglo, galleryGarden, galleryRestaurant],
    name: "Joglo Suite",
    tagline: "Paviliun kerajaan tahun 1920-an yang lahir kembali.",
    desc: "Langit-langit ukir tinggi dan tempat tidur jati berkelambu empat di bawah balok pendalungan antik.",
    longDesc: [
      "Terletak di dalam Joglo warisan sejarah yang asli, suite ini menawarkan pilar saka guru tinggi yang diukir dengan tangan dari kayu jati berusia seabad, beranda pribadi yang menghadap ke kolam koi, dan bak mandi batu berendam dalam yang dibingkai oleh sekat ukir Jepara.",
      "Tempat tidur king berkelambu empat, linen lurik tenunan lokal, dan perpustakaan seni Jawa yang dikuratori menjadikan suite ini sebagai tempat peristirahatan kami yang paling intim.",
    ],
    size: "65 m²",
    bed: "King",
    baseGuests: 12,
    maxGuests: 20,
    bathrooms: 1,
    view: "Kolam Koi & Taman",
    price: 3500000,
    features: ["Arsitektur Joglo warisan budaya", "Beranda pribadi", "Bak mandi batu berendam", "Termasuk sarapan harian"],
    amenities: ["Wi-Fi gratis", "AC", "Mini bar", "Mesin espresso", "Smart TV", "Brankas kamar"],
  },
  {
    slug: "garden-pavilion",
    img: roomPavilion,
    gallery: [roomPavilion, galleryPool, galleryGarden],
    name: "Garden Pavilion",
    tagline: "Kolam rendam pribadi di bawah pohon kamboja.",
    desc: "Kolam rendam pribadi dan daybed luar ruangan yang dibingkai oleh sekat ukir jepara.",
    longDesc: [
      "Sebuah paviliun berkonsep terbuka yang ditata di sekitar kolam rendam pribadi dan daybed luar ruangan, dengan bak mandi teraso berdiri bebas yang diposisikan untuk menangkap cahaya sore hari.",
      "Keindahan dalam dan luar ruangan menyatu dengan lembut di sini — pintu geser setinggi langit-langit terbuka lebar ke taman tropis pribadi Anda.",
    ],
    size: "85 m²",
    bed: "King",
    baseGuests: 12,
    maxGuests: 20,
    bathrooms: 1,
    view: "Taman Pribadi & Kolam Rendam",
    price: 5400000,
    features: ["Kolam rendam pribadi", "Daybed luar ruangan", "Taman tropis berpagar", "Pelayan pribadi bersiap"],
    amenities: ["Wi-Fi gratis", "AC", "Mini bar", "Mesin espresso", "Smart TV", "Pancuran luar ruangan"],
  },
  {
    slug: "royal-villa",
    img: roomRoyal,
    gallery: [roomRoyal, galleryPool, galleryRestaurant],
    name: "Royal Two-Bedroom Villa",
    tagline: "Kediaman warisan leluhur dengan pelayan pribadi dan pemandangan sawah.",
    desc: "Kediaman warisan budaya dua lantai dengan pemandangan sawah dan pelayan pribadi.",
    longDesc: [
      "Kediaman utama kami — dua kamar tidur dengan ranjang king, kolam renang infinity pribadi sepanjang 12 meter, paviliun pendopo berukir tangan untuk bersantap di dalam villa, dan teras lantai atas dengan pemandangan sawah yang indah membentang.",
      "Dilengkapi dengan pelayan pribadi yang berdedikasi, koki pribadi berdasarkan permintaan, dan ritual kebugaran harian gratis di spa kami.",
    ],
    size: "180 m²",
    bed: "2 King",
    baseGuests: 12,
    maxGuests: 20,
    bathrooms: 2,
    view: "Sawah & Gunung Merapi",
    price: 7600000,
    features: ["Kolam renang infinity 12m", "Pelayan pribadi", "Pendopo makan pribadi", "Ritual spa harian"],
    amenities: ["Wi-Fi gratis", "AC", "Dua mini bar", "Mesin espresso", "Smart TV", "Gudang anggur (wine cellar)"],
  },
];

export const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export const getRoom = (slug: string) => rooms.find((r) => r.slug === slug);
