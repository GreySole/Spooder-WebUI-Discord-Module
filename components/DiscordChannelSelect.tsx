import React from 'react';
import useDiscord from '../useDiscord';
import { SelectDropdown } from '@spooder/webui-component-library';
import { channelOptions, guildOptions } from './discordPickerOptions';

interface DiscordChannelPair {
  destGuild: string;
  destChannel: string;
}

interface DiscordChannelSelectProps {
  label?: string;
  value: DiscordChannelPair;
  onChange: (value: DiscordChannelPair) => void;
}

export default function DiscordChannelSelect(props: DiscordChannelSelectProps) {
  const { label, value, onChange } = props;
  const { getDiscordGuilds } = useDiscord();
  const { data: guilds, isLoading, error } = getDiscordGuilds();

  const destGuild = value.destGuild;
  const destChannel = value.destChannel;

  const onGuildChange = (guild: string) => {
    onChange({ destGuild: guild, destChannel: '' });
  };

  const onChannelChange = (channel: string) => {
    onChange({ ...value, destChannel: channel });
  };

  if (isLoading || error) {
    return null;
  }

  if (Object.keys(guilds).length > 0) {
    return (
      <label>
        {label}
        <SelectDropdown options={guildOptions(guilds)} value={destGuild} onChange={onGuildChange} />
        <SelectDropdown
          // Text channels only: this picker names a message destination, and a category or a
          // voice channel is not one.
          options={channelOptions(guilds, destGuild, ['text'])}
          value={destChannel}
          onChange={onChannelChange}
        />
      </label>
    );
  } else {
    return (
      <label>
        {label}
        No guilds found. Invite your Spooder to a Discord server to assign a channel.
      </label>
    );
  }
}
