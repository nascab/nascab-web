import Vue from 'vue'
import Vuex from 'vuex'
import i18n from '@/plugins/i18n' // 导入vue-i18n

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        geoCache: new Map(),
        firstIndex: null, //列表左上角第一个索引
        //服务器通过websocket推送过来的信息 在app.vue中提交
        unreadMsgCount: 0, //未读消息数量
        runInElectron: false,
        serverConfig: {},
        currentUser: null,
        privateSpace: {} //加密空间相关
    },
    mutations: {
        setServerConfig(state, serverConfig) {
            state.serverConfig = serverConfig
        },
        setRunInElectron(state, runInElectron) {
            state.runInElectron = runInElectron
        }
    },
    actions: {},
    modules: {}
})