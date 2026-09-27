import React, { useEffect, useRef, useState } from "react";

/** Hook: returns [ref, isVisible] — flips to true when the element scrolls into view. */
export function useReveal(options = {}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px", ...options }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, shown];
}

/** Wrapper component form of the same behaviour. */
export default function Reveal({ children, delay = 0, className = "", as: Tag = "div" }) {
  const [ref, shown] = useReveal();
  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
