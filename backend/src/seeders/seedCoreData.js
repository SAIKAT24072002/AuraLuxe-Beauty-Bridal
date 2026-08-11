import dotenv from "dotenv";
import { connectDatabase } from "../config/database.js";
import Availability from "../models/Availability.js";
import BridalPackage from "../models/BridalPackage.js";
import Category from "../models/Category.js";
import Offer from "../models/Offer.js";
import Service from "../models/Service.js";
import SiteSettings from "../models/SiteSettings.js";
import Testimonial from "../models/Testimonial.js";
import { slugify } from "../utils/slugify.js";

dotenv.config();

const categorySeeds = [
  {
    name: "Hair Care",
    description: "Repair-driven hair rituals for shine, softness, and scalp wellness.",
    sortOrder: 1,
  },
  {
    name: "Skin Care",
    description: "Facials and skin treatments tailored for glow, hydration, and recovery.",
    sortOrder: 2,
  },
  {
    name: "Hands & Feet",
    description: "Luxury manicure and pedicure treatments for polished, nourished finish.",
    sortOrder: 3,
  },
  {
    name: "Bridal Makeup",
    description: "Event-ready beauty looks for bridal milestones and ceremonial celebrations.",
    sortOrder: 4,
  },
];

const serviceSeeds = [
  {
    name: "Hair Spa",
    categoryName: "Hair Care",
    shortDescription: "Deep nourishment ritual for damaged, dry, or tired hair.",
    description: "A restorative hair spa with scalp massage, steam therapy, and mask treatment.",
    price: 1800,
    durationMinutes: 75,
    advancePercentage: 30,
    featured: true,
  },
  {
    name: "Facial",
    categoryName: "Skin Care",
    shortDescription: "Glow-focused facial with cleansing, massage, and finishing mask.",
    description: "A premium facial service designed to brighten complexion and refresh the skin barrier.",
    price: 2200,
    durationMinutes: 90,
    advancePercentage: 35,
    featured: true,
  },
  {
    name: "Skin Care",
    categoryName: "Skin Care",
    shortDescription: "Targeted skin recovery session for hydration and smooth texture.",
    description: "Professional skin prep with exfoliation, hydration, and soothing finish.",
    price: 1600,
    durationMinutes: 60,
    advancePercentage: 30,
  },
  {
    name: "Manicure",
    categoryName: "Hands & Feet",
    shortDescription: "Luxury hand care with nail shaping, cuticle care, and polish prep.",
    description: "A polished manicure experience with nourishing treatment and refined finish.",
    price: 1200,
    durationMinutes: 50,
    advancePercentage: 25,
  },
  {
    name: "Pedicure",
    categoryName: "Hands & Feet",
    shortDescription: "Relaxing foot therapy with exfoliation, massage, and grooming.",
    description: "Premium pedicure service with soak, scrub, nail care, and stress-relief massage.",
    price: 1400,
    durationMinutes: 60,
    advancePercentage: 25,
  },
  {
    name: "Hair Styling",
    categoryName: "Hair Care",
    shortDescription: "Occasion styling for sleek, soft, and camera-ready looks.",
    description: "Custom styling session for parties, events, and special-occasion preparation.",
    price: 2500,
    durationMinutes: 90,
    advancePercentage: 50,
    featured: true,
  },
  {
    name: "Bridal Makeup",
    categoryName: "Bridal Makeup",
    shortDescription: "Classic bridal look with skin prep, base, eyes, and drape finish.",
    description: "Traditional bridal makeup service with premium products and look planning.",
    price: 12000,
    durationMinutes: 180,
    advancePercentage: 50,
  },
  {
    name: "HD Bridal Makeup",
    categoryName: "Bridal Makeup",
    shortDescription: "HD-finish bridal artistry for close-up photography and events.",
    description: "High-definition bridal glam with extended prep and luxury detailing.",
    price: 18500,
    durationMinutes: 210,
    advancePercentage: 50,
    featured: true,
  },
  {
    name: "Engagement Makeup",
    categoryName: "Bridal Makeup",
    shortDescription: "Elegant look for engagement ceremonies and portrait sessions.",
    description: "Sophisticated occasion makeup with hairstyle coordination and finishing touches.",
    price: 9000,
    durationMinutes: 150,
    advancePercentage: 35,
  },
  {
    name: "Reception Makeup",
    categoryName: "Bridal Makeup",
    shortDescription: "Reception-ready glam with lasting finish and statement styling.",
    description: "A polished reception makeup experience built for evening lights and longevity.",
    price: 11000,
    durationMinutes: 180,
    advancePercentage: 35,
  },
  {
    name: "Airbrush Bridal Makeup",
    categoryName: "Bridal Makeup",
    shortDescription: "Airbrush bridal finish for lightweight wear and flawless photography.",
    description: "Luxury airbrush bridal makeup designed for long events, humidity control, and skin-like finish.",
    price: 22000,
    durationMinutes: 240,
    advancePercentage: 50,
    featured: true,
  },
  {
    name: "Haldi Makeup",
    categoryName: "Bridal Makeup",
    shortDescription: "Fresh and luminous styling for haldi ceremonies.",
    description: "Soft, radiant makeup paired with lightweight styling for haldi events.",
    price: 6500,
    durationMinutes: 120,
    advancePercentage: 30,
  },
  {
    name: "Mehendi Makeup",
    categoryName: "Bridal Makeup",
    shortDescription: "Playful festive makeup with long-wear comfort for mehendi functions.",
    description: "Celebration-focused mehendi glam with expressive eyes and photo-friendly finish.",
    price: 7000,
    durationMinutes: 120,
    advancePercentage: 30,
  },
  {
    name: "Saree Draping",
    categoryName: "Bridal Makeup",
    shortDescription: "Precision draping support for bridal silhouettes and ceremony changes.",
    description: "Elegant draping assistance for saree, dupatta, and bridal presentation finishing.",
    price: 2500,
    durationMinutes: 60,
    advancePercentage: 50,
  },
  {
    name: "Pre-Bridal Preparation",
    categoryName: "Bridal Makeup",
    shortDescription: "Bridal prep session for skin, schedule, and styling coordination.",
    description: "A curated pre-bridal preparation session for skin readiness and event-day planning.",
    price: 5500,
    durationMinutes: 120,
    advancePercentage: 50,
  },
];

