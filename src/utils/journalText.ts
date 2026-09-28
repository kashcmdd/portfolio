import { JournalBlock, JournalEntry } from '../types';

/**
 * Flattens one content block into plain text for search indexing.
 *
 * Search used to look only at titles, subtitles and categories, so the only way
 * to find a post was to already know its title. The body is where the specific
 * words live - a function name, a database engine, a measurement - so it is
 * what has to be searchable for search to be worth opening.
 *
 * Code is indexed too. A post about query planning is not findable by "sqlite"
 * unless the word appears in a code sample, and that is exactly where a reader
 * would expect to find it.
 */
export const blockPlainText = (block: JournalBlock): string => {
  switch (block.type) {
    case 'code':
      return `${block.language} ${block.caption || ''} ${block.code}`;
    case 'list':
      return block.items.join(' ');
    case 'image':
      return `${block.alt} ${block.caption || ''}`;
    default:
      return block.text;
  }
};

/** Every word in an article, body included, lowercased and ready to match. */
export const entryPlainText = (entry: JournalEntry): string =>
  entry.content.map(blockPlainText).join(' ').toLowerCase();
