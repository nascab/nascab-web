import screenfull from 'screenfull';
import jsBridge from '../../plugins/jsBridge';
import formatUtil from './formatUtil';

class VideoHelper {
    constructor(vue) {
        this.vue = vue

        this.primaryOptionPlay = { size: 1920, bitrate: 3584, label: "1080p 3mbps" }
        this.optionsPlay = [

            { size: 4096, bitrate: 51200, label: "4k 30mbps" },
            { size: 4096, bitrate: 20480, label: "4k 20mbps" },
            { size: 4096, bitrate: 10240, label: "4k 10mbps" },
            { size: 4096, bitrate: 6144, label: "4k 6mbps" },
            { size: 4096, bitrate: 4096, label: "4k 4mbps" },
            { size: 1920, bitrate: 8192, label: "1080p 8mbps" },
            { size: 1920, bitrate: 6144, label: "1080p 6mbps" },
            { size: 1920, bitrate: 4096, label: "1080p 4mbps" },
            { size: 1920, bitrate: 3584, label: "1080p 3mbps" },
            { size: 1920, bitrate: 2048, label: "1080p 2mbps" },
            { size: 1280, bitrate: 3584, label: "720p 3mbps" },
            { size: 1280, bitrate: 2048, label: "720p 2mbps" },
            { size: 1280, bitrate: 1024, label: "720p 1mbps" },
            { size: 720, bitrate: 2048, label: "480p 2mbps" },
            { size: 720, bitrate: 1024, label: "480p 1mbps" },
            { size: 1, bitrate: 3584, label: this.vue.$t("video.code_raw") }
        ]


        //播放速率选项
        this.optionsPlaySpeed = [
            { value: 0.5, label: '0.5x' },
            { value: 0.75, label: '0.75x' },
            { value: 1, label: '1x' },
            { value: 1.25, label: '1.25x' },
            { value: 1.5, label: '1.5x' },
            { value: 2, label: '2x' },
            { value: 3, label: '3x' }]

        if (screenfull.isEnabled) {
            screenfull.on('change', () => {
                this.vue.isFullScreen = screenfull.isFullscreen
            });
        }
        //隐藏导航栏
        jsBridge.setIsShowNavBar(false)
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
                let moveSec = (parseInt(this.vue.seekSec) - 15)
                if (moveSec < 1) moveSec = 1
                if (formatUtil.usingFlv) {//flv是直播流 需要换url
                    this.vue.changeSeekFromSlider(moveSec)
                } else {
                    this.vue.vPlayer.currentTime(moveSec)  //方向键左
                }
            } else if (event.keyCode == 39) {
                let moveSec = (parseInt(this.vue.seekSec) + 15)
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
        let fullUrl = this.vue.indexObj.rawUrl
        if (!fullUrl.startsWith("http")) {
            fullUrl = window.location.protocol + "//" + window.location.host + fullUrl
        }
        console.log("fullUrl", fullUrl)
        if (this.vue.isFromApp) {
            jsBridge.openInBrowser(fullUrl)
        } else {
            window.open(fullUrl, "_blank")
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
        console.log("response", response)
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

    setSuitSizeOptions(indexObj) {
        if (indexObj.width && indexObj.height) {
            if (indexObj.width < 2000 && indexObj.height < 2000) {
                //宽和高都小于2000 不显示4k选项
                this.vue.playSizeList = this.optionsPlay.slice(5)
                return
            }
        }
        this.vue.playSizeList = this.optionsPlay
    }
    getVideoSuitResolution(indexObj) {//获取适合视频的分辨率
        this.vue.currentSizeOption = this.primaryOptionPlay
        this.vue.videoBitRate = this.primaryOptionPlay.bitrate
        return this.primaryOptionPlay.size
    }
    //修改播放速率
    changePlaySpeed(index) {
        let speedOption = this.optionsPlaySpeed[index]
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
        this.vue.playSpeed=1
        this.vue.setBurnState()
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
    onDestroy() {
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
                        language: stream.tags && stream.tags.language ? stream.tags.language : '',
                        stream: stream
                    })


                } else if (stream.codec_type == 'video') {//保存视频流 用于分析是否能播放源文件 里面有视频编码信息
                    this.vue.currentVideoStream = stream
                }
            }
            //根据首选字幕语言设置字幕索引
            if (this.vue.currentSubtitleStreamList) {
                console.log("this.vue.currentSubtitleStreamList",this.vue.currentSubtitleStreamList)
                for (let i in this.vue.currentSubtitleStreamList) {
                    let subStream = this.vue.currentSubtitleStreamList[i]
                    if (subStream.language && this.vue.moviePreferLanguage) {
                        if (subStream.language == this.vue.moviePreferLanguage) {
                            console.log("首选字幕语言索引",i)
                            this.vue.subtitleStreamIndex = i
                            break
                        }
                    }
                }
            }

            if (this.vue.movieType != 1) {
                this.getSameNameSubtitles(this.vue.indexObj.id, playFilePath)
            }
        }
    }

    //获取和视频文件同名的字幕文件

    getSameNameSubtitles(indexId, videoPath) {
        console.log("调用 getSameNameSubtitles")
        if (this.isGettingSameNameSubtties) {
            return
        }
        this.isGettingSameNameSubtties = true
        let params = {}

        if (indexId) {
            params.id = indexId
        }
        if (videoPath) {
            params.videoPath = videoPath
        }
        this.vue.api
            .post('/api/movieApi/getSameNameSubtitles', params).then((res) => {
                this.isGettingSameNameSubtties = false
                if (!res.code) {
                    //用户设置的字号

                    let subtitlePathList = res.data
                    if (subtitlePathList.length > 0) {
                        //添加到现有字幕列表
                        let rawLength = this.vue.currentSubtitleStreamList.length
                        for (let i in subtitlePathList) {
                            let subtitleItem = subtitlePathList[i]
                            this.vue.currentSubtitleStreamList.push({
                                label: subtitleItem.fileName,
                                value: subtitleItem.filePath,
                                type: 'path'
                            })
                        }
                        if (rawLength < 1) {
                            this.vue.chooseSubtitle(0)
                        }
                    }
                    // 设置用户自定义的字体大小
                    if (res.userFontSize) {
                        this.vue.userFontSize = res.userFontSize * 15 + "px"
                    } else {
                        this.vue.userFontSize = "20px"
                    }

                }
            }).catch(err => {
                this.isGettingSameNameSubtties = false
            })
    }

}
export default VideoHelper