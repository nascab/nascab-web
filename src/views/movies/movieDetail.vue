<template>
	<div class="movie-detail-root">
		<!-- 关闭按钮 -->
		<vs-button icon class="closs-btn" @click="$emit('onClose')">
			<Icon type="md-close-circle" size="25" />
		</vs-button>
		<!-- myheader占位 -->
		<div class="main-layout">
			<!-- 上部电影信息区域 -->
			<!-- 海报 手机端 自己占用一行 -->
			<div class="nas-mobile-show">
				<div
					style="width:100%;margin-bottom:40px;display:flex;align-items:center;flex-direction:column;position: relative;">
					<img style="width:100%;object-fit:contain;border-radius: 10px;" v-lazy="movieIndexObj.url"
						@click="playMovie()" />
					<!-- 电影评分 -->
					<div v-if="movieIndexObj.movie_douban_score && movieIndexObj.movie_douban_score > 0"
						class="movie-score-bg">
						<span class="movie-score">{{
							movieIndexObj.movie_douban_score
						}}</span>
					</div>
					<!-- 手机端播放按钮-->
					<img src="@/static/icon_play.png" @click="playMovie()"
						style="width:60px;height:60px;position:absolute;bottom: -30px;right: 30px;" />
				</div>
			</div>
			<Card style="width: 100%;" class="top-root-card">
				<div class="top-root">
					<div class="poster-parent nas-mobile-none">
						<!-- 电影截图/海报 -->
						<img class="img-poster" v-lazy="movieIndexObj.url" @click="playMovie()" />

						<!-- 电影评分 -->
						<div v-if="movieIndexObj.movie_douban_score && movieIndexObj.movie_douban_score > 0"
							class="movie-score-bg">
							<span class="movie-score">{{
								movieIndexObj.movie_douban_score
							}}</span>
						</div>


						<!-- 豆瓣/imdb跳转 -->
						<div style="position: absolute;top: 10px;left: 10px;">
							<img v-if="movieIndexObj.movie_douban_id"
								@click.stop="utils.checkDouban(movieIndexObj.filename, parseInt(movieIndexObj.movie_douban_id))"
								style="width: 30px;height: 30px;cursor: pointer;" src="@/static/social-douban.png" />
							<img v-if="movieIndexObj.movie_imdb_id"
								@click.stop="utils.checkImdb(movieIndexObj.filename, movieIndexObj.movie_imdb_id)"
								style="border-radius: 5px; width: 30px;height: 30px;margin-left: 10px;cursor: pointer;"
								src="@/static/icon_imdb.png" />
						</div>
						<img src="@/static/icon_play.png" @click="playMovie()"
							style="width:60px;height:60px;position:absolute;cursor: pointer;" />
					</div>
					<!-- 电影名/电影信息 -->
					<div class="top-movie-info-root">
						<!-- 匹配名称 -->
						<div class="movie-info-item-header" v-if="movieIndexObj.movie_info_name || movieIndexObj.filename">
							<div class="movie-info-item-content enable-text-select">{{ movieIndexObj.movie_info_name ||
								movieIndexObj.filename }}
								<span v-if="movieIndexObj.movie_year">({{ parseInt(movieIndexObj.movie_year)
								}})</span>
								<span v-if="movieIndexObj.movie_regions">({{ movieIndexObj.movie_regions }})</span>
								<span v-if="movieIndexObj.movie_release_date">({{ movieIndexObj.movie_release_date
								}})</span>
								<span v-if="movieIndexObj.movie_language">({{ movieIndexObj.movie_language
								}})</span>
								<span v-if="movieIndexObj.movie_release_date">({{ movieIndexObj.movie_release_date
								}})</span>
								<!-- 信息有误? -->
								<a style="margin-left:10px;color:#99AABF;" v-if="movieIndexObj.movie_info_name"
									@click="onSearchMovieInfo">{{
										$t('movie.wrongInfo')
									}}?</a>
							</div>
						</div>
						<!-- 文件名 -->
						<div class="movie-info-item" v-if="movieIndexObj.filename">
							<div class="movie-info-item-title">{{ $t('common.folder') }}:</div>
							<p class="movie-info-item-content enable-text-select">{{ movieIndexObj.path }}</p>
						</div>
						<div class="movie-info-item" v-if="movieIndexObj.filename">
							<div class="movie-info-item-title">{{ $t('common.file') }}:</div>
							<p class="movie-info-item-content enable-text-select">{{ movieIndexObj.filename }}</p>
						</div>
						<!-- 时长 大小 -->
						<div class="movie-info-item">
							<div class="movie-info-item-title">{{ $t('video.duration') }}:</div>
							<span class="movie-info-item-content">{{ utils.formatSeconds(movieIndexObj.duration)
							}}<span>
									[{{ utils.getSizeStr(movieIndexObj.size) }}]</span></span>

						</div>

						<!-- 未找到电影信息 是会员 提示未找到-->
						<div class="no-movie-info" v-if="!movieIndexObj.movie_info_name && vipInfo">
							{{ $t('movie.noMovieInfoFound') }}
							<a style="margin-left:10px;color:#99AABF;" @click="showSearchMovieInfo = true">{{
								$t('common.search')
							}}</a>
						</div>
						<!-- 未找到电影信息 还不是会员 提示升级可以自动匹配 -->
						<div class="no-movie-info" v-if="!movieIndexObj.movie_info_name && !vipInfo">
							{{ $t('movie.upgradeAutoMatch') }}
							<a style="margin-left:10px;color:#99AABF" @click="goToSetting('nasAccount')">{{
								$t('nascab.upgrade')
							}}</a>
						</div>

						<!-- 又名 -->
						<div class="movie-info-item" v-if="movieIndexObj.movie_alias">
							<div class="movie-info-item-title">{{ $t('movie.alias') }}:</div>
							<p class="movie-info-item-content">{{ movieIndexObj.movie_alias }}</p>
						</div>
						<!-- 导演 -->
						<div class="movie-info-item" v-if="movieIndexObj.movie_director">
							<div class="movie-info-item-title">{{ $t('movie.director') }}:</div>
							<p class="movie-info-item-content">{{ movieIndexObj.movie_director }}</p>
						</div>
						<!-- 主演 -->
						<div class="movie-info-item" v-if="movieIndexObj.movie_actor">
							<div class="movie-info-item-title">{{ $t('movie.actors') }}:</div>
							<p class="movie-info-item-content">{{ movieIndexObj.movie_actor }}</p>
						</div>

						<!-- 类型 -->
						<div class="movie-info-item" v-if="movieIndexObj.movie_genres">
							<div class="movie-info-item-title">{{ $t('movie.genres') }}:</div>
							<p class="movie-info-item-content">{{ movieIndexObj.movie_genres }}</p>
						</div>
						<!-- 剧情简介 -->
						<div class="movie-info-item" v-if="movieIndexObj.movie_storyline">
							<div class="movie-info-item-title">{{ $t('movie.storyline') }}:</div>
							<p class="movie-info-item-content">{{ movieIndexObj.movie_storyline }}</p>
						</div>
						<!-- nfo位置 -->
						<div class="movie-info-item" v-if="movieIndexObj.nfoFullPath">
							<div class="movie-info-item-title">NFO {{$t("common.file")}}:</div>
							<p class="movie-info-item-content enable-text-select">{{ movieIndexObj.nfoFullPath }}</p>
						</div>
					</div>
				</div>
				
				<div style="position:absolute;right: 10px;bottom: 10px;">
					<!-- 删除nfo -->
					<a v-if="movieIndexObj.nfoFullPath" @click="deleteNfoFile" style="margin-right:20px">{{$t("common.delete")}} nfo {{$t("common.file")}}</a>

					<!-- 清除电影信息 -->
					<a v-if="movieIndexObj.movie_info_name && !movieIndexObj.nfoFullPath" 
						@click="clearMovieInfo">{{
							$t('movie.clearMovieInfo')
						}}</a>
				</div>
				
			</Card>
			<!-- 同文件夹内海报 -->
			<Card class="mid-root" v-if="sameFolderImgList && sameFolderImgList.length > 0">
				<div class="recent-title">
					{{ $t('movie.relatedPictures') }}
				</div>
				<vue-horizontal class="recent-root">
					<div class="recent-card-item" v-for="(poster, index) in sameFolderImgList"
						@click.stop="goPreviewImage(index)">
						<img v-lazy="poster" />
					</div>
				</vue-horizontal>
			</Card>
			<!-- 其他剧集 -->
			<Card class="mid-root" v-if="otherTv && otherTv.length > 0">
				<div class="recent-title" style="display: flex;justify-content: space-between;">
					<span>{{ $t('movie.otherTv') }}</span>
					<my-search :placeholder="$t('movie.searchPlaceHolder')" @onSearch="onSearchOtherTv"></my-search>

				</div>
				<div class="othertv-root">
					<div v-for="(movie, index) in otherTv" style="margin-top: 20px;" v-if="!movie.hide">
						<div style="display: flex;flex-direction:row;" @click.stop="tvListClick(index)">
							<img v-lazy="movie.url" class="other-tv-cover">
							<div style="display:flex;flex-direction:column;margin-left:10px;justify-content: center;">

								<div class="movie-name">{{ movie.filename }}</div>

								<!-- 电影文件大小 -->
								<span style="flex-shrink:0;margin-top: 10px;"><span v-if="movie.movie_info_name"
										style="margin-right:10px">{{ movie.movie_info_name }}</span>[{{
											utils.formatSeconds(movie.duration) }}][{{
		utils.getSizeStr(movie.size) }}]</span>
								<div class="max-line-two" style="flex-shrink:0;margin-top: 10px;"
									v-if="movie.movie_storyline">{{ movie.movie_storyline }}</div>
							</div>

						</div>
					</div>
				</div>
			</Card>
			<!-- 最近播放 -->
			<Card class="mid-root " v-if="recentMovies && recentMovies.length > 0">
				<div>
					<div class="recent-title">
						{{ $t('movie.recentPlay') }}
						<Icon color="#99AABF" v-if="!showRecentList" @click="setShowRecent(1)" type="md-eye-off" size="20"
							style="cursor: pointer;margin-left: 5px;" />
						<Icon color="#99AABF" v-else @click="setShowRecent(0)" type="md-eye" size="20"
							style="cursor: pointer;margin-left: 5px;" />
					</div>
					<vue-horizontal v-if="showRecentList" class="recent-root">
						<div class="recent-card-item " style="height:100%;" @click.stop="recentMovieClick(index)"
							v-for="(movie, index) in recentMovies">
							<img v-lazy="movie.url" />
							<div class="movie-name max-line-one">{{ movie.filename }}</div>
						</div>
					</vue-horizontal>
				</div>
			</Card>
			<!-- 电影流信息 -->
			<Card class="bottom-root" v-if="movieIndexObj && movieIndexObj.stream_info">

				<!-- stream 流信息 -->
				<div class="recent-title">
					{{ $t('movie.mediaInfo') }}
				</div>
				<vue-horizontal class="stream-root">
					<Card class="stream-item-card" v-for="stream in movieIndexObj.stream_info"
						v-if="stream.codec_type == 'video' || stream.codec_type == 'audio' || stream.codec_type == 'subtitle'">
						<div
							style="display: flex;align-items: center;justify-content: left;font-size: 16px;margin-bottom: 10px;">
							<Icon style="margin-right:5px" size="16" v-if="stream.codec_type == 'video'"
								type="md-videocam" />
							<Icon style="margin-right:5px" size="16" v-if="stream.codec_type == 'audio'"
								type="md-volume-up" />
							<Icon style="margin-right:5px" size="16" v-if="stream.codec_type == 'subtitle'"
								type="md-bookmark" />
							<span v-if="stream.codec_type == 'video'">{{ $t('movie.streamVideo')
							}}</span>
							<span v-if="stream.codec_type == 'audio'">{{ $t('movie.streamAudio')
							}}</span>
							<span v-if="stream.codec_type == 'subtitle'">{{ $t('movie.subtitle')
							}}</span>
						</div>
						<!-- 视频信息列表 -->
						<div v-if="stream.codec_type == 'video'"
							style="display:flex;flex-direction:column;align-items: flex-start;">
							<!-- 分辨率 -->
							<p v-if="stream.width && stream.height" class="stream-info-title">
								{{ $t('movie.resolution') }}:<span class="stream-info-content">{{
									stream.width
								}}x{{ stream.height }}</span>
							</p>
							<!-- 视频比例 -->
							<p v-if="stream.display_aspect_ratio" class="stream-info-title">
								{{ $t('movie.displayRatio') }}:<span class="stream-info-content">{{
									stream.display_aspect_ratio
								}}</span>
							</p>
							<!-- 编码名字 -->
							<p v-if="stream.codec_name" class="stream-info-title">
								{{ $t('movie.codecName') }}:<span class="stream-info-content">{{
									stream.codec_name
								}}</span>
							</p>
							<!-- 帧率 -->
							<p v-if="stream.r_frame_rate" class="stream-info-title">
								{{ $t('movie.frameRate') }}:<span class="stream-info-content">{{
									stream.r_frame_rate
								}}</span>
							</p>
							<!-- 像素格式 -->
							<p v-if="stream.pix_fmt" class="stream-info-title">
								{{ $t('movie.pixFmt') }}:<span class="stream-info-content">{{ stream.pix_fmt
								}}</span>
							</p>
							<!-- Level -->
							<p v-if="stream.level" class="stream-info-title">
								Level:<span class="stream-info-content">{{ stream.level
								}}</span></p>
						</div>

						<!-- 音频信息列表 -->
						<div v-if="stream.codec_type == 'audio'"
							style="display:flex;flex-direction:column;align-items: flex-start;">
							<!-- 标题 -->
							<p v-if="stream.tags && stream.tags.title" class="stream-info-title">
								{{ $t('common.title') }}:<span class="stream-info-content">{{
									stream.tags.title
								}}</span>
							</p>
							<!-- 声道步距 -->
							<p v-if="stream.channel_layout" class="stream-info-title">
								{{ $t('movie.channelLayout') }}:<span class="stream-info-content">{{
									stream.channel_layout
								}}</span>
							</p>
							<!-- 声道数量 -->
							<p v-if="stream.channels" class="stream-info-title">
								{{ $t('movie.channels') }}:<span class="stream-info-content">{{
									stream.channels
								}}</span>
							</p>
							<!-- 码率 -->
							<p v-if="stream.tags && stream.tags.BPS" class="stream-info-title">
								{{ $t('movie.bitrate') }}:<span class="stream-info-content">{{
									stream.tags.BPS
								}}</span>
							</p>
							<!-- 编码名字 -->
							<p v-if="stream.codec_name" class="stream-info-title">
								{{ $t('movie.codecName') }}:<span class="stream-info-content">{{
									stream.codec_name
								}}</span>
							</p>
							<!-- 语言 -->
							<p v-if="stream.tags && stream.tags.language" class="stream-info-title">
								{{ $t('setting.language') }}:<span class="stream-info-content">{{
									stream.tags.language
								}}</span>
							</p>
						</div>

						<!-- 字幕信息列表 -->
						<div v-if="stream.codec_type == 'subtitle'"
							style="display:flex;flex-direction:column;align-items: flex-start;">
							<!-- 标题 -->
							<p v-if="stream.tags && stream.tags.title" class="stream-info-title">
								{{ $t('common.title') }}:<span class="stream-info-content">{{
									stream.tags.title
								}}</span>
							</p>
							<!-- 编码名字 -->
							<p v-if="stream.codec_name" class="stream-info-title">
								{{ $t('movie.codecName') }}:<span class="stream-info-content">{{
									stream.codec_name
								}}</span>
							</p>
							<!-- 语言 -->
							<p v-if="stream.tags && stream.tags.language" class="stream-info-title">
								{{ $t('setting.language') }}:<span class="stream-info-content">{{
									stream.tags.language
								}}</span>
							</p>

						</div>
					</Card>
				</vue-horizontal>
			</Card>

		</div>
		<Modal v-model="showVideoDetail" fullscreen footer-hide>
			<video-detail propsServerType="movie" v-if="showVideoDetail" @onClose="showVideoDetail = false"
				ref="videoPlayer"></video-detail>
		</Modal>

		<Modal v-model="showSearchMovieInfo" footer-hide>
			<h4 style="font-size: 16px;">
				{{ $t('movie.matchMovieInfo') }}
			</h4>
			<search-movie-info :movieIndexObj="movieIndexObj" v-if="showSearchMovieInfo"
				@onClose="showSearchMovieInfo = false" ref="searchMovieInfo" @onMovieInfoSelected="init">
			</search-movie-info>
		</Modal>


		<!-- 照片详情弹窗 -->
		<Modal v-model="showPhotoDetail" fullscreen footer-hide style="background-color: transparent;">
			<photo-detail v-if="showPhotoDetail" @onClose="showPhotoDetail = false" :fromFolderBrower="true"
				ref="photoDetail"></photo-detail>
		</Modal>
	</div>
