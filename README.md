# Muxy Extension Rig

![Muxy Logo](docs/logo.png)

The Muxy Extension Rig combined with the Muxy Extension SDK can greatly speed up the development of Twitch Extensions.

See also:

[Muxy Extension JavaScript Library](https://github.com/muxy/extensions-js)

[Overlay App Rig](https://github.com/muxy/overlay-app-rig)

##Overview

The Rig simulates the Twitch environment that extension run in. Combined with the Muxy SDK it allows extensions to
safely be sandboxed away from production data and any hiccups that can happen on Twitch's site. When running in the rig 
the Muxy SDK also provides a pubsub system that works exactly like the production one on Twitch.

## Managing Twitch Extension Secrets
Before you can use the Muxy Extension SDK you will have to create a new extension on [https://vulcan.curseforge.com](https://vulcan.curseforge.com).
Once you have done that take the Extension id and secret and submit them to [https://u.muxy.io/developers](https://u.muxy.io/developers) 
This will allow the automatic sandbox credentials to work for your extension.

## Software Requirements
The skeleton runs as a NodeJS web server, and as such a globally accessible version of NodeJS must
be available. The LTS version (currently 6.11) is used to test against. NodeJS may be downloaded
[here](https://nodejs.org).

This documentation is bundled with the App Skeleton. The code can always be found on its
[GitHub page](https://github.com/muxy/extension-rig) with specific
[tagged releases](https://github.com/muxy/extension-rig/releases) available.

The NodeJS libraries required to run the skeleton can be installed by running `npm install` on the
command line.

## Developing with the Rig
You can develop an extension directly in the rig by adding a folder under the src folder and creating a manifest.

If you are planning developing with an asset pipeline or bundler (gulp, webpack, etc.) you'll want to create a new folder in the Rig source folder and 
set that as your output folder. The webserver shipped with the Rig will then serve those assets.

There are two example apps under the src folder that show off the absolute minimum for an Extension with the Muxy Extension SDK.
For documentation on the Muxy Extension SDK visit [https://github.com/muxy/extensions-js](https://github.com/muxy/extensions-js)

## Manifest
Putting a manifest.json file in the root of your app lets us know what files we should load into the rig. Along with any
other configuration settings that are available.

```json
{
  "viewer_path": "viewer.html",
  "config_path": "config.html",
  "live_config_path": "live.html",
  "panel_height": 100
}
```

## Running
To run the rig, simply run `PORT=4000 npm run dev`. This will start the server running on port
4000 on your local machine. You may change the port to suite your environment.

Once running, visit http://localhost:4000 to see the extension rig.

## Resources
 - [Getting Started](docs/GettingStarted.md)