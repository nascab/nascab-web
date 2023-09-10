<template>
	<div class="movie-list-root">
		<!-- 头部 -->
		<div class="movie-header">
			<div style="display: flex;align-items: center;justify-content: space-between;width: 100%;">
				<div style="display: flex;align-items: center;flex: 1;">
					<!-- grid list 切换 -->

					<div :style="{'margin-left': itemMargin + 'px'}">
						<span v-if="showType == 'grid'" class="nasIcons icon-grid operation-icon "
						@click="onSelectShowType('list')"></span>
						<span v-else class="nasIcons icon-list operation-icon" @click="onSelectShowType('grid')"></span>
					</div>

					<!-- 改变图片大小 -->
					<div class="nas-mobile-none">
						<Slider v-if="showType == 'grid'" class="zoom-slider" show-tip="never" v-model="sliderValue"
							:min="sliderMin" :max="sliderMax" :step="10" @on-input="onSizeChange">
						</Slider>
					</div>
				</div>
				<div @click="clearHistoryApi()">
					<my-btn :title="$t('movie.clearHistory')"></my-btn>
				</div>
			</div>
		</div>

		<div style="width:100%;height: 100%;display:flex;flex-direction:row;overflow: hidden;padding-top: 70px;">
			<div class="movie-list" ref="listWrapper">
				<div style="padding-bottom: 10px;cursor: pointer;"
					:style="{ 'margin': itemMargin + 'px', width: itemWidth + 'px' }" @click="movieClick(index)"
					class="movie-item-root" v-for="(movie, index) in movieList" @mouseenter="mouseEnterImg(index)"
					@mouseleave="mouseLeaveImg(index)" v-if="showType == 'grid'"
					@contextmenu="showRightMenu($event, $root, movie, index)" :key="movie.id"
					@touchstart="touchstart($event, movie, index)" @touchend="touchend">

					<div class="cover-root" style="width:100%">
						<!-- 封面 禁用浏览器默认的事件-->
						<img class="movie-cover" v-lazy="movie.url" :style="{ height: itemWidth / 3 * 4.5 + 'px' }" />
						<!-- <img v-if="movie.hover" class="icon-play" src="@/static/icon_play.png" /> -->

						<Button type="text" ghost v-if="movie.hover" style="height:40px;position:absolute" >
							<span class="nasIcons icon-play" style="font-size:40px;line-height:40px" ></span>
						</Button>

						<!-- 视频的时长 -->
						<p class="icon-duration">{{ utils.formatSeconds(movie.duration) }}</p>
					</div>

					<!-- 名称 -->
					<p class="filename">
						{{ movie.filename }}
						<span v-if="movie.movie_year && movie.movie_year > 1000">[{{ parseInt(movie.movie_year) }}]</span>
					</p>

				</div>
				<div @click="movieClick(index)" v-for="(movie, index) in movieList" v-if="showType == 'list'"
					@mouseenter="mouseEnterImg(index)" @mouseleave="mouseLeaveImg(index)"
					style="display: flex;flex-direction: column;width: 100%;cursor: pointer;"
					@contextmenu="showRightMenu($event, $root, movie, index)">
					<!-- 封面 -->
					<div class="movie-item-root-list">

						<div class="cover-root">
							<!-- 封面 -->
							<img class="movie-cover-list" v-lazy="movie.url" />
								<Button type="text" ghost v-if="movie.hover" style="height:40px;position:absolute" >
									<span class="nasIcons icon-play" style="font-size:40px;line-height:40px" ></span>
								</Button>
							<!-- 视频的时长 -->
							<p class="icon-duration-list">{{ utils.formatSeconds(movie.duration) }}</p>
							

							<!-- 电影评分 -->
							<div v-if="movie.movie_douban_score && movie.movie_douban_score > 0" class="movie-score-bg">
								<span class="movie-score">{{
									movie.movie_douban_score
								}}</span>
							</div>
						</div>

					
						<!-- 名称 -->
						<div style="display:flex;flex-direction:column;height: 100%;">
							<p class="filename max-line-three">
								{{ movie.filename }}
							</p>
							<div class="list-item-line">
								<span class="item-title">{{ $t("common.folder") }}:</span>
								<span class="item-content">{{ movie.path }}</span>
							</div>
							<!-- 视频的时长 -->
							<p class="list-item-line">
								<span class="item-title">{{ $t("video.duration") }}:</span>
								<span class="item-content">{{ utils.formatSeconds(movie.duration) }}
									<span style="margin-left:5px">[{{ movie.sizeStr }}]</span>
								</span>
							</p>
							<!-- 上次看到 -->
							<p class="list-item-line">
								<span class="item-title">{{ $t("movie.lastTime") }}:</span>
								<span class="item-content">{{ utils.formatSeconds(movie.time) }}
								</span>
							</p>
						</div>


					</div>
					<div style="width: 100%;height: 1px;background-color: #eee;margin-top: 10px;margin-bottom: 10px;">
					</div>
				</div>
				<!-- 底部的loading和没有更多 -->
				<div style="display: flex;justify-content: center;width: 100%;flex-direction:column;align-items:center">
					<Spin size="large" v-if="nextLoading" style="margin-top:30px"></Spin>
					<span v-if="!nextLoading && !nextHasMore" style="margin-top: 30px;">{{
						$t('common.noMore')
					}}</span>
					<div style="height:80px"></div>
				</div>
			</div>

			<!-- 返回顶部按钮 -->
			<my-btn-icon v-if="showToTopBtn" style="position:fixed;right:10px;bottom:10px;" iIcon="md-arrow-up"
				@click="scrollToTop"></my-btn-icon>
		</div>


		<Modal v-model="showVideoDetail" fullscreen footer-hide>
			<video-detail propsServerType="movie" v-if="showVideoDetail" @onClose="showVideoDetail = false"
				ref="videoPlayer"></video-detail>
		</Modal>
		<!-- 电影详情页 -->
		<Modal v-model="showMovieInfoDetail" fullscreen footer-hide class-name="modal-style-nopadding"
			@onClose="showMovieInfoDetail = false">
			<movie-info-detail  @onClose="showMovieInfoDetail = false" :propsDetailMovieList="movieList" 
				:propsDetailIndex="selectedIndex" ref="movieInfoDetail" v-if="showMovieInfoDetail" @onMarkType="markType">
			</movie-info-detail>
		</Modal>
		<!-- 右键菜单 -->
		<easy-cm @ecmcb="rightMenuClick" :list="rightMenuList"></easy-cm>

		<!-- 手机端长按条目的时候弹出的菜单 -->
		<vs-dialog v-model="showLongPressMenu">
			<h4 v-if="selectedFile" class="max-line-one" style="word-break:break-all">{{ selectedFile.filename }}</h4>
			<my-selector-phone :optionList="rightMenuList"
				@onItemClick="(item) => (rightMenuClick(null, item.type))"></my-selector-phone>
		</vs-dialog>

	</div>
