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
        level: 1,
        title: i18n.t('security.login'),
    },
    component: () =>
        import('../views/index/login.vue')
},
{ //忘记密码
    path: '/forgotPwd',
    name: 'forgotPwd',
    meta: {
        level: 1,
    },
    component: () =>
        import('../views/index/forgotPwd.vue')
},
{ //创建管理员页面
    path: '/create_admin',
    name: 'create_admin',
    meta: {
        level: 1,
        title: i18n.t('registerAdmin.registerAdmin'),
    },
    component: () =>
        import('../views/index/createAdmin.vue')
},
{ //首页
    path: '/home',
    name: 'home',
    meta: {
        level: 2,
        title: i18n.t('common.home'),
    },
    component: () =>
        import('../views/home/home.vue'),
    meta: {
        keepAlive: true //设置缓存
    }

},
{ //首页 手机端
    path: '/homeMobile',
    name: 'homeMobile',
    meta: {
        level: 2,
        title: i18n.t('common.home'),
    },
    component: () =>
        import('../views/home/homeMobile.vue'),
    meta: {
        keepAlive: true //设置缓存
    }

},
{ //安全中心
    path: '/security',
    name: 'security',
    meta: {
        level: 3,
        title: i18n.t('home.securityCenter'),
    },
    component: () =>
        import('../views/security/security.vue')
},
{ //设置页
    path: '/setting',
    name: 'setting',
    meta: {
        level: 3,
        title: i18n.t('home.settingCenter'),
    },
    component: () =>
        import('../views/setting/setting.vue')
},
{ //照片模块-时间线
    path: '/photoTimeline',
    name: 'photoTimeline',
    meta: {
        level: 3,
        title: i18n.t('photo.timeline'),
    },
    component: () =>
        import('../views/photos/photoPages/photoTimeline.vue')
},
{ //照片模块-地图
    path: '/photoMap',
    name: 'photoMap',
    meta: {
        level: 3,
        title: i18n.t('photo.footprint'),
    },
    component: () =>
        import('../views/photos/photoPages/photoMap.vue')
},
{ //照片模块-ai
    path: '/photoAI',
    name: 'photoAI',
    meta: {
        level: 3,
        title: i18n.t('photo.ai'),
    },
    component: () =>
        import('../views/photos/photoPages/photoAI.vue')
},
{ //照片模块-智能相册
    path: '/aiAlbum',
    name: 'aiAlbum',
    meta: {
        level: 3,
        title: i18n.t('photo.aiAlbum'),
    },
    component: () =>
        import('../views/photos/photoPages/aiAlbum.vue')
},
{ //照片模块-普通相册
    path: '/ordinaryAlbum',
    name: 'ordinaryAlbum',
    meta: {
        level: 3,
        title: i18n.t('photo.ordinaryAlbum'),
    },
    component: () =>
        import('../views/photos/photoPages/ordinaryAlbum.vue')
},
{ //照片模块-合集
    path: '/photoLibrary',
    name: 'photoLibrary',
    meta: {
        level: 3,
        title: i18n.t('photo.library'),
    },
    component: () =>
        import('../views/photos/photoPages/photoLibrary.vue')
},
{ //照片模块-文件试图
    path: '/photoFolderView',
    name: 'photoFolderView',
    meta: {
        level: 3,
        title: i18n.t('photo.folder'),
    },
    component: () =>
        import('../views/photos/photoPages/photoFolderView.vue')
},
{ //照片模块-ai分类
    path: '/photoClasses',
    name: 'photoClasses',
    meta: {
        level: 3,
        title: i18n.t('photo.aiClasses'),
    },
    component: () =>
        import('../views/photos/photoPages/photoClasses.vue')
},
{ //照片模块-人脸
    path: '/photoFaces',
    name: 'photoFaces',
    meta: {
        level: 3,
        title: i18n.t('photo.aiFace'),
    },
    component: () =>
        import('../views/photos/photoPages/photoFaces.vue')
},
{ //照片模块-最近
    path: '/photoRecent',
    name: 'photoRecent',
    meta: {
        level: 3,
        title: i18n.t('photo.recentCheck'),
    },
    component: () =>
        import('../views/photos/photoPages/photoRecent.vue')
},
{ //照片模块-回收站
    path: '/photoTrash',
    name: 'photoTrash',
    meta: {
        level: 3,
        title: i18n.t('file.trashBin'),
    },
    component: () =>
        import('../views/photos/photoPages/photoTrash.vue')
},
{ //照片模块-回收站
    path: '/photoSourceSet',
    name: 'photoSourceSet',
    meta: {
        level: 3,
        title: i18n.t('setting.photoSourceSetting'),
    },
    component: () =>
        import('../views/photos/photoPages/photoSourceSet.vue')
},

