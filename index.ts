import { DiscordIcon } from '../../../ui/common/icons/icons';
import type { ModuleDefinition } from '../../types';
import { discordApi } from './discordSlice';
import DiscordTab from './discordTab/DiscordTab';
import DiscordChannelSelect from './components/DiscordChannelSelect';
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
  // Plugin settings fields of `type: 'discord'` - a guild plus one of its channels.
  pluginInputs: {
    discord: { form: FormDiscordChannelSelect, controlled: DiscordChannelSelect },
  },
  fieldRenderers: {
    // Height covers the label plus the stacked guild and channel dropdowns.
    channelSelect: { component: FormDiscordChannelSelect, height: 84 },
  },
};

export default DiscordModule;