</template>
<script>
import axios from "@/plugins/axios";
import videoDetail from "@/views/videoDetail/videoDetail.vue";
import MovieInfoDetail from "@/views/movies/movieDetail.vue";
import jsBridge from "@/plugins/jsBridge"

export default {
	created() {
	},
	mounted() {
		//在header的mounted中触发加载第一页数据 在onChooseRange
		let showType = localStorage.getItem("movie-list-show-type");
		if (showType) {
			this.showType = showType;
			this.onSelectShowType(this.showType)
		}
		this.loadFirstPage()

		//窗口变化监听
		window.addEventListener("resize", this.onWindowResize);

		let saveSliderValue = localStorage.getItem('MovieImageSize')
		if (saveSliderValue && parseInt(saveSliderValue) >= 100) {
			this.sliderValue = parseInt(saveSliderValue)
			this.onSizeChange()
		}
		//监听后退事件
		window.addEventListener('popstate', this.onPopstate)

	},
	beforeDestroy() {
		window.removeEventListener("resize", this.onWindowResize);
		window.removeEventListener('popstate', this.onPopstate);
		if (this.sliderValue) localStorage.setItem('MovieImageSize', this.sliderValue)
	},
	components: {
		videoDetail,
		MovieInfoDetail
	},
	data() {
		return {
			orderMenuOptionList: [{
				title: this.$t('file.recent'),
				id: "check_time"
			}, {
				title: this.$t('movie.createTime'),
				id: "create_time"
			}, {
				title: this.$t('movie.filename'),
				id: "filename"
			}],
			showMovieInfoDetail: false,
			showToTopBtn: false,
			showVideoDetail: false,
			rightMenuList: [],
			sliderMin: 120,
			sliderMax: 280,
			sliderValue: 120,
			itemBaseWidth: 120,
			itemWidth: 120,
			itemMargin: 6,
			sortField: 'recent',
			sortType: 'desc',
			movieList: [],
			nextHasMore: true, //后面还有没有更多了
			nextLoading: false, //上一页是否正在加载
			sortField: 'check_time',
			sortType: 'desc',
			searchStr: '',
			showType: 'list',
			selectedIndex: null,
			selectedFile: null,
			longPressTimeout: null,
			showLongPressMenu: false
		};
	},
	computed: {

	},
	methods: {
		
		onPopstate() {
			//后退按钮被点击 如果当前正在播放视频 则关闭视频 如果每播放 则后退
			if (this.showMovieInfoDetail || this.showVideoDetail) {
				this.showMovieInfoDetail = false
				this.showVideoDetail = false
			} else {
				this.$router.go(-1)
			}
		},
		//获取电影筛选过滤的数组 国别/语言/分类
		getMovieKeys() {
			this.api.post('/api/movieApi/getMovieKeys', {
				hideLoading: true
			}).then((res) => {
				if (!res.code) {
					if (res.data && res.data.length > 0) {
						for (let i = 0; i < res.data.length; i++) {
							let item = res.data[i]
							if (item.key_type == "movie_language") {
								this.languageList.push(item.key_value)
							} else if (item.key_type == "movie_regions") {
								this.regionList.push(item.key_value)
							} else if (item.key_type == "movie_genres") {
								this.genresList.push(item.key_value)
							}
						}
					}
				}
			}).catch((error) => { })
		},
		touchstart(event, item, index) {
			clearTimeout(this.longPressTimeout); //再次清空定时器，防止重复注册定时器
			this.longPressTimeout = setTimeout(() => {
				this.onLongPress(item, index)
			}, 800);
		},
		touchend() {
			clearTimeout(this.longPressTimeout); //清空定时器，防止重复注册定时器
		},
		onLongPress(item, index) {
			this.selectedFile = item
			this.selectedIndex = index
			this.initRightMenu(item)
			this.showLongPressMenu = true
		},
		scrollToTop() {
			this.$nextTick(() => {
				this.$refs.listWrapper.scrollTo({
					top: 0,
					behavior: "smooth"
				});
			})
		},
		initRightMenu(file) {
			this.rightMenuList = [{
				text: this.$t('file.check'),
				type: "CHECK",
			}]
			if (file.is_tvplay == 0) {
				this.rightMenuList.push({
					text: this.$t('common.delete'),
					type: "DELETE"
				})
			}
			console.log('file.is_tvplay', file.is_tvplay)
			// if (file.is_tvplay == 1) {
			// 	this.rightMenuList.push({
			// 		text: this.$t('movie.setAsMovie'),
			// 		type: "setAsMovie"
			// 	})

			// } else {
			// 	this.rightMenuList.push({
			// 		text: this.$t('movie.setAsTv'),
			// 		type: "setAsTv"
			// 	})
			// }
		},
		showRightMenu(event, root, file, index) {
			if (this.isMobile) return event.preventDefault()
			this.selectedFile = file
			this.selectedIndex = index
			this.initRightMenu(file)
			this.$easycm(event, root)
		},
		clearHistoryApi() {//清除观看历史
			this.api.post('/api/movieApi/clearHistory', {
			}).then((res) => {
				if (!res.code) {
					this.showVsNotification(this.$t('common.operationSuccess'))
					setTimeout(() => {
						this.loadFirstPage()
					}, 500);
				}
			}).catch((error) => { })
		},
		deleteApi(needRefresh) {
			this.api.post('/api/fileApi/deleteFromDisk', {
				ids: [this.selectedFile.id],
				serverType: "movie"
			}).then((res) => {
				console.log("deleteFromDisk deleteFromDisk", res)
				if (!res.code) {
					if (res.errCount > 0) {
						this.showVsNotification(this.$t('file.deleteFail'));
					} else {
						this.showVsNotification(this.$t('file.deleteSuc'));
					}
				}
				this.api.post('/api/movieApi/deleteIndex', {
					indexId: this.selectedFile.id,
				}).then((res) => {
					if (!res.code) {
						this.showVsNotification(this.$t('movie.indexDeleted'));
						for (let i in this.movieList) {
							if (this.movieList[i].id == this.selectedFile.id) {
								this.movieList.splice(i, 1)
								this.selectedFile = null
								break
							}
						}
					}
				}).catch((error) => { })
			}).catch((error) => { })
		},
		deleteSelectedFile() {
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('file.confirmDelete'), () => {
				this.deleteApi()
			})
		},
		setAsTvMovie(isTvplay, indexId) {
			console.log('setAsTvMovie', isTvplay)
			this.api.post('/api/movieApi/setTvplay', {
				isTvPlay: isTvplay,
				indexId: indexId
			}).then((res) => {
				if (!res.code) {
					this.showVsNotification(this.$t('common.operationSuccess'))
					this.loadFirstPage()
				}
			}).catch((error) => { })
		},
		markType(type, indexId) {//标记为电影或者电视剧
			if (type == 1) { //设置为电视剧
				this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('movie.setAsTvAlert'),
					() => {
						this.setAsTvMovie(1, indexId)
					})
			} else if (type == 2) { //设置为电影
				this.setAsTvMovie(2, indexId)
			}
		},
		//右键菜单点击
		rightMenuClick(indexList, clickType) {
			this.showLongPressMenu = false
			let type = clickType ? clickType : this.rightMenuList[indexList[0]].type
			if (type == 'CHECK') { //查看
				this.movieClick(this.selectedIndex)
			} else if (type == 'DELETE') { //收藏
				this.deleteSelectedFile()
			}
		},

		loadFirstPage() {
			this.nextHasMore = true
			this.nextLoading = false
			this.getMovies()
		},
		//计算item宽度
		calImageWidth() {
			if (!this.$refs.listWrapper) {
				return
			}			
			if (this.isMobile) {
				this.itemBaseWidth = 120
			}
			let wrapper = this.$refs.listWrapper.getBoundingClientRect();
			let itemWidth = this.utils.calItemWidth(wrapper, this.itemBaseWidth, this.itemMargin)
			if (itemWidth) this.itemWidth = itemWidth

		},
		onSizeChange() {
			if (this.itemBaseWidth != this.sliderValue) {
				this.itemBaseWidth = this.sliderValue
				this.calImageWidth()
			}
		},
		onSelectShowType(val) {
			this.showType = val
			this.switchShowType(this.showType)
			localStorage.setItem("movie-list-show-type", val);
		},
		clickOrder(sortField, sortType) {
			this.sortField = sortField
			this.sortType = sortType
			this.loadFirstPage()
		},
		onSearch(searchStr) {
			this.searchStr = searchStr
			this.loadFirstPage()
		},
		onSearchClear() {
			this.searchStr = ''
			this.loadFirstPage()
		},
		switchShowType(showType) {
			this.showType = showType
		},
		mouseEnterImg(index) {
			if (!this.isMobile) {
				this.$set(this.movieList[index], "hover", true);
			}
		},
		mouseLeaveImg(index) {
			if (!this.isMobile) {
				this.movieList[index].hover = false;
			}
		},

		//窗口变化回调
		onWindowResize() {
			//重新计算照片高度
			this.calImageWidth();
		},

		movieClick(index) {
			//电影点击
			this.selectedIndex = index
			this.showMovieInfoDetail = true
			this.pushState()
		},
		getMovies() {
			if (this.nextLoading || !this.nextHasMore) {
				return
			}

			this.movieList = []
			this.nextLoading = true
			let params = {
				hideLoading: true
			}
			if (this.selectedSourceFolder && this.selectedSourceFolder != this.$t('common.all')) {
				params.sourceFolder = axios.encodePath(this.selectedSourceFolder)
			}

			this.api
				.post("/api/movieApi/getHistory", params)
				.then((res) => {

					for (let i = 0; i < res.data.length; i++) {
						let url = axios.getImgFullPath(res.data[i].id, true, res.data[i].filename, 'movie');
						let rawUrl = axios.getImgFullPath(res.data[i].id, false, res.data[i].filename, 'movie');
						res.data[i].url = url
						res.data[i].rawUrl = rawUrl;
						let size = res.data[i].size
						let sizeKb = parseInt(size / 1024 * 100) / 100 //kb
						let sizeStr = sizeKb + 'KB'
						if (sizeKb > 1024) {
							let sizeMb = parseInt(sizeKb / 1024 * 100) / 100
							sizeStr = sizeMb + 'MB'
							if (sizeMb > 1024) {
								let sizeGb = parseInt(sizeMb / 1024 * 100) / 100
								sizeStr = sizeGb + 'GB'
							}
						}
						res.data[i].sizeStr = sizeStr
					}
					this.movieList = res.data
					this.nextHasMore = false
					this.nextLoading = false
					this.$nextTick(() => {
						this.calImageWidth();
					})
				})
				.catch((error) => {
					this.nextLoading = false
				});
		}

	}
}
</script>
<style lang="scss" scoped>
::v-deep .ivu-icon-ios-close {
	display: none;
}

