import axios from 'axios'
import Vue from 'vue'
import store from '@/store'
import utils from "@/plugins/utils"
import iview from '@/plugins/myViewDesign';
import router from '@/router'
import i18n from '@/plugins/i18n' // 导入vue-i18n
import base64 from '@/plugins/base64/index.js' // 导入vue-i18n

let nasCabBaseUrl = "https://www.nascab.cn"

let baseUrl = ""
if (process.env.NODE_ENV === 'development') {
    baseUrl = "http://localhost:80"
    console.log('baseUrl', baseUrl)
} else {
    console.log('生产环境')
}

let uploadUrl = function () {
    return baseUrl + '/api/uploadApi/regularUpload?token=' + store.state.token
}
let privateSpaceUploadUrl = function () {
    return baseUrl + '/api/privateSpaceApi/regularUpload?token=' + store.state.token
}
let mapUrl = baseUrl + '/api/mapApi/tile?zoom={z}&x={x}&y={y}'
let homePageUrl = "https://nascab.cn"
let nasRemoteUrl = 'nas-cab.com'
// 创建 axios 实例
const requests = axios.create({
    baseURL: baseUrl, // 基础url,如果是多环境配置这样写，也可以像下面一行的写死。
    // baseURL: 'http://168.192.0.123',
    timeout: 30000 // 请求超时时间
})

// 错误处理函数
const err = (error) => {
    // Vue.prototype.showVsNotification(i18n.t('net.error'))

    if (error.response) {
        const data = error.response.data

    }
    iview.Spin.hide();
    return Promise.reject(error)
}

// request interceptor(请求拦截器)
requests.interceptors.request.use(config => {
    const token = utils.getToken()
    store.state.token = token
    if (token) {
        config.headers['token'] = token // 让每个请求携带自定义 token 请根据实际情况自行修改
    }
    if (!config.data || !config.data.hideLoading) {
        iview.Spin.show();
    }
    if (config.data && config.data.hideLoading) {
        delete config.data.hideLoading
    }
    return config
}, err)

// response interceptor（接收拦截器）
requests.interceptors.response.use((response) => {
    iview.Spin.hide();
    const res = response.data
    if (res.code !== 0 && res.code !== 200) {
        if (res.code === 1) {
            //错误提示
            if (res.alertType == "dialog") {
                Vue.prototype.showVsAlertDialog(null, res.message)
            } else {
                Vue.prototype.showVsNotification(res.message)
            }
        } else if (res.code === 101) {
            // 101:Token过期,请重新登录
            Vue.prototype.showVsAlertDialog(null, i18n.t('common.tokenExpire'), () => {
                sessionStorage.removeItem('token')
                sessionStorage.removeItem('currentUser')
                router.push({
                    path: '/login'
                })
            })
        } else if (res.code == 102) {
            // 无权限
            Vue.prototype.showVsNotification(i18n.t('common.noPermission'))
        } else if (res.code == 103) {
            // 服务器忙 正在索引
            Vue.prototype.showVsNotification(i18n.t('photo.stillIndexTryLater'))
        } else if (res.code == 104) {
            //token过期
            Vue.prototype.showVsAlertDialog(null, i18n.t('private.tokenExpired'))
        } else if (res.code == 188) {
            //账号无权限使用此功能 需开通高级版
            Vue.prototype.showVsAlertDialog(null, i18n.t('nascab.needUpgrade'))
        }
        return Promise.reject(res)
    } else {
        return res
    }
}, err)
function dealFileName(fileName) {
    if (!fileName || fileName.length < 1) return ''
    const specialChars = /[`!@#$%^&*()+=\[\]{};':"\\|,<>\/?~]/;
    var ext = fileName.substr(fileName.lastIndexOf('.') + 1);

    if (specialChars.test(fileName)) {
        fileName = base64.encode(fileName)
        if (ext && !specialChars.test(ext)) {
            fileName += "."+ext
        }
    }
    return fileName
}
//根据索引id获取图片完整路径
function getImgFullPath(indexId, tiny, fileName, serverType) {
    if (!serverType) {
        serverType = 'photo'
    }
    //处理特殊字符 防止url无法访问
    fileName = dealFileName(fileName)

    if (tiny) {
        if (fileName) {

            return baseUrl +
                `/api/fileApi/tinyImg/${fileName}?indexId=${indexId}&token=${utils.getToken()}&serverType=${serverType}`
        } else {
            return baseUrl + `/api/fileApi/tinyImg?indexId=${indexId}&token=${utils.getToken()}&serverType=${serverType}`
        }
    } else {
        if (fileName) {
            return baseUrl +
                `/api/fileApi/rawFile/${fileName}?indexId=${indexId}&token=${utils.getToken()}&serverType=${serverType}`
        } else {
            return baseUrl + `/api/fileApi/rawFile?indexId=${indexId}&token=${utils.getToken()}&serverType=${serverType}`
        }
    }
}

//根据文件物理路径获取缩略图
function getTinyUrlByFilePath(filePath) {
    filePath = encodeURI(filePath)
    filePath = base64.encode(filePath)
    return baseUrl + `/api/fileApi/tinyImgByPath/tiny.webp?fullPath=${filePath}&token=${utils.getToken()}`
}

//获取空间资源url
function getPrivateSpaceFileUrl(spaceId, spaceToken, fileName, type, indexId) {
    let token = utils.getToken()
    //处理特殊字符 防止url无法访问
    fileName = dealFileName(fileName)

    return baseUrl +
        `/api/privateSpaceApi/getDecodeFile/${fileName}?indexId=${indexId}&spaceId=${spaceId}&spaceToken=${spaceToken}&type=${type}&token=${token}`
}
//获取人脸图片地址 根据face_id
function getFaceImageUrl(faceId) {
    let token = utils.getToken()
    let url = `/api/photoApi/getFaceImg/${faceId}.jpg?faceId=${faceId}&token=${token}`
    return baseUrl + url
}
// 根据物理路径获取文件下载地址
function getRawFileUrl(filePath, fileName, serverType) {
    if (!serverType) {
        serverType = 'photo'
    }
    let token = store.state.token
    filePath = encodeURI(filePath)
    filePath = base64.encode(filePath)
    if (fileName) {
        //处理特殊字符 防止url无法访问
        fileName = dealFileName(fileName)
        return baseUrl + `/api/file/rawFile/${fileName}?path=${filePath}&token=${token}&serverType=${serverType}`
    }
    return baseUrl + `/api/file/rawFile?path=${filePath}&token=${token}&serverType=${serverType}`
}



function encodePath(path) {
    path = encodeURI(path)
    path = base64.encode(path)
    return path
}
export default {
    getPrivateSpaceFileUrl,
    getImgFullPath,
    baseUrl,
    requests,
    mapUrl,
    uploadUrl,
    privateSpaceUploadUrl,
    getRawFileUrl,
    encodePath,
    homePageUrl,
    getFaceImageUrl,
    nasCabBaseUrl,
    nasRemoteUrl,
    getTinyUrlByFilePath
}