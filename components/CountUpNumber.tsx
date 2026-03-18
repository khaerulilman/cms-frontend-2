"use client";

import { useEffect, useState } from "react";

type CountUpNumberProps = {
  to: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
};

export default function CountUpNumber({
  to,
  duration = 900,
  decimals = 0,
  suffix = "",
}: CountUpNumberProps) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(to * eased);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [to, duration]);

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

  return (
    <>
      {formatted}
      {suffix}
    </>
  );
}
