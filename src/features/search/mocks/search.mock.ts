import { Product } from "../types/search.type";

export const mockProducts: Product[] = [
  {
    id: 1,
    source: "alibaba",
    source_url: "https://alibaba.com/product/1",
    external_id: "ALI001",

    title: "iPhone 17 Pro Max Camera Lens Protector",

    short_description: {
      intro: "Premium tempered glass lens protector",
      advantages: "Anti scratch, HD clear",
    },

    original_description: "",

    currency: "USD",
    min_price: "2.50",
    max_price: "5.00",

    best_supplier_score: 95,
    rating: 4.8,
    review_count: 1250,

    specifications: {
      Brand: "ATB",
      Compatible: "iPhone 17 Pro Max",
    },

    imported_at: "",
    updated_at: "",

    suppliers: [],

    images: [
      {
        id: 1,
        image_url:
          "https://sc04.alicdn.com/kf/Hf833b3cbfa904cc1b1247cb781069c69e.jpg",
        width: 1000,
        height: 1000,
        score: 99,
        is_primary: true,
      },
    ],
  },

  {
    id: 2,
    source: "amazon",
    source_url: "https://amazon.com/product/2",
    external_id: "AMZ001",

    title: "Samsung Galaxy S26 Tempered Glass",

    short_description: {
      intro: "Full screen protection",
      advantages: "9H hardness",
    },

    original_description: "",

    currency: "USD",
    min_price: "3.00",
    max_price: "6.00",

    best_supplier_score: 88,
    rating: 4.6,
    review_count: 820,

    specifications: {
      Brand: "Spigen",
      Compatible: "Samsung Galaxy S26",
    },

    imported_at: "",
    updated_at: "",

    suppliers: [],

    images: [
      {
        id: 2,
        image_url:
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
        width: 1000,
        height: 1000,
        score: 95,
        is_primary: true,
      },
    ],
  },

  {
    id: 3,
    source: "1688",
    source_url: "https://1688.com/product/3",
    external_id: "1688001",

    title: "Apple Watch Ultra Silicone Band",

    short_description: {
      intro: "Soft silicone replacement strap",
      advantages: "Water resistant",
    },

    original_description: "",

    currency: "USD",
    min_price: "1.20",
    max_price: "2.50",

    best_supplier_score: 90,
    rating: 4.4,
    review_count: 340,

    specifications: {
      Brand: "OEM",
      Compatible: "Apple Watch Ultra",
    },

    imported_at: "",
    updated_at: "",

    suppliers: [],

    images: [
      {
        id: 3,
        image_url:
          "https://images.unsplash.com/photo-1546868871-7041f2a55e12",
        width: 1000,
        height: 1000,
        score: 93,
        is_primary: true,
      },
    ],
  },

  {
    id: 4,
    source: "alibaba",
    source_url: "https://alibaba.com/product/4",
    external_id: "ALI004",

    title: "AirPods Pro 3 Protective Case",

    short_description: {
      intro: "Shockproof silicone case",
      advantages: "Dust resistant",
    },

    original_description: "",

    currency: "USD",
    min_price: "0.80",
    max_price: "1.80",

    best_supplier_score: 92,
    rating: 4.7,
    review_count: 560,

    specifications: {
      Brand: "OEM",
      Compatible: "AirPods Pro 3",
    },

    imported_at: "",
    updated_at: "",

    suppliers: [],

    images: [
      {
        id: 4,
        image_url:
          "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46",
        width: 1000,
        height: 1000,
        score: 94,
        is_primary: true,
      },
    ],
  },

  {
    id: 5,
    source: "amazon",
    source_url: "https://amazon.com/product/5",
    external_id: "AMZ005",

    title: "USB-C Fast Charging Cable 100W",

    short_description: {
      intro: "Braided USB-C cable",
      advantages: "100W Power Delivery",
    },

    original_description: "",

    currency: "USD",
    min_price: "1.50",
    max_price: "3.50",

    best_supplier_score: 85,
    rating: 4.5,
    review_count: 2100,

    specifications: {
      Brand: "Baseus",
      Length: "2m",
    },

    imported_at: "",
    updated_at: "",

    suppliers: [],

    images: [
      {
        id: 5,
        image_url:
          "https://images.unsplash.com/photo-1583863788434-e58a36330cf0",
        width: 1000,
        height: 1000,
        score: 96,
        is_primary: true,
      },
    ],
  },
];