const bridalPackageSeeds = [
  {
    name: "Silver Bridal",
    coverImage:
      "https://images.unsplash.com/photo-1523264766116-1e09b3145b84?auto=format&fit=crop&w=1100&q=80",
    shortDescription: "An elegant bridal baseline for intimate celebrations.",
    fullDescription: "Includes bridal makeup, saree draping, hairstyle, lashes, and touch-up kit.",
    includedServices: [
      "Bridal Makeup",
      "Hairstyling",
      "Saree / Dupatta Draping",
      "Basic Touch-up Kit",
    ],
    price: 18000,
    discountPrice: 16500,
    advancePercentage: 50,
    durationMinutes: 240,
    homeServiceAvailable: true,
    venueServiceAvailable: true,
  },
  {
    name: "Gold Bridal",
    coverImage:
      "https://images.unsplash.com/photo-1525258946800-98cfd641d0de?auto=format&fit=crop&w=1100&q=80",
    shortDescription: "Balanced luxury for wedding, reception, and signature portrait moments.",
    fullDescription: "Adds HD base upgrade, premium hair detailing, and family member light touch-up.",
    includedServices: [
      "HD Bridal Makeup",
      "Premium Hairstyling",
      "Lens Assistance",
      "One Family Member Touch-up",
    ],
    price: 26000,
    discountPrice: 24000,
    advancePercentage: 40,
    durationMinutes: 300,
    featured: true,
    homeServiceAvailable: true,
    venueServiceAvailable: true,
  },
  {
    name: "Royal Bridal",
    coverImage:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1100&q=80",
    shortDescription: "High-touch bridal presentation for grand-scale wedding styling.",
    fullDescription: "A premium package with deluxe skin prep, HD artistry, draping, and extended stay support.",
    includedServices: [
      "Luxury Skin Prep",
      "HD Bridal Makeup",
      "Statement Hairstyling",
      "Jewellery Setting Assistance",
      "Extended Stay Touch-up Support",
    ],
    price: 36000,
    discountPrice: 33500,
    advancePercentage: 50,
    durationMinutes: 360,
    featured: true,
    homeServiceAvailable: true,
    venueServiceAvailable: true,
  },
];

const offerSeeds = [
  {
    name: "Weekday Glow Ritual",
    description: "Save on select facial and hair spa combinations from Monday to Thursday.",
    discountType: "PERCENTAGE",
    discountValue: 15,
    isActive: true,
  },
];

const testimonialSeeds = [
  {
    customerName: "Madhurima S.",
    review:
      "The bridal finish looked refined in person and stunning in photographs throughout the event.",
    rating: 5,
    serviceLabel: "HD Bridal Makeup",
    featured: true,
    isActive: true,
  },
];

