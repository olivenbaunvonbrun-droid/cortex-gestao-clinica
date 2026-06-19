import React, { useRef, useEffect } from "react";
import { 
  Bold, Italic, Underline, Strikethrough, 
  List, ListOrdered, AlignLeft, AlignCenter, 
  AlignRight, AlignJustify, Link, Eraser, 
  Sparkles, Loader2, Type, Highlighter 
} from "lucide-react";

interface RichTextEditorProps {
  id: string;
  value: string;
  onChange: (val: string) => void;
  isAiEnabled?: boolean;
  onAiTrigger?: () => void;
  isAiLoading?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  id,
  value,
  onChange,
  isAiEnabled = false,
  onAiTrigger,
  isAiLoading = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync state to editor element once initially or when programmatic reset happens
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    handleInput();
  };

  const insertLink = () => {
    const url = prompt("Digite a URL do Link (ex: https://google.com):");
    if (url) {
      execCommand("createLink", url);
    }
  };

  return (
    <div className="border border-border-subtle rounded-xl shadow-sm overflow-hidden flex flex-col bg-bg-sidebar">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border-subtle bg-bg-card text-text-main select-none">
        <select
          onChange={(e) => execCommand("formatBlock", e.target.value)}
          defaultValue="p"
          className="text-xs px-2 py-1 bg-bg-sidebar border border-border-subtle text-text-main rounded outline-none cursor-pointer"
        >
          <option value="p">Parágrafo</option>
          <option value="h1">Título 1</option>
          <option value="h2">Título 2</option>
          <option value="h3">Título 3</option>
        </select>

        <div className="w-[1px] h-5 bg-border-subtle/50 mx-1" />

        <button
          type="button"
          onClick={() => execCommand("bold")}
          title="Negrito"
          className="p-1.5 hover:bg-bg-sidebar rounded border border-transparent hover:border-border-subtle transition-colors text-text-dim hover:text-text-main cursor-pointer"
        >
          <Bold size={14} />
        </button>
        <button
          type="button"
          onClick={() => execCommand("italic")}
          title="Itálico"
          className="p-1.5 hover:bg-bg-sidebar rounded border border-transparent hover:border-border-subtle transition-colors text-text-dim hover:text-text-main cursor-pointer"
        >
          <Italic size={14} />
        </button>
        <button
          type="button"
          onClick={() => execCommand("underline")}
          title="Sublinhar"
          className="p-1.5 hover:bg-bg-sidebar rounded border border-transparent hover:border-border-subtle transition-colors text-text-dim hover:text-text-main cursor-pointer"
        >
          <Underline size={14} />
        </button>
        <button
          type="button"
          onClick={() => execCommand("strikethrough")}
          title="Tachado"
          className="p-1.5 hover:bg-bg-sidebar rounded border border-transparent hover:border-border-subtle transition-colors text-text-dim hover:text-text-main cursor-pointer"
        >
          <Strikethrough size={14} />
        </button>

        <div className="w-[1px] h-5 bg-border-subtle/50 mx-1" />

        <button
          type="button"
          onClick={() => execCommand("insertUnorderedList")}
          title="Lista de Marcadores"
          className="p-1.5 hover:bg-bg-sidebar rounded border border-transparent hover:border-border-subtle transition-colors text-text-dim hover:text-text-main cursor-pointer"
        >
          <List size={14} />
        </button>
        <button
          type="button"
          onClick={() => execCommand("insertOrderedList")}
          title="Lista Numerada"
          className="p-1.5 hover:bg-bg-sidebar rounded border border-transparent hover:border-border-subtle transition-colors text-text-dim hover:text-text-main cursor-pointer"
        >
          <ListOrdered size={14} />
        </button>

        <div className="w-[1px] h-5 bg-border-subtle/50 mx-1" />

        <button
          type="button"
          onClick={() => execCommand("justifyLeft")}
          title="Alinhar à Esquerda"
          className="p-1.5 hover:bg-bg-sidebar rounded border border-transparent hover:border-border-subtle transition-colors text-text-dim hover:text-text-main cursor-pointer"
        >
          <AlignLeft size={14} />
        </button>
        <button
          type="button"
          onClick={() => execCommand("justifyCenter")}
          title="Centralizar"
          className="p-1.5 hover:bg-bg-sidebar rounded border border-transparent hover:border-border-subtle transition-colors text-text-dim hover:text-text-main cursor-pointer"
        >
          <AlignCenter size={14} />
        </button>
        <button
          type="button"
          onClick={() => execCommand("justifyRight")}
          title="Alinhar à Direita"
          className="p-1.5 hover:bg-bg-sidebar rounded border border-transparent hover:border-border-subtle transition-colors text-text-dim hover:text-text-main cursor-pointer"
        >
          <AlignRight size={14} />
        </button>
        <button
          type="button"
          onClick={() => execCommand("justifyFull")}
          title="Justificar"
          className="p-1.5 hover:bg-bg-sidebar rounded border border-transparent hover:border-border-subtle transition-colors text-text-dim hover:text-text-main cursor-pointer"
        >
          <AlignJustify size={14} />
        </button>

        <div className="w-[1px] h-5 bg-border-subtle/50 mx-1" />

        {/* Text color picker */}
        <label
          htmlFor={`color-${id}`}
          className="p-1.5 hover:bg-bg-sidebar rounded border border-transparent hover:border-border-subtle transition-colors text-text-dim hover:text-text-main cursor-pointer flex items-center justify-center relative"
          title="Cor do Texto"
        >
          <Type size={14} />
          <input
            type="color"
            id={`color-${id}`}
            onChange={(e) => execCommand("foreColor", e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </label>

        {/* Highlighter highlight background color */}
        <label
          htmlFor={`bg-color-${id}`}
          className="p-1.5 hover:bg-bg-sidebar rounded border border-transparent hover:border-border-subtle transition-colors text-text-dim hover:text-text-main cursor-pointer flex items-center justify-center relative"
          title="Cor do Realce (Highlighter)"
        >
          <Highlighter size={14} />
          <input
            type="color"
            id={`bg-color-${id}`}
            onChange={(e) => execCommand("hiliteColor", e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </label>

        <button
          type="button"
          onClick={insertLink}
          title="Inserir Link"
          className="p-1.5 hover:bg-bg-sidebar rounded border border-transparent hover:border-border-subtle transition-colors text-text-dim hover:text-text-main cursor-pointer"
        >
          <Link size={14} />
        </button>

        <button
          type="button"
          onClick={() => execCommand("removeFormat")}
          title="Limpar Formatação"
          className="p-1.5 hover:bg-bg-sidebar rounded border border-transparent hover:border-border-subtle transition-colors text-red-500 hover:text-red-400 cursor-pointer"
        >
          <Eraser size={14} />
        </button>

        {isAiEnabled && onAiTrigger && (
          <div className="ml-auto flex items-center">
            <button
              type="button"
              disabled={isAiLoading}
              onClick={onAiTrigger}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 text-[10px] text-primary font-black cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
            >
              {isAiLoading ? (
                <>
                  <Loader2 className="animate-spin text-primary" size={12} />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <Sparkles size={12} />
                  <span>IA</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        id={id}
        contentEditable
        onInput={handleInput}
        className="min-h-[140px] max-h-[400px] overflow-y-auto p-4 outline-none focus:ring-1 focus:ring-primary/40 bg-white text-slate-800 leading-relaxed font-semibold rounded-b-xl"
        style={{ textAlign: "justify" }}
      />
    </div>
  );
};