::v-deep .ivu-select-dropdown {
	width: 90%;
}

.operation-icon {
	font-size: 30px;
	line-height: 30px;
	color: $nas-main;
	margin-right: 20px;
	cursor: pointer;
	span{
		font-size: 30px;
	}

	@media all and (max-width:640px) {
		margin-right: 15px;
	}
}

.movie-list-root {
	position: relative;
	width: 100%;
	height: 100%;

	background-color: rgba(255, 255, 255, 0.6);
	padding-left: 10px;
	padding-right: 10px;

	@media not all and (max-width:640px) {
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
		padding-left: 20px;
		padding-right: 20px;
	}
}

::v-deep .ivu-icon-md-play {
	font-size: 30px;
	margin-left: 5px;
}

.movie-list {
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	overflow-y: scroll;
	overflow-x: hidden;
	align-content: flex-start;
	scrollbar-width: none;

	@media all and (max-width:640px) {
		-webkit-overflow-scrolling: touch;
	}

}

.movie-item-root {
	position: relative;
	display: inline-flex;
	flex-direction: column;
	align-items: center;
}

.filename {
	font-size: 14px;
	margin-top: 5px;
	word-break: break-all;
	text-align: center;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 3;
	overflow: hidden;
}

.movie-item-root-list {
	width: 100%;
	position: relative;
	text-align: center;
	align-self: center;
	display: inline-flex;
	flex-direction: row;
	align-items: center;

	.movie-cover-list {
		pointer-events: none;
		border-radius: 10px;
		background-color: white;
		width: 120px;
		height: 160px;
		object-fit: cover;
		box-shadow: 5px 5px 10px rgba(0, 0, 0, .2);

	}

	.filepath {
		font-size: 14px;
		margin-right: 20px;
		text-align: left;
		margin-left: 20px;
		word-break: break-all;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-top: 15px;
	}


	.filename {
		font-size: 16px;
		font-weight: bold;
		margin-right: 20px;
		text-align: left;
		margin-left: 20px;
		word-break: break-all;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.list-item-line {
		font-size: 14px;
		margin-right: 20px;
		text-align: left;
		margin-left: 20px;
		word-break: break-all;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-top: 10px;

		.item-title {
			font-weight: bold;
			margin-right: 5px;
		}

	}
}

.cover-root {
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}


.icon-duration {
	font-size: 14px;
	color: #eee;
	position: absolute;
	left: 6px;
	bottom: 6px;
	font-weight: bold;
}


.icon-duration-list {
	font-size: 14px;
	color: #eee;
	position: absolute;
	left: 6px;
	bottom: 6px;
	font-weight: bold;
}

.movie-cover {
	pointer-events: none; //禁止响应点击事件
	border-radius: 10px;
	background-color: white;
	width: 100%;
	object-fit: cover;
	box-shadow: 5px 5px 10px rgba(0, 0, 0, .2);
	// border: 1px solid #eee;
}


.movie-header {
	left: 0;
	position: absolute;
	z-index: 2;
	width: 100%;
	position: absolute;
	height: 70px;
	padding-left: 10px;
	padding-right: 10px;

	@media not all and (max-width:640px) {
		padding-left: 20px;
		padding-right: 20px;
	}

	display: flex;
	align-items: center;
	justify-content: space-between;
}

.zoom-slider {
	margin-right: 20px;
	width: 60px;
	display: inline-flex;

	@media all and (max-width:640px) {
		width: 40px;
		margin-left: 10px;
	}
}

.movie-header-position {
	width: 100%;
	height: 50px;
}

.icon-showtype {
	margin-right: 20px;
	cursor: pointer;

	@media all and (max-width:640px) {
		margin-right: 15px;
	}
}

.source-item {
	margin-top: 10px;
	border-radius: 20px;
	color: white;
	padding: 10px;
	background-color: $nas-grey;
}
</style>
