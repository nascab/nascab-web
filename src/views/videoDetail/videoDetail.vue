<template>
	<div id="videoDetailWrapper" refs="rootWrapper" class="video-detail-root" :catchtouchmove="false" @mousemove="onMouse">
		<video x5-video-player-type="h5" object-fit='fill' width="100%" height="100%" preload="auto" id="player"
			ref="player" :muted="isMuted" class="video-js vjs-fill" :duration="indexObj.duration" :controls="false"
			webkit-playsinline playsinline crossorigin="anonymous" autoplay>
			<!-- <source ref="videoSource"> -->
			<!-- 字幕 -->
			<!-- <track mode="showing" v-if="textTrackUrl && !isCloseSubtitle" ref="textTrack" kind="capitions"
					:src="textTrackUrl" srclang="en" label="subtitle" default> -->
		</video>

		<!-- 承载点击事件的ui层 -->
		<div @click="videoClick" @touchstart.stop="onMouseDown" @touchend.stop="onMouseUp" @mousedown.stop="onMouseDown" @mouseup.stop="onMouseUp" style="position:fixed;width:100%;height:100%;z-index: 1;"></div>
		<!-- 头部控制条 -->
		<div class="video-controller-top" @click="videoClick" v-if="showCustomController">
			<!-- 返回按钮 -->

			<div class="icon-root" @click.stop="onClose" style="margin-left:20px">
				<span class="icon_controller_xxl nasIcons icon-back" style="font-size:20px"></span>
			</div>

			<div @click="videoClick">
				<p class="video-name max-line-one" style="word-break: break-all;">{{ indexObj.filename }}</p>
			</div>
		</div>
		<div class="controller-bottom" v-if="showCustomController">
			<!-- 视频名 分辨率 码率 -->
			<div @click="videoClick">
				<p v-if="movieSize && videoBitRate" class="video-name">{{ resolutionStr }}
				</p>
			</div>

			<div class="controller-slider">
				<!-- 自定义进度条 -->
				<Slider :disabled="fromPrivateSpace" class="slider" v-model="seekSec" :min="0"
					:tip-format="utils.formatSeconds" :max="indexObj.duration" @on-change="changeSeekFromSlider">
				</Slider>
				<!-- {{ $t('movie.privateVideoCannotSeek') }} -->
				<!-- 全屏切换 -->
				<div class="icon-root" @click="videoHelper.switchFullScreen()">
					<!-- <Icon color="white" type="md-expand" size="35" /> -->
					<span class="icon_controller_m nasIcons icon-fullscreen"></span>
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
					<div style="cursor:pointer">
						<span @click="onPre()" class="icon_controller_xxl nasIcons icon-video-last"></span>
					</div>
					<!-- 播放暂停 -->
					<div style="margin-left: 40px;margin-right: 40px;">
						<span v-if="!isPlaying" @click="switchPlay()" class="icon_controller_xxl nasIcons icon-play"></span>
						<span v-if="isPlaying" @click="switchPlay()" class="icon_controller_xxl nasIcons icon-pause"></span>
					</div>
					<!-- 下一个 -->
					<div>
						<span @click="onNext()" class="icon_controller_xxl nasIcons icon-video-next"></span>
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
							<span @click="onPre()" class="icon_controller_m nasIcons icon-video-last"></span>
						</div>
						<!-- 播放暂停 -->
						<div class="icon-root">
							<span v-if="!isPlaying" @click="switchPlay()"
								class="icon_controller_m nasIcons icon-play"></span>
							<span v-if="isPlaying" @click="switchPlay()"
								class="icon_controller_m nasIcons icon-pause"></span>
							<!-- <Spin color="white" v-if="!playCanUse"></Spin> -->
						</div>
						<!-- 下一个 -->
						<div class="icon-root">
							<span @click="onNext()" class="icon_controller_m nasIcons icon-video-next"></span>
						</div>
						<!-- 信息 -->
						<div class="icon-root">
							<span style="margin-left:10px" v-if="!fromFileBrower" @click="showExif = !showExif"
								class="icon_controller_s nasIcons icon-exif-info"></span>
						</div>
						<!-- 下载 -->
						<div class="icon-root">
							<span style="margin-left:10px" v-if="videoHelper" @click="videoHelper.download()"
								class="icon_controller_s nasIcons icon-download"></span>
						</div>
					</div>
				</div>
				<div class="controller-section-r">
					<!-- 音量 -->
					<Poptip class="nas-mobile-none" trigger="hover" v-if="playCanUse" :title="$t('video.volumn')">
						<div class="icon-root">
							<span v-if="!isMuted" @click="videoHelper.setMuted(true)"
								class="icon_controller_m nasIcons icon-sound-on"></span>
							<span v-else @click="videoHelper.setMuted(false)"
								class="icon_controller_m nasIcons icon-sound-off"></span>
						</div>
						<template #content>
							<div style="padding-left:14px;padding-right:14px">
								<Slider @on-change="setVolume" :min="0" :max="1" :step="0.1" v-model="currentVolume"
									show-tip="never">
								</Slider>
							</div>
						</template>
					</Poptip>


					<!-- 音轨 -->
					<Poptip v-if="playCanUse" :title="$t('movie.audioIndex')">
						<div class="icon-root">
							<span class="icon_controller_m nasIcons icon-music"></span>
						</div>
						<template #content>
							<!-- 声道数量显示 -->
							<a @click="chooseAc" class="option-item">{{ $t('movie.audioChannel') }}:{{
								audioChannel
							}}</a>
							<!-- 音轨选择 -->
							<div style="height:150px;overflow-y: scroll;">
								<div class="option-item" v-for="(item, index) in currentAudioStreamList"
									@click="chooseAudio(index)" :key="item.value">
									<p>{{ item.label }}</p>
									<Icon style="margin-left:3px" v-if="index == audioStreamIndex" type="md-checkmark"
										size="20" color="#333" />
								</div>
							</div>
						</template>
					</Poptip>


					<!-- 字幕 -->
					<Poptip v-if="playCanUse" :title="$t('movie.subtitle')">
						<div class="icon-root">
							<span class="icon_controller_l nasIcons icon-subtitles"></span>
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
							<div style="height:150px;overflow-y: scroll;"
								v-if="currentSubtitleStreamList && currentSubtitleStreamList.length > 0">
								<div class="option-item" v-for="(item, index) in currentSubtitleStreamList"
									@click="chooseSubtitle(index)" :key="index">
									<p class="subtitleTitle">
										{{ item.label.length > 15 ? "..." + item.label.substr(item.label.length - 14) :
											item.label }}
									</p>
									{{ item.language ? '-' + item.language : '' }}
									<Icon style="margin-left:3px"
										v-if="index == subtitleStreamIndex && !uploadSubtitleFilePath && !isCloseSubtitle"
										type="md-checkmark" size="20" color="#333" />
								</div>
							</div>
							<!-- 上传字幕文件 -->
							<Upload :on-error="onUploadErr" :on-success="onUploadSuc" :show-upload-list="false"
								:action="normalUploadUrl" :before-upload="onSubtitleBeforeUpload"
								:format="['ass', 'srt', 'vtt']" accept=".ass,.srt,.vtt" :webkitdirectory="false">
								<Button icon="ios-cloud-upload-outline">{{ $t('movie.selectLocalSubtitles') }}</Button>
							</Upload>
							<!-- 选择服务器上的字幕 -->
							<Button style="margin-top:10px" @click="showChooseSub()" icon="ios-cloud-upload-outline">{{
								$t('movie.selectSubtitleInServer')
							}}</Button>

						</template>
					</Poptip>


					<!-- 转码分辨率 -->
					<Poptip :title="$t('transcode')">
						<div class="icon-root">
							<span class="icon_controller_l nasIcons icon-hd"></span>
						</div>
						<template #content>
							<div class="size-list-root">
								<div class="option-item" @click="onChooseMovieSize(item.size, item.bitrate, index)"
									v-for="(item, index) in playSizeList" :key="item.label">
									<p>{{ item.label }}</p>
									<Icon style="margin-left:3px"
										v-if="item.size == movieSize && item.bitrate == videoBitRate" type="md-checkmark"
										size="20" color="#333" />
								</div>
							</div>
						</template>
					</Poptip>
					<!-- 播放速率 -->
					<Poptip v-if="playCanUse" :title="$t('movie.playRate')">
						<div class="icon-root">
							<span class="icon_controller_m nasIcons icon-play-speed"></span>
						</div>
						<template #content>
							<div class="option-item" @click="videoHelper.changePlaySpeed(index)"
								v-for="(item, index) in playSpeedList" :key="item.value">
								<p>{{ item.label }}</p>
								<Icon style="margin-left:3px" v-if="item.value == playSpeed" type="md-checkmark" size="20"
									color="#333" />
							</div>
						</template>
					</Poptip>
				</div>
			</div>
		</div>

		<!-- 选择服务器上的字幕 -->
		<vs-dialog v-model="showChooseSubtitle" scroll :full-screen="isMobile">
			<template #header>
				<h4 style="font-size: 16px;">
					{{ $t('file.chooseFolder') + '[' + $t('file.doubleClickFolderEnter') + ']' }}
				</h4>
			</template>
			<file-select ref="fileSelector" v-if="showChooseSubtitle" parent="root" @onSelect='onSelectSubtitleFile'
				@onCancel="showChooseSubtitle = false" :fileType="0"
				:initPath="indexObj.path ? indexObj.path : ''"></file-select>
			<template #footer>
				<file-select-bar @back="$refs.fileSelector.goBack()" @select="$refs.fileSelector.onSelect()"
					@create="(newFolderName) => $refs.fileSelector.createNewFolder(newFolderName)"></file-select-bar>
			</template>
		</vs-dialog>

		<!-- exif信息板 -->
		<photo-exif :serverType="serverType" v-if="showExif && !fromFileBrower" :indexObj="indexObj"
			@closeExif="showExif = false"></photo-exif>

	</div>
