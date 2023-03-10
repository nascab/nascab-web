import screenfull from 'screenfull';
import jsBridge from '../../plugins/jsBridge';
import formatUtil from './formatUtil';

class VideoHelper {
    constructor(vue) {
        this.vue = vue
        this.primaryMovieSize = 1280 //原始文件无法播放的时候 首选的转码清晰度 

        //比特率选项
        this.optionsBitrate = [
            { value: 320, label: '320Kbps' },
            { value: 512, label: '512Kbps' },
            { value: 1024, label: '1Mbps' },
            { value: 2048, label: '2Mbps' },
            { value: 3584, label: '3Mbps' },
            { value: 4096, label: '4Mbps' },
            { value: 5120, label: '5Mbps' },
            { value: 8192, label: '8Mbps' },
            { value: 12288, label: '12Mbps' },
            { value: 15360, label: '16Mbps' },
            { value: 20480, label: '20Mbps' },
            { value: 30720, label: '30Mbps' },
            { value: 40960, label: '40Mbps' },
            { value: 51200, label: '50Mbps' },
            { value: 61400, label: '60Mbps' },
            { value: 81920, label: '80Mbps' },
            { value: 102400, label: '100Mbps' }
        ]
        //分辨率选项
        this.optionsPlaySize = [
            { value: 1, label: this.vue.$t("video.code_raw") },
            { value: 4096, minBitrate: 1024, maxBitrate: 102400, defaultBitrate: 3584, label: "4K" },
            { value: 1920, minBitrate: 1024, maxBitrate: 40960, defaultBitrate: 2048, label: "1080P" },
            { value: 1280, minBitrate: 1024, maxBitrate: 4096, defaultBitrate: 1024, label: "720P" },
            { value: 720, minBitrate: 512, maxBitrate: 3584, defaultBitrate: 1024, label: "480P" },
            { value: 480, minBitrate: 320, maxBitrate: 2048, defaultBitrate: 512, label: "240P" }
        ]
        //播放速率选项
        this.optionsPlaySpeed = [
            { value: 1, label: '1x' },
            { value: 1.25, label: '1.25x' },
            { value: 1.5, label: '1.5x' }]

        if (screenfull.isEnabled) {
            screenfull.on('change', () => {
                this.vue.isFullScreen = screenfull.isFullscreen
            });
        }
        //隐藏导航栏
        jsBridge.setIsShowNavBar(false)
    }
    //从本地缓存读取之前的比特率
    readBitrateFromLocal() {
        let bitrateSave = localStorage.getItem("lastPlayBitrate");
        if (bitrateSave) {
            this.vue.videoBitRate = bitrateSave;
        }
        for (let i in this.vue.bitrateList) {
            if (this.vue.bitrateList[i].value == bitrateSave) {
                this.vue.selectedBitRateIndex = i
            }
        }
    }
    //将用户选取的比特率保存 下次使用
    saveBitrateToLocal() {
       localStorage.setItem('lastPlayBitrate', this.vue.videoBitRate)
    }

