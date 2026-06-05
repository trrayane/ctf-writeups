import { useMemo, useRef } from 'react';
import Editor, { type Monaco, type OnMount } from '@monaco-editor/react';
import type * as MonacoTypes from 'monaco-editor';

type QMongoEditorProps = {
  value: string;
  onChange: (value: string) => void;
  height?: number;
};

const QMONGO_LANGUAGE_ID = 'qmongo';
let languageRegistered = false;

const KEYWORDS = [
  'let',
  'from',
  'where',
  'select',
  'include',
  'order',
  'by',
  'asc',
  'desc',
  'limit',
  'offset',
  'insert',
  'into',
  'update',
  'set',
  'delete',
  'aggregate',
  'match',
  'lookup',
  'on',
  'group',
  'having',
  'sort',
  'policy',
  'maxLimit',
  'allow',
  'deny',
  'fields',
  'and',
  'or',
  'not',
  'in',
  'between',
  'contains',
  'startsWith',
  'endsWith',
  'now',
  'count',
  'sum',
  'avg',
  'min',
  'max',
  'true',
  'false',
];

function formatQMongo(source: string): string {
  const lines = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const formatted: string[] = [];
  let indent = 0;

  for (const line of lines) {
    const compact = line.replace(/\s+/g, ' ');

    if (compact.startsWith('}')) {
      indent = Math.max(0, indent - 1);
    }

    formatted.push(`${'  '.repeat(indent)}${compact}`);

    const openCount = (compact.match(/\{/g) || []).length;
    const closeCount = (compact.match(/\}/g) || []).length;
    indent += openCount - closeCount;

    if (indent < 0) {
      indent = 0;
    }
  }

  return formatted.join('\n');
}

function registerQMongoLanguage(monaco: Monaco) {
  if (languageRegistered) return;
  languageRegistered = true;

  monaco.languages.register({ id: QMONGO_LANGUAGE_ID });

  monaco.languages.setMonarchTokensProvider(QMONGO_LANGUAGE_ID, {
    ignoreCase: true,
    keywords: KEYWORDS,
    operators: ['==', '!=', '>=', '<=', '>', '<', '=', '+', '-', '*', '/', '%', ':', ',', '.'],
    tokenizer: {
      root: [
        [/--.*$/, 'comment'],
        [/\$[a-zA-Z_][\w.]*/, 'variable'],
        [/"(?:[^"\\]|\\.)*"/, 'string'],
        [/\b\d+(?:\.\d+)?\b/, 'number'],
        [/[{}()[\]]/, '@brackets'],
        [/[,:]/, 'delimiter'],
        [/==|!=|>=|<=|>|<|=|\+|-|\*|\/|%/, 'operator'],
        [
          /[a-zA-Z_][\w]*/,
          {
            cases: {
              '@keywords': 'keyword',
              '@default': 'identifier',
            },
          },
        ],
      ],
    },
  });

  monaco.languages.setLanguageConfiguration(QMONGO_LANGUAGE_ID, {
    comments: {
      lineComment: '--',
    },
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
    ],
  });

  monaco.languages.registerDocumentFormattingEditProvider(QMONGO_LANGUAGE_ID, {
    provideDocumentFormattingEdits: (model: MonacoTypes.editor.ITextModel) => [
      {
        range: model.getFullModelRange(),
        text: formatQMongo(model.getValue()),
      },
    ],
  });

  monaco.editor.defineTheme('qmongo-theme', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '7ce5b8', fontStyle: 'bold' },
      { token: 'variable', foreground: 'f2d68d' },
      { token: 'operator', foreground: '9dd8ff' },
      { token: 'identifier', foreground: 'dbe8ff' },
      { token: 'number', foreground: 'f0b07f' },
      { token: 'string', foreground: 'a7f3a0' },
      { token: 'comment', foreground: '6c8a80', fontStyle: 'italic' },
    ],
    colors: {
      'editor.background': '#08110d',
      'editorLineNumber.foreground': '#4f7666',
      'editorLineNumber.activeForeground': '#9fd5be',
      'editorCursor.foreground': '#83d8b3',
      'editor.selectionBackground': '#1f3a2f',
      'editor.inactiveSelectionBackground': '#173026',
    },
  });
}

export function QMongoEditor({ value, onChange, height = 320 }: QMongoEditorProps) {
  const editorRef = useRef<MonacoTypes.editor.IStandaloneCodeEditor | null>(null);

  const editorOptions = useMemo<MonacoTypes.editor.IStandaloneEditorConstructionOptions>(
    () => ({
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: 'on',
      wordWrap: 'on',
      scrollBeyondLastLine: false,
      tabSize: 2,
      automaticLayout: true,
      suggestOnTriggerCharacters: false,
      quickSuggestions: false,
      wordBasedSuggestions: 'off',
      formatOnPaste: true,
      formatOnType: false,
      padding: { top: 10, bottom: 10 },
    }),
    [],
  );

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    registerQMongoLanguage(monaco);

    editor.addAction({
      id: 'qmongo.format.document',
      label: 'Format QMongo',
      keybindings: [monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF],
      run: () => {
        editor.getAction('editor.action.formatDocument')?.run();
      },
    });
  };

  return (
    <div className="qmongo-editor-wrap">
      <div className="qmongo-editor-toolbar">
        <button
          type="button"
          className="button button--outline"
          onClick={() => editorRef.current?.getAction('editor.action.formatDocument')?.run()}
        >
          Format Query
        </button>
      </div>
      <Editor
        height={height}
        defaultLanguage={QMONGO_LANGUAGE_ID}
        language={QMONGO_LANGUAGE_ID}
        theme="qmongo-theme"
        value={value}
        options={editorOptions}
        beforeMount={registerQMongoLanguage}
        onMount={handleEditorMount}
        onChange={(nextValue) => onChange(nextValue ?? '')}
      />
    </div>
  );
}
