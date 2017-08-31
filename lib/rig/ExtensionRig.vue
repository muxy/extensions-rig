<template>
  <div v-if="!extensions.length">
    <div class="no-extensions">
      <h2>We could not find any panel extensions in your <code>src/</code> directory.</h2>
      <h3>You can get sample extensions in the <a href="">GitHub Repo</a> for this rig.</h3>
    </div>
  </div>

  <div v-else class="rig">
    <ui-toolbar remove-nav-icon type="colored" text-color="white"
      :title="`Muxy Extension Development Rig - ${extension.name || extension._rig_id}`">
      <div slot="actions">
        <ui-icon-button color="white" has-dropdown icon="more_vert" ref="appsDropdown">
          <ui-menu slot="dropdown" :options="extensions"
            @select="selectExtension" @close="$refs.appsDropdown.closeDropdown()">
            <template scope="props" slot="options">
              <router-link :to="props.option._rig_id">
                {{ props.option.label }}
              </router-link>
            </template>
          </ui-menu>
        </ui-icon-button>
      </div>
    </ui-toolbar>

    <div class="viewer-live-apps">
      <div title="Viewer Panel" class="app">
        <div class="viewer">
          <iframe class="panel" :style="{ height: `${Math.min(500, extension.panel_height || 500)}px` }"
            :src="viewerURL" scrolling="no" sandbox="allow-scripts"></iframe>

          <div class="title">
            {{ extension.name || 'Panel Extension' }} - Viewer
            <span class="info-link" @click="openModal('viewer-panel')">?</span>
          </div>
        </div>
      </div>

      <div title="Broadcaster Live Panel" class="app" v-if="extension.live_config_path">
        <div class="broadcaster">
          <div class="live">
            <iframe :src="liveURL"  :style="{ height: `${Math.min(500, extension.panel_height || 500)}px` }"
                    scrolling="no" sandbox="allow-scripts"></iframe>

            <div class="title">
              {{ extension.name || 'Panel Extension' }} - Live
              <span class="info-link" @click="openModal('live-panel')">?</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div title="Broadcaster Config Panel" class="app config-app">
      <div class="broadcaster">
        <div class="config">
          <iframe :src="configURL" scrolling="no" sandbox="allow-scripts"></iframe>

          <div class="title">
            {{ extension.name || 'Panel Extension' }} - Config
            <span class="info-link" @click="openModal('config-panel')">?</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Informational Modals (defined out here so they can expand to full screen) -->
    <ui-modal ref="viewer-panel" title="Viewer Panel">
      This is what the viewer will see underneath the broadcaster&#8217;s stream, alongside
      their other panels.
    </ui-modal>

    <ui-modal ref="config-panel" title="Configure Panel">
      <p>
        The Broadcaster Config App is accessible by the broadcaster from Twitch&#8217;s
        &#8220;Extension Manager.&#8221; Your extension will
        appear in a large area and should display any configuration options the
        broadcaster may set that will affect your app channel-wide.
      </p>
      <p>
        This page is not expected to be kept open by the broadcaster. Instead it is
        loaded and configured before the extension is enabled, so that viewers only see your
        extension after the broadcaster has tweaked it to their liking. Any realtime events
        or updates sent to this page will most likely not be seen by the broadcaster.
      </p>
    </ui-modal>

    <ui-modal ref="live-panel" title="Live Panel">
      <p>
        The broadcaster live app is accessible by the broadcaster from Twitch&#8217;s
        &#8220;Live Dashboard.&#8221; The useable space in the Live App is considerably
        smaller than the other two, and should only display controls that are immediately
        useful to the broadcaster. The expected behavior is that a broadcaster will have
        the Live Dashboard open while they stream.
      </p>
      <p>
        This app is optional, but may be used to display information needed by the
        broadcaster. For example, it may show aggregate voting data. It can also be used
        by the broadcaster to effect app state, such as clearing out a poll&#8217;s
        information, sending messages to viewers or hiding/displaying the app on all
        viewers&#8217; pages.
      </p>
      <p>
        <strong>NOTE</strong> that the width of this panel expands from
        <code>286px</code> to <code>308px</code> when the broadcaster&#8217;s window expands
        to <code>1200px</code> or wider.
      </p>
    </ui-modal>
  </div>