{ //电影模块
    path: '/movies',
    name: 'movies',
    meta: {
        level: 3,
        title: i18n.t('home.movieManage'),
    },
    component: () =>
        import('../views/movies/movies.vue')
},
{ //电影详情
    path: '/movieDetail',
    name: 'movieDetail',
    meta: {
        level: 4,
    },
    component: () =>
        import('../views/movies/movieDetail.vue')
},
{ //空间详情
    path: '/spaceDetail',
    name: 'spaceDetail',
    meta: {
        level: 4,
    },
    component: () =>
        import('../views/privateSpace/spaceDetail.vue')
}
    ,
{ //相册详情
    path: '/albumDetail',
    name: 'albumDetail',
    meta: {
        level: 4,
    },
    component: () =>
        import('../views/photos/photoPages/albumDetail.vue')
},
{ //播放器
    path: '/videoDetail',
    name: 'videoDetail',
    meta: {
        level: 4,
    },
    component: () =>
        import('../views/videoDetail/videoDetail.vue')
},
{ //文件浏览器
    path: '/filesBrower',
    name: 'filesBrower',
    meta: {
        level: 3,
        title: i18n.t('home.fileBrower'),
    },
    component: () =>
        import('../views/filesBrower/filesBrower.vue')
},
{ //加密空间
    path: '/privateSpace',
    name: 'privateSpace',
    meta: {
        level: 3,
        title: i18n.t('photo.privateSpace'),
    },
    component: () =>
        import('../views/privateSpace/privateSpace.vue')
},
{ //备份
    path: '/backup',
    name: 'backup',
    meta: {
        level: 3,
        title: i18n.t('home.backup'),
    },
    component: () =>
        import('../views/fileBackup/backup.vue')
},
{ //终端
    path: '/terminal',
    name: 'terminal',
    meta: {
        level: 3,
        title: i18n.t('home.terminal'),
    },
    component: () =>
        import('../views/terminal/terminal.vue')
},
{ //分享
    path: '/share',
    name: 'share',
    meta: {
        level: 3,
        title: i18n.t('home.sharing'),
    },
    component: () =>
        import('../views/fileShare/share.vue')
},
{ //通知中心
    path: '/noticeCenter',
    name: 'noticeCenter',
    meta: {
        level: 3,
        title: i18n.t('home.sharing'),
    },
    component: () =>
        import('../views/noticeCenter/noticeCenter.vue')
},
{ //临时分享
    path: '/shareTemp',
    name: 'shareTemp',
    meta: {
        level: 3,
        title: i18n.t('home.shareTemp'),
    },
    component: () =>
        import('../views/shareTemp/shareTemp.vue')
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
let noCheckPath = ["/", "/login", "/create_admin", "/forgotPwd","/shareTemp"]
router.beforeEach((to, from, next) => { //路由守卫
    if (!noCheckPath.includes(to.path)) { //判断路由是否为登录路径
        if (!store.state.token) { //是否含有token
            const token = utils.getToken()
            if (!store.state.currentUser) {
                let currentUser = localStorage.getItem('currentUser')
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