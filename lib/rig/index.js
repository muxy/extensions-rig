import _ from 'lodash';

import Vue from 'vue';
import VueRouter from 'vue-router';

import App from './App';
import ExtensionRig from './ExtensionRig';

/* eslint-disable */
const extensions = /* DI:ExtensionList */.map(e => _.extend(e, { label: e.name || e._rig_id }));
/* eslint-enable */

function extURL(to, from, next) {
  const ext = _.find(extensions, e => e._rig_id === to.params.extension_id);
  const file = ext[to.matched[0].meta.path];
  next(`/${ext._rig_id}/${file}`);
}

Vue.use(VueRouter);
const router = new VueRouter({
  hashbang: false,
  routes: [
    {
      path: '/',
      component: ExtensionRig
    },
    {
      path: '/:extension_id',
      name: 'extension',
      props: true,
      component: ExtensionRig,
      linkActiveClass: true,
      children: [
        {
          path: 'viewer',
          name: 'viewer-panel',
          meta: { path: 'viewer_path' },
          beforeEnter: extURL
        },
        {
          path: 'live',
          name: 'live-panel',
          meta: { path: 'live_config_path' }
        },
        {
          path: 'config',
          name: 'config-panel',
          meta: { path: 'config_path' }
        }
      ]
    }
  ]
});


const app = new Vue({
  router,

  ...App
});

app.$mount('#app');