</template>

<script>
import _ from 'lodash';

const UiIconButton = window.KeenUI.UiIconButton;
const UiMenu = window.KeenUI.UiMenu;
const UiModal = window.KeenUI.UiModal;
const UiSelect = window.KeenUI.UiSelect;
const UiToolbar = window.KeenUI.UiToolbar;

// Available extensions
const extensions = /* DI:ExtensionList */.map(e => _.extend(e, { label: e.name || e._rig_id }));

export default {
  name: 'extension',
  props: ['extension_id'],
  components: { UiIconButton, UiMenu, UiModal, UiSelect, UiToolbar },

  data: () => ({
    extensions
  }),

  computed: {
    extension() {
      return _.find(extensions, e => e._rig_id === this.extension_id);
    },

    viewerURL() { return `/${this.extension._rig_id}/${this.extension.viewer_path}`; },
    configURL() { return `/${this.extension._rig_id}/${this.extension.config_path}`; },
    liveURL() { return `/${this.extension._rig_id}/${this.extension.live_config_path}`; }
  },

  methods: {
    popout(url) {
      window.open(url);
    },

    selectExtension(ext) {
      this.$router.push({ name: 'extension', params: { extension_id: ext._rig_id } });
    },

    openModal(ref) {
      this.$refs[ref].open();
    }
  },

  created() {
    if (!this.extension_id) {
      if (this.extensions.length > 0) {
        this.$router.push({ name: 'extension', params: { extension_id: this.extensions[0]._rig_id } });
      }
    }
  }
};
</script>

<style lang='scss'>
@import '../shared/scss/base';

.rig {
  background-color: #faf9fa;
  display: flex;
  flex-flow: column;
  justify-content: space-between;
  min-height: 100%;
  overflow: hidden;

  iframe {
    border: 1px solid #e5e3e8;
    border-bottom: 0;
  }

  .no-extensions {
    text-align: center;
    a { text-decoration: underline; }
  }

  .viewer-live-apps {
    display: flex;
    justify-content: space-around;
    margin: 10px;

    // Viewer panel extension
    .viewer {
      display: inline-block;
      overflow: hidden;
      width: 318px;
      vertical-align: middle;

      .panel {
        // Panel extensions are limited to a height of 500px
        max-height: 500px;
        // ...and locked to 318px in width
        width: 318px;
      }
    }

    // Broadcaster live extension
    .live {
      display: inline-block;
      margin-left: 10px;
      width: 286px;
      vertical-align: middle;

      iframe {
        max-height: 500px;
        overflow: hidden;
        width: 286px;
      }

      // Copying Twitch's CSS, live frame size width increases on larger browser widths.
      @media (min-width: 1200px) {
        width: 308px;
        iframe { width: 308px; }
      }
    }

    .info {
      display: inline-block;
      width: 320px;
      vertical-align: middle;
    }
  }

  .config-app {
    margin: 10px;
    overflow: hidden;

    iframe {
      background-color: #faf9fa;
      height: 700px;
      width: 100%;
    }
  }

  .app {
    .title {
      background-color: #faf9fa;
      border: 1px solid #e5e3e8;
      color: #6441a4;
      font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
      font-size: 0.8rem;
      line-height: 2rem;
      padding: 0 0.5rem;
      position: relative;

      .info-link {
        cursor: pointer;
        position: absolute;
        right: 0.5rem;
      }
    }

    .info {
      margin: 0;

      p:first-child { margin-top: 0; }
    }
  }
}
</style>
