import React, { useCallback, useState } from 'react';
import { discordPresenceData } from '../data/portfolioData';
import { DiscordMark } from './DiscordMark';

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
