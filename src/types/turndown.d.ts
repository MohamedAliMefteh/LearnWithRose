declare module 'turndown' {
  interface Options {
    headingStyle?: 'setext' | 'atx';
    hr?: string;
    bulletListMarker?: '-' | '+' | '*';
    codeBlockStyle?: 'indented' | 'fenced';
    fence?: string;
    emDelimiter?: '_' | '*';
    strongDelimiter?: '**' | '__';
    linkStyle?: 'inlined' | 'referenced';
    linkReferenceStyle?: 'full' | 'collapsed' | 'shortcut';
  }

  interface Rule {
    filter: string | string[] | ((node: Node) => boolean);
    replacement: (content: string, node?: any) => string;
  }

  class TurndownService {
    constructor(options?: Options);
    turndown(html: string): string;
    addRule(key: string, rule: Rule): TurndownService;
    remove(filter: string | string[]): TurndownService;
  }

  export = TurndownService;
}
