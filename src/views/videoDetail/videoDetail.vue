<template>
	<div id="videoDetailWrapper" refs="rootWrapper" class="video-detail-root" :catchtouchmove="false"
		@mousemove="onMouse">
		<video x5-video-player-type="h5" object-fit='fill' width="100%" height="100%" preload="auto" id="player"
			ref="player" :muted="isMuted" class="video-js vjs-fill" :duration="indexObj.duration" :controls="false"
			webkit-playsinline playsinline crossorigin="anonymous" autoplay>
			<!-- <source ref="videoSource"> -->
			<!-- 字幕 -->
			<!-- <track mode="showing" v-if="textTrackUrl && !isCloseSubtitle" ref="textTrack" kind="capitions"
				:src="textTrackUrl" srclang="en" label="subtitle" default> -->
		</video>

		<!-- 承载点击事件的ui层 -->
		<div @click="videoClick" style="position:fixed;width:100%;height:100%;z-index: 1;"></div>
		<!-- 头部控制条 -->
		<div class="video-controller-top" @click="videoClick" v-if="showCustomController">
			<!-- 返回按钮 -->
			<div class="icon-root" @click.stop="onClose" style="margin-left:20px">
				<Icon type="md-arrow-round-back" size="40" color="white" />
			</div>
		</div>
		<div class="controller-bottom" v-if="showCustomController">
			<!-- 视频名 分辨率 码率 -->
			<div @click="videoClick">
				<p v-if="movieSize && videoBitRate" class="video-name">{{ resolutionStr }}
					<span v-if="movieSize != 1">{{ parseFloat(parseInt(videoBitRate / 1024 * 10) / 10) }}Mbps</span>
				</p>
			</div>
			<div @click="videoClick">
				<p class="video-name max-line-one" style="word-break: break-all;">{{ indexObj.filename }}</p>
			</div>
			<div class="controller-slider">
				<!-- 自定义进度条 -->
				<Slider :disabled="fromPrivateSpace" class="slider" v-model="seekSec" :min="0"
					:tip-format="utils.formatSeconds" :max="indexObj.duration" @on-change="changeSeekFromSlider">
				</Slider>
				<!-- {{ $t('movie.privateVideoCannotSeek') }} -->
				<!-- 全屏切换 -->
				<div class="icon-root" @click="videoHelper.switchFullScreen()">
					<Icon color="white" type="md-expand" size="40" />
				</div>
			</div>
			<div class="controller-slider" style="justify-content:space-between">
				<!-- 播放时间 -->
				<p class="time">{{ utils.formatSeconds(seekSec) }}</p>
				<p class="time">{{ utils.formatSeconds(indexObj.duration) }}</p>
			</div>
			<!-- 播放暂停 手机版ui -->
			<div class="nas-mobile-show">
				<div class="controller-mobile">
					<!-- 上一个 -->
					<div class="icon-root">
						<Icon @click="onPre" type="ios-skip-backward" size="65" color="white" />
					</div>
					<!-- 播放暂停 -->
					<div class="icon-root">
						<Icon v-if="!isPlaying" @click="switchPlay()" type="ios-play" size="65" color="white" />
						<Icon v-if="isPlaying" @click="switchPlay()" type="ios-pause" size="65" color="white" />
					</div>
					<!-- 下一个 -->
					<div class="icon-root">
						<Icon type="ios-skip-forward" @click="onNext" size="65" color="white" />
					</div>
				</div>
			</div>

			<!-- 播放暂停控制条 -->
			<div class="controller-btns">
				<div>
					<Spin class="nas-mobile-show" v-if="isLoading" size="large"></Spin>

					<div class="controller-section-l nas-mobile-none">
						<!-- 上一个 -->
						<div style="cursor:pointer">
							<Icon @click="onPre" v-if="playCanUse" type="ios-skip-backward" size="45" color="white" />
						</div>
						<!-- 播放暂停 -->
						<div class="icon-root">
							<Icon v-if="!isPlaying && playCanUse" @click="switchPlay()" type="ios-play" size="45"
								color="white" />
							<Icon v-if="isPlaying && playCanUse" @click="switchPlay()" type="ios-pause" size="45"
								color="white" />
							<Spin color="white" v-if="!playCanUse"></Spin>
						</div>
						<!-- 下一个 -->
						<div class="icon-root">
							<Icon type="ios-skip-forward" @click="onNext" v-if="playCanUse" size="45" color="white" />
						</div>
						<!-- 信息 -->
						<div class="icon-root">
							<Icon v-if="!fromFileBrower" @click="showExif = !showExif" style="margin-left:30px"
								type="md-information-circle" size="40" color="white" />
						</div>
						<!-- 下载 -->
						<div class="icon-root">
							<Icon v-if="videoHelper" @click="videoHelper.download()" style="margin-left:10px"
								type="md-download" size="40" color="white" />
						</div>
					</div>
				</div>
				<div class="controller-section-r">
					<!-- 音量 -->
					<Poptip class="nas-mobile-none" trigger="hover" v-if="playCanUse" :title="$t('video.volumn')">
						<div class="icon-root">
							<Icon v-if="!isMuted" color="white" type="md-volume-up" size="40"
								@click="videoHelper.setMuted(true)" />
							<Icon v-else color="white" type="md-volume-off" size="40"
								@click="videoHelper.setMuted(false)" />
						</div>
						<template #content>
							<div style="padding-left:14px;padding-right:14px">
								<Slider @on-change="setVolume" :min="0" :max="1" :step="0.1" v-model="currentVolume"
									show-tip="never">
								</Slider>
							</div>
						</template>
					</Poptip>
					<!-- 字幕 -->
					<Poptip v-if="playCanUse" :title="$t('movie.subtitle')">
						<div class="icon-root">
							<Icon color="white" type="ios-closed-captioning" size="40" />
						</div>
						<template #content>
							<!-- 关闭字幕的选项 -->
							<div class="option-item" v-if="currentSubtitleStreamList.length > 0" @click="closeSubtitle">
								<p>{{ $t('video.closeSubtitle') }}</p>
								<Icon v-if="isCloseSubtitle" style="margin-left:3px" type="md-checkmark" size="20"
									color="#333" />
							</div>
							<!-- 使用自定义上传的字幕的时候显示 -->
							<div class="option-item" v-if="uploadSubtitleFilePath">
								<p class="subtitleTitle">{{ uploadSubtitleName }}</p>
								<Icon style="margin-left:3px" type="md-checkmark" size="20" color="#333" />
							</div>

							<div class="option-item" v-for="(item, index) in currentSubtitleStreamList"
								@click="chooseSubtitle(index)" :key="item.value">
								<p class="subtitleTitle">{{ item.label }}</p>
								{{ item.language ? '-' + item.language : '' }}
								<Icon style="margin-left:3px"
									v-if="index == subtitleStreamIndex && !uploadSubtitleFilePath && !isCloseSubtitle"
									type="md-checkmark" size="20" color="#333" />
							</div>
							<!-- 上传字幕文件 -->
							<Upload :on-error="onUploadErr" :on-success="onUploadSuc" :show-upload-list="false"
								:action="normalUploadUrl" :format="['ass', 'srt']" accept=".ass,.srt">
								<Button icon="ios-cloud-upload-outline">{{ $t('movie.selectLocalSubtitles') }}</Button>
							</Upload>
						</template>
					</Poptip>

					<!-- 音轨 -->
					<Poptip v-if="playCanUse && movieSize != 1" :title="$t('movie.audioIndex')">
						<div class="icon-root">
							<Icon color="white" type="md-musical-notes" size="40" />
						</div>
						<template #content>
							<!-- 声道数量显示 -->
							<a @click="chooseAc" class="option-item">{{ $t('movie.audioChannel') }}:{{ audioChannel
							}}</a>
							<!-- 音轨选择 -->
							<div class="option-item" v-for="(item, index) in currentAudioStreamList"
								@click="chooseAudio(index)" :key="item.value">
								<p>{{ item.label }}</p>
								<Icon style="margin-left:3px" v-if="index == audioStreamIndex" type="md-checkmark"
									size="20" color="#333" />
							</div>
						</template>
					</Poptip>

					<!-- 码率 -->
					<Poptip v-if="movieSize != 1" :title="$t('movie.bitrate')">
						<div class="icon-root">
							<Icon color="white" type="md-film" size="40" />
						</div>
						<template #content>
							<div class="option-item" @click="bitChoose(item.value, index)"
								v-for="(item, index) in bitrateList" :key="item.value">
								<p>{{ item.label }}</p>
								<Icon style="margin-left:3px" v-if="item.value == videoBitRate" type="md-checkmark"
									size="20" color="#333" />
							</div>
						</template>
					</Poptip>

					<!-- 转码分辨率 -->
					<Poptip :title="$t('movie.resolution')">
						<div class="icon-root">
							<Icon color="white" type="md-tablet-landscape" size="40" />
						</div>
						<template #content>
							<div class="option-item" @click="onChooseMovieSize(item.value, index)"
								v-for="(item, index) in playSizeList" :key="item.value">
								<p>{{ item.label }}</p>
								<Icon style="margin-left:3px" v-if="item.value == movieSize" type="md-checkmark"
									size="20" color="#333" />
							</div>
						</template>
					</Poptip>
					<!-- 播放速率 -->
					<Poptip v-if="playCanUse" :title="$t('movie.playRate')">
						<div class="icon-root">
							<Icon color="white" type="md-flash" size="40" />
						</div>
						<template #content>
							<div class="option-item" @click="videoHelper.changePlaySpeed(index)"
								v-for="(item, index) in playSpeedList" :key="item.value">
								<p>{{ item.label }}</p>
								<Icon style="margin-left:3px" v-if="item.value == playSpeed" type="md-checkmark"
									size="20" color="#333" />
							</div>
						</template>
					</Poptip>

				</div>
			</div>
		</div>
		<!-- exif信息板 -->
		<photo-exif :serverType="serverType" v-if="showExif && !fromFileBrower" :indexObj="indexObj"
			@closeExif="showExif = false"></photo-exif>

	</div>
