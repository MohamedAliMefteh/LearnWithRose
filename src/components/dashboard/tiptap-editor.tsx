"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import UnderlineExtension from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette,
  Highlighter,
  Undo2,
  Redo2,
  Globe,
} from "lucide-react";
import { detectDirection } from "@/lib/direction-detector";
import { useState, useEffect } from "react";

interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
  onDirectionChange?: (direction: "rtl" | "ltr" | "mixed") => void;
  onFontChange?: (font: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const FONT_FAMILIES = [
  // System & Default
  { label: "System Default", value: "system-ui, sans-serif" },
  
  // Arabic Fonts
  { label: "Noto Sans Arabic", value: '"Noto Sans Arabic", "Arabic UI Text", sans-serif' },
  { label: "Cairo", value: '"Cairo", "Noto Sans Arabic", sans-serif' },
  { label: "Amiri", value: '"Amiri", "Noto Sans Arabic", serif' },
  { label: "Tajawal", value: '"Tajawal", "Noto Sans Arabic", sans-serif' },
  { label: "Almarai", value: '"Almarai", "Noto Sans Arabic", sans-serif' },
  { label: "IBM Plex Sans Arabic", value: '"IBM Plex Sans Arabic", "Noto Sans Arabic", sans-serif' },
  { label: "Scheherazade New", value: '"Scheherazade New", "Noto Sans Arabic", serif' },
  { label: "Lateef", value: '"Lateef", "Noto Sans Arabic", serif' },
  { label: "Markazi Text", value: '"Markazi Text", "Noto Sans Arabic", serif' },
  { label: "Reem Kufi", value: '"Reem Kufi", "Noto Sans Arabic", sans-serif' },
  { label: "Lalezar", value: '"Lalezar", "Noto Sans Arabic", cursive' },
  { label: "Mada", value: '"Mada", "Noto Sans Arabic", sans-serif' },
  
  // Latin/English Sans-Serif Fonts
  { label: "Arial", value: 'Arial, "Helvetica Neue", Helvetica, sans-serif' },
  { label: "Helvetica", value: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  { label: "Segoe UI", value: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' },
  { label: "Roboto", value: '"Roboto", "Segoe UI", sans-serif' },
  { label: "Open Sans", value: '"Open Sans", "Segoe UI", sans-serif' },
  { label: "Lato", value: '"Lato", "Segoe UI", sans-serif' },
  { label: "Montserrat", value: '"Montserrat", "Segoe UI", sans-serif' },
  { label: "Poppins", value: '"Poppins", "Segoe UI", sans-serif' },
  { label: "Inter", value: '"Inter", "Segoe UI", sans-serif' },
  { label: "Nunito", value: '"Nunito", "Segoe UI", sans-serif' },
  { label: "Raleway", value: '"Raleway", "Segoe UI", sans-serif' },
  { label: "Ubuntu", value: '"Ubuntu", "Segoe UI", sans-serif' },
  { label: "Verdana", value: 'Verdana, Geneva, sans-serif' },
  { label: "Tahoma", value: 'Tahoma, Verdana, sans-serif' },
  
  // Serif Fonts
  { label: "Georgia", value: 'Georgia, "Times New Roman", Times, serif' },
  { label: "Times New Roman", value: '"Times New Roman", Times, serif' },
  { label: "Garamond", value: 'Garamond, "Times New Roman", serif' },
  { label: "Palatino", value: '"Palatino Linotype", Palatino, serif' },
  { label: "Merriweather", value: '"Merriweather", Georgia, serif' },
  { label: "Playfair Display", value: '"Playfair Display", Georgia, serif' },
  { label: "Lora", value: '"Lora", Georgia, serif' },
  { label: "PT Serif", value: '"PT Serif", Georgia, serif' },
  
  // Monospace Fonts
  { label: "Courier New", value: '"Courier New", Courier, monospace' },
  { label: "Consolas", value: 'Consolas, Monaco, "Courier New", monospace' },
  { label: "Monaco", value: 'Monaco, Consolas, "Courier New", monospace' },
  { label: "Fira Code", value: '"Fira Code", Monaco, Consolas, monospace' },
  { label: "Source Code Pro", value: '"Source Code Pro", Monaco, monospace' },
  { label: "JetBrains Mono", value: '"JetBrains Mono", Monaco, monospace' },
  
  // Display & Decorative
  { label: "Impact", value: 'Impact, Haettenschweiler, sans-serif' },
  { label: "Comic Sans MS", value: '"Comic Sans MS", cursive' },
  { label: "Brush Script MT", value: '"Brush Script MT", cursive' },
];

export function TiptapEditor({
  value,
  onChange,
  onDirectionChange,
  onFontChange,
  placeholder = "Write your article content here...",
  minHeight = "400px",
}: TiptapEditorProps) {
  const [selectedFont, setSelectedFont] = useState("system-ui, sans-serif");
  const [detectedDirection, setDetectedDirection] = useState<"rtl" | "ltr" | "mixed">("ltr");
  const [isDragging, setIsDragging] = useState(false);
  const [imageSelected, setImageSelected] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color,
      UnderlineExtension,
      Link.configure({
        openOnClick: false,
      }),
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: {
              default: null,
              renderHTML: attributes => {
                if (!attributes.width) {
                  return {}
                }
                return {
                  width: attributes.width,
                }
              },
            },
            style: {
              default: null,
              parseHTML: element => element.getAttribute('style'),
              renderHTML: attributes => {
                if (!attributes.style) {
                  return {}
                }
                return {
                  style: attributes.style,
                }
              },
            },
          }
        },
      }).configure({
        allowBase64: true,
        inline: false,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      
      // Auto-detect direction from content
      const direction = detectDirection(editor.getText());
      setDetectedDirection(direction);
      onDirectionChange?.(direction);
    },
    onSelectionUpdate: ({ editor }) => {
      // Check if an image is selected
      const { from } = editor.state.selection;
      const node = editor.state.doc.nodeAt(from);
      setImageSelected(node?.type.name === 'image');
    },
  });

  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  // Log editor state for debugging
  useEffect(() => {
    if (editor) {
      console.log('Editor HTML:', editor.getHTML());
      console.log('Editor Text:', editor.getText());
    }
  }, [editor]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  const handleAddLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  const handleAddImage = () => {
    // Create a hidden file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      // Convert to base64 and insert
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const base64 = readerEvent.target?.result as string;
        if (base64) {
          editor.chain().focus().setImage({ src: base64 }).run();
        }
      };
      reader.readAsDataURL(file);
    };
    
    input.click();
  };
  
  const handleAddImageUrl = () => {
    const url = prompt("Enter image URL (or click cancel to upload a file):");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    } else {
      // If cancelled, show file upload option
      handleAddImage();
    }
  };

  const handleFontChange = (font: string) => {
    setSelectedFont(font);
    onFontChange?.(font);
  };
  
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        if (file.size > 5 * 1024 * 1024) {
          alert('Image size should be less than 5MB');
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          if (base64) {
            editor?.chain().focus().setImage({ src: base64 }).run();
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };
  
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };
  
  const setImageSize = (size: 'small' | 'medium' | 'large' | 'full' | 'custom') => {
    // Check if an image is selected
    const { state } = editor;
    const { from } = state.selection;
    const node = state.doc.nodeAt(from);
    
    console.log('Setting image size:', size);
    console.log('Node at selection:', node?.type.name);
    
    if (!node || node.type.name !== 'image') {
      alert('Please click on an image first to resize it');
      return;
    }
    
    let width = '100%';
    switch (size) {
      case 'small':
        width = '25%';
        break;
      case 'medium':
        width = '50%';
        break;
      case 'large':
        width = '75%';
        break;
      case 'full':
        width = '100%';
        break;
      case 'custom':
        const customWidth = prompt('Enter width (e.g., 300px, 50%, etc.):');
        if (customWidth) {
          width = customWidth;
        } else {
          return;
        }
        break;
    }
    
    console.log('Applying width:', width);
    
    // Update the image attributes
    const result = editor
      .chain()
      .focus()
      .updateAttributes('image', { 
        width: width,
        style: `width: ${width}; height: auto; display: block; margin: 1rem auto;`
      })
      .run();
      
    console.log('Update result:', result);
  };

  return (
    <div 
      className={`border rounded-lg overflow-hidden bg-white relative ${isDragging ? 'border-primary border-2' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-lg shadow-xl p-6 border-2 border-primary border-dashed">
            <ImageIcon className="w-16 h-16 text-primary mx-auto mb-2" />
            <p className="text-lg font-semibold text-primary">Drop image here</p>
            <p className="text-sm text-slate-600">Max size: 5MB</p>
          </div>
        </div>
      )}
      
      {/* Toolbar */}
      <div className="bg-slate-50 border-b p-2 space-y-2">
        {/* Row 1: Text Formatting */}
        <div className="flex flex-wrap gap-1">
          <Button
            size="sm"
            variant={editor.isActive("bold") ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive("italic") ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive("underline") ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline"
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive("strike") ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>

          <div className="w-px bg-slate-300" />

          {/* Headings */}
          <Button
            size="sm"
            variant={editor.isActive("heading", { level: 1 }) ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive("heading", { level: 2 }) ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive("heading", { level: 3 }) ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>

          <div className="w-px bg-slate-300" />

          {/* Lists */}
          <Button
            size="sm"
            variant={editor.isActive("bulletList") ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive("orderedList") ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <div className="w-px bg-slate-300" />

          {/* Alignment */}
          <Button
            size="sm"
            variant={editor.isActive({ textAlign: "left" }) ? "default" : "outline"}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive({ textAlign: "center" }) ? "default" : "outline"}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive({ textAlign: "right" }) ? "default" : "outline"}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>

          <div className="w-px bg-slate-300" />

          {/* Quote & Code */}
          <Button
            size="sm"
            variant={editor.isActive("blockquote") ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive("codeBlock") ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="Code Block"
          >
            <Code className="h-4 w-4" />
          </Button>

          <div className="w-px bg-slate-300" />

          {/* Undo/Redo */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Row 2: Media & Styling */}
        <div className="flex flex-wrap gap-1 items-center">
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddLink}
            title="Add Link"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          
          {/* Image Upload Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddImage}
            title="Upload Image from Computer"
            className="relative"
          >
            <ImageIcon className="h-4 w-4" />
            <span className="ml-1 text-xs hidden sm:inline">Upload</span>
          </Button>
          
          {/* Image URL Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddImageUrl}
            title="Add Image from URL"
            className="relative"
          >
            <LinkIcon className="h-3 w-3" />
            <ImageIcon className="h-4 w-4 -ml-1" />
            <span className="ml-1 text-xs hidden sm:inline">URL</span>
          </Button>
          
          <div className="w-px bg-slate-300" />
          
          {/* Image Size Controls */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded transition-all ${imageSelected ? 'bg-primary/10 border border-primary/30' : 'bg-slate-100'}`}>
            <span className="text-xs text-slate-600 hidden md:inline">{imageSelected ? '📐 Size:' : 'Size:'}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setImageSize('small')}
              title="Small (25%)"
              className={`h-6 px-2 text-xs ${imageSelected ? 'hover:bg-primary/20' : ''}`}
              disabled={!imageSelected}
            >
              S
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setImageSize('medium')}
              title="Medium (50%)"
              className={`h-6 px-2 text-xs ${imageSelected ? 'hover:bg-primary/20' : ''}`}
              disabled={!imageSelected}
            >
              M
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setImageSize('large')}
              title="Large (75%)"
              className={`h-6 px-2 text-xs ${imageSelected ? 'hover:bg-primary/20' : ''}`}
              disabled={!imageSelected}
            >
              L
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setImageSize('full')}
              title="Full Width (100%)"
              className={`h-6 px-2 text-xs ${imageSelected ? 'hover:bg-primary/20' : ''}`}
              disabled={!imageSelected}
            >
              Full
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setImageSize('custom')}
              title="Custom Size"
              className={`h-6 px-2 text-xs ${imageSelected ? 'hover:bg-primary/20' : ''}`}
              disabled={!imageSelected}
            >
              ⚙️
            </Button>
          </div>

          <div className="w-px bg-slate-300" />

          {/* Font Selection */}
          <select
            value={selectedFont}
            onChange={(e) => handleFontChange(e.target.value)}
            className="text-sm px-3 py-1.5 border border-slate-300 rounded bg-white hover:border-primary focus:border-primary focus:ring-1 focus:ring-primary transition-colors max-w-[200px]"
            title="Font Family"
          >
            <optgroup label="━━━ System ━━━">
              <option value="system-ui, sans-serif">System Default</option>
            </optgroup>
            
            <optgroup label="━━━ Arabic Fonts ━━━">
              <option value='"Noto Sans Arabic", "Arabic UI Text", sans-serif'>Noto Sans Arabic</option>
              <option value='"Cairo", "Noto Sans Arabic", sans-serif'>Cairo</option>
              <option value='"Amiri", "Noto Sans Arabic", serif'>Amiri</option>
              <option value='"Tajawal", "Noto Sans Arabic", sans-serif'>Tajawal</option>
              <option value='"Almarai", "Noto Sans Arabic", sans-serif'>Almarai</option>
              <option value='"IBM Plex Sans Arabic", "Noto Sans Arabic", sans-serif'>IBM Plex Sans Arabic</option>
              <option value='"Scheherazade New", "Noto Sans Arabic", serif'>Scheherazade New</option>
              <option value='"Lateef", "Noto Sans Arabic", serif'>Lateef</option>
              <option value='"Markazi Text", "Noto Sans Arabic", serif'>Markazi Text</option>
              <option value='"Reem Kufi", "Noto Sans Arabic", sans-serif'>Reem Kufi</option>
              <option value='"Lalezar", "Noto Sans Arabic", cursive'>Lalezar</option>
              <option value='"Mada", "Noto Sans Arabic", sans-serif'>Mada</option>
            </optgroup>
            
            <optgroup label="━━━ Sans-Serif ━━━">
              <option value='Arial, "Helvetica Neue", Helvetica, sans-serif'>Arial</option>
              <option value='"Helvetica Neue", Helvetica, Arial, sans-serif'>Helvetica</option>
              <option value='"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'>Segoe UI</option>
              <option value='"Roboto", "Segoe UI", sans-serif'>Roboto</option>
              <option value='"Open Sans", "Segoe UI", sans-serif'>Open Sans</option>
              <option value='"Lato", "Segoe UI", sans-serif'>Lato</option>
              <option value='"Montserrat", "Segoe UI", sans-serif'>Montserrat</option>
              <option value='"Poppins", "Segoe UI", sans-serif'>Poppins</option>
              <option value='"Inter", "Segoe UI", sans-serif'>Inter</option>
              <option value='"Nunito", "Segoe UI", sans-serif'>Nunito</option>
              <option value='"Raleway", "Segoe UI", sans-serif'>Raleway</option>
              <option value='"Ubuntu", "Segoe UI", sans-serif'>Ubuntu</option>
              <option value='Verdana, Geneva, sans-serif'>Verdana</option>
              <option value='Tahoma, Verdana, sans-serif'>Tahoma</option>
            </optgroup>
            
            <optgroup label="━━━ Serif ━━━">
              <option value='Georgia, "Times New Roman", Times, serif'>Georgia</option>
              <option value='"Times New Roman", Times, serif'>Times New Roman</option>
              <option value='Garamond, "Times New Roman", serif'>Garamond</option>
              <option value='"Palatino Linotype", Palatino, serif'>Palatino</option>
              <option value='"Merriweather", Georgia, serif'>Merriweather</option>
              <option value='"Playfair Display", Georgia, serif'>Playfair Display</option>
              <option value='"Lora", Georgia, serif'>Lora</option>
              <option value='"PT Serif", Georgia, serif'>PT Serif</option>
            </optgroup>
            
            <optgroup label="━━━ Monospace ━━━">
              <option value='"Courier New", Courier, monospace'>Courier New</option>
              <option value='Consolas, Monaco, "Courier New", monospace'>Consolas</option>
              <option value='Monaco, Consolas, "Courier New", monospace'>Monaco</option>
              <option value='"Fira Code", Monaco, Consolas, monospace'>Fira Code</option>
              <option value='"Source Code Pro", Monaco, monospace'>Source Code Pro</option>
              <option value='"JetBrains Mono", Monaco, monospace'>JetBrains Mono</option>
            </optgroup>
            
            <optgroup label="━━━ Decorative ━━━">
              <option value='Impact, Haettenschweiler, sans-serif'>Impact</option>
              <option value='"Comic Sans MS", cursive'>Comic Sans MS</option>
              <option value='"Brush Script MT", cursive'>Brush Script MT</option>
            </optgroup>
          </select>

          {/* Text Color */}
          <input
            type="color"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            value={editor.getAttributes("textStyle").color || "#000000"}
            className="w-8 h-8 rounded cursor-pointer"
            title="Text Color"
          />

          {/* Highlight Color */}
          <input
            type="color"
            onChange={(e) => editor.chain().focus().setHighlight({ color: e.target.value }).run()}
            value={editor.getAttributes("highlight").color || "#ffff00"}
            className="w-8 h-8 rounded cursor-pointer"
            title="Highlight Color"
          />

          <div className="w-px bg-slate-300" />

          {/* Direction Indicator */}
          <div className="flex items-center gap-1 px-2 py-1 bg-white border rounded text-xs">
            <Globe className="h-4 w-4" />
            <span className="font-medium">
              {detectedDirection === "mixed" ? "Mixed" : detectedDirection.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div
        style={{
          minHeight,
          fontFamily: selectedFont,
          direction: detectedDirection === "rtl" ? "rtl" : "ltr",
        }}
        className="cursor-text"
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent
          editor={editor}
          className="prose prose-lg max-w-none p-6 focus:outline-none min-h-full"
        />
      </div>

      {/* Character Count */}
      <div className="bg-slate-50 border-t px-4 py-2 text-xs text-slate-500">
        {editor.storage.characterCount?.characters() || 0} characters
      </div>
    </div>
  );
}