</template>

<script>
import myHeader from "@/components/my-header/my-header.vue"
import utils from "@/plugins/utils";
import VueHorizontal from "vue-horizontal";

import videoDetail from "@/views/videoDetail/videoDetail.vue";
import searchMovieInfo from "@/views/movies/components/searchMovie.vue";
import photoDetail from "@/views/photos/components/photoDetail.vue";

import jsBridge from "@/plugins/jsBridge"

export default {
	props: {
		propsDetailMovieList: {
			default: () => { return [] },
			type: Array
		},
		propsDetailIndex: {
			default: 0
		}
	},
	data() {
		return {

			showPhotoDetail: false,
			openAsPage: false,
			detailMovieList: [],
			detailIndex: [],
			otherTv: false,
			vipInfo: false,
			showSearchMovieInfo: false,
			showRecentList: true,
			movieList: [],
			currentIndex: false,
			showVideoDetail: false,
			movieIndexObj: '',
			hasContinuePlay: false,
			recentMovies: [],
			lastProgressStr: '',
			sameFolderImgList: [],
		}
	},
	components: {
		VueHorizontal,
		photoDetail,
		myHeader,
		videoDetail,
		searchMovieInfo
	},
	mounted() {
		let passParams = this.$route.params
		//兼容弹窗模式打开 从props传进来属性
		if (this.propsDetailMovieList.length > 0) {
			this.detailMovieList = this.propsDetailMovieList
			this.detailIndex = this.propsDetailIndex
		} else if (passParams.detailMovieList) {
			//兼容页面模式打开
			this.detailMovieList = passParams.detailMovieList
			this.detailIndex = passParams.detailIndex
			this.openAsPage = true
		} else {
			//没传参数 跳回到电影列表
			return this.$router.go(-1)
		}

		this.movieList = this.detailMovieList
		this.currentIndex = this.detailIndex
		this.init()
	},
	beforeDestroy() {
	},
	methods: {
		deleteNfoFile(){
			//删除nfo文件接口
			if(!this.movieIndexObj.nfoFullPath){
				return
			}
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('movie.confirClearMovieInfo'), () => {
				this.api
				.post("/api/file/deleteByPath", {
					fullPath: this.movieIndexObj.nfoFullPath
				}).then((res) => {
					this.init()
				}).catch(err => {})
			})
		},
		onSearchMovieInfo(){
			if(this.movieIndexObj.nfoFullPath){
				return this.showVsNotification(this.$t("movie.deleteNfoFirst"))
			}
			this.showSearchMovieInfo=true
		},
		onSearchOtherTv(searchValue) {
			console.log("searchValue", searchValue)
			if (!this.otherTv) { return }
			for (let i in this.otherTv) {
				if (!searchValue) {
					this.otherTv[i].hide = false
					continue
				}
				if (!this.otherTv[i].filename.includes(searchValue)) {
					this.otherTv[i].hide = true
				} else {
					this.otherTv[i].hide = false
				}
			}
			console.log(this.otherTv)
			this.$forceUpdate()
		},
		goPreviewImageCover() {
			//将文件对象包装为indexObj的格式 方便使用一套代码展示 从物理路径跳过去无法使用加入回收站功能 因为没有indexId
			let useList = [{
				title: 1,
				type: 1,
				url: this.movieIndexObj.url
			}]
			console.log(useList)
			this.showPhotoDetail = true;
			this.$nextTick(() => {
				this.$refs.photoDetail.showImg(useList, 0, true);
			});
			this.pushState()
		},
		//点击了图片 跳转到图片详情
		goPreviewImage(index) {
			//将文件对象包装为indexObj的格式 方便使用一套代码展示 从物理路径跳过去无法使用加入回收站功能 因为没有indexId
			let useList = []
			for (let i = 0; i < this.sameFolderImgList.length; i++) {
				useList.push({
					title: i + "",
					type: 1,
					url: this.sameFolderImgList[i]
				})
			}
			this.showPhotoDetail = true;
			this.$nextTick(() => {
				this.$refs.photoDetail.showImg(useList, index);
			});
			this.pushState()
		},
		goToSetting(pageName) {
			if (this.$store.state.currentUser.is_admin == 1) {
				this.$router.push({
					path: "/setting",
					query: {
						pageName: pageName,
					},
				});
			} else {
				this.showVsNotification(this.$t('common.noPermission'))
			}
		},
		goBack() {
			if (this.openAsPage) this.$router.go(-1)
			else this.$emit('onClose')
		},
		clickType() {
			if (this.movieIndexObj.is_tvplay == 1) {
				//切换为电影
				this.$emit('onMarkType', 2, this.movieIndexObj.id)
			} else {
				//切换为电视剧
				this.$emit('onMarkType', 1, this.movieIndexObj.id)
			}
		},
		clearMovieInfo() {
			if(this.movieIndexObj.nfoFullPath){
				return this.showVsNotification(this.$t("movie.deleteNfoFirst"))
			}
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('movie.confirClearMovieInfo'), () => {
				this.api
					.post("/api/movieApi/setMovieInfo", {
						indexId: this.movieIndexObj.id,
						movieJson: '{}'
					})
					.then((res) => {
						if (!res.code) {
							this.init()
						}
					})
					.catch((error) => { });
			})
		},
		setShowRecent(isShow) {
			this.showRecentList = isShow
			localStorage.setItem('moviedetail-showRecentList', isShow)
		},
		init() {
			this.showVideoDetail = false
			this.hasContinuePlay = false
			this.recentMovies = []
			this.lastProgressStr = ''
			this.movieIndexObj = this.movieList[this.currentIndex]
			this.getIndexDetail()
			this.checkCanContinue()
			this.showRecentList = localStorage.getItem('moviedetail-showRecentList') == 1
		},
		onPageScroll(e) {
			if (this.showVideoDetail) {
				return
			}
		},
		playMovie() {
			console.log("this.movieList", this.movieList)

			if (localStorage.getItem("rawPlayer") == "1") {
				//调用原生播放器
				jsBridge.playVideo(JSON.stringify({
					playIndex: this.currentIndex,
					playList: this.movieList,
					token: this.$store.state.token,
					fromFileBrower: false,
					serverType: "movie"
				}))
			} else {
				//继续使用网页播放器
				this.showVideoDetail = true;
				this.$nextTick(() => {
					this.$refs.videoPlayer.playVideo(this.movieList, this.currentIndex);
				});
				this.pushState()
			}
		},
		getIndexDetail() {
			this.api
				.post('/api/movieApi/getMovieDetail', {
					id: this.movieIndexObj.id,
					serverType: 'movie'
				}).then((res) => {
					if (!res.code) {
						if (res.movieIndex.stream_info && res.movieIndex.stream_info.length > 0) {
							res.movieIndex.stream_info = JSON.parse(res.movieIndex.stream_info)
						}
						this.movieIndexObj = {
							...this.movieIndexObj,
							...res.movieIndex
						}
						if (this.movieIndexObj.folder_cover_path) {
							// 看看有没有同文件夹下匹配的海报
							this.movieIndexObj.url = this.axios.getRawFileUrl(this.movieIndexObj.folder_cover_path, '', 'movie')
						} else if (this.movieIndexObj.movie_cover_path && this.movieIndexObj.movie_info_state == 1) {
							//如果有封面 则使用封面
							this.movieIndexObj.url = this.axios.getRawFileUrl(this.movieIndexObj.movie_cover_path, '', 'movie')
						} else {
							this.movieIndexObj.url = this.axios.getImgFullPath(this.movieIndexObj.id, true, this
								.movieIndexObj.filename, 'movie');
						}
						for (let i in res.recentMovies) {
							let url = this.axios.getImgFullPath(res.recentMovies[i].id, true, res.recentMovies[i]
								.filename, 'movie');
							let rawUrl = this.axios.getImgFullPath(res.recentMovies[i].id, false, res.recentMovies[
								i].filename, 'movie');
							res.recentMovies[i].rawUrl = rawUrl
							res.recentMovies[i].url = url
							if (res.recentMovies[i].folder_cover_path) {
								//没有封面 看看有没有同文件夹下匹配的海报
								res.recentMovies[i].url = this.axios.getRawFileUrl(res.recentMovies[i].folder_cover_path, '', 'movie')
							} else if (res.recentMovies[i].movie_cover_path) {
								//如果有封面 则使用封面
								res.recentMovies[i].url = this.axios.getRawFileUrl(res.recentMovies[i]
									.movie_cover_path, '', 'movie')
							}
						}
						this.recentMovies = res.recentMovies

						for (let i in res.tvplayList) {
							let url = this.axios.getImgFullPath(res.tvplayList[i].id, true, res.tvplayList[i]
								.filename, 'movie');
							let rawUrl = this.axios.getImgFullPath(res.tvplayList[i].id, false, res.tvplayList[
								i].filename, 'movie');
							res.tvplayList[i].rawUrl = rawUrl
							res.tvplayList[i].url = url
							if (res.tvplayList[i].folder_cover_path) {
								//看看有没有同文件夹下匹配的海报
								res.tvplayList[i].url = this.axios.getRawFileUrl(res.tvplayList[i].folder_cover_path, '', 'movie')
							}
						}
						this.otherTv = res.tvplayList
						if (this.otherTv && this.otherTv.length > 0) {
							let currentMovie = this.movieList[this.currentIndex]
							//当前是电视剧 要把播放列表替换为剧集去播放
							for (let i = 0; i < this.otherTv.length; i++) {
								if (currentMovie.id == this.otherTv[i].id) {
									this.currentIndex = i
									this.movieList = this.otherTv
									break
								}
							}
						}
						this.vipInfo = res.vipInfo

						this.sameFolderImgList = []
						if (res.sameFolderImgList) {
							for (let i in res.sameFolderImgList) {
								this.sameFolderImgList.push(this.axios.getRawFileUrl(res.sameFolderImgList[i]))
							}
						}
						this.$forceUpdate()
					}
				})
		},
		checkCanContinue() {
			// 查询上次播放进度
			if (this.movieIndexObj && this.movieIndexObj.id) {
				let lastProgress = localStorage.getItem('videoProgress' + this.movieIndexObj.id)
				console.log('lastProgress', lastProgress)
				if (lastProgress && lastProgress > 60) {
					this.hasContinuePlay = true
					this.lastProgressStr = utils.formatSeconds(lastProgress)
				}
			}
		},
		recentMovieClick(index) {
			this.movieList = [this.recentMovies[index]]
			this.currentIndex = 0
			this.init()
		},
		tvListClick(index) {
			this.currentIndex = index
			this.playMovie()
		}
	}
}
</script>

