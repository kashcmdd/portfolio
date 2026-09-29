import React from 'react';
import { ArrowUpRight, Hammer } from 'lucide-react';
import { currentlyBuildingData, recentWorkData } from '../data/portfolioData';
import { RecentWork } from '../types';

/**
 * A "what I am working on right now" band, plus a short dated changelog.
 *
 * Portfolio pages tend to describe finished work, which makes a visitor wonder
 * whether any of it is still alive. One honest line about current work answers
 * that without a blog post, and the changelog below it shows the work is moving
 * without pretending to be a live feed — the dates are real, so a reader can see
 * exactly how fresh the page is.
 *
 * The kind of each change is carried by a coloured dot rather than a word, so
 * the titles read as titles instead of running together with "Feature"/"Fix".
 * Colour alone is not a label, so the kind is also in an sr-only span and the
 * title attribute.
 */
const KIND_DOTS: Record<RecentWork['kind'], string> = {
  Feature: 'bg-[#89AACC]',
  Fix: 'bg-[#9ECE6A]',
  Refactor: 'bg-[#C099FF]',
  Content: 'bg-[#E0AF68]',
};

// Both rows share one label column, so the description and the changelog start
// at the same x instead of the second row looking indented by accident.
const LABEL = 'flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-widest sm:w-44';

export const NowBuildingStrip: React.FC = () => {
  const item = currentlyBuildingData;
  if (!item) return null;

  const recent = recentWorkData.slice(0, 3);

  return (
    <div className="border-y border-white/10 bg-white/[0.02]">
      <div className="mx-auto flex max-w-6xl flex-col px-6 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <span className={`${LABEL} text-[#89AACC]`}>
            <Hammer className="h-3 w-3" />
            Currently building
          </span>

          <p className="min-w-0 flex-1 text-sm text-neutral-300">
            <span className="font-medium text-white">{item.name}</span>
            <span className="mx-2 text-neutral-700">&middot;</span>
            {item.description}
          </p>

          {item.status && (
            <span className="shrink-0 self-start rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-neutral-400 sm:self-auto">
              {item.status}
            </span>
          )}

          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-1 self-start text-sm text-[#89AACC] transition-colors hover:text-white sm:self-auto"
            >
              Take a look
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        {recent.length > 0 && (
          <div className="mt-3 flex flex-col gap-2 border-t border-white/5 pt-3 sm:flex-row sm:items-center sm:gap-4">
            <span className={`${LABEL} text-neutral-600`}>Recently</span>

            <ul className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1.5 font-body text-xs">
              {recent.map((work) => (
                <li
                  key={work.title}
                  title={`${work.kind} - ${work.date}`}
                  className="flex items-center gap-1.5"
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${KIND_DOTS[work.kind]}`}
                    aria-hidden="true"
                  />
                  <span className="sr-only">{work.kind}: </span>
                  <span className="text-neutral-200">{work.title}</span>
                  <span className="text-neutral-600">{work.date}</span>
                </li>
              ))}
            </ul>

            <a
              href="https://github.com/kashcmdd/portfolio-dev/commits/main"
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-1 self-start whitespace-nowrap font-body text-xs text-[#89AACC] transition-colors hover:text-white sm:self-auto"
            >
              Full changelog
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