const openingHours = [
  { day: "Monday", open: "10:00", close: "19:00", isClosed: false },
  { day: "Tuesday", open: "10:00", close: "19:00", isClosed: false },
  { day: "Wednesday", open: "10:00", close: "19:00", isClosed: false },
  { day: "Thursday", open: "10:00", close: "19:00", isClosed: false },
  { day: "Friday", open: "10:00", close: "19:00", isClosed: false },
  { day: "Saturday", open: "09:00", close: "20:00", isClosed: false },
  { day: "Sunday", open: "09:00", close: "18:00", isClosed: false },
];

async function dedupeCategories() {
  const categories = await Category.find({}).sort({ createdAt: 1, _id: 1 });
  const grouped = new Map();

  for (const category of categories) {
    const normalizedSlug = category.slug || slugify(category.name);
    const bucket = grouped.get(normalizedSlug) || [];
    bucket.push(category);
    grouped.set(normalizedSlug, bucket);
  }

  for (const [normalizedSlug, bucket] of grouped) {
    const keeper = bucket.find((item) => item.slug === normalizedSlug) || bucket[0];
    const duplicates = bucket.filter((item) => String(item._id) !== String(keeper._id));

    for (const duplicate of duplicates) {
      await Service.updateMany({ category: duplicate._id }, { $set: { category: keeper._id } });
      await Category.findByIdAndDelete(duplicate._id);
    }

    if (keeper.slug !== normalizedSlug) {
      keeper.slug = normalizedSlug;
      await keeper.save();
    }
  }
}

async function seedCategories() {
  await dedupeCategories();
  const categoryMap = new Map();

  for (const seed of categorySeeds) {
    const slug = slugify(seed.name);
    const category = await Category.findOneAndUpdate(
      { slug },
      { $set: { ...seed, slug, isActive: true } },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );
    categoryMap.set(seed.name, category);
  }

  return categoryMap;
}

async function seedServices(categoryMap) {
  for (const seed of serviceSeeds) {
    const category = categoryMap.get(seed.categoryName);
    await Service.findOneAndUpdate(
      { slug: slugify(seed.name) },
      {
        $set: {
          name: seed.name,
          slug: slugify(seed.name),
          category: category._id,
          shortDescription: seed.shortDescription,
          description: seed.description,
          price: seed.price,
          durationMinutes: seed.durationMinutes,
          advancePercentage: seed.advancePercentage,
          featured: Boolean(seed.featured),
          isAvailable: true,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );
  }
}

async function seedBridalPackages() {
  for (const seed of bridalPackageSeeds) {
    await BridalPackage.findOneAndUpdate(
      { slug: slugify(seed.name) },
      { $set: { ...seed, slug: slugify(seed.name), isActive: true } },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );
  }
}

async function seedBusinessMeta() {
  await Availability.findOneAndUpdate(
    { type: "BEAUTY" },
    {
      $set: {
        type: "BEAUTY",
        availableDays: [1, 2, 3, 4, 5, 6, 0],
        openingTime: "10:00",
        closingTime: "19:00",
        slotDurationMinutes: 30,
        isActive: true,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );

  await Availability.findOneAndUpdate(
    { type: "BRIDAL" },
    {
      $set: {
        type: "BRIDAL",
        availableDays: [1, 2, 3, 4, 5, 6, 0],
        openingTime: "07:00",
        closingTime: "20:00",
        slotDurationMinutes: 60,
        isActive: true,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );

  await SiteSettings.findOneAndUpdate(
    { key: "default" },
    {
      $set: {
        key: "default",
        businessName: "Luxe Beauty Parlour",
        heroTitle: "Signature beauty rituals for everyday confidence and bridal moments.",
        heroSubtitle:
          "Premium salon experiences, home service support, and polished event-ready artistry.",
        aboutText:
          "Luxe Beauty Parlour blends refined salon care with bridal artistry, thoughtful hospitality, and dependable scheduling.",
        phone: "+91 98765 43210",
        whatsapp: "+91 98765 43210",
        email: "hello@luxebeauty.local",
        address: "Lake Town, Kolkata, West Bengal",
        openingHours,
        cancellationPolicy:
          "Advance bookings can be rescheduled once with prior notice, subject to slot availability.",
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );

  for (const seed of offerSeeds) {
    await Offer.findOneAndUpdate(
      { name: seed.name },
      { $set: seed },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );
  }

  for (const seed of testimonialSeeds) {
    await Testimonial.findOneAndUpdate(
      { customerName: seed.customerName, review: seed.review },
      { $set: seed },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );
  }
}

async function seedCoreData() {
  await connectDatabase();

  const categoryMap = await seedCategories();
  await seedServices(categoryMap);
  await seedBridalPackages();
  await seedBusinessMeta();

  console.log("Core business data seeded successfully.");
  process.exit(0);
}

seedCoreData().catch((error) => {
  console.error("Core data seed failed:", error.message);
  process.exit(1);
});
