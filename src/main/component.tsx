import * as React from 'react';

import { BbbPluginSdk, PluginApi } from 'bigbluebutton-html-plugin-sdk';

interface MainComponentProps {
  pluginUuid: string;
}

function MainComponent(
  { pluginUuid: uuid }: MainComponentProps,
): React.ReactElement<MainComponentProps> {
  BbbPluginSdk.initialize(uuid);
  const pluginApi: PluginApi = BbbPluginSdk.getPluginApi(uuid);

  console.log('Hello world', pluginApi);

  return null;
}

export default MainComponent;
