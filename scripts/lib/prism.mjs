/**
 * Syntax highlighting, shared by the SPA and the static article pages.
 *
 * Both renderers used to print code as flat monochrome text, so the technical
 * writing on this site read as plain text. Highlighting it in one place matters
 * because there are two renderers: the React modal and the no-JavaScript
 * article pages. If the theme lived in both, the "full page" version of a post
 * would slowly drift away from the version people read in the app.
 *
 * Only the six languages the journal actually uses are registered. Prism's core
 * plus these grammars is small, and the SPA imports this module dynamically, so
 * none of it lands in the initial bundle.
 */
import Prism from 'prismjs';
import 'prismjs/components/prism-clike.js';
import 'prismjs/components/prism-markup.js';
import 'prismjs/components/prism-css.js';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-jsx.js';
import 'prismjs/components/prism-python.js';
import 'prismjs/components/prism-bash.js';

// TSX is TypeScript plus JSX, and neither grammar alone is right: the
// TypeScript grammar leaves JSX tags unstyled, the JSX grammar has no notion
// of type annotations. Extending one with the other gets both.
Prism.languages.tsx = Prism.languages.extend('typescript', Prism.languages.jsx);

// The labels used in the content model mapped onto grammars that exist.
const GRAMMARS = {
  ts: 'typescript',
  typescript: 'typescript',
  tsx: 'tsx',
  js: 'javascript',
  jsx: 'jsx',
  javascript: 'javascript',
  python: 'python',
  py: 'python',
  css: 'css',
  html: 'markup',
  xml: 'markup',
  markup: 'markup',
  bash: 'bash',
  sh: 'bash',
  shell: 'bash',
};

export function grammarFor(language) {
  const key = String(language || '').toLowerCase();
  const name = GRAMMARS[key];
  return name ? Prism.languages[name] : undefined;
}

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );

/**
 * Returns highlighted HTML, or escaped plain text when the language is unknown.
 * Prism escapes the source before wrapping it in token spans, so the result is
 * safe to inject — a code sample containing `<script>` cannot become markup.
 */
export function highlightCode(code, language) {
  const source = String(code ?? '');
  const grammar = grammarFor(language);
  if (!grammar) return escapeHtml(source);
  try {
    return Prism.highlight(source, grammar, String(language).toLowerCase());
  } catch {
    return escapeHtml(source);
  }
}

/**
 * One theme, emitted as a plain CSS string so both renderers can inline it: the
 * static pages inject it into their <head>, the SPA injects it alongside the
 * highlighter it loads lazily. Colours follow the site palette rather than an
 * off-the-shelf theme, so code sits in the same world as everything else.
 */
export const PRISM_TOKEN_CSS = `
.prism-code .token.comment,
.prism-code .token.prolog,
.prism-code .token.doctype,
.prism-code .token.cdata { color: #55606e; font-style: italic; }
.prism-code .token.punctuation { color: #7d8794; }
.prism-code .token.property,
.prism-code .token.tag,
.prism-code .token.symbol,
.prism-code .token.deleted,
.prism-code .token.selector,
.prism-code .token.attr-name { color: #89AACC; }
.prism-code .token.boolean,
.prism-code .token.number,
.prism-code .token.constant { color: #ff9e64; }
.prism-code .token.string,
.prism-code .token.char,
.prism-code .token.inserted,
.prism-code .token.attr-value { color: #9ece6a; }
.prism-code .token.keyword { color: #bb9af7; }
.prism-code .token.function,
.prism-code .token.class-name { color: #e0af68; }
.prism-code .token.operator,
.prism-code .token.entity,
.prism-code .token.url { color: #89dceb; }
.prism-code .token.builtin,
.prism-code .token.atrule { color: #7dcfff; }
.prism-code .token.regex,
.prism-code .token.important,
.prism-code .token.variable { color: #f7768e; }
.prism-code .token.important,
.prism-code .token.bold { font-weight: 600; }
.prism-code .token.italic { font-style: italic; }
`;
