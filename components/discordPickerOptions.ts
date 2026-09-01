import type React from 'react';
import { KeyedObject, SelectOption } from '@spooder/webui-module-sdk';

// Shared by every Discord field that puts a button beside its input - the manual-entry toggle
// on the id pickers, the emoji browser's opener.
//
// `alignSelf: stretch` is what matches the button to the control next to it: these render both
// on a node card, where .node-inline-field squeezes inputs down to 0.75rem, and in plugin
// settings at full size, so a fixed height would be wrong in one of the two. The width is a
// floor rather than a size, since the button only ever holds an icon and would otherwise
// collapse to it.
export const FIELD_BUTTON_STYLE: React.CSSProperties = {
  flex: '0 0 auto',
  alignSelf: 'stretch',
  minWidth: 36,
  padding: '0 10px',
};

// StyleSize.small is 0.5rem - an 8px glyph, which is what made these look broken rather than
// small. 1rem sits comfortably inside the 26px control height the card forces.
export const FIELD_BUTTON_ICON_SIZE = 'medium';

// discord.js ChannelType, which /get_guilds passes through as the raw number (see
// DiscordApi.getGuilds). Named here rather than imported because the WebUI has no discord.js
// dependency, and only the members that a node can actually target are listed.
const CHANNEL_TYPE = {
  guildText: 0,
  guildVoice: 2,
  guildCategory: 4,
  guildAnnouncement: 5,
  announcementThread: 10,
  publicThread: 11,
  privateThread: 12,
  guildStageVoice: 13,
};

// What each kind of node can be pointed at. A guild's channel list also carries categories and
// forums, which are containers rather than destinations - sending to one fails at the API, so
// they are never offered.
export const CHANNEL_TYPE_GROUPS: { [group: string]: number[] } = {
  text: [
    CHANNEL_TYPE.guildText,
    CHANNEL_TYPE.guildAnnouncement,
    CHANNEL_TYPE.announcementThread,
    CHANNEL_TYPE.publicThread,
    CHANNEL_TYPE.privateThread,
  ],
  voice: [CHANNEL_TYPE.guildVoice, CHANNEL_TYPE.guildStageVoice],
};

// A field declares which groups it accepts via options.channelTypes. Left unset it means every
// group - still not categories, which nothing can post to or join.
export function allowedChannelTypes(groups?: string[]): number[] {
  const names = groups?.length ? groups : Object.keys(CHANNEL_TYPE_GROUPS);
  return names.flatMap((name) => CHANNEL_TYPE_GROUPS[name] ?? []);
}

export function guildOptions(guilds?: KeyedObject): SelectOption[] {
  const options: SelectOption[] = [{ value: '', label: 'Select Guild' }];
  for (const id in guilds ?? {}) {
    options.push({ value: id, label: guilds![id].name });
  }
  return options;
}

export function channelOptions(
  guilds: KeyedObject | undefined,
  guildId: string,
  channelTypes?: string[],
): SelectOption[] {
  const options: SelectOption[] = [{ value: '', label: 'Select Channel' }];
  const channels = guilds?.[guildId]?.channels ?? {};
  const allowed = allowedChannelTypes(channelTypes);
  for (const id in channels) {
    if (!allowed.includes(channels[id].type)) {
      continue;
    }
    options.push({ value: id, label: channels[id].name });
  }
  return options;
}

export function roleOptions(guilds: KeyedObject | undefined, guildId: string): SelectOption[] {
  const options: SelectOption[] = [{ value: '', label: 'Select Role' }];
  const roles = guilds?.[guildId]?.roles ?? {};
  // Position descending puts the roles a user is likely to tag - the ones near the top of the
  // server's own list - first, rather than in whatever order the cache happens to hold them.
  const sorted = Object.values(roles).sort(
    (a: any, b: any) => (b.position ?? 0) - (a.position ?? 0),
  );
  for (const role of sorted as KeyedObject[]) {
    // @everyone is the guild id as a role and tagging it from an automation is rarely wanted.
    if (role.id === guildId) {
      continue;
    }
    options.push({ value: role.id, label: '@' + role.name });
  }
  return options;
}

// A picker for one id often needs a sibling field's value: a channel list is scoped to the
// selected guild, a role list to the guild it belongs to. The field def names that sibling by
// its path under the node's values (options.guildField), and the two share everything up to
// the last segment of the form key - `...nodes.3.values.channelId` -> `...values.guildId`.
export function siblingFormKey(formKey: string, siblingPath: string): string {
  return formKey.replace(/[^.]+$/, siblingPath);
}
