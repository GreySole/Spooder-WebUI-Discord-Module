import { DiscordIcon } from '../../../ui/common/icons/icons';
import type { ModuleDefinition } from '../../types';
import { discordApi } from './discordSlice';
import DiscordTab from './discordTab/DiscordTab';
import FormDiscordChannelSelect from './components/FormDiscordChannelSelect';

const DiscordModule: ModuleDefinition = {
  key: 'discord',
  tabConfig: {
    label: 'Discord',
    icon: DiscordIcon,
    parentTab: 'module',
  },
  Component: DiscordTab,
  api: discordApi,
  fieldRenderers: {
    channelSelect: FormDiscordChannelSelect,
  },
};

export default DiscordModule;