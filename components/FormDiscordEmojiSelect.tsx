import { faFaceSmile } from '@fortawesome/free-solid-svg-icons';
import { Button, FormTextInput } from '@spooder/webui-component-library';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFormContext } from 'react-hook-form';
import { CustomFieldRendererProps } from '../../../../ui/tabs/eventsTab/eventNodes/customFieldRenderer';
import { panelStyle } from '../../../../ui/tabs/eventsTab/eventNodes/palette/CascadeMenu';
import { KeyedObject } from '../../../../ui/Types';
import useDiscord from '../useDiscord';
import { FIELD_BUTTON_ICON_SIZE, FIELD_BUTTON_STYLE, siblingFormKey } from './discordPickerOptions';

interface EmojiEntry {
  // 'name:id', the same composite the backend emits for a reaction and matches the node
  // against. Unique across guilds, where a bare name is not - two servers can both have a
  // :pepe:, and the trigger has to be able to tell them apart.
  value: string;
  name: string;
  url: string;
  guildName: string;
}

const POPUP_WIDTH = 260;
const GRID_HEIGHT = 180;
const EMOJI_SIZE = 24;
const EDGE_MARGIN = 8;

function collectEmojis(guilds: KeyedObject | undefined, guildId: string): EmojiEntry[] {
  const entries: EmojiEntry[] = [];
  for (const id in guilds ?? {}) {
    // An empty guild filter on the node means "any guild", so the picker offers every emoji
    // the bot can see rather than nothing.
    if (guildId && id !== guildId) {
      continue;
    }
    const guild = guilds![id];
    for (const emojiId in guild.emojis ?? {}) {
      const emoji = guild.emojis[emojiId];
      entries.push({
        value: `${emoji.name}:${emojiId}`,
        name: emoji.name,
        // Asking for the wrong extension gives a still frame or a 404, so it follows the flag
        // the backend sends rather than guessing.
        url: `https://cdn.discordapp.com/emojis/${emojiId}.${emoji.animated ? 'gif' : 'png'}`,
        guildName: guild.name,
      });
    }
  }
  return entries;
}

// Picks the emoji a Reaction Added node listens for: a field holding the value, and a button
// that opens the browser for it.
//
// Custom emoji are shown as themselves - a name in a list tells you nothing about which :pepe:
// you are choosing - but a grid of them is far taller than a node row, so it opens over the
// graph instead of living on the card.
//
// Standard Unicode emoji have no grid to offer: they aren't Discord's, they number in the
// thousands, and shipping a copy of the table would cost more than it earns here. The text
// field takes them instead, pasted from Discord or typed with the OS emoji picker, and it
// doubles as the way to read or correct whatever is currently set.
export default function FormDiscordEmojiSelect(props: CustomFieldRendererProps) {
  const { formKey, label, field } = props;
  const { getDiscordGuilds } = useDiscord();
  const { data: guilds, isLoading, error } = getDiscordGuilds();
  const { watch, setValue } = useFormContext();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  // Scoped to the node's own guild filter when it has one, so a node aimed at one server
  // doesn't offer emoji it can never match.
  const guildId = watch(siblingFormKey(formKey, field.options?.guildField ?? 'guildId'), '') ?? '';
  const value = watch(formKey, '') ?? '';

  // Positioned in viewport coordinates against the button's own rect, and rendered through a
  // portal: the field sits inside the graph's pan/zoom transform, and inside a node row that
  // clips to the height declared at registration - either one would swallow a popup laid out
  // in place.
  useLayoutEffect(() => {
    if (!open || !anchorRef.current) {
      return;
    }
    const rect = anchorRef.current.getBoundingClientRect();
    setPosition({
      x: Math.max(EDGE_MARGIN, Math.min(rect.left, window.innerWidth - POPUP_WIDTH - EDGE_MARGIN)),
      y: Math.max(EDGE_MARGIN, Math.min(rect.bottom + 4, window.innerHeight - GRID_HEIGHT - 60)),
    });
  }, [open]);

  useLayoutEffect(() => {
    if (open) {
      searchRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  if (isLoading || error) {
    return null;
  }

  const emojis = collectEmojis(guilds, guildId).filter((emoji) =>
    search ? emoji.name.toLowerCase().includes(search.toLowerCase()) : true,
  );

  function pick(entry: EmojiEntry) {
    // Clicking the current selection clears it, which is the only way back to "any emoji"
    // without deleting the text by hand.
    setValue(formKey, value === entry.value ? '' : entry.value, { shouldDirty: true });
    setOpen(false);
  }

  return (
    <div>
      {label ? <label>{label}</label> : null}
      <div ref={anchorRef} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          <FormTextInput formKey={formKey} placeholder='Any emoji' />
        </div>
        <Button
          icon={faFaceSmile}
          iconSize={FIELD_BUTTON_ICON_SIZE}
          style={FIELD_BUTTON_STYLE}
          tooltipText='Browse custom emoji'
          onClick={() => setOpen(!open)}
        />
      </div>
      {open
        ? createPortal(
            <div
              // Full-screen backdrop rather than an outside-click listener: it also stops the
              // press reaching the canvas underneath, which would otherwise pan or deselect
              // the node whose field this is.
              style={{ position: 'fixed', inset: 0, zIndex: 40 }}
              onPointerDown={() => setOpen(false)}
            >
              <div
                onPointerDown={(e) => e.stopPropagation()}
                onWheel={(e) => e.stopPropagation()}
                style={{
                  ...panelStyle,
                  position: 'fixed',
                  left: position.x,
                  top: position.y,
                  width: POPUP_WIDTH,
                  color: 'var(--color-text, #eee)',
                }}
              >
                <input
                  ref={searchRef}
                  type='text'
                  value={search}
                  placeholder='Search emoji...'
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '4px 6px',
                    marginBottom: 4,
                    fontSize: '0.8rem',
                    borderRadius: 3,
                    border: '1px solid var(--color-border, #444)',
                  }}
                />
                <div
                  style={{
                    height: GRID_HEIGHT,
                    overflowY: 'auto',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    alignContent: 'flex-start',
                  }}
                >
                  {emojis.length === 0 ? (
                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                      {guildId ? 'No custom emoji in that guild.' : 'No custom emoji found.'}
                    </span>
                  ) : null}
                  {emojis.map((emoji) => (
                    <button
                      key={emoji.value}
                      type='button'
                      title={`:${emoji.name}: (${emoji.guildName})`}
                      onClick={() => pick(emoji)}
                      style={{
                        padding: 2,
                        lineHeight: 0,
                        border:
                          value === emoji.value
                            ? '2px solid currentColor'
                            : '2px solid transparent',
                        background: 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <img
                        src={emoji.url}
                        alt={emoji.name}
                        width={EMOJI_SIZE}
                        height={EMOJI_SIZE}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