</template>

<script>
import videoJS from 'video.js';
import "video.js/dist/video-js.css"

import photoExif from "../photos/components/photoExif.vue";
import axios from "@/plugins/axios";
import utils from "@/plugins/utils";
import VideoHelper from "./videoDetailHelper"
import formatUtil from "./formatUtil";

export default {
	props: {
		fromFileBrower: {
			default: false,
			type: Boolean
		},
		propsServerType: {
			default: '',
			type: String
		}
	},
	name: "video-detail",
	components: {
		photoExif,
	},
	computed: {
		resolutionStr: function () {//分辨率提示字符串
			let str = this.$t('movie.resolution') + ":"
			if (this.movieSize == 1) {
				return str += this.$t('video.code_raw')
			} else {
				let option = this.playSizeList.filter((item) => {
					if (item.value == this.movieSize) return item
				})
				return option[0] ? (str += option[0].label) : ""
			}
		}
	},
	data() {
		return {
			canPlayRawFile: true,//是否支持源文件
			vPlayer: null,//videojs示例
			audioChannel: 2,//默认双声道
			openAsPage: false,
			serverType: "photo",
			allowAndroidPlayRaw: false,
			isLoading: false,
			textTrackUrl: '',
			textTrackEl: null,
			showChooseResolution: false,
			fromPrivateSpace: false,
			playSpeed: 1,
			videoHelper: null,//帮助类实例
			playResolutionList: [],//分辨率码率选项
			playSpeedList: [],//播放速率
			playSizeList: [],//分辨率选项
			bitrateList: [],//码率选项
			videoBitRate: 3584, //默认比特率
			movieSize: 1,
			isMuted: false, //是否为静音
			playCanUse: false,
			token: utils.getToken(),
			utils: utils,
			baseUrl: axios.baseUrl, //服务器地址
			normalUploadUrl: axios.uploadUrl() + "&uploadSubtitle=1&overMode=over",
			currentIndex: 0,//当前播放索引
			photoList: [],//待播放列表
			showExif: false,
			indexObj: false, //当前的索引
			isPlaying: false, //播放状态
			seek: 0,
			seekSec: 0,//显示的秒数 flv模式下和seek不一样 其他源和seek一样
			showCustomController: true,
			noMoveTime: 0,
			currentAudioStreamList: [], //当前视频的音频流
			currentSubtitleStreamList: [], //当前视频的字幕流
			audioStreamIndex: 0, //音轨 默认0
			subtitleStreamIndex: 0, //字幕 默认0
			currentVolume: 1, //当前音量
			uploadSubtitleFilePath: null, //用户上传字幕后的字幕路径
			videoSameNameSubtitleFilePath: null, //与视频文件同名的字幕
			uploadSubtitleName: '', //用户自己上传的字幕文件名
			isCloseSubtitle: false, //是否关闭字幕
			playId: "",
			isFullScreen: false,
			userFontSize: '1.5rem',
			currentVideoStream: false//当前的视频流信息
		};
	},
	mounted() {
		//创建helper 给转码选项赋值
		this.videoHelper = new VideoHelper(this)
		this.playSpeedList = this.videoHelper.optionsPlaySpeed
		this.videoHelper.readBitrateFromLocal()//读取缓存的比特率
		this.videoHelper.setKeyEvent(document)//设置键盘按键响应
		//设置当前正在播放视频的状态
		let playerCount = sessionStorage.getItem('player-count')
		sessionStorage.setItem('player-count', playerCount ? parseInt(playerCount) + 1 : 1)

		//以页面形式打开处理
		let passParams = this.$route.params
		if (passParams.passVideoList) {
			this.serverType = passParams.serverType
			this.playVideo(passParams.passVideoList, passParams.passPlayIndex, passParams.passAllowAndroidPlayRaw)
			this.openAsPage = true
		} else if (this.propsServerType) {
			//以弹窗形式打开处理
			this.serverType = this.propsServerType
		} else {
			//没传参数处理
			return this.$router.go(-1)
		}
	},

	beforeDestroy() {
		//卸载键盘事件
		this.videoHelper.disposeKeyEvent(document)
		this.videoHelper.stopPlayId()
		//销毁videojs
		if (this.vPlayer) {
			this.vPlayer.dispose();
			this.vPlayer = null
		}
		document.onkeydown = null
		//设置停止播放视频的状态
		let playerCount = sessionStorage.getItem('player-count')
		sessionStorage.setItem('player-count', playerCount ? parseInt(playerCount) - 1 : 0)
	},
	methods: {
		setVolume(val) {
			this.videoHelper.changeVolume(val)
		},
		onUploadSuc(response) {//上传成功回调
			this.videoHelper.uploadSubtitleSuc(response)
		},
		onUploadErr() {//上传失败回调
			this.videoHelper.uploadSubtitleErr()
		},
		showBitrateAlert() {
			this.showVsAlertDialog(this.$t('common.alert'), this.$t('video.whatIsBitate'))
		},
		//关闭字幕
		closeSubtitle() {
			this.isCloseSubtitle = true
			this.uploadSubtitleFilePath = null
			this.videoSameNameSubtitleFilePath = null
			this.textTrackUrl = ''
			this.setSubtitleTrackUrl()
		},
		chooseSubtitle(index) {
			this.isCloseSubtitle = false
			this.uploadSubtitleFilePath = null
			this.videoSameNameSubtitleFilePath = null
			this.subtitleStreamIndex = index

			let selectedSubtitle = this.currentSubtitleStreamList[index]
			if (selectedSubtitle.type == 'path') {
				//选择的是与视频同名的字幕文件
				this.uploadSubtitleName = selectedSubtitle.label
				this.videoSameNameSubtitleFilePath = selectedSubtitle.value
			}
			this.setSubtitleTrackUrl()
		},
		chooseAc() {
			//切换声道数量
			let currentAudioStrem = this.currentAudioStreamList[this.audioStreamIndex].stream
			console.log(currentAudioStrem)
			if (!currentAudioStrem.channels) {
				return this.showVsNotification(this.$t('movie.noOtherChannel'))
			}
			if (this.audioChannel == currentAudioStrem.channels) {
				if (this.audioChannel == 2) {
					return this.showVsNotification(this.$t('movie.noOtherChannel'))
				} else {
					this.audioChannel = 2
				}
			} else {
				this.audioChannel = currentAudioStrem.channels
			}
			this.showVsNotification(this.$t('movie.alreadChangeChannelTo', { channels: this.audioChannel }))
			this.playIndex(this.indexObj, true)
		},
		chooseAudio(index) {
			this.audioStreamIndex = index
			this.playIndex(this.indexObj, true)
		},
		bitChoose(bit, index) {
			this.videoBitRate = bit
			if (parseInt(this.videoBitRate) > 3584 && formatUtil.isRemoteMode) {
				// 远程访问 码率大于3mbps 提示用户
				this.showVsNotification(this.$t('nascab.usingRemoteBitrateTooHigh'))
			}
			this.playIndex(this.indexObj, true)
			//保存选定的比特率 下次使用
			this.videoHelper.saveBitrateToLocal()
		},
		onMouse(e) {
			this.noMoveTime = 0
		},
		videoClick() {
			//如果自定义控制器处于展示状态 先隐藏
			this.noMoveTime = 0
			return this.showCustomController = !this.showCustomController
		},
		onChooseMovieSize(movieSize) {
			if (movieSize == 1) {
				if (!this.canPlayRawFile) {
					return this.showVsNotification(this.$t('video.videoIsNotSupportCoding'))
				}
				//手动选择播放源文件 强制
				this.pauseVideo()
				this.setMovieSize(movieSize)
				this.playIndex(this.indexObj, false, false, true);
				if (this.seekSec > 0) {
					this.vPlayer.currentTime(this.seekSec)
				}
				this.vPlayer.autoplay('play')
				this.uploadSubtitleName = null
				this.uploadSubtitleFilePath = null
				if (this.videoSameNameSubtitleFilePath) {
					//之前选的是视频同名字幕 播放源文件的时候要恢复为默认第一个字幕
					this.subtitleStreamIndex = 0
					this.videoSameNameSubtitleFilePath = null
				}
			} else {
				this.pauseVideo()
				this.setMovieSize(movieSize)
				this.playIndex(this.indexObj, true);
			}
		},
		//----------回调事件------------
		onPre() {
			this.canPlayRawFile = true

			//找到上一个视频索引
			let preIndex = -1;
			for (let i = this.currentIndex - 1; i >= 0; i--) {
				if (this.photoList[i].type == 2) {
					// 不是视频 继续下一个
					preIndex = i;
					break;
				}
			}
			if (preIndex == -1) {
				return this.showVsNotification(this.$t("video.noMoreVideo"));
			}
			this.currentIndex = preIndex;
			this.videoHelper.resetValue()
			this.vPlayer.autoplay('play')
			this.movieSize = this.videoHelper.getVideoSuitResolution(this.indexObj)
			this.playIndex(this.indexObj, false);
		},
		onNext() {
			this.canPlayRawFile = true
			//找到下一个视频索引
			let nextIndex = -1;
			for (let i = this.currentIndex + 1; i < this.photoList.length; i++) {
				if (this.photoList[i].type == 2) {
					// 不是视频 继续下一个
					nextIndex = i;
					break;
				}
			}
			if (nextIndex == -1) {
				return this.showVsNotification(this.$t("video.noMoreVideo"));
			}
			this.currentIndex = nextIndex;
			this.videoHelper.resetValue()
			this.vPlayer.autoplay('play')
			this.movieSize = this.videoHelper.getVideoSuitResolution(this.indexObj)
			this.playIndex(this.indexObj, false);
		},
		errorCb(err) {


		},
		playCb() {
			this.isPlaying = true;
		},
		canplayCb(e) {
			console.log(' canplayCb canplayCb canplayCb')
			this.playCanUse = true
		},
		pauseCb() {
			this.isPlaying = false;
		},
		endedCb() {
			this.onNext();
		},
		onSeekingCb(e) {
		},
		onSeekedCb(e) {
		},
		onLoadedMetaDataCb(e) {
		},
		onLoadedDataCb(e) {
			if (this.currentSubtitleStreamList.length > 0) {
				//设置字幕显示
				this.setSubtitleTrackUrl()
			}
		},
		onWaitingCb() {
			console.log('onWaitingCb')
			this.isLoading = true
			if (this.topLoading) this.topLoading()
		},
		onPlayingCb() {
			this.isLoading = false
			console.log('onPlayingCb this.isLoading', this.isLoading)
		},
		onTimeUpdateCb() {
			if (!this.isPlaying) return
			this.noMoveTime += 1
			if (this.noMoveTime >= 15 && this.isPlaying) {
				//一段时间没有移动 隐藏自定义控制
				this.showCustomController = false
			}
			this.seekSec = this.vPlayer.currentTime()
			//3秒保存一次当前播放位置
			if (this.seekSec && parseInt(this.seekSec) % 10 == 0) {
				this.videoHelper.savePlaySeek()
			}
		},
		//---------控制函数-------------
		pauseVideo() {
			if (this.vPlayer) this.vPlayer.pause()
		},
		resumePlayVideo() {
			if (this.vPlayer) {
				this.vPlayer.play()
			}
		},
		switchPlay() {
			if (this.isPlaying) {
				this.pauseVideo()
			} else {
				this.resumePlayVideo()
			}
		},
		onClose() {
			if (this.isFullScreen) {
				this.videoHelper.exitFullscreen()
			}
			if (this.openAsPage) {
				//以页面形式打开的 后退
				this.$router.go(-1)
			} else {
				this.$emit("onClose");
			}
		},
		changeSeekFromSlider(value) {
			this.vPlayer.currentTime(value)
		},
		//为播放器设置播放的url
		setPlayerUrl(url) {
			console.log('url', url)
			if (!this.vPlayer) {
				let that = this
				this.vPlayer = videoJS(this.$refs.player, {
					html5: {
						nativeTextTracks: formatUtil.isIos() ? true : false,
					},
					suppressNotSupportedError: false
				}, function () {
					this.on("play", that.playCb);
					this.on("pause", that.pauseCb);
					this.on("ended", that.endedCb);
					this.on("seeking", that.onSeekingCb)
					this.on("seeked", that.onSeekedCb)
					this.on('canplay', that.canplayCb)
					this.on("loadedmetadata", that.onLoadedMetaDataCb)
					this.on("loadeddata", that.onLoadedDataCb)
					//正在播放
					this.on("playing", that.onPlayingCb);
					//播放时长改变
					this.on("timeupdate", that.onTimeUpdateCb)
					//视频等待
					this.on("waiting", that.onWaitingCb);
					this.on("error", (e, b) => {
						//视频错误监听事件
						let errObj = that.vPlayer.error()
						if (errObj && errObj.code == 4) {
							that.canPlayRawFile = false
							//设置源不支持 转换转码播放
							if (that.movieSize == 1) {
								//之前是源文件 转码试试
								that.playIndex(that.indexObj, true)
							} else {
								that.showVsConfirmDialog(that.$t('common.confirm'), that.$t('video.errorRetryPlay'), () => {
									that.playIndex(that.indexObj, true)
								})
							}
						}
					});
					this.on("loadstart", () => {
						console.log('视频开始加载数据监听事件')
					});
					this.on("canplaythrough", () => {
						console.log('视频可以播放')
					});
					//网络异常
					this.on("stalled", () => {
						// console.log("网络异常");
					});
				});

				//恢复之前设置的音量
				this.videoHelper.resetVolume()
			}
			if (url.indexOf('.m3u8') != -1) {
				formatUtil.setFormatState('m3u8')
				this.vPlayer.src({
					type: 'application/x-mpegURL',
					src: url
				})
				if (this.seekSec > 5) {
					this.vPlayer.currentTime(this.seekSec)
				}
			} else {
				formatUtil.setFormatState(false)
				this.vPlayer.src({
					type: 'video/mp4',
					src: url
				})
				if (this.seekSec > 5) {
					this.vPlayer.currentTime(this.seekSec)
				}
			}
		},
		//设置分辨率
		setMovieSize(sizeValue) {
			if (sizeValue != 1) {
				let sizeOption = this.videoHelper.optionsPlaySize.filter((item) => {
					if (item.value == sizeValue) return item
				})[0]
				if (!sizeOption) {
					sizeOption = this.playSizeList.filter((item) => {
						if (item.value == sizeValue) return item
					})[0]
				}
				let videoRawBitRate = this.videoHelper.setSuitBitrateOptions(sizeOption)
				this.videoBitRate = (videoRawBitRate && (sizeOption.defaultBitrate > videoRawBitRate)) ? videoRawBitRate : sizeOption.defaultBitrate
			}
			this.movieSize = sizeValue
		},
		//获取转码url
		getTransCodeUrl() {
			//原来播放的是原始 现在转码 选默认码率
			if (this.movieSize == 1) {
				this.setMovieSize(this.videoHelper.getVideoSuitResolution(this.indexObj))
			}
			//默认转码格式为flv ios不支持media source extension 但是原生支持m3u8
			let transFormat = formatUtil.getTranscodeFormat()
			let indexObj = this.indexObj
			let prifixPart = `${axios.baseUrl}/api/transCode/play/stream.${transFormat}?format=${transFormat}&`
			if (transFormat == 'm3u8') {
				prifixPart += `playId=${this.playId}&`
			}
			let lastPart = `&token=${this.token}&size=${this.movieSize}&seek=${this.seek}&videobit=${this.videoBitRate}&subtitleIndex=${this.subtitleStreamIndex}&audioIndex=${this.audioStreamIndex}&ac=${this.audioChannel}`
			let playUrl = `${prifixPart}serverType=${this.serverType}&indexId=${indexObj.id}${lastPart}`;
			if (this.fromFileBrower) {//从文件夹来的 要带着filePath
				playUrl = `${prifixPart}filePath=${indexObj.filePath}${lastPart}`;
			}
			if (indexObj.spaceId) {//有spaceid 证明是从加密空间来的 添加私密空间相关参数
				this.fromPrivateSpace = true
				playUrl = `${prifixPart}spaceId=${indexObj.spaceId}&spaceToken=${indexObj.spaceToken}&spaceIndexId=${indexObj.id}&filePath=${indexObj.filePath}${lastPart}`
			} else {
				this.fromPrivateSpace = false
			}
			return playUrl
		},
		setSubtitleTrackUrl() {
			if (this.textTrackEl) {
				this.vPlayer.removeRemoteTextTrack(this.textTrackEl)
				this.textTrackEl = null
			}
			if (this.isCloseSubtitle) {
				return this.textTrackUrl = ""
			}
			if (this.currentSubtitleStreamList.length <= this.subtitleStreamIndex) {
				return this.textTrackUrl = ""
			}
			let selectedSubtitleObj = this.currentSubtitleStreamList[this.subtitleStreamIndex]
			if (selectedSubtitleObj.stream && selectedSubtitleObj.stream['codec_name'] == 'pgssub') {
				//选择了图片字幕 需要烧录 
				return this.textTrackUrl = ""
			}
			console.log('所选字幕', selectedSubtitleObj)
			//播放源文件的时候设置字幕
			let subtitleUrl = this.baseUrl + `/api/transCode/subtitle/subtitle.vtt?token=${this.token}&subtitleIndex=${this.subtitleStreamIndex}`
			if (this.indexObj.spaceId) {
				subtitleUrl += `&spaceId=${this.indexObj.spaceId}&spaceToken=${this.indexObj.spaceToken}&spaceIndexId=${this.indexObj.id}`
			}
			if (this.fromFileBrower || this.indexObj.spaceId) {
				subtitleUrl += `&filePath=${this.indexObj.filePath}`
			} else {
				subtitleUrl += `&indexId=${this.indexObj.id}&serverType=${this.serverType}`
			}
			if (this.uploadSubtitleFilePath) {
				//使用上传字幕
				this.isCloseSubtitle = false
				subtitleUrl += `&subtitleFile=${axios.encodePath(this.uploadSubtitleFilePath)}`
			} else if (this.videoSameNameSubtitleFilePath) {
				//使用的是视频同名字幕
				this.isCloseSubtitle = false
				subtitleUrl += `&subtitleFile=${axios.encodePath(this.videoSameNameSubtitleFilePath)}`
			}
			this.textTrackUrl = subtitleUrl
			let srcLan = 'en'
			let label = 'subtitle'
			if (selectedSubtitleObj.stream && selectedSubtitleObj.stream.tags) {
				if (selectedSubtitleObj.stream.tags.language) {
					srcLan = selectedSubtitleObj.stream.tags.language
				}
				if (selectedSubtitleObj.stream.tags.title) {
					label = selectedSubtitleObj.stream.tags.title
				}
			}

			//添加字幕
			this.textTrackEl = this.vPlayer.addRemoteTextTrack({
				src: this.textTrackUrl,
				mode: "showing",
				srclang: srcLan,
				kind: "subtitles",
				label: label,
				default: true
			}, false);
			let that = this
			//设置用户字体
			this.textTrackEl.addEventListener('load', () => {
				if (that.userFontSize) {
					document.getElementsByTagName('body')[0].style.setProperty('--subtitleFontSize', that.userFontSize);
					console.log('字幕字号更新完毕', that.userFontSize)
				}
			});
		},
		playIndex(indexObj, playTransCode, seekValue, forcePlayRaw) {
			console.log('playIndex', indexObj)
			if (seekValue) {
				this.seek = seekValue
			} else {
				this.seek = this.seekSec
			}
			// 为影片设置合适的分辨率选项
			this.videoHelper.setSuitSizeOptions()
			this.playCanUse = false
			this.isPlaying = false
			this.indexObj = indexObj
			this.currentAudioStreamList = []
			this.currentSubtitleStreamList = []
			let settingPlayUrl = () => {
				if (!playTransCode) {
					if (!forcePlayRaw && !this.canPlayRawFile) {
						console.log('不能播放源文件 强制转码')
						//不能播源文件 自动切换为转码
						return this.playIndex(indexObj, true)
					} else {
						//播放源文件
						this.movieSize = 1
						this.setPlayerUrl(indexObj.rawUrl);
					}
				} else {
					//获取转码播放的url
					this.videoHelper.genNewPlayId()
					let playUrl = this.getTransCodeUrl()
					this.setPlayerUrl(playUrl)
				}
			}
			//没有streaminfo补充streminfo
			if (!indexObj.stream_info && !this.fromFileBrower) {
				//非文件夹来的 
				this.api
					.post('/api/photoApi/getIndexDetail', {
						id: indexObj.id,
						serverType: this.serverType
					}).then((res) => {
						if (!res.code) {
							this.indexObj.stream_info = res.data.stream_info
							this.videoHelper.parseAudioAndSubtitles()
							settingPlayUrl()
						}
					})
			} else if (this.fromFileBrower) {
				let params = { 'filePath': indexObj.filePath }
				indexObj.filename = indexObj.name || indexObj.filename
				//从文件夹来的 没有索引 需要先获取视频信息 解析字幕音频轨等
				this.api.post('/api/transCode/getVideoInfoByPath', params).then((res) => {
					if (!res.code) {
						this.indexObj.stream_info = res.streams
						this.indexObj.duration = res.duration
						this.videoHelper.parseAudioAndSubtitles(indexObj.filePath)
						settingPlayUrl()
					}
				})
			} else {
				//本来就有stream_info 也不是从文件夹来的 会走到这里 从加密空间来的也会走到这里 加密空间过来的带stream_info
				this.videoHelper.parseAudioAndSubtitles()
				settingPlayUrl()
			}

		},
		// //询问用户是否继续播放
		// ifContinuPlay() {
		// 	// 查询上次播放进度
		// 	if (this.indexObj && this.indexObj.id) {
		// 		let lastProgress = localStorage.getItem('videoProgress' + this.indexObj.id)
		// 		if (lastProgress && lastProgress > 60) {
		// 			lastProgress = parseInt(lastProgress)
		// 			if (isContinue === true) {
		// 				//继续播放
		// 				this.changeSeekFromSlider(lastProgress)
		// 			} else if (isContinue === undefined) {
		// 				//询问用户是否恢复进度
		// 				this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('movie.continuePlay', {
		// 					lastTime: utils.formatSeconds(lastProgress)
		// 				}), () => {
		// 					//继续播放
		// 					this.changeSeekFromSlider(lastProgress)
		// 				}, null, this.$t('movie.resumePlay'), this.$t('movie.playBegain'))
		// 			}
		// 		}
		// 	}
		// },
		playVideo(photoList, index, allowAndroidPlayRaw) {//外部调用播放视频的入口
			if (allowAndroidPlayRaw == true) {
				this.allowAndroidPlayRaw = true
			} else {
				this.allowAndroidPlayRaw = false
				if (this.isAndroid) {
					this.canPlayRawFile = false
				}
			}
			this.currentIndex = index;
			this.photoList = photoList;
			this.indexObj = photoList[index];
			this.playSizeList = []
			if (this.indexObj.spaceId) {
				this.fromPrivateSpace = true
			}
			this.playIndex(this.indexObj, false);
		}
	},
};
</script>

<style lang="scss" scoped>
@import './videoDetail.scss'
</style>
