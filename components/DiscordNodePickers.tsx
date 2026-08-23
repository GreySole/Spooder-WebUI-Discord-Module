import React from 'react';
import { useFormContext } from 'react-hook-form';
import { CustomFieldRendererProps } from '../../../../ui/tabs/eventsTab/eventNodes/customFieldRenderer';
import useDiscord from '../useDiscord';
import { channelOptions, guildOptions, roleOptions, siblingFormKey } from './discordPickerOptions';
import FormDiscordIdSelect from './FormDiscordIdSelect';

// Single-value pickers for the id fields on Discord's action nodes. Each binds to a plain
// string form key rather than an object, which is what keeps the field a connectable input
// port: a graph that wants a destination from the event that triggered it wires the port and
// the card hides the control, exactly as it does for a text field.
//
// The combined guild+channel widget (FormDiscordChannelSelect) stays for `Send To Channel`,
// whose stored value is one object and predates ports on these fields.

const NO_GUILDS = 'No guilds found. Invite your Spooder to a Discord server first.';

export function FormDiscordGuildSelect(props: CustomFieldRendererProps) {
  const { formKey, label } = props;
  const { getDiscordGuilds } = useDiscord();
  const { data: guilds, isLoading } = getDiscordGuilds();

  return (
    <FormDiscordIdSelect
      formKey={formKey}
      label={label}
      options={guildOptions(guilds)}
      isLoading={isLoading}
      emptyMessage={NO_GUILDS}
      manualPlaceholder='Guild ID'
    />
  );
}

export function FormDiscordChannelIdSelect(props: CustomFieldRendererProps) {
  const { formKey, label, field } = props;
  const { getDiscordGuilds } = useDiscord();
  const { data: guilds, isLoading } = getDiscordGuilds();
  const { watch } = useFormContext();
  // Which sibling field holds the guild this channel belongs to. Watched rather than read once,
  // so changing the guild re-lists the channels immediately.
  const guildId = watch(siblingFormKey(formKey, field.options?.guildField ?? 'guildId'), '') ?? '';

  return (
    <FormDiscordIdSelect
      formKey={formKey}
      label={label}
      options={channelOptions(guilds, guildId, field.options?.channelTypes)}
      isLoading={isLoading}
      emptyMessage={guildId ? 'That guild has no channels of this kind.' : 'Select a guild first.'}
      manualPlaceholder='Channel ID'
    />
  );
}

export function FormDiscordRoleSelect(props: CustomFieldRendererProps) {
  const { formKey, label, field } = props;
  const { getDiscordGuilds } = useDiscord();
  const { data: guilds, isLoading } = getDiscordGuilds();
  const { watch } = useFormContext();
  const guildId = watch(siblingFormKey(formKey, field.options?.guildField ?? 'guildId'), '') ?? '';

  return (
    <FormDiscordIdSelect
      formKey={formKey}
      label={label}
      options={roleOptions(guilds, guildId)}
      isLoading={isLoading}
      emptyMessage={guildId ? 'That guild has no roles to tag.' : 'Select a guild first.'}
      manualPlaceholder='Role ID'
    />
  );
}
