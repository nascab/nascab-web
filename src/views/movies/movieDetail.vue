<template>
	<div class="movie-detail-root" :style="{ padding: isMobile ? '15px' : '0' }">
		<!-- myheader占位 -->
		<div class="main-layout">
			<div class="header-root">
				<!-- 返回按钮 -->
				<Icon @click="goBack" type="md-close" style="margin-right:20px;cursor:pointer" size="20"
					color="#333333" />
				<!-- 电影文件名 -->
				<div style="overflow-x:hidden">
					<div class="movie-name">
						<p class="max-line-one">{{ movieIndexObj.filename }}</p>
						<div class="nas-mobile-none" style="display:flex;font-weight: normal;align-items: center">
							<!-- 电影文件大小 -->
							<span style="flex-shrink:0">[{{ utils.getSizeStr(movieIndexObj.size) }}]</span>
							<!-- 电影时长 -->
							<span style="flex-shrink:0">[{{ utils.formatSeconds(movieIndexObj.duration) }}]</span>
							<vs-tooltip style="flex-shrink:0" bottom v-if="!isMobile">
								<a v-if="!isMobile" @click="clickType">[{{ $t('security.type') }}:{{
									movieIndexObj.is_tvplay == 1 ?
									$t('movie.tvdrama') : $t('movie.movie')
								}}]</a>
								<template #tooltip>
									<p>{{ movieIndexObj.is_tvplay == 1 ? $t('movie.clickSwitchToMovie') :
										$t('movie.clickSwitchToTV')
									}}</p>
								</template>
							</vs-tooltip>
						</div>
					</div>
					<div class="movie-name nas-mobile-show">
						<div style="display:flex;font-weight: normal;align-items: center;">
							<!-- 电影文件大小 -->
							<span style="flex-shrink:0">[{{ utils.getSizeStr(movieIndexObj.size) }}]</span>
							<!-- 电影时长 -->
							<span style="flex-shrink:0">[{{ utils.formatSeconds(movieIndexObj.duration) }}]</span>
							<vs-tooltip style="flex-shrink:0" bottom v-if="!isMobile">
								<a @click="clickType">[{{ $t('security.type') }}:{{ movieIndexObj.is_tvplay == 1 ?
									$t('movie.tvdrama') : $t('movie.movie')
								}}]</a>
								<template #tooltip>
									<p>{{ movieIndexObj.is_tvplay == 1 ? $t('movie.clickSwitchToMovie') :
										$t('movie.clickSwitchToTV')
									}}</p>
								</template>
							</vs-tooltip>
						</div>
					</div>
				</div>
			</div>
			<!-- 上部电影信息区域 -->
			<div>
				<!-- 海报 手机端 自己占用一行 -->
				<div class="nas-mobile-show">
					<div style="width:100%;margin-bottom:10px;display:flex;align-items:center;flex-direction:column">
						<img style="width:100%;object-fit:contain;border-radius: 10px;" v-lazy="movieIndexObj.url" />
						<!-- 手机端播放按钮  非安卓-->
						<my-btn style="margin-top:20px" class="play-btn" @click="playMovie()"
							:title="$t('movie.play')"></my-btn>
					</div>
				</div>
				<Card style="width: 100%;" class="top-root-card">
					<div class="top-root">
						<div class="nas-mobile-none" style="position: relative;">
							<!-- 电影截图/海报 -->
							<div>
								<img class="img-poster" v-lazy="movieIndexObj.url" />
							</div>
							<!-- 评分组件 -->
							<div class="rate-root" v-if="movieIndexObj.movie_douban_score">
								<Rate :disabled="true" allow-half v-model="movieIndexObj.movie_douban_score" />
								<span style="color:#ff9900;font-weight: bold;font-size: 14px;">{{
									movieIndexObj.movie_douban_score * 2
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
						</div>
						<!-- 电影名/电影信息 -->
						<div class="top-movie-info-root">

							<!-- 未找到电影信息 是会员 提示未找到-->
							<div class="no-movie-info" v-if="!movieIndexObj.movie_info_name && vipInfo">
								{{ $t('movie.noMovieInfoFound') }}
								<a style="margin-left:10px" @click="showSearchMovieInfo = true">{{ $t('common.search')
								}}</a>
							</div>
							<!-- 未找到电影信息 还不是会员 提示升级可以自动匹配 -->
							<div class="no-movie-info" v-if="!movieIndexObj.movie_info_name && !vipInfo">
								{{ $t('movie.upgradeAutoMatch') }}
								<a style="margin-left:10px" @click="goToSetting('nasAccount')">{{ $t('nascab.upgrade')
								}}</a>
							</div>
							<!-- 匹配名称 -->
							<div class="movie-info-item" v-if="movieIndexObj.movie_info_name">
								<div class="movie-info-item-title">{{ $t('movie.movieName') }}:</div>
								<div class="movie-info-item-content">{{ movieIndexObj.movie_info_name }}
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
									<a style="margin-left:10px" @click="showSearchMovieInfo = true">{{
										$t('movie.wrongInfo')
									}}?</a>
								</div>
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
							<!-- 播放和继续播放按钮 -->
							<div class="nas-mobile-none" style="display:flex;margin-top: 20px;justify-content:center">
								<my-btn class="play-btn" @click="playMovie()" :title="$t('movie.play')"></my-btn>
							</div>
						</div>
					</div>
					<!-- 清除电影信息 -->
					<a v-if="movieIndexObj.movie_info_name" style="position:absolute;right: 10px;bottom: 10px;"
						@click="clearMovieInfo">{{
							$t('movie.clearMovieInfo')
						}}</a>
				</Card>
			</div>
			<!-- 同文件夹内海报 -->
			<div class="mid-root" v-if="sameFolderImgList && sameFolderImgList.length > 0">
				<div class="recent-title">
					{{ $t('movie.relatedPictures') }}
				</div>
				<div class="recent-root">
					<swiper style="width: 100%;" ref="mySwiperRecent" :options="swiperOptions">
						<swiper-slide v-for="(poster, index) in sameFolderImgList">
							<div class="recent-item" @click.stop="goPreviewImage(index)">
								<Card class="recent-card-item" style="height:100%;">
									<img v-lazy="poster" />
								</Card>
							</div>
						</swiper-slide>
					</swiper>
				</div>
			</div>
			<!-- 其他剧集 -->
			<div class="mid-root" v-if="otherTv && otherTv.length > 0">
				<div class="recent-title">
					{{ $t('movie.otherTv') }}
				</div>
				<div class="othertv-root">
					<Card v-for="(movie, index) in otherTv" style="margin-top: 10px;">
						<div style="display: flex;flex-direction:row;" @click.stop="tvListClick(index)">
							<img v-lazy="movie.url" style="width:80px;height:80px;border-radius:10px;object-fit:cover" />
							<div style="display:flex;flex-direction:column;margin-left:10px;justify-content: center;">
								<div class="movie-name">{{ movie.filename }}</div>
								<!-- 电影文件大小 -->
								<span style="flex-shrink:0;margin-top: 10px;">[{{ utils.formatSeconds(movie.duration) }}][{{
									utils.getSizeStr(movie.size) }}]</span>
							</div>

						</div>
					</Card>
				</div>
			</div>
			<!-- 最近播放 -->
			<div class="mid-root" v-else>
				<div v-if="recentMovies && recentMovies.length > 0">
					<div class="recent-title">
						{{ $t('movie.recentPlay') }}
						<Icon color="#386DF2" v-if="!showRecentList" @click="setShowRecent(1)" type="md-eye-off" size="20"
							style="cursor: pointer;margin-left: 5px;" />
						<Icon color="#386DF2" v-else @click="setShowRecent(0)" type="md-eye" size="20"
							style="cursor: pointer;margin-left: 5px;" />
					</div>
					<div v-if="showRecentList" class="recent-root">

						<swiper style="width: 100%;" ref="mySwiperRecent" :options="swiperOptions">
							<swiper-slide v-for="(movie, index) in recentMovies">
								<div class="recent-item" @click.stop="recentMovieClick(index)">
									<Card class="recent-card-item" style="height:100%;">
										<img v-lazy="movie.url" />
										<div class="movie-name">{{ movie.filename }}</div>
									</Card>
								</div>
							</swiper-slide>
						</swiper>
					</div>
				</div>
			</div>
			<!-- 电影流信息 -->
			<div class="bottom-root" v-if="movieIndexObj && movieIndexObj.stream_info">
				<div class="recent-title">
					{{ $t('movie.mediaInfo') }}
				</div>
				<!-- stream 流信息 -->
				<div class="stream-root">
					<swiper ref="mySwiper" :options="swiperOptions">
						<swiper-slide style="width: 250px;" v-for="stream in movieIndexObj.stream_info"
							v-if="stream.codec_type == 'video' || stream.codec_type == 'audio' || stream.codec_type == 'subtitle'">
							<div style="margin-right:20px;flex-shrink: 0;max-width:400px;min-width: 250px;">
								<Card style="height: 300px;width: 250px;" class="stream-item-card">
									<template #title>
										<div
											style="display: flex;align-items: center;justify-content: center;font-size: 16px;">
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
									</template>
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
							</div>
						</swiper-slide>

					</swiper>
				</div>
			</div>

		</div>
		<Modal v-model="showVideoDetail" fullscreen footer-hide :closable="false">
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

import videoDetail from "@/views/videoDetail/videoDetail.vue";
import searchMovieInfo from "@/views/movies/components/searchMovie.vue";
import photoDetail from "@/views/photos/components/photoDetail.vue";

import {
	Swiper,
	SwiperSlide,
} from 'vue-awesome-swiper'
import 'swiper/css/swiper.css'

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
			swiperOptions: {
				centeredSlidesBounds: true,
				spaceBetween: 20,
				freeMode: true,
				slidesPerView: 'auto'
			}
		}
	},
	components: {
		photoDetail,
		Swiper,
		SwiperSlide,
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
		//点击了图片 跳转到图片详情
		goPreviewImage(index) {
			console.log("goPreviewImage", index)
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
		onSwiper(swiper) {
			console.log(swiper);
		},
		onSlideChange() {
			console.log('slide change');
		},
		clearMovieInfo() {
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
			this.showVideoDetail = true;
			this.$nextTick(() => {
				this.$refs.videoPlayer.playVideo(this.movieList, this.currentIndex);
			});
			this.pushState()

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
						if (this.movieIndexObj.movie_cover_path && this.movieIndexObj.movie_info_state == 1) {
							//如果有封面 则使用封面
							this.movieIndexObj.url = this.axios.getRawFileUrl(this.movieIndexObj.movie_cover_path, '', 'movie')
						} else if (this.movieIndexObj.folder_cover_path) {
							//没有封面 看看有没有同文件夹下匹配的海报
							this.movieIndexObj.url = this.axios.getRawFileUrl(this.movieIndexObj.folder_cover_path, '', 'movie')
						} else {
							this.movieIndexObj.url = this.axios.getImgFullPath(this.movieIndexObj.id, true, this
								.movieIndexObj.filename, 'movie');
						}

						if (this.movieIndexObj.movie_douban_score) {
							this.movieIndexObj.movie_douban_score = this.movieIndexObj.movie_douban_score / 2
						}

						for (let i in res.recentMovies) {
							let url = this.axios.getImgFullPath(res.recentMovies[i].id, true, res.recentMovies[i]
								.filename, 'movie');
							let rawUrl = this.axios.getImgFullPath(res.recentMovies[i].id, false, res.recentMovies[
								i].filename, 'movie');
							res.recentMovies[i].rawUrl = rawUrl
							res.recentMovies[i].url = url
							if (res.recentMovies[i].movie_cover_path) {
								//如果有封面 则使用封面
								res.recentMovies[i].url = this.axios.getRawFileUrl(res.recentMovies[i]
									.movie_cover_path, '', 'movie')
							} else if (res.recentMovies[i].folder_cover_path) {
								//没有封面 看看有没有同文件夹下匹配的海报
								res.recentMovies[i].url = this.axios.getRawFileUrl(res.recentMovies[i].folder_cover_path, '', 'movie')
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
							if (res.tvplayList[i].movie_cover_path) {
								//如果有封面 则使用封面
								res.tvplayList[i].url = this.axios.getRawFileUrl(res.tvplayList[i]
									.movie_cover_path, '', 'movie')
							} else if (res.tvplayList[i].folder_cover_path) {
								//没有封面 看看有没有同文件夹下匹配的海报
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
.swiper-slide:nth-child(n) {
	width: 250px;
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

	@media not all and (max-width:640px) {
		padding-left: 20px;
		padding-right: 20px;
	}

	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	width: 100%;
}

.main-layout {
	width: 100%;
	height: 100%;
	overflow: auto;
	padding-top: 60px;
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
	font-size: 18px;
	font-weight: bold;
	word-break: break-all;
	display: flex;
	align-items: center;
}

.top-root {
	margin-bottom: 30px;
	width: 100%;
	display: flex;
	flex-direction: row;

	.img-poster {
		border-radius: 10px;
		width: 240px;
		height: 320px;
		object-fit: cover;
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
		margin-bottom: 20px;
		display: flex;
		align-items: flex-start;
		font-size: 16px;
		flex-direction: row;

		.movie-info-item-title {
			font-weight: bold;
			flex-shrink: 0;
			text-align: left;
			margin-right: 10px;
			color: $nas-text-title;
		}

		.movie-info-item-content {
			width: 100%;
			text-align: left;
			color: $nas-grey;
			word-break: break-all;
		}
	}



	.no-movie-info {
		font-size: 16px;
		margin-top: 20px;
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
	margin-top: 30px;
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
		margin-top: 10px;
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		// overflow-x: auto;
		padding-bottom: 10px;

		.recent-item {
			display: flex;
			flex-direction: column;
			cursor: pointer;
			width: 220px;

			.recent-card-item {
				border-radius: 10px;
				background-color: rgba(255, 255, 255, 1);
			}

			img {
				border-radius: 10px;
				flex-shrink: 0;
				align-self: flex-start;
				object-fit: cover;
				width: 180px;
				height: 240px;
			}

			.movie-name {
				width: 100%;
				text-align: center;
				font-size: 14px;
				word-break: break-all;
				overflow: hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 3;
				-webkit-box-orient: vertical
			}
		}
	}

	.recent-root::-webkit-scrollbar {
		display: none;
		/* Chrome Safari */
	}
}

.no-pointer-event {
	pointer-events: none;
}

.bottom-root {
	margin-bottom: 30px;
	margin-top: 30px;
	display: flex;
	flex-direction: column;
	width: 100%;
}

.stream-root {
	width: 100%;

	.stream-item-card {
		margin-top: 20px;
		border-radius: 10px;
		background-color: rgba(255, 255, 255, 1);
	}

	.stream-info-title {
		width: 100%;
		text-align: left;
		font-size: 14px;
		margin-top: 5px;
		font-weight: bold;
		color: $nas-text-title;
	}

	.stream-info-content {
		font-size: 14px;
		margin-top: 5px;
		margin-left: 10px;
		font-weight: normal;
		color: $nas-grey;
	}
}

.stream-root::-webkit-scrollbar {
	display: none;
	/* Chrome Safari */
}</style>
