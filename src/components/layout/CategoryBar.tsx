'use client';

import Link from 'next/link';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
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
import { Button } from '@/components/ui/button';

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

const ITEM_WIDTH = 56;
const ITEM_HORIZONTAL_PADDING = 12;
const ITEM_TOTAL = ITEM_WIDTH + ITEM_HORIZONTAL_PADDING;
const ALL_BUTTON_WIDTH = 72;
const MIN_GAP = 16;

export default function CategoryBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const ulRef = useRef<HTMLUListElement>(null);
  const [visibleCount, setVisibleCount] = useState(categories.length);

  const selectedCategory = searchParams.get('category');
  const inListings = pathname.startsWith('/listings');

  useLayoutEffect(() => {
    const el = ulRef.current;
    if (!el) return;

    const calculate = () => {
      const containerWidth = el.clientWidth;
      const widthForCategories = containerWidth - ALL_BUTTON_WIDTH;

      let fit = Math.floor(widthForCategories / ITEM_TOTAL);
      fit = Math.max(0, Math.min(fit, categories.length));

      const used = fit * ITEM_TOTAL;
      const remaining = widthForCategories - used;

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

  function hrefFor(category?: string) {
    const sp = new URLSearchParams();
    const q = searchParams.get('q');
    const sort = searchParams.get('sort');

    if (q) sp.set('q', q);
    if (sort) sp.set('sort', sort);
    if (category) sp.set('category', category);

    const qs = sp.toString();
    return qs ? `/listings?${qs}` : '/listings';
  }

  return (
    <ul
      ref={ulRef}
      className='flex items-center h-14 md:h-16 md:pt-2 justify-around'
    >
      {visibleCategories.map((cat) => {
        const Icon = cat.icon;
        const isActive = inListings && selectedCategory === cat.label;

        return (
          <li key={cat.label}>
            <Button
              asChild
              variant='ghost'
              className={`h-full min-w-[56px] rounded-t-md px-2 py-1 text-grey hover:bg-card hover:text-white ${
                isActive ? 'bg-card text-white' : ''
              }`}
            >
              <Link
                href={hrefFor(cat.label)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className='flex flex-col items-center justify-center'>
                  <Icon size={20} strokeWidth={2} />
                  <span className='text-sm'>{cat.label}</span>
                </span>
              </Link>
            </Button>
          </li>
        );
      })}

      <li>
        <Button
          asChild
          variant='ghost'
          className={`h-full rounded-t-md px-3 py-1.5 text-grey hover:bg-card hover:text-white ${
            inListings && !selectedCategory ? 'bg-card text-white' : ''
          }`}
        >
          <Link
            href={hrefFor(undefined)}
            aria-current={inListings && !selectedCategory ? 'page' : undefined}
          >
            <span className='flex flex-col items-center justify-center font-medium'>
              <Grip size={20} strokeWidth={2} />
              <span className='text-sm'>All</span>
            </span>
          </Link>
        </Button>
      </li>
    </ul>
  );
}
