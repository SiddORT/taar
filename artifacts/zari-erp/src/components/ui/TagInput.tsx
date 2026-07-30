import { useState } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagInput({
  value,
  onChange,
  placeholder = "Type a tag and press Enter",
}: TagInputProps) {
  const [input, setInput] = useState("");

  function addTag(tag: string) {
    const t = tag.trim();

    if (!t) return;
    if (value.includes(t)) return;

    onChange([...value, t]);
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(value.filter(x => x !== tag));
  }

  return (
    <div className="min-h-[42px] w-full rounded-lg border border-gray-300 px-2 py-2 flex flex-wrap items-center gap-2 focus-within:ring-2 focus-within:ring-cyan-900/10">
      {value.map(tag => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-sm"
        >
          {tag}

          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="hover:text-red-600"
          >
            <X size={12} />
          </button>
        </span>
      ))}

      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-[120px] outline-none text-sm"
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(input);
          }

          if (
            e.key === "Backspace" &&
            input === "" &&
            value.length > 0
          ) {
            removeTag(value[value.length - 1]);
          }
        }}
        onBlur={() => addTag(input)}
      />
    </div>
  );
}