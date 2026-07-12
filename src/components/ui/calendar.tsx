"use client";

import * as React from "react";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/lib/utils";
import { formatPriceCompact } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import type { DailyPriceEntry } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/LanguageContext";

// Context to pass price lookup function into DayButton without modifying DayPicker API
type PriceLookupFn = ((dateStr: string) => DailyPriceEntry | null | undefined) | undefined;
const PriceContext = React.createContext<PriceLookupFn>(undefined);

function Calendar({
  className,
  classNames,
  showOutsideDays = false,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  priceLookup,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
  /** Optional function to look up price data per date string (YYYY-MM-DD). When provided, prices are shown on day cells. */
  priceLookup?: (dateStr: string) => DailyPriceEntry | null | undefined;
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <PriceContext.Provider value={priceLookup}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn(
          "w-full bg-background group/calendar p-3 font-['Plus_Jakarta_Sans',sans-serif] [--cell-size:2.8rem] md:[--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
          String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
          String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
          className,
        )}
        captionLayout={captionLayout}
        formatters={{
          formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
          ...formatters,
        }}
        classNames={{
          root: cn("w-full md:w-fit", defaultClassNames.root),
          months: cn("relative flex flex-col gap-4 md:flex-row w-full", defaultClassNames.months),
          month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
          nav: cn(
            "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
            defaultClassNames.nav,
          ),
          button_previous: cn(
            buttonVariants({ variant: buttonVariant }),
            "h-(--cell-size) w-(--cell-size) select-none p-0 aria-disabled:opacity-50",
            defaultClassNames.button_previous,
          ),
          button_next: cn(
            buttonVariants({ variant: buttonVariant }),
            "h-(--cell-size) w-(--cell-size) select-none p-0 aria-disabled:opacity-50",
            defaultClassNames.button_next,
          ),
          month_caption: cn(
            "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
            defaultClassNames.month_caption,
          ),
          dropdowns: cn(
            "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
            defaultClassNames.dropdowns,
          ),
          dropdown_root: cn(
            "has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border",
            defaultClassNames.dropdown_root,
          ),
          dropdown: cn("bg-popover absolute inset-0 opacity-0", defaultClassNames.dropdown),
          caption_label: cn(
            "select-none font-medium",
            captionLayout === "label"
              ? "text-sm"
              : "[&>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5",
            defaultClassNames.caption_label,
          ),
          table: "w-full border-collapse",
          weekdays: cn("flex", defaultClassNames.weekdays),
          weekday: cn(
            "text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal",
            defaultClassNames.weekday,
          ),
          week: cn("mt-2 flex w-full", defaultClassNames.week),
          week_number_header: cn("w-(--cell-size) select-none", defaultClassNames.week_number_header),
          week_number: cn(
            "text-muted-foreground select-none text-[0.8rem]",
            defaultClassNames.week_number,
          ),
          day: cn(
            "group/day relative h-full w-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
            defaultClassNames.day,
          ),
          range_start: cn("bg-[#D4B47D]/20 rounded-l-md", defaultClassNames.range_start),
          range_middle: cn("rounded-none bg-[#D4B47D]/20", defaultClassNames.range_middle),
          range_end: cn("bg-[#D4B47D]/20 rounded-r-md", defaultClassNames.range_end),
          today: cn(
            "bg-[#F9F7F2] text-[#402E2A] rounded-md data-[selected=true]:rounded-none",
            defaultClassNames.today,
          ),
          outside: cn(
            "text-muted-foreground aria-selected:text-muted-foreground",
            defaultClassNames.outside,
          ),
          disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
          hidden: cn("invisible", defaultClassNames.hidden),
          ...classNames,
        }}
        components={{
          Root: ({ className, rootRef, ...props }) => {
            return <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />;
          },
          Chevron: ({ className, orientation, ...props }) => {
            if (orientation === "left") {
              return <ChevronLeftIcon className={cn("size-4", className)} {...props} />;
            }

            if (orientation === "right") {
              return <ChevronRightIcon className={cn("size-4", className)} {...props} />;
            }

            return <ChevronDownIcon className={cn("size-4", className)} {...props} />;
          },
          DayButton: CalendarDayButton,
          WeekNumber: ({ children, ...props }) => {
            return (
              <td {...props}>
                <div className="flex size-(--cell-size) items-center justify-center text-center">
                  {children}
                </div>
              </td>
            );
          },
          ...components,
        }}
        {...props}
      />
    </PriceContext.Provider>
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();
  const priceLookup = React.useContext(PriceContext);
  const { lang } = useTranslation();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  // Format date as YYYY-MM-DD for price lookup
  const dateStr = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, "0")}-${String(day.date.getDate()).padStart(2, "0")}`;
  const priceData = priceLookup ? priceLookup(dateStr) : undefined;

  // Determine if we should show price (not on disabled/outside days, unless selected as range)
  const isSelected = modifiers.selected || modifiers.range_start || modifiers.range_end || modifiers.range_middle;
  // TEMPORARILY HIDE PRICE UNTIL REQUESTED AGAIN
  const showPrice = false; // priceLookup && (!modifiers.disabled || isSelected) && !modifiers.outside && !modifiers.hidden;

  // Determine color class based on price type
  const priceColorClass = priceData
    ? priceData.type === "weekend"
      ? "text-amber-600 dark:text-amber-400"
      : "text-muted-foreground"
    : "";

  // When selected (range_start/end/middle/single), override price color to match
  const selectedPriceClass = isSelected
    ? modifiers.range_middle
      ? "text-accent-foreground/70"
      : "text-primary-foreground/80"
    : "";

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-[#402E2A] data-[selected-single=true]:text-white data-[range-middle=true]:bg-transparent data-[range-middle=true]:text-[#402E2A] data-[range-start=true]:bg-[#402E2A] data-[range-start=true]:text-white data-[range-end=true]:bg-[#402E2A] data-[range-end=true]:text-white group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex w-full min-w-(--cell-size) flex-col font-normal leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] hover:bg-[#F9F7F2]",
        // Dynamic sizing: when prices are shown, make cells taller; otherwise keep original sizes
        showPrice
          ? "h-14 md:h-12 gap-0.5 py-1 justify-center"
          : "h-12 md:h-9 aspect-square items-center justify-center gap-1",
        defaultClassNames.day,
        className,
      )}
      {...props}
    >
      {/* Date number */}
      <span className="text-[15px] md:text-sm font-normal leading-none">{props.children}</span>

      {/* Price label */}
      {showPrice && (
        priceData === null ? (
          // Loading skeleton
          <span className="w-7 h-2.5 bg-muted-foreground/15 rounded-sm animate-pulse" />
        ) : priceData ? (
          // Price text
          <span
            className={cn(
              "text-[0.55rem] md:text-[0.6rem] leading-none font-medium tracking-tight opacity-100",
              selectedPriceClass || priceColorClass,
            )}
          >
            {formatPriceCompact(priceData.price, lang)}
          </span>
        ) : null
      )}
    </Button>
  );
}

export { Calendar, CalendarDayButton };
