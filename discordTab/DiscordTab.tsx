import {
    Box,
    SaveButton,
    Stack
} from '@spooder/webui-component-library';
import React from 'react';
import { PageCircleLoader } from '@spooder/webui-module-sdk';
import useDiscord from '../useDiscord';
import DiscordTabFormContextProvider from './context/DiscordTabFormContext';
import DiscordAuthTutorial from './DiscordAuthTutorial';
import DiscordConfig from './input/DiscordConfig';
import DiscordLoginSettings from './input/DiscordLoginSettings';

export default function DiscordTab() {
  const { getDiscordConfig, getSaveDiscordConfig } = useDiscord();
  const {
    data: discordData,
    isLoading: discordLoading,
    error: discordError,
    refetch,
  } = getDiscordConfig();
  const { saveDiscordConfig } = getSaveDiscordConfig();
  if (discordLoading) {
    return <PageCircleLoader />;
  }

  const handleSaveDiscordConfig = (form: any) => {
    saveDiscordConfig(form).then(() => {
      refetch();
    });
  };

  return (
    <Stack width='100%' spacing='medium' padding='medium'>
      <DiscordTabFormContextProvider discordConfig={discordData}>
        <DiscordLoginSettings />
        {discordData.master && discordData.token && discordData.clientId ? (
          <DiscordConfig />
        ) : (
          <DiscordAuthTutorial />
        )}
        <Box justifyContent='flex-end'>
          <SaveButton saveFunction={handleSaveDiscordConfig} />
        </Box>
      </DiscordTabFormContextProvider>
    </Stack>
  );
}
