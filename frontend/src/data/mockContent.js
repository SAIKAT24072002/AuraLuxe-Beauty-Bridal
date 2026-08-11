export const siteMeta = {
  businessName: "AuraLuxe Beauty Atelier",
  phone: "+91 98765 43210",
  whatsapp: "+919876543210",
  email: "hello@auraluxeatelier.com",
  address: "Lake Town Signature Lane, Kolkata, West Bengal 700089",
  mapEmbedLabel: "Near VIP Road, Kolkata",
  heroTitle: "Elevated beauty appointments and bridal artistry for your most photographed moments.",
  heroSubtitle:
    "From premium salon rituals to graceful at-home bridal preparation, every detail is curated to feel calm, luxurious, and beautifully organized.",
};

export const serviceCategories = [
  "All",
  "Hair Care",
  "Hair Spa",
  "Facial",
  "Skin Care",
  "Waxing",
  "Nail Care",
  "Manicure",
  "Pedicure",
  "Makeup",
  "Hair Styling",
];

export const services = [
  {
    id: "svc-1",
    name: "Silk Repair Hair Spa",
    category: "Hair Spa",
    description: "Deep repair ritual with scalp massage, steam, and shine-restoring serum.",
    price: 1800,
    duration: "75 min",
    image:
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80",
    popular: true,
  },
  {
    id: "svc-2",
    name: "Glass Skin Facial",
    category: "Facial",
    description: "Hydrating multi-step facial for event-ready radiance and luminous texture.",
    price: 2200,
    duration: "60 min",
    image:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80",
    popular: true,
  },
  {
    id: "svc-3",
    name: "Classic Party Makeup",
    category: "Makeup",
    description: "Polished glam with soft contour, eyes, lashes, and long-wear finish.",
    price: 3500,
    duration: "90 min",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
    popular: false,
  },
  {
    id: "svc-4",
    name: "Signature Manicure",
    category: "Manicure",
    description: "Cuticle care, hand polish, relaxing soak, and high-gloss finish.",
    price: 1200,
    duration: "45 min",
    image:
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=80",
    popular: false,
  },
  {
    id: "svc-5",
    name: "Bridal Hair Styling Trial",
    category: "Hair Styling",
    description: "Preview your wedding-day look with draping direction and accessory planning.",
    price: 2800,
    duration: "70 min",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    popular: true,
  },
  {
    id: "svc-6",
    name: "Velvet Glow Cleanup",
    category: "Skin Care",
    description: "Fast-refresh skincare treatment for college events and festive evenings.",
    price: 999,
    duration: "35 min",
    image:
      "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=900&q=80",
    popular: false,
  },
];

export const bridalPackages = [
  {
    slug: "silver-bridal-package",
    name: "Silver Bridal Package",
    tagline: "Soft, timeless, camera-ready elegance.",
    price: 18000,
    discountPrice: 15000,
    duration: "4 hours",
    advancePercentage: 40,
    featured: false,
    homeService: true,
    venueService: true,
    image:
      "https://images.unsplash.com/photo-1523264766116-1e09b3145b84?auto=format&fit=crop&w=1100&q=80",
    includes: ["Bridal Makeup", "Hair Styling", "Saree Draping"],
    description:
      "A polished bridal look with glowing skin finish, classic lashes, and draping support for intimate ceremonies.",
  },
  {
    slug: "gold-bridal-package",
    name: "Gold Bridal Package",
    tagline: "Refined bridal glam with richer prep care.",
    price: 26000,
    discountPrice: 22000,
    duration: "5 hours",
    advancePercentage: 50,
    featured: true,
    homeService: true,
    venueService: true,
    image:
      "https://images.unsplash.com/photo-1525258946800-98cfd641d0de?auto=format&fit=crop&w=1100&q=80",
    includes: [
      "HD Bridal Makeup",
      "Hair Styling",
      "Saree Draping",
      "Nail Styling",
      "Pre-Bridal Facial",
    ],
    description:
      "Designed for brides who want richer detail, longer wear, and elevated skin preparation for ceremony and portrait hours.",
  },
  {
    slug: "royal-bridal-package",
    name: "Royal Bridal Package",
    tagline: "Our most luxurious wedding-day experience.",
    price: 38000,
    discountPrice: 32000,
    duration: "6.5 hours",
    advancePercentage: 50,
    featured: true,
    homeService: true,
    venueService: true,
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1100&q=80",
    includes: [
      "Premium Bridal Makeup",
      "Premium Hair Styling",
      "Saree Draping",
      "Nail Styling",
      "Pre-Bridal Care",
      "Eyelashes",
      "Bridal Preparation Support",
    ],
    description:
      "A luxury bridal plan for full wedding coverage with elevated prep, statement finish, and venue-ready coordination support.",
  },
];

