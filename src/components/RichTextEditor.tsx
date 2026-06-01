import React, { useRef, useEffect } from 'react';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, minHeight = "150px" }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleBlur = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border border-border-subtle rounded-[1.5rem] overflow-hidden bg-bg-sidebar shadow-inner flex flex-col">
      <div className="bg-bg-card p-3 border-b border-border-subtle flex gap-2">
        <button
          type="button"
          onClick={() => handleCommand('bold')}
          className="p-2 hover:bg-primary/10 rounded-xl transition-all text-text-dim hover:text-primary active:scale-90"
          title="Negrito"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => handleCommand('italic')}
          className="p-2 hover:bg-primary/10 rounded-xl transition-all text-text-dim hover:text-primary active:scale-90"
          title="Itálico"
        >
          <Italic size={16} />
        </button>
        <div className="w-px h-6 bg-border-subtle mx-2 self-center opacity-50" />
        <button
          type="button"
          onClick={() => handleCommand('insertUnorderedList')}
          className="p-2 hover:bg-primary/10 rounded-xl transition-all text-text-dim hover:text-primary active:scale-90"
          title="Lista"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => handleCommand('insertOrderedList')}
          className="p-2 hover:bg-primary/10 rounded-xl transition-all text-text-dim hover:text-primary active:scale-90"
          title="Lista Numerada"
        >
          <ListOrdered size={16} />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onBlur={handleBlur}
        className="p-6 outline-none overflow-y-auto text-text-main/90 text-sm leading-relaxed prose prose-invert prose-sm max-w-none min-h-[inherit]"
        style={{ minHeight }}
        data-placeholder={placeholder}
      />
    </div>
  );
}
