<template>
	<div class="movie-detail-root" ref="detailRoot">
		<!-- 关闭按钮 -->
		<!-- <Button shape="circle" type="primary" class="closs-btn" @click="$emit('onClose')" icon="md-close-circle"></Button> -->
		<!-- 电影截图/海报 -->
		<img class="top-bg" v-if="movieIndexObj" :src="movieIndexObj.url"/>
		<div class="top-operation-bar">
			<Button type="text" ghost @click="$emit('onClose')">
				<span class="icon_controller_xxl nasIcons icon-back" style="font-size:20px"></span>
			</Button>
			
			<!-- 匹配名称 -->
			<div  class="movie-info-item-header" v-if="movieIndexObj.filename">
				<div class="movie-info-item-content enable-text-select max-line-one" style="color:#ddd;font-size:16px">{{ movieIndexObj.movie_info_name ||
					movieIndexObj.filename }}
				</div>
			</div>
			
			<!-- 喜爱 -->
			<div  class="favorite-root" v-if="movieIndexObj">
				<span @click.stop="showVideoSettingDialog=true" class="nasIcons icon-settings" style="color:#fff;font-size:22px;padding-bottom:2px"></span>
				<span @click.stop="favoriteMovie()" class="nasIcons icon-xihuan-shi" :style="{ 'color': movieIndexObj.favorite ? '#DE4545' : 'white' }"></span>
			</div>

		</div>
		<!-- myheader占位 -->
		<div class="main-layout">
			<!-- 站位 -->
			<div style="height:60px"></div>
			<!-- 上部电影信息区域 -->
			<!-- 海报 手机端 自己占用一行 -->
			<div class="nas-mobile-show">
				<div
					style="width:100%;margin-bottom:40px;display:flex;align-items:center;flex-direction:column;position: relative;">
					<img style="width:100%;object-fit:contain;border-radius: 10px;" v-lazy="movieIndexObj.url"
						@click="playMovie(true)" />
					<!-- 电影评分 -->
					<div v-if="movieIndexObj.movie_douban_score && movieIndexObj.movie_douban_score > 0"
						class="movie-score-bg">
						<span class="movie-score">{{
							movieIndexObj.movie_douban_score
						}}</span>
					</div>
					<!-- 手机端播放按钮-->
					<img src="@/static/icon_play.png" @click="playMovie(true)"
						style="width:60px;height:60px;position:absolute;bottom: -30px;right: 30px; " />
				</div>
			</div>
			<div style="width: 100%;" class="top-root-card">
				<div class="top-root">
					<div class="poster-parent nas-mobile-none">
						<!-- 电影截图/海报 -->
						<img class="img-poster" v-lazy="movieIndexObj.url" @click="playMovie(true)" />

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

						<!-- 播放按钮 -->
						<Button type="text" ghost @click.stop="playMovie(true)"  style="height:60px;position:absolute">
							<span class="nasIcons icon-play" style="font-size:60px;line-height:60px" ></span>
						</Button>
					</div>
					<!-- 电影名/电影信息 -->
					<div class="top-movie-info-root">
						<div class="movie-info-item-header" v-if="movieIndexObj.movie_info_name || movieIndexObj.filename">
							<div class="movie-info-item-content enable-text-select" style="color:white;font-size:16px;margin-bottom:10px">{{ movieIndexObj.movie_info_name ||
								movieIndexObj.filename }}
								<span v-if="movieIndexObj.movie_year">({{ parseInt(movieIndexObj.movie_year)
								}})</span>
								<span v-if="movieIndexObj.movie_regions">({{ movieIndexObj.movie_regions }})</span>
								<span v-if="movieIndexObj.movie_release_date">({{ movieIndexObj.movie_release_date
								}})</span>
								<span v-if="movieIndexObj.movie_release_date">({{ movieIndexObj.movie_release_date
								}})</span>
								<!-- 信息有误? -->
								<a style="margin-left:10px;color:#99AABF;font-size:14px" v-if="movieIndexObj.movie_info_name"
									@click="onSearchMovieInfo">{{
										$t('movie.wrongInfo')
									}}?</a>
							</div>
						</div>
						<!-- 上次看到： -->
						<a style="margin-bottom:10px" v-if="lastTvEpisodeIndex&&lastTvEpisodeIndex.filename!=movieIndexObj.filename" @click.stop="otherTvClick(lastTvEpisodeIndex)">{{ $t("movie.continueWatch") }}: {{lastTvEpisodeIndex.filename}}</a>
						
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
						<div class="no-movie-info" style="color:white" v-if="!movieIndexObj.movie_info_name && vipInfo">
							{{ $t('movie.noMovieInfoFound') }}
							<a style="margin-left:10px;color:white;" @click="showSearchMovieInfo = true">{{
								$t('common.search')
							}}</a>
						</div>
						<!-- 未找到电影信息 还不是会员 提示升级可以自动匹配 -->
						<div class="no-movie-info" style="color:white" v-if="!movieIndexObj.movie_info_name && !vipInfo">
							{{ $t('movie.upgradeAutoMatch') }}
							<a style="margin-left:10px;" @click="goToSetting('nasAccount')">{{
								$t('nascab.upgrade')
							}}</a>
						</div>

						<!-- 又名 -->
						<div class="movie-info-item" v-if="movieIndexObj.movie_alias">
							<p class="movie-info-item-title">{{ $t('movie.alias') }}:</p>
							<p class="movie-info-item-content">{{ movieIndexObj.movie_alias }}</p>
						</div>
						<!-- 导演 -->
						<div class="movie-info-item" v-if="movieIndexObj.movie_director">
							<p class="movie-info-item-title">{{ $t('movie.director') }}:</p>
							<p class="movie-info-item-content">{{ movieIndexObj.movie_director }}</p>
						</div>
						<!-- 主演 -->
						<div class="movie-info-item" v-if="movieIndexObj.movie_actor">
							<p class="movie-info-item-title">{{ $t('movie.actors') }}:</p>
							<p class="movie-info-item-content">{{ movieIndexObj.movie_actor }}</p>
						</div>

						<!-- 类型 -->
						<div class="movie-info-item" v-if="movieIndexObj.movie_genres">
							<p class="movie-info-item-title">{{ $t('movie.genres') }}:</p>
							<p class="movie-info-item-content">{{ movieIndexObj.movie_genres }}</p>
						</div>
						<!-- 语言 -->
						<div class="movie-info-item" v-if="movieIndexObj.movie_regions">
							<p class="movie-info-item-title">{{ $t('movie.regions') }}:</p>
							<p class="movie-info-item-content">{{ movieIndexObj.movie_regions }}</p>
						</div>
						<!-- 剧情简介 -->
						<div class="movie-info-item" v-if="movieIndexObj.movie_storyline">
							<p class="movie-info-item-title">{{ $t('movie.storyline') }}:</p>
							<p class="movie-info-item-content">{{ movieIndexObj.movie_storyline }}</p>
						</div>
						<!-- nfo位置 -->
						<div class="movie-info-item" v-if="movieIndexObj.nfoFullPath">
							<p class="movie-info-item-title">NFO {{ $t("common.file") }}:</p>
							<p class="movie-info-item-content enable-text-select">{{ movieIndexObj.nfoFullPath }}</p>
						</div>
					</div>
				</div>

				<div style="position:absolute;right: 10px;bottom: 10px;">
					<!-- 删除nfo -->
					<a v-if="movieIndexObj.nfoFullPath" @click="deleteNfoFile" style="margin-right:20px">{{
						$t("common.delete") }} nfo {{ $t("common.file") }}</a>

					<!-- 清除电影信息 -->
					<a v-if="movieIndexObj.movie_info_name && !movieIndexObj.nfoFullPath" @click="clearMovieInfo">{{
						$t('movie.clearMovieInfo')
					}}</a>
				</div>

			</div>
			<!-- 同文件夹内海报 -->
			<div class="mid-root" v-if="sameFolderImgList && sameFolderImgList.length > 0">
				<div class="recent-title">
					{{ $t('movie.relatedPictures') }}
				</div>
				<vue-horizontal class="recent-root">
					<div class="recent-card-item" v-for="(poster, index) in sameFolderImgList"
						@click.stop="goPreviewImage(index)">
						<img v-lazy="poster" />
					</div>
				</vue-horizontal>
			</div>
			<!-- 其他剧集 -->
			<div class="mid-root" v-if="movieIndexObj && movieIndexObj.is_tvplay == 1">
				<div class="recent-title" style="display: flex;justify-content: space-between;">
					<span>{{ $t('movie.otherTv') }}({{ tvListCount }})</span>
					<my-search btnType="dark-grey" :placeholder="$t('movie.searchPlaceHolder')" :keepSmall="true" @onSearch="onSearchOtherTv"></my-search>
				</div>

				<!-- 剧集列表分区 -->
				<div class="tv-section-root" >
					<div  v-for="section in tvPageSectionList" @click="onTvSectionClick(section.index)"
						:class="{ 'tv-section-item-selected': section.index == tvPageSectionIndex, 'tv-section-item': section.index != tvPageSectionIndex }">
						<span v-if="section.min != section.max">{{ section.min }}-{{ section.max }}</span>
						<span v-else>{{ section.max }}</span>
					</div>
				</div>

				<div class="othertv-root">
					<div v-if="otherTv.length < 1" style="width:100%;text-align:center">{{ $t("video.noMoreVideo") }}</div>
					<div v-for="(movie, index) in otherTv" style="margin-top: 20px;" v-if="!movie.hide" @click.stop="otherTvClick(otherTv[index])">
						<div style="display: flex;flex-direction:row;" >
							<div class="other-tv-cover-root"  @click.stop="tvListClick(index)">
								<img v-lazy="movie.url" class="other-tv-cover">
								<!-- 播放按钮 -->
								<Button type="text" ghost  style="height:25px;position:absolute">
									<span class="nasIcons icon-play" style="font-size:25px;line-height:25px" ></span>
								</Button>
							</div>
							
							<div style="display:flex;flex-direction:column;margin-left:10px;justify-content: center;">
								<div class="movie-name">{{ movie.filename }}</div>
								<!-- 电影文件大小 -->
								<span style="flex-shrink:0;margin-top: 5px;;color:#ddd">
									<span v-if="movie.movie_info_name" style="margin-right:10px;color:#ddd">{{ movie.movie_info_name }}</span>
 									<span v-if="movie.duration"  style="margin-right:10px;color:#ddd">[{{ utils.formatSeconds(movie.duration) }}]</span>
									<span v-if="movie.size"  style="margin-right:10px;color:#ddd" >[{{ utils.getSizeStr(movie.size) }}]</span>
								</span>
								<!-- <div class="max-line-one" style="flex-shrink:0;margin-top: 5px;color:#ddd"
									v-if="movie.movie_storyline">{{ movie.movie_storyline.trim() }}</div> -->
							</div>
						</div>
					</div>
				</div>
			</div>
			<!-- 最近播放 -->
			<div class="mid-root " v-if="recentMovies && recentMovies.length > 0">
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
			</div>
			<!-- 电影流信息 -->
			<div class="bottom-root" v-if="movieIndexObj && movieIndexObj.stream_info">
				<vue-horizontal class="stream-root">
					<div class="stream-item-card" v-for="stream in movieIndexObj.stream_info"
						v-if="stream.codec_type == 'video' || stream.codec_type == 'audio' || stream.codec_type == 'subtitle'">
						<div class="stream-card-title-root">
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
					</div>
				</vue-horizontal>
			</div>

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
		<!-- 片头片尾设置 -->
		<Modal v-model="showVideoSettingDialog" @on-ok="setTitleEnding()">
			<div class="flex-row" style="margin-bottom:10px">
				<p>{{$t("movie.openDuration")}}：</p>
				<InputNumber :max="movieIndexObj.duration" :min="1" v-model="movieIndexObj.open_duration" />
			</div>
			<div class="flex-row" style="margin-bottom:10px">
				<p>{{$t("movie.endDuration")}}：</p>
				<InputNumber :max="movieIndexObj.duration" :min="1" v-model="movieIndexObj.end_duration" />
			</div>
			<div class="flex-row" style="margin-bottom:10px">
				<p>{{$t("movie.sikpOpenEnd")}}：</p>
				<i-switch v-if="movieIndexObj&&movieIndexObj.skip_open_end!=null" :true-value="1" :false-value="0" v-model="movieIndexObj.skip_open_end" />
			</div>

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
			showVideoSettingDialog:false,
			showPhotoDetail: false,
			openAsPage: false,
			detailMovieList: [],
			detailIndex: [],
			otherTv: false,
			tvPageSize: 10,
			tvListCount: 0,//剧集列表总数
			tvPageSectionList: [],//列表分页区列表
			tvPageSectionIndex: 0,//选中的分页区
			tvSearchStr: "",
			vipInfo: false,
			showSearchMovieInfo: false,
			showRecentList: true,
			movieList: [],
			currentIndex: 0,
			showVideoDetail: false,
			movieIndexObj: '',
			hasContinuePlay: false,
			recentMovies: [],
			sameFolderImgList: [],
			lastTvEpisodeIndex:null
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
		//设置片头片尾接口
		setTitleEnding(){
			this.api.post('/api/movieApi/setTitleAndEnding', {
				indexId: this.movieIndexObj.id,
				openDuration:this.movieIndexObj.open_duration,
				endDuration:this.movieIndexObj.end_duration,
				autoSkip:this.movieIndexObj.skip_open_end
			}).then((res) => {
				if (!res.code) {
					console.log("片头片尾设置成功了")
					this.showVsNotification(this.$t('common.operationSuccess'))
				}
			}).catch((error) => { })
		},
		favoriteMovie() {
			this.api.post('/api/movieApi/movieFavorite', {
				movieIndexId: this.movieIndexObj.id,
				hideLoading: true
			}).then((res) => {
				if (!res.code) {
					this.movieIndexObj.favorite = res.favorite
					console.log("收藏完成了")
					this.$emit("onFavorite",this.movieIndexObj.id,res.favorite)
				}
			}).catch((error) => { })
		},
		onPopstate() {
			console.log("onPopstate movie detail")
			//后退按钮被点击 如果当前正在播放视频 则关闭视频 如果每播放 则后退
			if (this.showVideoDetail) {
				this.showVideoDetail = false
			} else {
				this.$emit("onClose")
			}
		},
		deleteNfoFile() {
			//删除nfo文件接口
			if (!this.movieIndexObj.nfoFullPath) {
				return
			}
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('movie.confirClearMovieInfo'), () => {
				this.api
					.post("/api/file/deleteByPath", {
						fullPath: this.movieIndexObj.nfoFullPath
					}).then((res) => {
						this.init()
					}).catch(err => { })
			})
		},
		onSearchMovieInfo() {
			if (this.movieIndexObj.nfoFullPath) {
				return this.showVsNotification(this.$t("movie.deleteNfoFirst"))
			}
			this.showSearchMovieInfo = true
		},
		onTvSectionClick(page) {
			this.tvSearchStr = ''
			this.getTvList(page)
		},
		getTvList(page) {
			this.api
				.post("/api/movieApi/getTvList", {
					id: this.movieIndexObj.id,
					serverType: 'movie',
					page: page,
					pageSize: this.tvPageSize,
					searchStr: this.tvSearchStr
				}).then((res) => {
					if (!res.code && res.tvplayList) {
						this.tvPageSectionIndex = page
						this.tvListCount = res.count
						for (let i in res.tvplayList) {
							let url = this.axios.getImgFullPath(res.tvplayList[i].id, true, res.tvplayList[i]
								.filename, 'movie');
							let rawUrl = this.axios.getImgFullPath(res.tvplayList[i].id, false, res.tvplayList[
								i].filename, 'movie');
							res.tvplayList[i].rawUrl = rawUrl
							res.tvplayList[i].url = url
							// if (res.tvplayList[i].folder_cover_path) {
							// 	//看看有没有同文件夹下匹配的海报
							// 	res.tvplayList[i].url = this.axios.getRawFileUrl(res.tvplayList[i].folder_cover_path, '', 'movie')
							// }
						}
						this.otherTv = res.tvplayList
						//当前是电视剧 要把播放列表替换为剧集去播放
						if (this.otherTv && this.otherTv.length > 0) {
							this.movieList = this.otherTv
							this.currentIndex=0
						}
						console.log("this.movieList",this.movieList)

						//解析分页区
						this.tvPageSectionList = []
						this.tvPageSize = res.pageSize
						let sectionCount = Math.ceil(this.tvListCount / this.tvPageSize)
						for (let i = 0; i < sectionCount; i++) {
							let max = (i + 1) * this.tvPageSize
							if (max > this.tvListCount) {
								max = this.tvListCount
							}
							this.tvPageSectionList.push({
								min: i * this.tvPageSize + 1,
								max: max,
								index: i
							})
						}


					}

				}).catch(err => { })

		},
		onSearchOtherTv(searchValue) {
			this.tvSearchStr = searchValue
			this.getTvList(0)
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
			if (this.movieIndexObj.nfoFullPath) {
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
			this.movieIndexObj = this.movieList[this.currentIndex]
			console.log("init ",this.movieIndexObj,this.movieList)
			this.getIndexDetail()
			this.showRecentList = localStorage.getItem('moviedetail-showRecentList') == 1
			this.$forceUpdate()
		},
		onPageScroll(e) {
			if (this.showVideoDetail) {
				return
			}
		},
		playMovie(clickFromTopBtn) {
			let that = this
			function goPlay(list, index) {
				if (localStorage.getItem("rawPlayer") == "1") {
					//调用原生播放器
					jsBridge.playVideo({
						playIndex: index,
						playList: list,
						token: that.$store.state.token,
						fromFileBrower: false,
						serverType: "movie"
					})
				} else {
					//继续使用网页播放器
					that.showVideoDetail = true;
					that.$nextTick(() => {
						that.$refs.videoPlayer.playVideo(list, index);
					});
					that.pushState()
				}
			}

			if (clickFromTopBtn && this.movieIndexObj.is_tvplay == 1) {
				//电视剧 需要获取一下播放列表 传给播放器 当前的播放列表分区了 
				this.api
					.post("/api/movieApi/getTvList", {
						id: this.movieIndexObj.id,
						serverType: 'movie',
						page: 0,
						pageSize: 30,
						searchStr: "",
						fromName: this.movieIndexObj.filename
					}).then((res) => {
						if (!res.code && res.tvplayList) {
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
							goPlay(res.tvplayList, 0)
						} else {
							goPlay([this.movieIndexObj], 0)
						}
					}).catch(err => { })
			} else {
				goPlay(this.movieList, this.currentIndex)
			}

		},
		getIndexDetail() {
			this.api
				.post('/api/movieApi/getMovieDetail', {
					id: this.movieIndexObj.id,
					serverType: 'movie'
				}).then((res) => {
					if (!res.code) {
						this.lastTvEpisodeIndex=res.lastTvEpisodeIndex
						if (res.movieIndex.stream_info && res.movieIndex.stream_info.length > 0) {
							res.movieIndex.stream_info = JSON.parse(res.movieIndex.stream_info)
						}
						this.movieIndexObj = {
							...this.movieIndexObj,
							...res.movieIndex
						}
						console.log("getIndexDetail ",this.movieIndexObj)
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

						this.movieIndexObj.url=this.movieIndexObj.url+"&time="+new Date().getTime()
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


						this.vipInfo = res.vipInfo

						this.sameFolderImgList = []
						if (res.sameFolderImgList) {
							for (let i in res.sameFolderImgList) {
								this.sameFolderImgList.push(this.axios.getRawFileUrl(res.sameFolderImgList[i]))
							}
						}
						if (this.movieIndexObj.is_tvplay == 1) {
							this.getTvList(0)
						}
						this.$forceUpdate()
					}
				})
		},

		otherTvClick(indexObj){
			this.$nextTick(() => {
				this.$refs.detailRoot.scrollTo({
					top: 0,
					behavior: "smooth"
				});
			})
			this.movieList = [indexObj]
			this.currentIndex = 0
			this.init()
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


.top-operation-bar{
	z-index: 9;
	display: flex;
	align-items: center;
	padding-right: 10px;
	position: fixed;
	top: 0;
	left: 0;
	height: 60px;
	width:calc(100% - 80px);
	background-color: rgba(0,0,0,0.8);
	overflow: hidden;
}
.top-bg{
	position:fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 350px;
	object-fit:cover;
	z-index: 0;
	filter: blur(20px);
}
.favorite-root {
	background-color: rgba(0,0,0,0.8);
	position: fixed;
	right: 0;
	top: 0;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	padding: 10px;
	height: 60px;
	width: 80px;
	span {
		margin-right: 10px;
		line-height: 25px;
		font-size: 25px;
	}
}

.main-layout {
	width: 100%;
	height: 100%;
	z-index: 1;
	
}
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
	background-color: #101010;
	padding-bottom: 20px;

	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	width: 100%;
	overflow-y: auto;
	overflow-x: hidden;
}


.header-root {
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
	padding: 20px;
	border-radius: 10px;
	background-color: rgba(32, 32, 32, 0.9);
	position: relative;

}

.movie-name {
	color: $nas-text-title;
	text-align: left;
	font-weight: bold;
	word-break: break-all;
	display: flex;
	align-items: center;
	color:white;
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
		width: 100%;
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
			color: #ddd;
			word-break: break-all;
		}
	}

	.movie-info-item-header {
		max-width: 80%;
		display: flex;
		align-items: flex-start;
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
	font-size: 16px;
	font-weight: bolder;
	color:#ddd;
}

