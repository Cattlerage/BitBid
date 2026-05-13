'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Venus,
  Shirt,
  TabletSmartphone,
  Gamepad2,
  LampDesk,
  Grip,
  Bike,
  Scissors,
  Printer,
  Volleyball,
  Shapes,
  Bone,
  Footprints,
  Fence,
  Library,
  Car,
} from 'lucide-react';

const categories = [
  { label: 'Car', icon: Car },
  { label: 'Men', icon: Shirt },
  { label: 'Women', icon: Venus },
  { label: 'Electronics', icon: TabletSmartphone },
  { label: 'Gaming', icon: Gamepad2 },
  { label: 'Home', icon: LampDesk },
  { label: 'Handmade', icon: Scissors },
  { label: 'Office', icon: Printer },
  { label: 'Outdoor', icon: Bike },
  { label: 'Sports', icon: Volleyball },
  { label: 'Kids', icon: Shapes },
  { label: 'Books', icon: Library },
  { label: 'Shoes', icon: Footprints },
  { label: 'Pets', icon: Bone },
  { label: 'Garden', icon: Fence },
];

const ITEM_WIDTH = 56; // your min-w
const ITEM_HORIZONTAL_PADDING = 12; // px-3 => 12+12
const ITEM_TOTAL = ITEM_WIDTH + ITEM_HORIZONTAL_PADDING; // approx per category
const ALL_BUTTON_WIDTH = 72; // estimate (icon + text + px)
const MIN_GAP = 16; // minimum acceptable free space between items

export default function CategoryBar() {
  const ulRef = useRef<HTMLUListElement>(null);
  const [visibleCount, setVisibleCount] = useState(categories.length);

  useLayoutEffect(() => {
    const el = ulRef.current;
    if (!el) return;

    const calculate = () => {
      const containerWidth = el.clientWidth;

      // space left for categories after keeping "All" visible
      const widthForCategories = containerWidth - ALL_BUTTON_WIDTH;

      let fit = Math.floor(widthForCategories / ITEM_TOTAL);
      fit = Math.max(0, Math.min(fit, categories.length));

      // leftover space after placing `fit` items
      const used = fit * ITEM_TOTAL;
      const remaining = widthForCategories - used;

      // if gap is too tight, remove one category and retry spacing feel
      if (fit > 0 && remaining < MIN_GAP) {
        fit -= 1;
      }
      setVisibleCount(fit);
    };

    calculate();
    const ro = new ResizeObserver(calculate);
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  const visibleCategories = useMemo(
    () => categories.slice(0, visibleCount),
    [visibleCount],
  );

  return (
    <ul ref={ulRef} className='flex items-center h-11 md:h-13 justify-around'>
      {visibleCategories.map((cat) => {
        const Icon = cat.icon;
        return (
          <li
            key={cat.label}
            className='h-full min-w-[56px] px-2 flex flex-col items-center cursor-pointer justify-center rounded-t-md hover:bg-card'
          >
            <Icon size={17} strokeWidth={2} />
            <span className='text-sm'>{cat.label}</span>
          </li>
        );
      })}

      <li className='h-full px-3 flex flex-col items-center justify-center rounded-t-md hover:bg-card font-medium'>
        <Grip size={17} strokeWidth={2} />
        <span className='text-sm'>All</span>
      </li>
    </ul>
  );
}
