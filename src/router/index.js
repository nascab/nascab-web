import Vue from 'vue'
import VueRouter from 'vue-router'
import index from '../views/index/index.vue'
import store from '../store/index'
import i18n from '@/plugins/i18n' // 导入vue-i18n
import utils from "@/plugins/utils"

Vue.use(VueRouter)

const routes = [{
    path: '/',
    name: 'index',
    component: index
},
{ //登录
    path: '/login',
    name: 'login',
    meta: {
        title: i18n.t('security.login'),
    },
    component: () =>
        import('../views/index/login.vue')
},
{ //忘记密码
    path: '/forgotPwd',
    name: 'forgotPwd',
    component: () =>
        import('../views/index/forgotPwd.vue')
},
{ //创建管理员页面
    path: '/create_admin',
    name: 'create_admin',
    meta: {
        title: i18n.t('registerAdmin.registerAdmin'),
    },
    component: () =>
        import('../views/index/createAdmin.vue')
},
{ //首页
    path: '/home',
    name: 'home',
    meta: {
        title: i18n.t('common.home'),
    },
    component: () =>
        import('../views/home/home.vue'),
    meta: {
        keepAlive: true //设置缓存
    }

},
{ //安全中心
    path: '/security',
    name: 'security',
    meta: {
        title: i18n.t('home.securityCenter'),
    },
    component: () =>
        import('../views/security/security.vue')
},
{ //设置页
    path: '/setting',
    name: 'setting',
    meta: {
        title: i18n.t('home.settingCenter'),
    },
    component: () =>
        import('../views/setting/setting.vue')
},
{ //照片模块
    path: '/photos',
    name: 'photos',
    meta: {
        keepAlive: true ,//设置缓存
        title: i18n.t('home.photoManage'),
    },
    component: () =>
        import('../views/photos/photos.vue')
},
{ //电影模块
    path: '/movies',
    name: 'movies',
    meta: {
        title: i18n.t('home.movieManage'),
    },
    component: () =>
        import('../views/movies/movies.vue')
},
{ //电影详情
    path: '/movieDetail',
    name: 'movieDetail',
    component: () =>
        import('../views/movies/movieDetail.vue')
},
{ //空间详情
    path: '/spaceDetail',
    name: 'spaceDetail',
    component: () =>
        import('../views/privateSpace/spaceDetail.vue')
}
,
{ //相册详情
    path: '/albumDetail',
    name: 'albumDetail',
    component: () =>
        import('../views/photos/photo-list/albumDetail.vue')
},
{ //播放器
    path: '/videoDetail',
    name: 'videoDetail',
    component: () =>
        import('../views/videoDetail/videoDetail.vue')
},
{ //文件浏览器
    path: '/filesBrower',
    name: 'filesBrower',
    meta: {
        title: i18n.t('home.fileBrower'),
    },
    component: () =>
        import('../views/filesBrower/filesBrower.vue')
},
{ //加密空间
    path: '/privateSpace',
    name: 'privateSpace',
    meta: {
        title: i18n.t('photo.privateSpace'),
    },
    component: () =>
        import('../views/privateSpace/privateSpace.vue')
},
{ //备份
    path: '/backup',
    name: 'backup',
    meta: {
        title: i18n.t('home.backup'),
    },
    component: () =>
        import('../views/fileBackup/backup.vue')
},
{ //分享
    path: '/share',
    name: 'share',
    meta: {
        title: i18n.t('home.sharing'),
    },
    component: () =>
        import('../views/fileShare/share.vue')
},
{ //通知中心
    path: '/noticeCenter',
    name: 'noticeCenter',
    meta: {
        title: i18n.t('home.sharing'),
    },
    component: () =>
        import('../views/noticeCenter/noticeCenter.vue')
}
]
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location, onResolve, onReject) {
    if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
    return originalPush.call(this, location).catch(err => err)
}
const router = new VueRouter({
    mode: 'hash',
    base: process.env.BASE_URL,
    routes
})
let noCheckPath = ["/", "/login", "/create_admin", "/forgotPwd"]
router.beforeEach((to, from, next) => { //路由守卫
    if (!noCheckPath.includes(to.path)) { //判断路由是否为登录路径
        if (!store.state.token) { //是否含有token
            const token = utils.getToken()
            if (!store.state.currentUser) {
                let currentUser = sessionStorage.getItem('currentUser')
                if (currentUser) {
                    currentUser = JSON.parse(currentUser)
                    store.state.currentUser = currentUser
                }
            }
            if (token) {
                store.state.token = token
            } else {
                return next({
                    path: "/"
                })
            }
        }
    }
    next()
})
router.afterEach((to, from) => {
    console.log(to)
    document.title = to.meta.title ? to.meta.title : "NasCab" //在全局后置守卫中获取路由元信息设置title
})

export default router