export const bridalServices = [
  "Bridal Makeup",
  "HD Bridal Makeup",
  "Airbrush Bridal Makeup",
  "Engagement Makeup",
  "Reception Makeup",
  "Haldi Makeup",
  "Mehendi Makeup",
  "Pre-Bridal Skin Care",
  "Bridal Hair Styling",
  "Saree Draping",
  "Bridal Nail Styling",
];

export const offers = [
  {
    id: "offer-1",
    title: "Monsoon Bridal Consultation Week",
    description: "Free bridal look consultation with every bridal package discussion this week.",
    badge: "Limited Offer",
    code: "BRIDEGLOW",
    validUntil: "31 Aug 2026",
  },
  {
    id: "offer-2",
    title: "Facial + Hair Spa Duo",
    description: "Book both rituals together and unlock a premium add-on scalp therapy session.",
    badge: "Best Value",
    code: "SPAEDIT",
    validUntil: "20 Aug 2026",
  },
  {
    id: "offer-3",
    title: "Venue Bridal Early Booking",
    description: "Reserve your wedding date 45 days in advance and enjoy a complimentary draping trial.",
    badge: "Bridal Exclusive",
    code: "AURALUXE45",
    validUntil: "15 Sep 2026",
  },
];

export const galleryItems = [
  {
    id: "gal-1",
    title: "Royal bridal glow",
    category: "Bridal",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "gal-2",
    title: "Soft engagement glam",
    category: "Engagement",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "gal-3",
    title: "Hair texture finish",
    category: "Hair",
    image:
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "gal-4",
    title: "Reception radiance",
    category: "Reception",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "gal-5",
    title: "Bridal before / after",
    category: "Before / After",
    image:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "gal-6",
    title: "Nail detail",
    category: "Nails",
    image:
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=80",
  },
];

export const testimonials = [
  {
    id: "test-1",
    name: "Riya Das",
    rating: 5,
    service: "Glass Skin Facial",
    quote:
      "The appointment flow felt premium from the first click, and the actual service was calm, polished, and beautifully managed.",
  },
  {
    id: "test-2",
    name: "Priya Sen",
    rating: 5,
    service: "Royal Bridal Package",
    quote:
      "They handled my venue booking with so much grace. My bridal makeup lasted through portraits, rituals, and the full reception.",
  },
  {
    id: "test-3",
    name: "Mou Chakraborty",
    rating: 5,
    service: "Signature Manicure",
    quote:
      "Even the smaller services feel luxurious here. The ambience, styling, and finishing are all very thoughtful.",
  },
];

export const openingHours = [
  { day: "Monday", hours: "10:00 AM - 7:00 PM" },
  { day: "Tuesday", hours: "10:00 AM - 7:00 PM" },
  { day: "Wednesday", hours: "10:00 AM - 7:00 PM" },
  { day: "Thursday", hours: "10:00 AM - 8:00 PM" },
  { day: "Friday", hours: "10:00 AM - 8:00 PM" },
  { day: "Saturday", hours: "9:00 AM - 8:00 PM" },
  { day: "Sunday", hours: "Bridal bookings only" },
];

export const stats = [
  { label: "Happy Clients", value: "3.8K+" },
  { label: "Bridal Makeovers", value: "620+" },
  { label: "Years Experience", value: "9" },
  { label: "Venue Visits", value: "240+" },
];

export const whyChooseUs = [
  "Premium beauty rituals guided by experienced artists",
  "Flexible parlour, home, and venue service support",
  "Clear advance payment and tracking-ready workflow",
  "Bridal-first styling with timeline-aware preparation",
];

export const trackTimeline = [
  "Booking Created",
  "Advance Paid",
  "Booking Confirmed",
  "Beautician Preparing",
  "Beautician On The Way",
  "Service Started",
  "Service Completed",
  "Remaining Payment",
  "Fully Paid",
];
