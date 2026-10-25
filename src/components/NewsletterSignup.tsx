import React, { useState } from 'react';
import { Mail, Rss, Github, ArrowUpRight } from 'lucide-react';
import { warriorDetails } from '../data/portfolioData';

/**
 * #11 - Newsletter.
 *
 * Buttondown is a form POST, not a JS widget: no script from a third party runs
 * on this page, no cookie is set before the visitor chooses to subscribe, and
 * the only thing that ever reaches Buttondown is an address someone typed in
 * deliberately. That is the whole reason it was picked over the alternatives -
 * it fits the same privacy posture as the analytics consent banner.
 *
 * BUTTONDOWN_USERNAME is the single piece of configuration. While it is empty
 * the form is not rendered at all: a subscribe box that posts to a username
 * that does not exist is worse than no subscribe box, because it looks like it
 * worked. The RSS feed and the GitHub profile are the honest stand-ins until
 * the list is set up.
 */
const BUTTONDOWN_USERNAME = '';

const NewsletterSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  const username = BUTTONDOWN_USERNAME.trim();
  const isLive = username.length > 0;

  return (
    <div className="w-full max-w-xl mx-auto rounded-[28px] border border-white/10 bg-white/[0.03] p-6 md:p-8 text-left">
      <div className="flex items-center gap-2 text-xs font-body text-neutral-400 uppercase tracking-[0.25em] mb-2">
        <Mail className="w-3.5 h-3.5" />
        <span>Stay in the loop</span>
      </div>

      <p className="text-sm font-body font-light text-neutral-300 mb-5">
        Occasional notes when something ships - a new project, a journal entry worth reading. No
        schedule, no filler.
      </p>

      {isLive ? (
        <>
          <form
            action={`https://buttondown.com/api/emails/embed-subscribe/${username}`}
            method="post"
            target="_blank"
            className="flex flex-col sm:flex-row gap-2"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 min-w-0 rounded-full bg-[#0f0f0f] border border-white/10 px-4 py-2.5 text-sm font-body text-white placeholder:text-neutral-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#89AACC]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-black px-5 py-2.5 text-sm font-body font-medium hover:bg-[#89AACC] transition-colors cursor-pointer shrink-0"
            >
              <span>Subscribe</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </form>
          <p className="mt-3 text-[11px] font-body text-neutral-500 leading-relaxed">
            Double opt-in - you will get one email asking you to confirm. Buttondown handles the
            list; unsubscribe from any issue.
          </p>
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <a
              href={`${import.meta.env.BASE_URL}rss.xml`}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-body text-neutral-200 hover:text-white hover:border-white/25 transition-colors"
            >
              <Rss className="w-3.5 h-3.5" />
              <span>RSS feed</span>
            </a>
            <a
              href={warriorDetails.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-body text-neutral-200 hover:text-white hover:border-white/25 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>
          <p className="mt-3 text-[11px] font-body text-neutral-500 leading-relaxed">
            Email updates are not set up yet. Until they are, the feed and the profile are the
            places new work shows up first.
          </p>
        </>
      )}
    </div>
  );
};

export default NewsletterSignup;
