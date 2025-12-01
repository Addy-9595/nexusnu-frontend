import { useState, useRef, useEffect } from 'react';
import api from '../../services/api';

interface Skill {
  id: string;
  name: string;
}

interface Props {
  selected: string[];
  onChange: (skills: string[]) => void;
  maxSkills?: number;
}

export default function SkillsAutocomplete({ selected, onChange, maxSkills = 50 }: Props) {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<Skill[]>([]);
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (input.length < 1) {
      setResults([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/skills/search?q=${encodeURIComponent(input)}`);
        const filtered = res.data.skills.filter((s: Skill) => !selected.includes(s.name));
        setResults(filtered);
        setShow(true);
      } catch (err) {
        setResults([]);
      }
    }, 250);
  }, [input, selected]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShow(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleSkill = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter(s => s !== name));
    } else if (selected.length < maxSkills) {
      onChange([...selected, name]);
    }
  };

  const removeSkill = (name: string) => {
    onChange(selected.filter(s => s !== name));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!show || results.length === 0) {
      if (e.key === 'Backspace' && !input && selected.length > 0) {
        removeSkill(selected[selected.length - 1]);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocused(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocused(prev => Math.max(prev - 1, 0));
    } else if ((e.key === 'Enter' || e.key === ' ') && focused >= 0) {
      e.preventDefault();
      toggleSkill(results[focused].name);
    } else if (e.key === 'Escape') {
      setShow(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map(skill => (
          <span key={skill} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => input.length >= 1 && setShow(true)}
        placeholder="Type to search skills (e.g., c, data, comm)"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-northeastern-red"
      />

      {show && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg overflow-hidden">
          <div className="max-h-[200px] overflow-y-auto">
            {results.map((skill, idx) => (
              <label
                key={skill.id}
                className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                  idx === focused ? 'bg-gray-100' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(skill.name)}
                  onChange={() => toggleSkill(skill.name)}
                  className="mr-3 w-4 h-4"
                />
                <span className="text-sm">{skill.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {selected.length >= maxSkills && (
        <p className="text-xs text-red-600 mt-1">Max {maxSkills} skills</p>
      )}
    </div>
  );
}