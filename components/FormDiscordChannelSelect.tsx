import React from 'react';
import { useFormContext } from 'react-hook-form';
import { NodeFieldDef } from '@spooder/webui-module-sdk';
import { channelOptions, guildOptions } from './discordPickerOptions';
import FormDiscordIdSelect from './FormDiscordIdSelect';
import useDiscord from '../useDiscord';

interface FormDiscordChannelSelectProps {
  formKey: string;
  label?: string;
  // Present when this renders as a node's custom field; absent for a plugin setting of
  // `type: 'discord'`, which has no field def behind it.
  field?: NodeFieldDef;
}

// A guild and one of its channels, stored together as `{ destguild, destchannel }` under a
// single form key. Kept distinct from the single-value pickers in DiscordNodePickers because
// its value is one object rather than two string ports - the shape `Send To Channel` and the
// `discord` plugin input already store.
export default function FormDiscordChannelSelect(props: FormDiscordChannelSelectProps) {
  const { formKey, label, field } = props;
  const { getDiscordGuilds } = useDiscord();
  const { data: guilds, isLoading, error } = getDiscordGuilds();
  const { watch } = useFormContext();
  const destGuild = watch(`${formKey}.destguild`, '') ?? '';

  if (error) {
    return null;
  }

  // Defaults to text channels rather than everything: this widget's only consumers send
  // messages, and a category or a voice channel is not something sendToChannel can post to.
  const channelTypes = field?.options?.channelTypes ?? ['text'];

  return (
    <div>
      {label ? <label>{label}</label> : null}
      <FormDiscordIdSelect
        formKey={`${formKey}.destguild`}
        options={guildOptions(guilds)}
        isLoading={isLoading}
        emptyMessage='No guilds found. Invite your Spooder to a Discord server to assign a channel.'
        manualPlaceholder='Guild ID'
      />
      <FormDiscordIdSelect
        formKey={`${formKey}.destchannel`}
        options={channelOptions(guilds, destGuild, channelTypes)}
        isLoading={isLoading}
        emptyMessage={destGuild ? 'That guild has no text channels.' : 'Select a guild first.'}
        manualPlaceholder='Channel ID'
      />
    </div>
  );
}
