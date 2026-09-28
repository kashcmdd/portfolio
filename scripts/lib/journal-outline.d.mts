export declare function slugifyHeading(text: string, seen?: Set<string>): string;

export declare function outlineSlugs(blocks: readonly unknown[]): (string | null)[];

export declare function articleOutline(
  blocks: readonly unknown[]
): { id: string; text: string }[];
