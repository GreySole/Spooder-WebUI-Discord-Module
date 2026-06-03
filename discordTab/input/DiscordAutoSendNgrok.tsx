import React from 'react';
import FormDiscordChannelSelect from '../../../../../ui/common/input/form/FormDiscordChannelSelect';

interface DiscordAutoSendNgrokProps {
  formKey: string;
}

export default function DiscordAutoSendNgrok(props: DiscordAutoSendNgrokProps) {
  const { formKey } = props;

  return <FormDiscordChannelSelect formKey={`${formKey}.autosendngrok`} />;
}
