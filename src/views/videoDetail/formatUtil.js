//源文件播放支持情况 兼容   edge safari chrome qq浏览器 360浏览器
//safari(ios,mac,ipad)浏览器只支持mov格式的源文件播放(包含h264/H265)
//h265(hevc)支持：
//107及以上版本的chrome 11及以上版本的safari
//除了满足上面两个条件 其他浏览器一律将h265的视频转码播放
//其他情况
//远程连接检测文件码率是否能满足播放源文件    
//webm,ogg编码
//ie不支持

import axios from "@/plugins/axios";

let formatUtil = {}
formatUtil.usingM3u8 = false//是否正在播放m3u8
formatUtil.usingRawFile = false//是否正在播放源文件
formatUtil.isRemoteMode = false//是否正在远程连接

if (window.location.href.indexOf(axios.nasRemoteUrl) != -1) {
    formatUtil.isRemoteMode = true//当前在使用远程连接
}
formatUtil.getCanPlayRawFile=function(videoStream,indexObj){
    if(indexObj.filename){
        let extionName=formatUtil.getFileExtension(indexObj.filename)
        if(extionName=="mov"||extionName=="MOV"){
            if(indexObj.is_livephoto==1&&!formatUtil.isSafari()&&!formatUtil.isChrome()){
                return false
            }
        }
    }
    return true
}
//设置当前播放的格式状态
formatUtil.setFormatState = function (format) {
    formatUtil.usingM3u8 = format == 'm3u8'
    formatUtil.usingRawFile = format == false
}
formatUtil.getTranscodeFormat = function (indexObj) {
    if(indexObj&&indexObj.duration&&indexObj.duration<10){
        //10秒以下的使用mp4
        return "mp4"
    }else{
        return 'm3u8'
    }
   
}
formatUtil.isIos = function () {//判断是否为ios
    return /(iPhone|iOS)/i.test(navigator.userAgent)
}
formatUtil.isSafari = function () {//判断是否为ios
    return /(Safari)/i.test(navigator.userAgent) && !/(Chrome)/i.test(navigator.userAgent)
}
formatUtil.isChrome = function () {//判断是否为chrome
    return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
}
formatUtil.isAndroid = function () {//判断是否为手机浏览器
    return /(Android)/i.test(navigator.userAgent)
}
//获取文件或者url扩展名
formatUtil.getFileExtension = function (path) {
    if (typeof path === 'string') {
        const splitPathRe = /^(\/?)([\s\S]*?)((?:\.{1,2}|[^\/]+?)(\.([^\.\/\?]+)))(?:[\/]*|[\?].*)$/;
        const pathParts = splitPathRe.exec(path);

        if (pathParts) {
            return pathParts.pop().toLowerCase();
        }
    }
    return '';
};

export default formatUtil