import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

interface MultiSelectDropdownProps {
  options: { id: string; label: string }[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  selectAllOptionText?: string;
}

export function MultiSelectDropdown({
  options,
  selectedValues,
  onChange,
  placeholder = 'Seçiniz...',
  selectAllOptionText
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (id: string) => {
    if (selectedValues.includes(id)) {
      onChange(selectedValues.filter(v => v !== id));
    } else {
      onChange([...selectedValues, id]);
    }
  };

  const handleToggleAll = () => {
    if (selectedValues.length === options.length) {
      // Deselect all
      onChange([]);
    } else {
      // Select all
      onChange(options.map(opt => opt.id));
    }
  };

  const removeSelected = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onChange(selectedValues.filter(v => v !== id));
  };

  const isAllSelected = options.length > 0 && selectedValues.length === options.length;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <div 
        className="min-h-10 px-3 py-2 rounded-xl border border-slate-200 focus-within:border-indigo-500 bg-white flex flex-wrap gap-2 items-center cursor-pointer transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedValues.length === 0 ? (
          <span className="text-slate-400 text-sm truncate flex-1">{placeholder}</span>
        ) : (
          <div className="flex gap-1.5 flex-1 overflow-hidden items-center">
            {selectedValues.slice(0, 2).map(val => {
              const opt = options.find(o => o.id === val);
              const label = opt ? opt.label : val;
              return (
                <span 
                  key={val} 
                  className="flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold border border-indigo-100 whitespace-nowrap"
                >
                  <span className="truncate max-w-[100px]">{label}</span>
                  <button 
                    type="button" 
                    className="text-indigo-400 hover:text-indigo-600 focus:outline-none flex-shrink-0"
                    onClick={(e) => removeSelected(e, val)}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
            {selectedValues.length > 2 && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold whitespace-nowrap">
                +{selectedValues.length - 2} daha
              </span>
            )}
          </div>
        )}
        <div className="ml-auto flex-shrink-0 pl-2">
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-slate-200 shadow-xl max-h-60 overflow-y-auto py-1">
          {selectAllOptionText && (
            <div 
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
              onClick={handleToggleAll}
            >
              <div className={`w-5 h-5 flex flex-shrink-0 items-center justify-center rounded border transition-colors ${isAllSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                {isAllSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className="text-sm font-bold text-slate-800">{selectAllOptionText}</span>
            </div>
          )}
          
          <div className="py-1">
            {options.map((option) => {
              const isSelected = selectedValues.includes(option.id);
              return (
                <div 
                  key={option.id}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => handleToggleOption(option.id)}
                >
                  <div className={`w-5 h-5 flex flex-shrink-0 items-center justify-center rounded border transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{option.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
