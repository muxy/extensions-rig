# Getting Started

In this getting started guide we will build a simple extension. For the sake of simplicity we wont be using 
any asset or javascript transformation pipelines (gulp, babel, webkit, sass, etc.)

## Install Node.js

We recommend the current LTS release for your OS:
[https://nodejs.org/en/download/](https://nodejs.org/en/download/)

## Getting the rig and dependencies
```bash
git clone https://github.com/muxy/extensions-rig
cd ./extensions-rig
npm install
```

## Register a new Extension on Twitch
*  Visit [https://vulcan.curseforge.com](https://vulcan.curseforge.com) and create a new extension. Make a note of the 
Extension ID and Secret that get generated.
*  Visit [https://u.muxy.io/developers](https://u.muxy.io/developers) and submit the ID and Secret from the last step to enable the 
Muxy Extension SDK for your Extension.

## Create the Extension 
*  Make a new folder under the `src` folder in the rig with the name of your extension. (snake case preferred)
*  Create a manifest.json in this new folder with these contents:
   ```json
   {
     "viewer_path": "viewer.html",
     "config_path": "config.html",
     "live_config_path": "live.html",
     "panel_height": 500
   }
   ```
*  Create a `viewer.html`, `config.html`, and `live.html` file in that folder too

## Put some code in there

**Important:** Be sure to replace the Extension ID with your Extension ID.

viewer.html
```html
<html>
  <head>
    <style>
      @import url('//fonts.googleapis.com/css?family=Roboto');

      body {
        font-family: 'Roboto', sans-serif;
      }
    </style>
    <!-- A real extension would not be able to link to external CDNs; we just do it here for simplicity -->
    <script src="//cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js"></script>
    <script src="//ext-cdn.muxy.io/muxy-extensions-sdk/latest/muxy-extensions-sdk.js"></script>

    <script type="text/javascript">
      Muxy.setup({ extensionID: 'replaceme' }); // Replace this string with your Extension ID
      const sdk = new Muxy.SDK();

      sdk.loaded().then(() => {
        sdk.listen('motd', function(motd) {
          document.querySelector('#motd').innerText = motd.motd;
        });
      });
    </script>
  </head>
  <body>
    <h3>Message of the Day</h3>
    <p id="motd"></p>
  </body>
</html>
```

live.html
```html
<html>
  <head>
    <!-- A real extension would not be able to link to external CDNs; we just do it here for simplicity -->
    <script src="//cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js"></script>
    <script src="//ext-cdn.muxy.io/muxy-extensions-sdk/latest/muxy-extensions-sdk.js"></script>

    <script type="text/javascript">
      Muxy.testJWTRole = 'broadcaster'; // Necessary here to fake broadcaster access to the Muxy API. In production, the role will be set automatically in the broadcaster views.

      Muxy.setup({ extensionID: 'replaceme' }); // Replace this string with your Extension ID
      const sdk = new Muxy.SDK();

      function changeMotd() {
        const motd = document.querySelector('#motd').value;
        sdk.loaded().then(() => {
          sdk.send('motd', { motd: motd });
        });
      }
    </script>
  </head>
  <body>
    <textarea id="motd">Hello, world!</textarea>
    <p>
      <button onclick="changeMotd()">Set MOTD</button>
    </p>
  </body>
</html>
```

## Try it out in the Rig
Run this from the root of the Rig
```bash
PORT=4000 npm run dev
```

Visit [http://localhost:4000](http://localhost:4000)

## Next Steps
*  Read up on the Muxy Extension SDK: [https://github.com/muxy/extensions-js](https://github.com/muxy/extensions-js)
*  Visit the forum
*  Hit us up with any issues at [support@muxy.io](mailto:support@muxy.io)
