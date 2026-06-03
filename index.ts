import { DiscordIcon } from '../../../ui/common/icons/icons';
import type { ModuleDefinition } from '../../types';
import { discordApi } from './discordSlice';
import DiscordTab from './discordTab/DiscordTab';

const DiscordModule: ModuleDefinition = {
  key: 'discord',
  tabConfig: {
    label: 'Discord',
    icon: DiscordIcon,
    parentTab: 'module',
  },
  Component: DiscordTab,
  api: discordApi,
};

export default DiscordModule;