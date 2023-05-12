import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
//因为要对view design做一些修改满足自己的需求 所以没有用npm管理 把源码拷贝过来了
import myViewDesign from '@/plugins/myViewDesign';
import i18n from '@/plugins/i18n' // 导入vue-i18n
import './plugins/myViewDesign/styles/index.less';

import '@/plugins/longpress'
//导入jsbridge 挂在全局
import Bridge from './plugins/jsBridge'
Vue.prototype.$bridge = Bridge



//懒加载图片组建
import VueLazyload from 'vue-lazyload'
// or with options
const loadimage = require('./assets/loading.gif')
const errorimage = require('./assets/error.png')
Vue.use(VueLazyload, {
	preLoad: 1,
	error: errorimage,
	loading: loadimage,
	attempt: 1
})



//导入自定义主题和 view design
import '../my-theme/index.less';
Vue.use(myViewDesign, {
	i18n: (key, value) => i18n.t(key, value)
});


// 上下文菜单组件
import VueEasyCm from '@/plugins/easyContextMenu'
Vue.use(VueEasyCm)



//css
import "/src/assets/font/iconfont.css"
import "/src/assets/font-icons/iconfont.css"


Vue.prototype.goPath = function (path) {
	router.push({
		path: path
	})
}
// axios全局挂载
import api from '@/plugins/axios.js'
Vue.prototype.api = api.requests
Vue.prototype.axios = api

// utils全局挂载
import utils from '@/plugins/utils.js'
Vue.prototype.utils = utils

import base64 from '@/plugins/base64/index.js'
Vue.prototype.base64 = base64

// 图片浏览器
import '@/components/viewerjs/index.css'
import viewerApi from '@/components/viewerjs/api.js'
Vue.prototype[`$viewerApi`] = viewerApi

// Vuesax
import Vuesax from 'vuesax'
import 'vuesax/dist/vuesax.css' //Vuesax styles
Vue.use(Vuesax, {
	colors: {
		primary: '#386DF2',
		success: 'rgb(23, 201, 100)',
		danger: 'rgb(242, 19, 93)',
		warning: 'rgb(255, 130, 0)',
		dark: 'rgb(36, 33, 69)'
	}
})
// 展示普通通知弹窗
Vue.prototype.showVsNotification = (msg, colorStr) => {
	Vue.prototype.$vs.notification({
		color: colorStr ? colorStr : null,
		position: 'top-center',
		title: i18n.t('common.alert'),
		text: msg
	})
}
Vue.prototype.$vs.d
Vue.config.productionTip = false

//全局注册自定义通用组件
import mySideBar from '@/components/my-components/my-sidebar/my-sidebar'
Vue.component('my-sidebar', mySideBar)

import myHeader from '@/components/my-header/my-header.vue'
Vue.component('my-header', myHeader)

import mySideBarMobile from '@/components/my-components/my-sidebar/my-sidebar-mobile'
Vue.component('my-sidebar-mobile', mySideBarMobile)

import myBg from '@/components/my-components/my-bg/my-bg.vue'
Vue.component('my-bg', myBg)

import myMenuSelect from '@/components/my-components/my-menu-select/my-menu-select'
Vue.component('my-menu-select', myMenuSelect)

import myBtn from '@/components/my-components/my-btn/my-btn'
Vue.component('my-btn', myBtn)

import myBtnIcon from '@/components/my-components/my-btn/my-btn-icon'
Vue.component('my-btn-icon', myBtnIcon)

import myNoData from '@/components/my-components/my-nodata/my-nodata'
Vue.component('my-nodata', myNoData)

import mySearch from '@/components/my-components/my-search/my-search'
Vue.component('my-search', mySearch)

import myDialogAlert from '@/components/my-components/my-dialog/my-dialog-alert'
Vue.component('my-dialog-alert', myDialogAlert)

import myDialogConfirm from '@/components/my-components/my-dialog/my-dialog-confirm'
Vue.component('my-dialog-confirm', myDialogConfirm)

import myDialogInput from '@/components/my-components/my-dialog/my-dialog-input'
Vue.component('my-dialog-input', myDialogInput)

import myDialogSelect from '@/components/my-components/my-dialog/my-dialog-select'
Vue.component('my-dialog-select', myDialogSelect)

import mySelectorPhone from '@/components/my-components/my-selector-phone/my-selector-phone'
Vue.component('my-selector-phone', mySelectorPhone)


import fileSelect from "@/components/file-select/file-select.vue"
Vue.component('file-select', fileSelect)

import fileSelectBar from "@/components/file-select/file-select-bar.vue"
Vue.component('file-select-bar', fileSelectBar)


new Vue({
	i18n,
	router,
	store,
	beforeCreate() {
		Vue.prototype.$bus = this;
	},
	render: h => h(App)
}).$mount('#app')


