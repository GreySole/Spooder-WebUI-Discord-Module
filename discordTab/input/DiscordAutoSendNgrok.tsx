import React from 'react';
import FormDiscordChannelSelect from '../../components/FormDiscordChannelSelect';

interface DiscordAutoSendNgrokProps {
  formKey: string;
}

export default function DiscordAutoSendNgrok(props: DiscordAutoSendNgrokProps) {
  const { formKey } = props;

  return <FormDiscordChannelSelect formKey={`${formKey}.autosendngrok`} />;
}
