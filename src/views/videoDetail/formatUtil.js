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
//不支持的音频格式
let noSupportAudioFormat=["dca","eac3","ac3"]

//检测是否为图片字幕
formatUtil.isPictureSubtitle=function(subtitleStream){
    if(subtitleStream&&subtitleStream.type&&subtitleStream.type=="path"){
        //使用的是视频文件同名字幕
        return false
    }
    if(subtitleStream
        &&subtitleStream.stream
        && subtitleStream.stream.codec_name
        &&(subtitleStream.stream.codec_name.toLowerCase()=="pgssub"
        ||subtitleStream.stream.codec_name.toLowerCase()=="vobsub"
        ||subtitleStream.stream.codec_name.toLowerCase()=="dvd_subtitle"
        ||subtitleStream.stream.codec_name.toLowerCase()=="dvb_subtitle")){
        console.log("图片字幕 需要转码")
        return true
    }else{
        return false
    }
}
formatUtil.getCanPlayRawFile=function(videoStream,indexObj,audioStream,subtitleStream,uploadSubtitleFilePath){
    try{
        console.log("videoStream",videoStream)
        if(audioStream&&audioStream.stream){
            if(noSupportAudioFormat.includes(audioStream.stream.codec_name.trim())){
                return false
            }
        }
        //h265相关的逻辑判断
        if(videoStream&&videoStream.codec_name=="hevc"){
            console.log("正在播放h265")
            if(formatUtil.isChrome()){
                let chromeVersion = formatUtil.getChromeVersion()
                let version=parseInt(chromeVersion.major)
                console.log("Chrome版本",version)
                if(version<107){
                    return false
                }
            }
        }
        //如果是图片字幕 需要转码
        if(formatUtil.isPictureSubtitle(subtitleStream)&&!uploadSubtitleFilePath){
            return false
        }
    }catch(err){
        console.log(err)
        return true
    }
    return true
}
formatUtil.getChromeVersion =function () {
    var pieces = navigator.userAgent.match(/Chrom(?:e|ium)\/([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/);
    if (pieces == null || pieces.length != 5) {
        return undefined;
    }
    pieces = pieces.map(piece => parseInt(piece, 10));
    return {
        major: pieces[1],
        minor: pieces[2],
        build: pieces[3],
        patch: pieces[4]
    };
}
//设置当前播放的格式状态
formatUtil.setFormatState = function (format) {
    formatUtil.usingM3u8 = format == 'm3u8'
    formatUtil.usingRawFile = format == false
}
formatUtil.getTranscodeFormat = function (indexObj) {
        return 'm3u8'
}
formatUtil.isIos = function () {//判断是否为ios
    let isIOS = /iPad|iPhone|iPod/.test(navigator.platform)
|| (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

// 
    return /(iPhone|iOS|iPad)/i.test(navigator.userAgent) || isIOS
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