<style lang="scss" scoped>
::v-deep .ivu-icon-ios-close {
	display: none;
}

.play-btn {
	min-width: 250px;

	@media all and (max-width:640px) {
		width: 80%;
	}
}

.rate-root {
	display: flex;
	align-items: center;
	justify-content: center;

	@media all and (max-width:640px) {
		display: none;
	}
}


.movie-detail-root {
	position: fixed;
	padding: 10px;
	background-color: #F5F5F5;
	padding-bottom: 20px;

	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	width: 100%;
	overflow: scroll;
}

.main-layout {
	width: 100%;
	height: 100%;
}

.header-root {
	border-bottom: 1px solid #eeeeee;
	background-color: white;
	z-index: 2;
	height: 60px;
	display: flex;
	width: 100%;
	padding-left: 20px;
	padding-right: 20px;
	align-items: center;
	position: absolute;
	top: 0px;
	left: 0px;
}

.top-root-card {
	border-radius: 10px;
	background-color: rgba(255, 255, 255, 1);
}

.movie-name {
	color: $nas-text-title;
	text-align: left;
	font-size: 16px;
	font-weight: bold;
	word-break: break-all;
	display: flex;
	align-items: center;
}

.movie-score-bg {
	position: absolute;
	left: 5%;
	bottom: 5%;
	width: 36px;
	height: 32px;
	background: white;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);


	.movie-score {
		padding-top: 2px;
		color: #ff9900;
		font-size: 16px;
		font-weight: bold;
		text-align: center;
	}

}