.mid-root {
	background-color: rgba(32, 32, 32, 0.9);
	padding: 20px;
	border-radius: 10px;
	margin-top: 10px;
	display: flex;
	flex-direction: column;
	width: 100%;
	position: relative;
	z-index: 2;
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
	margin-top: 20px;
	display: flex;
	flex-direction: column;
	width: 100%;
}

.stream-root {
	width: 100%;
	display: flex;
	
	.stream-card-title-root {
		display: flex;
		align-items: center;
		justify-content: left;
		font-size: 16px;
		margin-bottom: 10px;
		color:#ddd;
		}

	.stream-item-card {
		background-color: rgba(32, 32, 32, 0.9);
		padding: 15px;
		flex-shrink: 0;
		margin-right: 10px;
		border-radius: 10px;
		min-width: 200px;
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
		color: #fff;
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

.other-tv-cover-root {
	width: 120px;
	height:80px;
	border-radius: 5px;
	object-fit: cover;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 5px;
	@media all and (max-width:640px) {
		width: 100px;
	}

	.other-tv-cover {
		width: 120px;
		height:80px;
		border-radius: 5px;
		object-fit: cover;
		@media all and (max-width:640px) {
			width: 100px;
		}
	}
	
}



.tv-section-root::-webkit-scrollbar {
	display: none;
	width: 100%;
}

.tv-section-root {
	z-index: 2;
	display: grid;
	margin-top: 10px;
	cursor: pointer;
	grid-template-columns: repeat(auto-fill, 110px);
	justify-content: flex-start;

	.tv-section-item {
		text-align: center;
		font-size: 12px;
		margin-top: 5px;
		flex-shrink: 0;
		display: inline;
		margin-right: 10px;
		border-radius: 4px;
		background-color: #5f5f5f;
		span {
			color:#ddd;
			font-size: 16px;
			margin: 10px;
		}
	}

	.tv-section-item-selected {
		@extend .tv-section-item;
		background-color: $nas-main;

	}
}</style>