</template>

<script>
import videoJS from "@/plugins/videoJs/video.min.js";
import "@/plugins/videoJs/video-js.min.css"
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
		photoExif

	},
	computed: {
		resolutionStr: function () {//分辨率提示字符串
			let str = this.$t('movie.resolution') + ":"
			if (this.movieSize == 1) {
				return str += this.$t('video.code_raw') + " [" + this.$t('video.rawPlayAlert') + "]"
			} else {
				return str += this.currentSizeOption ? this.currentSizeOption.label : ""
			}
		}
	},
	data() {
		return {
			moviePreferLanguage: "",
			burnSubtitle: false,//是否需要服务端烧录字幕
			showChoosePlaySize: false,//是否显示选择分辨率的抽屉组件
			isAddingHistory: false,
			showChooseSubtitle: false,
			canPlayRawFile: true,//是否支持源文件
			vPlayer: null,//videojs示例
			audioChannel: 2,//默认双声道
			openAsPage: false,
			serverType: "photo",
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
			movieSize: 1,
			isMuted: false, //是否为静音
			playCanUse: false,
			token: utils.getToken(),
			videoBitRate: 3584, //默认比特率
			currentSizeOption: null,
			utils: utils,
			baseUrl: axios.baseUrl, //服务器地址
			normalUploadUrl: axios.uploadUrl() + "&uploadSubtitle=1&overMode=over",
			currentIndex: 0,//当前播放索引
			photoList: [],//待播放列表
			showExif: false,
			indexObj: false, //当前的索引
			isPlaying: false, //播放状态
			isPlayingM3u8: false, //播放状态
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
			ifContinueAlertIndexId: "",
			skippedEnd: false,//当前视频是否已经执行过跳过片尾 防止多次触发的标记
			currentVideoStream: false,//当前的视频流信息
			clickObj: {
				firstTime: '', // mousedown的时间戳
				lastTime: '', // mouseup的时间戳
				isClick:false,
				isLongPress:false,
				longPressSpeedingMsg:null,
				longPressTimeOut:null
			}
		};
	},
	mounted() {
		//创建helper 给转码选项赋值
		this.videoHelper = new VideoHelper(this)
		this.playSpeedList = this.videoHelper.optionsPlaySpeed
		this.videoHelper.setKeyEvent(document)//设置键盘按键响应
		//设置当前正在播放视频的状态

		//以页面形式打开处理
		let passParams = this.$route.params
		if (passParams.passVideoList) {
			this.serverType = passParams.serverType
			this.playVideo(passParams.passVideoList, passParams.passPlayIndex)
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
		if (this.isPlayingM3u8) this.videoHelper.stopPlayId()
		this.videoHelper.onDestroy()

		//销毁videojs
		if (this.vPlayer) {
			this.vPlayer.dispose();
			this.vPlayer = null
		}
		document.onkeydown = null
	},
	methods: {
		onMouseDown: function () {
			console.log("onMouseDown")
			 this.clickObj.isLongPress=false
	   		 this.clickObj.firstTime = new Date().getTime()
			 this.clickObj.longPressTimeOut = setTimeout(() => {
				if(this.isPlaying){
					if(this.clickObj.longPressSpeedingMsg){
						this.clickObj.longPressSpeedingMsg()
					}
					this.clickObj.isLongPress=true
					//开始长按视频加速事件
        			this.vPlayer.playbackRate(4)
					// this.videoHelper.changePlaySpeed(6)
					this.clickObj.longPressSpeedingMsg = this.$Message.loading({
						content: this.$t('video.speedingPlay'),
						duration: 0
					});
				}
			 }, 300);
		},
		onMouseUp: function () {
			this.clickObj.lastTime = new Date().getTime()
			// 鼠标点击和抬起的时间差<200，或者选中文本为空时，可以触发点击
			if((this.clickObj.lastTime - this.clickObj.firstTime) >= 300 && this.clickObj.isLongPress){
				//正在长按加速 停止
				this.videoHelper.changePlaySpeed(2)
				this.clickObj.longPressSpeedingMsg()
			}
			if(this.clickObj.longPressSpeedingMsg){
				this.clickObj.longPressSpeedingMsg()
			}
			if(this.clickObj.longPressTimeOut){
				clearTimeout(this.clickObj.longPressTimeOut)
			}
		},

		//展示字幕选择
		showChooseSub() {
			this.showChooseSubtitle = true
		},
		onSubtitleBeforeUpload(file) {
			return new Promise((resolve, reject) => {
				this.normalUploadUrl = axios.uploadUrl() + "&uploadSubtitle=1&overMode=over&filename=" + file.name
				return resolve(file)
			})
		},
		//选择了服务器的字幕的回调
		onSelectSubtitleFile(filePath) {
			console.log(filePath)
			if (!filePath.endsWith('.ass') && !filePath.endsWith('.srt') && !filePath.endsWith('.vtt')) {
				this.showVsAlertDialog(this.$t('common.alert'), this.$t('movie.subtitleNoSupport'));
			} else {
				this.showChooseSubtitle = false
				this.videoHelper.onSelectServerSubtitlePath(filePath)
			}
		},
		setVolume(val) {
			this.videoHelper.changeVolume(val)
		},
		onUploadSuc(response) {//上传成功回调
			this.videoHelper.uploadSubtitleSuc(response)
		},
		onUploadErr() {//上传失败回调
			this.videoHelper.uploadSubtitleErr()
		},
		//关闭字幕
		closeSubtitle() {
			this.isCloseSubtitle = true
			this.uploadSubtitleFilePath = null
			this.videoSameNameSubtitleFilePath = null
			this.textTrackUrl = ''
			if (this.burnSubtitle) {
				console.log("关闭字幕 当前正在烧录字幕 并且正在转码 需要重新设置转码 让服务器关闭字幕烧录 ")
				//选择了图片字幕 需要服务端烧录 并且转码才可以显示 
				this.burnSubtitle = false
				this.playIndex(this.indexObj, true);
			}
			this.setSubtitleTrackUrl()
		},
		//设置是否需要字幕烧录参数
		setBurnState() {
			if (this.currentSubtitleStreamList.length > this.subtitleStreamIndex) {
				let selectedSubtitleIfNeedBurn = formatUtil.isPictureSubtitle(this.currentSubtitleStreamList[this.subtitleStreamIndex])
				this.burnSubtitle = selectedSubtitleIfNeedBurn
			} else {
				this.burnSubtitle = false
			}
		},
		chooseSubtitle(index) {
			this.isCloseSubtitle = false
			this.uploadSubtitleFilePath = null
			this.videoSameNameSubtitleFilePath = null
			this.subtitleStreamIndex = index

			let selectedSubtitle = this.currentSubtitleStreamList[index]
			if (selectedSubtitle.type == 'path') {
				//选择的是与视频同名的字幕文件
				console.log("选择的是与视频同名的字幕文件 非内置字幕")
				this.uploadSubtitleName = selectedSubtitle.label
				this.videoSameNameSubtitleFilePath = selectedSubtitle.value
			}
			//标记选择的字幕是否需要烧录
			let selectedSubtitleIfNeedBurn = formatUtil.isPictureSubtitle(this.currentSubtitleStreamList[this.subtitleStreamIndex])
			if (this.burnSubtitle || selectedSubtitleIfNeedBurn) {
				this.burnSubtitle = selectedSubtitleIfNeedBurn
				console.log("烧录状态 :", this.burnSubtitle)

				//选择了图片字幕 需要服务端烧录 并且转码才可以显示 
				this.playIndex(this.indexObj, true);
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

		onMouse(e) {
			this.noMoveTime = 0
		},
		videoClick() {
			if(this.clickObj.isLongPress){
				return
			}
			//如果自定义控制器处于展示状态 先隐藏
			this.noMoveTime = 0
			return this.showCustomController = !this.showCustomController
		},
		onChooseMovieSize(movieSize, bitrate, index) {
			this.showChoosePlaySize = false
			if (movieSize == 1) {
				if (!this.canPlayRawFile) {
					return this.showVsNotification(this.$t('video.videoIsNotSupportCoding'))
				}
				localStorage.setItem("lastPlayIsTransCode", "0")

				//如果正在转吗 则停止
				if (this.isPlayingM3u8) this.videoHelper.stopPlayId()

				//手动选择播放源文件 强制
				this.pauseVideo()
				this.setMovieSize(movieSize)
				this.playIndex(this.indexObj, false, false, true);
				if (this.seekSec > 0) {
					this.vPlayer.currentTime(this.seekSec)
				}
				this.vPlayer.autoplay('play')
				// this.uploadSubtitleName = null
				// this.uploadSubtitleFilePath = null
				// if (this.videoSameNameSubtitleFilePath) {
				// 	//之前选的是视频同名字幕 播放源文件的时候要恢复为默认第一个字幕
				// 	this.subtitleStreamIndex = 0
				// 	this.videoSameNameSubtitleFilePath = null
				// }
			} else {
				this.currentSizeOption = this.playSizeList[index]
				//保存一下是转码播放 切换视频后默认转码
				localStorage.setItem("lastPlayIsTransCode", "1")
				this.pauseVideo()
				this.videoBitRate = bitrate
				this.setMovieSize(movieSize)
				this.playIndex(this.indexObj, true);
				//保存用户选的分辨率
				localStorage.setItem('lastPlayMovieSize', movieSize)
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
			this.playIndex(this.indexObj, localStorage.lastPlayIsTransCode && localStorage.lastPlayIsTransCode == "1");
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
				this.showVsNotification(this.$t("video.noMoreVideo"))
				return false;
			}
			this.currentIndex = nextIndex;
			this.videoHelper.resetValue()
			this.vPlayer.autoplay('play')
			this.movieSize = this.videoHelper.getVideoSuitResolution(this.indexObj)
			this.playIndex(this.indexObj, localStorage.lastPlayIsTransCode && localStorage.lastPlayIsTransCode == "1");
			return true;
		},
		errorCb(err) {

			console.log("！！1errorCb")
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
			console.log("onLoadedDataCb")
			console.log(this.vPlayer)
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
		//添加播放历史
		addHistory(time) {
			if (this.isAddingHistory || time < 5) return
			if (!this.indexObj || !this.indexObj.id) {
				return
			}
			this.isAddingHistory = true
			this.api
				.post('/api/movieApi/addHistory', {
					hideLoading: true,
					indexId: this.indexObj.id,
					time: time
				}).then((res) => {
					setTimeout(() => {
						this.isAddingHistory = false
					}, 1000);
				}).catch(err => {
					this.isAddingHistory = false
				})
		},
		onTimeUpdateCb() {
			if (!this.isPlaying) return
			this.noMoveTime += 1
			if (this.noMoveTime >= 60 && this.isPlaying) {
				//一段时间没有移动 隐藏自定义控制
				this.showCustomController = false
			}
			this.seekSec = this.vPlayer.currentTime()
			//n秒保存一次当前播放位置
			if (this.seekSec && parseInt(this.seekSec) % 15 == 0) {
				if (this.serverType == "movie" && !this.fromFileBrower && !this.fromFileBrower) {
					this.addHistory(this.seekSec)
				}
			}

			//如果设置了自动跳过片尾
			if (this.indexObj.skip_open_end == 1 && !this.skippedEnd) {
				let leftSeconds = this.indexObj.duration - this.seekSec
				if (this.indexObj.end_duration > 0 && this.indexObj.end_duration > leftSeconds) {
					this.skippedEnd = true
					return this.onNext()
				}
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
					errorDisplay: false,
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
						console.log("出现错误", e)
						//视频错误监听事件
						let errObj = that.vPlayer.error()
						if (errObj && (errObj.code == 4 || errObj.code == 3)) {
							that.canPlayRawFile = false
							//设置源不支持 转换转码播放
							if (that.movieSize == 1) {
								//之前是源文件 转码试试
								that.playIndex(that.indexObj, true)
								that.showVsNotification(that.$t("video.autoTranscodeStart"))
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
						console.log(that.vPlayer)
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
				this.isPlayingM3u8 = true
				formatUtil.setFormatState('m3u8')
				this.vPlayer.src({
					type: 'application/x-mpegURL',
					src: url
				})
				if (this.seekSec > 5) {
					this.vPlayer.currentTime(this.seekSec)
				}
			} else {
				this.isPlayingM3u8 = false
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
			this.movieSize = sizeValue
		},
		//获取转码url
		getTransCodeUrl() {
			//原来播放的是原始 现在转码 
			if (this.movieSize == 1) {
				this.setMovieSize(this.videoHelper.getVideoSuitResolution(this.indexObj))
			}
			let transFormat = formatUtil.getTranscodeFormat(this.indexObj)
			let indexObj = this.indexObj
			let prifixPart = `${axios.baseUrl}/api/transCode/play/stream.${transFormat}?format=${transFormat}&`
			if (transFormat == 'm3u8') {
				prifixPart += `playId=${this.playId}&`
			}
			let lastPart = `&token=${this.token}&size=${this.movieSize}&seek=${this.seek}&videobit=${this.videoBitRate}&subtitleIndex=${this.subtitleStreamIndex}&audioIndex=${this.audioStreamIndex}&ac=${this.audioChannel}`
			if (this.burnSubtitle) {
				//设置为1 告诉服务器需要烧录字幕
				lastPart += `&burn=1`
			}
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
			let selectedSubtitleObj
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
				if (this.burnSubtitle) {
					this.burnSubtitle = false
					this.playIndex(this.indexObj, true);
				}
			} else if (this.videoSameNameSubtitleFilePath) {
				//使用的是视频同名字幕
				this.isCloseSubtitle = false
				subtitleUrl += `&subtitleFile=${axios.encodePath(this.videoSameNameSubtitleFilePath)}`
				if (this.burnSubtitle) {
					this.burnSubtitle = false
					this.playIndex(this.indexObj, true);
				}
			} else {
				if (this.currentSubtitleStreamList.length <= this.subtitleStreamIndex) {
					return this.textTrackUrl = ""
				}
				selectedSubtitleObj = this.currentSubtitleStreamList[this.subtitleStreamIndex]
				//使用了图片字幕
				if (formatUtil.isPictureSubtitle(selectedSubtitleObj)) {
					this.textTrackUrl = ""
					return
				}
			}

			this.textTrackUrl = subtitleUrl
			let srcLan = 'en'
			let label = 'subtitle'
			if (selectedSubtitleObj && selectedSubtitleObj.stream && selectedSubtitleObj.stream.tags) {
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
			this.skippedEnd = false
			if (seekValue) {
				this.seek = seekValue
			} else {
				this.seek = this.seekSec
			}
			// 为影片设置合适的分辨率选项
			this.videoHelper.setSuitSizeOptions(indexObj)
			this.playCanUse = false
			this.isPlaying = false
			this.indexObj = indexObj
			this.currentAudioStreamList = []
			this.currentSubtitleStreamList = []
			let settingPlayUrl = () => {
				this.canPlayRawFile = formatUtil.getCanPlayRawFile(
					this.currentVideoStream,
					this.indexObj,
					this.currentAudioStreamList[this.audioStreamIndex],
					this.currentSubtitleStreamList[this.subtitleStreamIndex],
					this.uploadSubtitleFilePath)
				console.log("canPlayRawFile", this.canPlayRawFile)
				if (!playTransCode) {
					if (!forcePlayRaw && !this.canPlayRawFile) {
						console.log('不能播放源文件 强制转码')
						//不能播源文件 自动切换为转码
						this.setBurnState()
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
				//每个索引只询问一次是否继续播放
				if (this.serverType == "movie" && this.ifContinueAlertIndexId != this.indexObj.id) {
					this.ifContinueAlertIndexId = this.indexObj.id
					this.ifContinuPlay()
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
							this.indexObj = {
								...this.indexObj,
								...res.data
							}
							//首选语言
							if (res.moviePreferLanguage) {
								this.moviePreferLanguage = res.moviePreferLanguage
							}
							console.log("this.moviePreferLanguage", this.moviePreferLanguage)
							this.videoHelper.parseAudioAndSubtitles()
							settingPlayUrl()
							//如果设置了自动跳过片头
							if (this.indexObj.skip_open_end == 1) {
								if (this.indexObj.open_duration > 0 && this.indexObj.open_duration < (this.indexObj.duration - 10)) {
									console.log("跳过片头:" + this.indexObj.open_duration)
									this.changeSeekFromSlider(this.indexObj.open_duration)
									return this.showVsNotification(this.$t('movie.skippingMovieTitle'))
								}
							}
						}
					})
			} else if (this.fromFileBrower) {
				let params = { 'filePath': indexObj.filePath }
				indexObj.filename = indexObj.name || indexObj.filename
				//从文件夹来的 没有索引 需要先获取视频信息 解析字幕音频轨等
				this.api.post('/api/transCode/getVideoInfoByPath', params).then((res) => {
					if (!res.code) {
						//首选语言
						if (res.moviePreferLanguage) {
							this.moviePreferLanguage = res.moviePreferLanguage
						}
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
		//询问用户是否继续播放
		ifContinuPlay() {
			if (this.serverType == "photo") {
				return
			}
			// 查询上次播放进度
			if (this.indexObj && this.indexObj.id) {
				this.api
					.post('/api/movieApi/getHistory', {
						hideLoading: true,
						indexId: this.indexObj.id
					}).then((res) => {
						if (!res.code) {
							let history = res.data
							if (history) {
								//如果上次的观看历史在片头或片尾的范围内 则不提示了
								let openDuration = this.indexObj.open_duration ? parseInt(this.indexObj.open_duration) : 30
								let endDuration = this.indexObj.end_duration ? parseInt(this.indexObj.end_duration) : 30
								if (history.time > openDuration && history.time < (this.indexObj.duration - endDuration)) {
									//询问用户是否恢复进度
									this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('movie.continuePlay', {
										lastTime: utils.formatSeconds(history.time)
									}), () => {
										//继续播放
										this.changeSeekFromSlider(history.time)
									}, null, this.$t('movie.resumePlay'), this.$t('movie.playBegain'))
								}

							}
						}
					}).catch(err => {
					})
			}
		},
		playVideo(photoList, index) {//外部调用播放视频的入口

			this.currentIndex = index;
			this.photoList = photoList;
			this.indexObj = photoList[index];
			this.playSizeList = []
			if (this.indexObj.spaceId) {
				this.fromPrivateSpace = true
			}
			// this.playIndex(this.indexObj, localStorage.lastPlayIsTransCode && localStorage.lastPlayIsTransCode == "1");
			localStorage.lastPlayIsTransCode = "0"
			this.playIndex(this.indexObj, false);
		}
	},
};
</script>

<style lang="scss" scoped>
@import './videoDetail.scss'
</style>
