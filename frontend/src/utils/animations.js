export const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export const staggerParent = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.12,
    },
  },
  viewport: { once: true, amount: 0.15 },
};

