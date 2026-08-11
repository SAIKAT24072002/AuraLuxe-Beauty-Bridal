import { motion } from "framer-motion";
import { fadeUp } from "../utils/animations";

export default function Reveal({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial={fadeUp.initial}
      animate={fadeUp.whileInView}
      transition={{ ...fadeUp.transition, delay }}
    >
      {children}
    </motion.div>
  );
}
