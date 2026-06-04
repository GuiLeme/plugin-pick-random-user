# Repository of a plugin for BigBlueButton

## Description

A brief description of the plugin including a screenshot and/or a short video.

## Building the Plugin

To build the plugin for production use, follow these steps:

```bash
cd $HOME/src/bbb-plugin-template
npm ci
npm run build-bundle
```

The above command will generate the `dist` folder, containing the bundled JavaScript file named `BbbPluginTemplate.js`. This file can be hosted on any HTTPS server along with its `manifest.json`.

If you install the Plugin separated to the manifest, remember to change the `javascriptEntrypointUrl` in the `manifest.json` to the correct endpoint.

To use the plugin in BigBlueButton, send this parameter along in create call:

```
pluginManifests=[{"url":"<your-domain>/path/to/manifest.json"}]
```

Or additionally, you can add this same configuration in the `.properties` file from `bbb-web` in `/usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties`


## Setting the Plugin manifest Version

To set or update the `version` field in `manifest.json`, run:

```bash
npm run set-manifest:version -- <version>
```

For example:

```bash
npm run set-manifest:version -- 1.0.0
```

This will add the field if it doesn't exist yet, or overwrite it if it does.

## Development mode

As for development mode (running this plugin from source), please, refer back to https://github.com/bigbluebutton/bigbluebutton-html-plugin-sdk section `Running the Plugin from Source`