.top-root {
	margin-bottom: 30px;
	width: 100%;
	display: flex;
	flex-direction: row;


	.poster-parent {
		flex-shrink: 0;
		width: 240px;
		height: 320px;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;

		.img-poster {
			border-radius: 10px;
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}


	.top-movie-info-root {
		@media not all and (max-width:640px) {
			margin-left: 20px;
		}

		display: flex;
		flex-direction: column;

		.movie-duration {
			color: white;
			margin-right: 20px;
			font-size: 16px;
			margin-top: 10px;
			text-align: left;
		}
	}

	.movie-info-item {
		margin-bottom: 10px;
		display: flex;
		align-items: flex-start;
		font-size: 14px;
		flex-direction: row;

		.movie-info-item-title {
			font-weight: bold;
			flex-shrink: 0;
			text-align: left;
			margin-right: 10px;
			color: #99AABF;
		}

		.movie-info-item-content {
			width: 100%;
			text-align: left;
			color: #333333;
			word-break: break-all;
		}
	}

	.movie-info-item-header {
		margin-bottom: 10px;
		display: flex;
		align-items: flex-start;
		font-size: 16px;
		flex-direction: row;


		.movie-info-item-content {
			font-weight: bold;
			width: 100%;
			text-align: left;
			color: $nas-text-title;
			word-break: break-all;
		}
	}


	.no-movie-info {
		font-size: 16px;
		margin-bottom: 20px;
		text-align: left;
	}
}

.recent-title {
	z-index: 1;
	display: flex;
	align-items: center;
	width: 100%;
	color: $nas-text-title;
	text-align: left;
	font-size: 22px;
	font-weight: bolder;
}

.mid-root {
	border-radius: 10px;
	margin-top: 10px;
	display: flex;
	flex-direction: column;
	width: 100%;

	.othertv-root {
		width: 100%;
		margin-top: 10px;
		display: flex;
		flex-direction: column;
		padding-bottom: 10px;
	}

	.recent-root {
		width: 100%;
		height: 100%;
		margin-top: 20px;
		display: flex;

		.recent-card-item {
			flex-shrink: 0;
			margin-right: 10px;
			cursor: pointer;
			width: 150px;
			border-radius: 10px;

			img {
				border-radius: 10px;
				flex-shrink: 0;
				align-self: flex-start;
				object-fit: cover;
				width: 100%;
				height: 200px;
			}

			.movie-name {
				margin-top: 7px;
				width: 100%;
				text-align: center;
				font-size: 14px;
				word-break: break-all;
				overflow: hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 1;
				-webkit-box-orient: vertical
			}
		}
	}


}

.bottom-root {
	border-radius: 10px;
	margin-top: 10px;
	display: flex;
	flex-direction: column;
	width: 100%;
}

.stream-root {
	width: 100%;
	display: flex;
	margin-top: 20px;

	.stream-item-card {
		flex-shrink: 0;
		margin-right: 10px;
		border-radius: 10px;
		min-width: 200px;
		background-color: rgba(255, 255, 255, 1);
	}

	.stream-info-title {
		width: 100%;
		text-align: left;
		font-size: 14px;
		margin-top: 5px;
		font-weight: bold;
		color: #99AABF;
	}

	.stream-info-content {
		font-size: 14px;
		margin-top: 5px;
		margin-left: 10px;
		font-weight: normal;
		color: #333333;
	}
}

.recent-root::-webkit-scrollbar {
	display: none;
	/* Chrome Safari */
}

.stream-root::-webkit-scrollbar {
	display: none;
	/* Chrome Safari */
}

.other-tv-cover {
	width: 200px;
	border-radius: 10px;
	object-fit: cover;
	flex-shrink: 0;
	@media all and (max-width:640px) {
		width: 120px;
	}
}

.closs-btn {
	z-index: 999999999;
	position: fixed;
	right: 0px;
	top: 0px;
}</style>
