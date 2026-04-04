import { Children, isValidElement, useEffect, useId, useRef, useState } from "react";
import { classNames } from "../../lib/utils/classNames.js";

function normalizeOptions(children) {
  return Children.toArray(children)
    .filter(isValidElement)
    .map((child, index) => ({
      key: child.key ?? `option-${index}`,
      value: String(child.props.value ?? ""),
      label: child.props.children,
      disabled: Boolean(child.props.disabled)
    }));
}

function getFirstEnabledIndex(options) {
  return options.findIndex((option) => !option.disabled);
}

function getNextEnabledIndex(options, startIndex, direction) {
  if (options.length === 0) {
    return -1;
  }

  let index = startIndex;

  for (let step = 0; step < options.length; step += 1) {
    index = (index + direction + options.length) % options.length;

    if (!options[index].disabled) {
      return index;
    }
  }

  return startIndex;
}

function createSyntheticChangeEvent(value, name) {
  return {
    target: { value, name },
    currentTarget: { value, name }
  };
}

function ChevronIcon({ open }) {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      className={classNames("h-4 w-4 shrink-0 text-subtle transition-transform duration-300", open && "rotate-180 text-accent")}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m5 7.5 5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      className="h-4 w-4 shrink-0 text-accent"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m5.5 10.5 2.7 2.7L14.5 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Select({
  className,
  children,
  value = "",
  onChange,
  name,
  id,
  disabled = false,
  required = false,
  invalid = false,
  ...props
}) {
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const listboxId = useId();
  const options = normalizeOptions(children);
  const currentValue = String(value ?? "");
  const selectedIndex = options.findIndex((option) => option.value === currentValue);
  const firstEnabledIndex = getFirstEnabledIndex(options);
  const fallbackIndex = selectedIndex >= 0 ? selectedIndex : firstEnabledIndex;
  const selectedOption = fallbackIndex >= 0 ? options[fallbackIndex] : null;
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(fallbackIndex);
  const isPlaceholder = selectedOption?.value === "";

  useEffect(() => {
    setActiveIndex((currentIndex) => {
      if (currentIndex >= 0 && currentIndex < options.length && !options[currentIndex]?.disabled) {
        return currentIndex;
      }

      return fallbackIndex;
    });
  }, [fallbackIndex, options]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function commitValue(nextIndex) {
    const option = options[nextIndex];

    if (!option || option.disabled) {
      return;
    }

    onChange?.(createSyntheticChangeEvent(option.value, name));
    setOpen(false);
    setActiveIndex(nextIndex);
    buttonRef.current?.focus();
  }

  function handleToggle() {
    if (disabled || options.length === 0) {
      return;
    }

    setOpen((currentOpen) => {
      const nextOpen = !currentOpen;

      if (nextOpen) {
        setActiveIndex(fallbackIndex);
      }

      return nextOpen;
    });
  }

  function handleKeyDown(event) {
    if (disabled || options.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (!open) {
        setOpen(true);
        setActiveIndex(fallbackIndex);
        return;
      }

      setActiveIndex((currentIndex) => getNextEnabledIndex(options, currentIndex < 0 ? fallbackIndex : currentIndex, 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (!open) {
        setOpen(true);
        setActiveIndex(fallbackIndex);
        return;
      }

      setActiveIndex((currentIndex) => getNextEnabledIndex(options, currentIndex < 0 ? fallbackIndex : currentIndex, -1));
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(firstEnabledIndex);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();

      const lastEnabledIndex = [...options].reverse().findIndex((option) => !option.disabled);
      const nextIndex = lastEnabledIndex < 0 ? -1 : options.length - 1 - lastEnabledIndex;

      setOpen(true);
      setActiveIndex(nextIndex);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (!open) {
        setOpen(true);
        setActiveIndex(fallbackIndex);
        return;
      }

      commitValue(activeIndex >= 0 ? activeIndex : fallbackIndex);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        id={id}
        type="button"
        name={name}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        aria-required={required || undefined}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={classNames(
          "flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-copy outline-none transition-all duration-300",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_30px_rgba(2,6,23,0.18)]",
          "hover:border-accent/30 hover:bg-white/[0.08] focus-visible:border-accent/60 focus-visible:bg-white/10 focus-visible:ring-2 focus-visible:ring-accent/20",
          "disabled:cursor-not-allowed disabled:opacity-60",
          invalid && "border-danger/60 bg-danger/5 focus-visible:border-danger focus-visible:ring-danger/20",
          isPlaceholder && "text-subtle",
          className
        )}
        aria-invalid={invalid || undefined}
        {...props}
      >
        <span className="truncate">{selectedOption?.label ?? "Sin opciones"}</span>
        <ChevronIcon open={open} />
      </button>

      {open ? (
        <div
          className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-[24px] border border-accent/15 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(8,14,28,0.98))] p-2 shadow-[0_30px_80px_rgba(2,6,23,0.6)] backdrop-blur-xl"
        >
          <div
            id={listboxId}
            role="listbox"
            aria-labelledby={id}
            className="max-h-72 space-y-1 overflow-y-auto pr-1"
          >
            {options.map((option, index) => {
              const isSelected = option.value === currentValue;
              const isActive = index === activeIndex;

              return (
                <button
                  key={option.key}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  onMouseEnter={() => {
                    if (!option.disabled) {
                      setActiveIndex(index);
                    }
                  }}
                  onClick={() => commitValue(index)}
                  className={classNames(
                    "flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left text-sm transition-all duration-200",
                    option.disabled && "cursor-not-allowed text-subtle/40",
                    !option.disabled && !isSelected && !isActive && "text-copy/90 hover:bg-white/5 hover:text-white",
                    !option.disabled && isActive && !isSelected && "bg-white/10 text-white",
                    !option.disabled && isSelected && "bg-accent/15 text-white shadow-[inset_0_0_0_1px_rgba(34,211,238,0.18)]"
                  )}
                >
                  <span className={classNames("truncate", option.value === "" && "text-subtle")}>{option.label}</span>
                  {isSelected ? <CheckIcon /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
