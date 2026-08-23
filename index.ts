import { DiscordIcon } from '../../../ui/common/icons/icons';
import type { ModuleDefinition } from '../../types';
import { discordApi } from './discordSlice';
import DiscordTab from './discordTab/DiscordTab';
import DiscordChannelSelect from './components/DiscordChannelSelect';
import FormDiscordChannelSelect from './components/FormDiscordChannelSelect';
import FormDiscordEmojiSelect from './components/FormDiscordEmojiSelect';
import {
  FormDiscordChannelIdSelect,
  FormDiscordGuildSelect,
  FormDiscordRoleSelect,
} from './components/DiscordNodePickers';

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
    // A card row clips to the height declared here, so these have to cover what the control
    // actually draws. CONTROL_HEIGHTS.select in nodeLayout says 40, sized for the 26px that
    // .node-inline-field asks inputs to shrink to - but FormSelectDropdown carries its 1.25rem
    // font as an inline style, which beats that rule, so a dropdown lands nearer 34px and the
    // focus ring the library paints outside it needs a few more. Hence 48 per row rather than
    // 40, and twice that for the stacked pair.
    channelSelect: { component: FormDiscordChannelSelect, height: 96 },
    guildSelect: { component: FormDiscordGuildSelect, height: 48 },
    channelIdSelect: { component: FormDiscordChannelIdSelect, height: 48 },
    roleSelect: { component: FormDiscordRoleSelect, height: 48 },
    // The emoji grid opens over the graph rather than living on the card, so this row is just
    // the value field and the button that opens it - kept level with the pickers above.
    emojiSelect: { component: FormDiscordEmojiSelect, height: 48 },
  },
};

export default DiscordModule;
