import React, { useCallback, useState } from 'react';
import { discordPresenceData } from '../data/portfolioData';

const CACHE_TTL_MS = 60_000;

type PresenceStatus = 'online' | 'idle' | 'dnd' | 'offline';

interface LanyardUser {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
}

interface LanyardActivity {
  name: string;
  type: number;
}

interface LanyardData {
  discord_user: LanyardUser;
  discord_status: PresenceStatus;
  activities: LanyardActivity[];
  listening_to_spotify: boolean;
  spotify?: { song: string; artist: string } | null;
}

interface LanyardResponse {
  success: boolean;
  data?: LanyardData;
}

const STATUS: Record<PresenceStatus, { label: string; dot: string }> = {
  online: { label: 'Online', dot: 'bg-emerald-400' },
  idle: { label: 'Idle', dot: 'bg-amber-400' },
  dnd: { label: 'Do Not Disturb', dot: 'bg-rose-400' },
  offline: { label: 'Offline', dot: 'bg-neutral-500' },
};

const ACTIVITY_VERBS: Record<number, string> = {
  0: 'Playing',
  1: 'Streaming',
  2: 'Listening to',
  3: 'Watching',
  5: 'Competing in',
};

const cacheKey = (userId: string) => `kashh:discord:${userId}`;

const readCache = (userId: string): LanyardData | null => {
  try {
    const raw = window.sessionStorage.getItem(cacheKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; data: LanyardData };
    if (!parsed?.data?.discord_user || Date.now() - parsed.at > CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
};

const writeCache = (userId: string, data: LanyardData) => {
  try {
    window.sessionStorage.setItem(cacheKey(userId), JSON.stringify({ at: Date.now(), data }));
  } catch {
    // Private browsing can refuse storage; the card still works without it.
  }
};

const avatarUrl = (user: LanyardUser) => {
  if (!user.avatar) return 'https://cdn.discordapp.com/embed/avatars/0.png';
  const extension = user.avatar.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=64`;
};

const activityLabel = (data: LanyardData): string | null => {
  if (data.listening_to_spotify && data.spotify) {
    return `Listening to ${data.spotify.song} — ${data.spotify.artist}`;
  }
  const activity = data.activities?.[0];
  if (!activity) return null;
  const verb = ACTIVITY_VERBS[activity.type] ?? 'Doing';
  return `${verb} ${activity.name}`;
};

/** Discord's mark, inline so the card adds no icon dependency. */
const DiscordMark: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52.07.07 0 0 0-.08.04c-.21.38-.45.87-.61 1.25a18.3 18.3 0 0 0-5.49 0 12.6 12.6 0 0 0-.62-1.25.08.08 0 0 0-.08-.04 19.7 19.7 0 0 0-4.88 1.52.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.05 19.9 19.9 0 0 0 5.99 3.03.08.08 0 0 0 .09-.03c.46-.63.87-1.3 1.22-1.99a.08.08 0 0 0-.04-.11 13.1 13.1 0 0 1-1.87-.89.08.08 0 0 1-.01-.13c.13-.1.25-.2.37-.3a.07.07 0 0 1 .08-.01c3.93 1.79 8.18 1.79 12.06 0a.07.07 0 0 1 .08.01c.12.1.25.2.37.3a.08.08 0 0 1-.01.13 12.3 12.3 0 0 1-1.87.89.08.08 0 0 0-.04.11c.36.7.77 1.36 1.22 1.99a.08.08 0 0 0 .09.03 19.8 19.8 0 0 0 6-3.03.08.08 0 0 0 .03-.05c.5-5.18-.84-9.68-3.55-13.66a.06.06 0 0 0-.03-.03zM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.41 0-1.33.96-2.41 2.16-2.41 1.21 0 2.18 1.09 2.16 2.41 0 1.33-.96 2.41-2.16 2.41zm7.97 0c-1.18 0-2.16-1.08-2.16-2.41 0-1.33.96-2.41 2.16-2.41 1.21 0 2.18 1.09 2.16 2.41 0 1.33-.95 2.41-2.16 2.41z" />
  </svg>
);

/**
 * Opt-in Discord presence. The public Lanyard API is contacted only after the
 * visitor presses the button, because a page that phones a third party on load
 * is exactly what the analytics consent exists to avoid.
 */
export const DiscordPresence: React.FC = () => {
  const userId = discordPresenceData.userId.trim();
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [data, setData] = useState<LanyardData | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;

    const cached = readCache(userId);
    if (cached) {
      setData(cached);
      setState('ready');
      return;
    }

    setState('loading');
    try {
      const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`, {
        headers: { Accept: 'application/json' },
      });
      const payload = (await response.json()) as LanyardResponse;
      if (!response.ok || !payload.success || !payload.data) throw new Error('No presence');
      setData(payload.data);
      setState('ready');
      writeCache(userId, payload.data);
    } catch {
      setState('error');
    }
  }, [userId]);

  if (!userId) return null;

  const meta = data ? STATUS[data.discord_status] ?? STATUS.offline : null;
  const activity = data ? activityLabel(data) : null;

  return (
    <div className="mt-8 flex flex-col items-center gap-2">
      {state === 'idle' && (
        <button
          type="button"
          onClick={load}
          className="liquid-glass inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white transition-colors hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89AACC]"
        >
          <DiscordMark />
          Show Discord status
        </button>
      )}

      {state === 'loading' && (
        <p role="status" className="text-xs text-neutral-300">
          Checking Discord…
        </p>
      )}

      {state === 'error' && (
        <div role="status" className="flex max-w-md flex-col items-center gap-1 text-center">
          <p className="text-xs text-neutral-300">
            Discord status isn&apos;t available right now. The Lanyard API may not be monitoring
            this account.
          </p>
          <button
            type="button"
            onClick={load}
            className="text-[11px] font-semibold uppercase tracking-wider text-[#89AACC] transition-colors hover:text-white"
          >
            Try again
          </button>
        </div>
      )}

      {state === 'ready' && data && meta && (
        <div
          role="status"
          className="liquid-glass flex max-w-[86vw] items-center gap-3 rounded-full border border-white/10 px-4 py-2 pr-5"
        >
          <img
            src={avatarUrl(data.discord_user)}
            alt=""
            loading="lazy"
            className="h-9 w-9 shrink-0 rounded-full border border-white/10 object-cover"
          />
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-medium text-white">
              {data.discord_user.global_name || data.discord_user.username}
            </p>
            <p className="flex items-center gap-1.5 text-[11px] text-neutral-400">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dot}`} aria-hidden="true" />
              <span>{meta.label}</span>
              {activity && <span className="truncate text-neutral-500">· {activity}</span>}
            </p>
          </div>
        </div>
      )}

      <p className="text-[10px] text-neutral-400">Fetched from Lanyard only when you ask.</p>
    </div>
  );
};
