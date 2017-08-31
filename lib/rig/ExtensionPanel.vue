<template>
  <iframe :src="iframeURL"></iframe>
</template>

<script>
import _ from 'lodash';

/* eslint-disable */
const extensions = /* DI:ExtensionList */.map(e => _.extend(e, { label: e.name || e._rig_id }));
/* eslint-enable */

export default {
  name: 'extension-panel',
  props: ['extension_id'],

  computed: {
    extension() {
      return _.find(extensions, e => e._rig_id === this.extension_id);
    },

    iframeURL() {
      return '';
    }
  }
};
</script>