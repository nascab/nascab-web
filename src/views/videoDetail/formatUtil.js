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
import WhichBrowser from "which-browser";

let formatUtil = {}
formatUtil.usingM3u8 = false//是否正在播放m3u8
formatUtil.usingRawFile = false//是否正在播放源文件
formatUtil.isRemoteMode = false//是否正在远程连接


let browserInfo = new WhichBrowser(navigator.userAgent);
console.log('当前浏览器信息', browserInfo.toString())
if (window.location.href.indexOf(axios.nasRemoteUrl) != -1) {
    formatUtil.isRemoteMode = true//当前在使用远程连接
}
//设置当前播放的格式状态
formatUtil.setFormatState = function (format) {
    formatUtil.usingM3u8 = format == 'm3u8'
    formatUtil.usingRawFile = format == false
}
formatUtil.getTranscodeFormat = function () {
    return 'm3u8'
}
formatUtil.isIos = function () {//判断是否为ios
    return /(iPhone|iOS)/i.test(navigator.userAgent)
}
formatUtil.isSafari = function () {//判断是否为ios
    return /(Safari)/i.test(navigator.userAgent) && !/(Chrome)/i.test(navigator.userAgent)
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

function getBrowserInfo() {
    navigator.browserSpecs = (function () {
        var ua = navigator.userAgent, tem,
            M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return { name: 'IE', version: (tem[1] || '') };
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
            if (tem != null) return { name: tem[1].replace('OPR', 'Opera'), version: tem[2] };
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null)
            M.splice(1, 1, tem[1]);
        return { name: M[0], version: M[1] };
    })();

    console.log(navigator.browserSpecs); //Object { name: "Firefox", version: "42" }

    if (navigator.browserSpecs.name == 'Firefox') {
        // Do something for Firefox.
        if (navigator.browserSpecs.version > 42) {
            // Do something for Firefox versions greater than 42.
        }
    }
    else {
        // Do something for all other browsers.
    }
}
export default formatUtil