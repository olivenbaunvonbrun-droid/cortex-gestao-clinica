import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";

interface MultiSelectProps {
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options = [],
  selectedValues = [],
  onChange,
  placeholder = "Selecione...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter((v) => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) return selectedValues[0];
    if (selectedValues.length <= 2) return selectedValues.join(", ");
    return `${selectedValues.length} abordagens selecionadas`;
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full min-h-[40px] px-3.5 py-2 border border-border-subtle rounded-xl bg-bg-sidebar text-text-main text-xs font-semibold cursor-pointer select-none shadow-sm transition-all hover:border-primary/50"
      >
        <span className="truncate">{getDisplayText()}</span>
        <ChevronDown size={14} className={`text-text-dim shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-bg-sidebar border border-border-subtle rounded-xl shadow-2xl max-h-56 overflow-y-auto py-1">
          {options.length === 0 ? (
            <div className="px-3.5 py-2 text-xs text-text-dim italic">Nenhuma abordagem cadastrada.</div>
          ) : (
            options.map((option) => {
              const checked = selectedValues.includes(option);
              return (
                <div
                  key={option}
                  onClick={() => handleToggleOption(option)}
                  className="flex items-center justify-between px-3.5 py-2.5 text-xs text-text-main hover:bg-bg-card cursor-pointer select-none transition-colors"
                >
                  <span className={checked ? "font-bold text-primary" : "font-medium"}>{option}</span>
                  {checked && <Check size={14} className="text-primary shrink-0 ml-2" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