    changeVolume(value) {
        //保存到localstorage
        localStorage.setItem('video-volumn', value)
        this.vue.currentVolume = value
        if (this.vue.vPlayer) {
            this.vue.vPlayer.volume(value)
        }
        if (value > 0) {
            this.vue.isMuted = false
        } else {
            this.vue.isMuted = true
        }
    }
    resetVolume() {
        //恢复音量
        let saveVolume = localStorage.getItem('video-volumn')
        if (saveVolume) {
            saveVolume = parseFloat(saveVolume)
            if (saveVolume >= 0 && saveVolume <= 1) {
                this.vue.currentVolume = saveVolume
                this.vue.vPlayer.volume(saveVolume)
            }
        }
    }
    setMuted(muted) {
        this.vue.isMuted = muted
        if (muted) {
            this.vue.currentVolume = 0
        } else {
            this.vue.currentVolume = this.vue.vPlayer.volume() * 100
        }
    }
    setKeyEvent(target) {
        //当前页面监视键盘输入
        target.onkeydown = (event) => {
            if (!event) return
            console.log(event.keyCode)
            if (event.isComposing || event.keyCode === 229) return;
            if (event.keyCode == 27) {
                if (this.vue.isFullScreen) this.switchFullScreen(); else this.vue.onClose()   // esc处理
            } else if (event.keyCode == 32) {
                this.vue.switchPlay()  //空格键处理
            } else if (event.keyCode == 37) {
                let moveSec = (parseInt(this.vue.seekSec) - 30)
                if (moveSec < 1) moveSec = 1
                if (formatUtil.usingFlv) {//flv是直播流 需要换url
                    this.vue.changeSeekFromSlider(moveSec)
                } else {
                    this.vue.vPlayer.currentTime(moveSec)  //方向键左
                }
            } else if (event.keyCode == 39) {
                let moveSec = (parseInt(this.vue.seekSec) + 30)
                if (moveSec > this.vue.indexObj.duration) moveSec = this.vue.indexObj.duration
                if (formatUtil.usingFlv) {//flv是直播流 需要换url
                    this.vue.changeSeekFromSlider(moveSec)
                } else {
                    this.vue.vPlayer.currentTime(moveSec)  //方向右
                }
            }
        }
    }
    stopPlayId() {
        console.log('stopPlayId')
        if (this.vue.playId) {
            //如果有旧的 先把旧的调用接口停掉
            this.vue.api.get(`/api/transCode/stopPlay?playId=${this.vue.playId}`, {}).then((res) => {
                console.log('播放已经停止')
            })
            try {
                let playIdList = sessionStorage.getItem('play-id-list')
                if (playIdList) {
                    playIdList = JSON.parse(playIdList)
                    for (let i in playIdList) {
                        if (playIdList[i] == this.vue.playId) {
                            playIdList.splice(i, 1)
                        }
                    }
                    sessionStorage.setItem('play-id-list', JSON.stringify(playIdList))
                }
            } catch (err) {
                console.log(err)
            }
        }
    }
    genNewPlayId() {
        //生成一个新的playId
        this.stopPlayId()
        this.vue.playId = new Date().getTime() + "" + parseInt(Math.random() * 10)
        console.log('生成新的playId', this.vue.playId)
        //持久化存一下
        try {
            let playIdList = sessionStorage.getItem('play-id-list')
            console.log('playIdList', playIdList)
            if (playIdList) {
                playIdList = JSON.parse(playIdList)
            } else {
                playIdList = []
            }
            playIdList.push(this.vue.playId)
            console.log('playIdList', playIdList)
            sessionStorage.setItem('play-id-list', JSON.stringify(playIdList) + "")
        } catch (err) {
            console.log('保存出错了')
            console.log(err)
        }
    }
    download() {
        let url=this.vue.indexObj.rawUrl
        let fullUrl = window.location.protocol + "//" + window.location.host + url
        if (this.vue.isFromApp) {
            jsBridge.openInBrowser(fullUrl)
        } else {
            window.open(url, "_blank")
        }
    }
    destroyFlvPlayer() {
        if (this.vue.flvPlayer) {
            console.log('销毁flvplayer')
            this.vue.flvPlayer.pause()
            this.vue.flvPlayer.unload()
            this.vue.flvPlayer.detachMediaElement();
            this.vue.flvPlayer.destroy()
            this.vue.flvPlayer = null
        }
    }
    //卸载键盘事件
    disposeKeyEvent(target) {
        target.onkeydown = null
    }
    savePlaySeek() {
        if (this.vue.indexObj && this.vue.indexObj.id && this.vue.indexObj.duration) {
            if ((this.vue.indexObj.duration - this.vue.seekSec) > 60) {
                //记录进度 下次继续播放
                localStorage.setItem('videoProgress' + this.vue.indexObj.id, this.vue.seekSec + "")
            } else {
                localStorage.removeItem('videoProgress' + this.vue.indexObj.id)
            }
        }
    }
    //当选择了服务器上面的字幕文件
    onSelectServerSubtitlePath(serverSubtitlePath) {
        if (serverSubtitlePath) {
            this.vue.uploadSubtitleName = serverSubtitlePath
            this.vue.uploadSubtitleFilePath = serverSubtitlePath
            this.vue.videoSameNameSubtitleFilePath = null
            this.vue.seek = this.vue.seekSec
            this.vue.setSubtitleTrackUrl()
        }
    }
    //字幕上传成功回调
    uploadSubtitleSuc(response, file, fileList) {
        if (response.code) {
            return this.uploadSubtitleErr()
        }
        this.vue.uploadSubtitleName = response.file.filename
        this.vue.uploadSubtitleFilePath = response.file.path
        this.vue.videoSameNameSubtitleFilePath = null
        this.vue.seek = this.vue.seekSec
        this.vue.setSubtitleTrackUrl()

    }
    uploadSubtitleErr() {
        console.log('字幕上传失败 提示用户')
        this.vue.showVsNotification(this.vue.$t('video.subtitleUploadFailed'))
    }
    setSuitBitrateOptions(sizeOption) {
        let indexObj = this.vue.indexObj
        console.log(indexObj)
        //筛选码率
        if (indexObj.size && indexObj.duration) {
            let videoRawBitrate = parseInt(indexObj.size / indexObj.duration * 8 / 1024)
            console.log('视频原生码率:' + videoRawBitrate + "kb")
            this.vue.bitrateList = this.optionsBitrate.filter((item) => {
                if (item.value >= sizeOption.minBitrate && item.value <= sizeOption.maxBitrate) {
                    if (item.value <= videoRawBitrate) {//大于文件原生码率的不添加
                        return item
                    }
                }
            }).reverse()
            let maxOption = this.vue.bitrateList[0]
            if (this.vue.bitrateList.length < 1 || maxOption.value < videoRawBitrate) {
                //手动添加一个文件原生码率的选项
                let showValue = parseFloat(parseInt(videoRawBitrate * 10) / 10)
                let showUnit = 'Kbps'
                if (showValue > 1024) {
                    showValue = parseInt(showValue / 1024 * 10) / 10
                    showUnit = 'Mbps'
                }
                this.vue.bitrateList.unshift({
                    value: videoRawBitrate,
                    label: this.vue.$t('video.originalBitrate') + ":" + showValue + showUnit
                })
            }
            return videoRawBitrate
        } else {
            console.log('没有size和duration')
            this.vue.bitrateList = this.optionsBitrate.reverse()
            return false
        }

    }
    setSuitSizeOptions() {
        //设置合适的分辨率选项
        let indexObj = this.vue.indexObj
        this.vue.playSizeList = []
        if (indexObj.width && indexObj.height) {
            let useSideLen = indexObj.width > indexObj.height ? indexObj.width : indexObj.height
            //从高到低从分辨率选项里找
            for (let i in this.optionsPlaySize) {
                if (useSideLen >= this.optionsPlaySize[i].value) {
                    this.vue.playSizeList.push(this.optionsPlaySize[i])
                }
            }
            //如果原始分辨率不在选项列表 在额外添加一个原始分辨率选项
            console.log('useSideLen', useSideLen)
            if (useSideLen > this.vue.playSizeList[1].value) {
                this.vue.playSizeList.push({
                    label: indexObj.width + "x" + indexObj.height,
                    value: useSideLen,
                    minBitrate: 1024,
                    maxBitrate: 102400,
                    defaultBitrate: 1024
                })
            }
        } else {
            console.log('this.playSizeList = this.optionsPlaySize')
            this.vue.playSizeList = this.optionsPlaySize
        }
    }
    getVideoSuitResolution(indexObj) {//获取适合视频的分辨率
        if (indexObj.width && indexObj.height) {
            let useSideLen = indexObj.width > indexObj.height ? indexObj.width : indexObj.height
            //从高到低从分辨率选项里找
            for (let i in this.optionsPlaySize) {
                if (this.optionsPlaySize[i].value < 240) continue
                if (useSideLen >= this.optionsPlaySize[i].value) {
                    console.log('····················合适的视频分辨率···················', this.optionsPlaySize[i].value)
                    //设置适合这个分辨率的码率选项列表 并获取视频源码率
                    let videoRawBitrate = this.setSuitBitrateOptions(this.optionsPlaySize[i])
                    console.log('视频源码率', videoRawBitrate)
                    //设置适合这个分辨率的码率当前值
                    if (videoRawBitrate) {
                        //用户上次使用的码率 如果能继续用就继续用
                        let bitrateSave = localStorage.getItem("lastPlayBitrate");
                        if (bitrateSave&&videoRawBitrate>=bitrateSave) {
                            this.vue.videoBitRate = bitrateSave;
                        }else{
                            this.vue.videoBitRate = this.optionsPlaySize[i].defaultBitrate > videoRawBitrate ? videoRawBitrate : this.optionsPlaySize[i].defaultBitrate
                            localStorage.setItem("lastPlayBitrate",this.vue.videoBitRate)
                        }
                    } else {
                        this.vue.videoBitRate = this.optionsPlaySize[i].defaultBitrate
                    }
                    console.log('要使用的码率是', this.vue.videoBitRate)
                    console.log("上次用户手动选择使用的码率",localStorage.lastPlayMovieSize)
                    if(localStorage.lastPlayMovieSize&&this.optionsPlaySize[i].value>=localStorage.lastPlayMovieSize){
                        return localStorage.lastPlayMovieSize
                    }else{
                        return this.optionsPlaySize[i].value
                    }
                }
            }
        }
        console.log('··········没找到合适的分辨率··········')
        return this.primaryMovieSize
    }
    //修改播放速率
    changePlaySpeed(index) {
        let speedOption = this.optionsPlaySpeed[index]
        console.log('speedOption', speedOption)
        this.vue.playSpeed = speedOption.value
        this.vue.vPlayer.playbackRate(speedOption.value)
    }
    //将播放相关的值恢复为默认
    resetValue() {
        this.vue.indexObj = this.vue.photoList[this.vue.currentIndex];
        this.vue.transCodeTest = false
        this.vue.seek = 0
        this.vue.seekSec = 0
        this.vue.audioStreamIndex = 0
        this.vue.subtitleStreamIndex = 0
        this.vue.uploadSubtitleFilePath = null
        this.vue.videoSameNameSubtitleFilePath = null
    }
    //切换全屏
    switchFullScreen() {
        if (/(iPhone|iOS)/i.test(navigator.userAgent)) {
            this.enterFullScreen()
        } else {
            if (this.vue.isFullScreen) {
                this.exitFullscreen()
            } else {
                this.enterFullScreen()
            }
        }
    }
    //进入全屏
    enterFullScreen() {
        var ele = document.getElementById('videoDetailWrapper');
        if (screenfull.isEnabled) {
            screenfull.toggle(ele);
        } else {
            let videoEl = document.getElementById('player_html5_api')
            if (videoEl && videoEl.webkitEnterFullScreen) {
                //兼容ios
                videoEl.webkitEnterFullScreen(); this.vue.isFullScreen = true;
            }
        }
        //通知手机横屏
        jsBridge.setScreenDirection("LANDSCAPE")

    }
    //退出全屏
    exitFullscreen() {
        var ele = document.getElementById('videoDetailWrapper');
        if (screenfull.isEnabled) {
            screenfull.toggle(ele);
        } else {
            console.log('调用退出全屏')
            if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen(); this.vue.isFullScreen = false;
            }
        }
        jsBridge.setScreenDirection("PORTRAIT")
    }
    onDestroy(){
        //销毁页面时候恢复自动横竖屏
        jsBridge.setScreenDirection("AUTO")
        jsBridge.setIsShowNavBar(true)

    }
    parseAudioAndSubtitles(playFilePath) {
        //解析字幕和音频标签
        if (this.vue.indexObj.stream_info) {
            this.vue.currentAudioStreamList = []
            this.vue.currentSubtitleStreamList = []
            let streamList = this.vue.indexObj.stream_info
            if (streamList && typeof (streamList) == 'string' && streamList != "undefined") {
                streamList = JSON.parse(streamList)
            }
            for (let i = 0; i < streamList.length; i++) {
                let stream = streamList[i]
                let streamIndex = stream.index
                if (stream.codec_type == "audio") {
                    let tag = "audio" + streamIndex ? streamIndex : i
                    if (stream.tags && stream.tags.title) {
                        tag = stream.tags.title
                    } else if (stream.tags && stream.tags.handler_name) {
                        tag = stream.tags.handler_name
                    }
                    this.vue.currentAudioStreamList.push({
                        label: tag,
                        value: streamIndex,
                        stream: stream
                    })
                } else if (stream.codec_type == "subtitle") {
                    let tag = "subtitle" + streamIndex ? streamIndex : i
                    if (stream.tags && stream.tags.title) {
                        tag = stream.tags.title
                    }
                    this.vue.currentSubtitleStreamList.push({
                        label: tag,
                        value: streamIndex,
                        language: stream.tags ? stream.tags.language : '',
                        stream: stream
                    })
                } else if (stream.codec_type == 'video') {//保存视频流 用于分析是否能播放源文件 里面有视频编码信息
                    this.vue.currentVideoStream = stream
                }
            }
            if (this.vue.movieType != 1) {
                this.getSameNameSubtitles(this.vue.indexObj.id, playFilePath)
            }
        }
    }

    //获取和视频文件同名的字幕文件
    getSameNameSubtitles(indexId, videoPath) {
        let params = {}
        if (indexId) {
            params.id = indexId
        }
        if (videoPath) {
            params.videoPath = videoPath
        }
        this.vue.api
            .post('/api/movieApi/getSameNameSubtitles', params).then((res) => {
                if (!res.code) {
                    //用户设置的字号

                    let subtitlePathList = res.data
                    if (subtitlePathList.length > 0) {
                        //添加到现有字幕列表
                        for (let i in subtitlePathList) {
                            let subtitleItem = subtitlePathList[i]
                            this.vue.currentSubtitleStreamList.push({
                                label: subtitleItem.fileName,
                                value: subtitleItem.filePath,
                                type: 'path'
                            })
                        }
                    }
                    // 设置用户自定义的字体大小
                    if (res.userFontSize) {
                        this.vue.userFontSize = res.userFontSize + "rem"
                    }else{
                        this.vue.userFontSize =  "1rem"
                    }
                }
            })
    }

}
export default VideoHelper