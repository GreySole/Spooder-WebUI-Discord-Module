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
    // Height covers the label plus the stacked guild and channel dropdowns.
    channelSelect: { component: FormDiscordChannelSelect, height: 84 },
  },
};

export default DiscordModule;