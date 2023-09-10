<template>
	<div style="width:100%;">
		<div class="movie-list" ref="listWrapper" id="movie-list-wrapper" @scroll="onPageScroll">
			<div v-for="(movie, index) in movieList" :class="{'movie-list-column':showType=='list'}" >
				<movie-list-item @mouseEnterImg="mouseEnterImg" @movieClick="movieClick" @mouseLeaveImg="mouseLeaveImg"
					@showRightMenu="showRightMenu" @touchstart="touchstart" @touchend="touchend" @playClick="playClick"
					@favoriteMovie="favoriteMovie" :movie="movie" :movieIndex="index" :showType="showType"
					:itemWidth="itemWidth" :itemMargin="itemMargin">
				</movie-list-item>
			</div>
			<!-- 底部的loading和没有更多 -->
			<div style="display: flex;justify-content: center;width: 100%;flex-direction:column;align-items:center">
				<!-- 手动加载更多的按钮 -->
				<Button v-if="nextHasMore && movieList.length > 0" @click="loadNextPage()" type="default"
					style="width: 250px;margin-top: 30px;height:45px;border-radius:20px">{{
						$t('common.loadmore')
					}}</Button>
				<Spin size="large" v-if="nextLoading" style="margin-top:30px"></Spin>
				<span v-if="!nextLoading && !nextHasMore" style="margin-top: 30px;">{{
					$t('common.noMore')
				}}</span>
				<div style="height:80px"></div>
			</div>
		</div>

		<Modal v-model="showVideoDetail" fullscreen footer-hide>
			<video-detail propsServerType="movie" v-if="showVideoDetail" @onClose="showVideoDetail = false"
				ref="videoPlayer"></video-detail>
		</Modal>
		<!-- 电影详情页 -->
		<Modal v-model="showMovieInfoDetail" fullscreen footer-hide :closable="false" class-name="modal-style-nopadding"
			@onClose="showMovieInfoDetail = false">
			<movie-info-detail @onClose="showMovieInfoDetail = false" :propsDetailMovieList="movieList"
				@onFavorite="onFavoriteChange" :propsDetailIndex="selectedIndex" ref="movieInfoDetail"
				v-if="showMovieInfoDetail" @onMarkType="markType">
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

		<!-- 选择影集的对话框 -->
		<vs-dialog scroll v-model="showCollectionSelectDialog">
			<template #header>
				<h4 class="not-margin">
					{{ $t('movie.whichCollectionWantoMove') }}
				</h4>
			</template>
			<movie-collection-list ref="movieCollectionList" :selectMode="true"></movie-collection-list>
			<template #footer>
				<vs-button block @click="onSelectCollection">
					{{ $t("common.select") }}
				</vs-button>
			</template>
		</vs-dialog>
		<!-- 右侧自定义滚动条 -->
		<my-scroll-bar ref="scrollBar"
			v-if="!showCollectionSelectDialog && !showLongPressMenu && !showMovieInfoDetail && !showVideoDetail"></my-scroll-bar>
	</div>
</template>
<script>
import videoDetail from "@/views/videoDetail/videoDetail.vue";
import MovieInfoDetail from "@/views/movies/movieDetail.vue";
import jsBridge from "@/plugins/jsBridge"
import movieListItem from "@/views/movies/components/movieListItem.vue";
import movieUtil from "../utils/movieUtil";
const movieCollectionList = () => import('@/views/movies/movieCollection.vue')
import myScrollBar from "@/components/my-components/my-scrollbar/my-scrollbar"

export default {
	props: {
		isAiCollection: {
			default: false,
			type: Boolean
		},
		collectionPwd: {
			default: "",
			type: String
		},
		collectionId: {
			default: 0,
			type: Number
		},
		libraryId: {
			default: 0,
			type: Number
		},
		sliderValue: {
			default: 120,
			type: Number
		},
		sortField: {
			default: "check_time",
			type: String
		},
		sortType: {
			default: "desc",
			type: String
		},
		searchStr: {
			default: "",
			type: String
		},
		showType: {
			default: "grid",
			type: String
		},
		listType: {
			default: "ALL",
			type: String
		},
		firstLetter: {
			default: "",
			type: String
		},
		sourceFolderList: {
			default: () => [],
			type: Array
		},
		selectedSourceType: {
			default: "",
			type: String
		},
		selectedSourceFolder: {
			default: () => [],
			type: Array
		},
		selectedLanguage: {
			default: () => [],
			type: Array
		},
		selectedRegion: {
			default: () => [],
			type: Array
		},
		selectedGenres: {
			default: () => [],
			type: Array
		}
	},
	created() {
	},
	mounted() {
		// this.loadFirstPage()
		//窗口变化监听
		window.addEventListener("resize", this.onWindowResize);
		//监听后退事件
		window.addEventListener('popstate', this.onPopstate)
	},
	beforeDestroy() {
		window.removeEventListener("resize", this.onWindowResize);
		window.removeEventListener('popstate', this.onPopstate);
		if (this.sliderValue) localStorage.setItem('MovieImageSize', this.sliderValue)
	},
	computed: {
		filterConditionCount: function () {
			return this.selectedSourceFolder.length + this.selectedLanguage.length + this.selectedRegion.length + this.selectedGenres.length
		}
	},
	components: {
		myScrollBar,
		movieCollectionList,
		movieListItem,
		videoDetail,
		MovieInfoDetail
	},
	data() {
		return {
			showCollectionSelectDialog: false,//选择影集的对话框
			showFilterDialog: false,
			showMovieInfoDetail: false,
			showVideoDetail: false,
			rightMenuList: [],
			itemBaseWidth: 120,
			itemWidth: 120,
			itemMargin: 6,
			count: 50,
			movieList: [],
			nextHasMore: true, //后面还有没有更多了
			nextLoading: false, //上一页是否正在加载
			selectedIndex: null,
			selectedFile: null,
			longPressTimeout: null,
			showLongPressMenu: false,
			showMovieInfoName: false, //是否显示匹配后的名字
		};
	},
	methods: {
		onFavoriteChange(indexId, favorite) {
			for (let i in this.movieList) {
				if (this.movieList[i].id == indexId) {
					this.movieList[i].favorite = favorite
					break
				}
			}
		},
		favoriteMovie(index) {
			let movieIndex = this.movieList[index]
			console.log("收藏", movieIndex)
			movieUtil.favoriteMovie(this, movieIndex, (isFavorite) => {
				//当前正在收藏界面而且取消了收藏 从列表移除
				if (isFavorite == 0 && this.listType == "FAVORITE") {
					this.movieList.splice(index, 1)
				}
			})
		},
		onPopstate() {
			if (this.showMovieInfoDetail) {
				this.$refs.movieInfoDetail.onPopstate()
			} else {
				//后退按钮被点击 如果当前正在播放视频 则关闭视频 如果每播放 则后退
				if (this.showVideoDetail) {
					this.showVideoDetail = false
				} else {
					this.$router.go(-1)
				}
			}
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
			this.rightMenuList = movieUtil.initRightMenu(this, file, this.movieList[this.selectedIndex], this.collectionId, this.isAiCollection)
		},
		showRightMenu(event, root, file, index) {
			if (this.isMobile) return event.preventDefault()
			this.selectedFile = file
			this.selectedIndex = index
			this.initRightMenu(file)
			this.$easycm(event, root)
		},
		deleteApi() {
			movieUtil.deleteApi(this, this.selectedFile)
		},
		removeSelectedFileFromList() {
			for (let i in this.movieList) {
				if (this.movieList[i].id == this.selectedFile.id) {
					this.movieList.splice(i, 1)
					this.selectedFile = null
					break
				}
			}
		},
		deleteSelectedFile() {
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('file.confirmDelete'), () => {
				this.deleteApi()
			})
		},
		setAsTvMovie(isTvplay, indexId) {
			movieUtil.setAsTvMovie(this, isTvplay, indexId, () => {
				this.loadFirstPage()
			})
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
			console.log("this.selectedIndex", this.selectedIndex)
			if (type == 'CHECK') { //查看
				this.movieClick(this.selectedIndex)
			} else if (type == 'DELETE') { //删除
				this.deleteSelectedFile()
			} else if (type == 'setAsTv') { //设置为电视剧
				this.markType(1, this.selectedFile.id)
			} else if (type == 'setAsMovie') { //设置为电影
				this.markType(2, this.selectedFile.id)
			} else if (type == "addToCollection") {//移动到影集
				this.showCollectionSelectDialog = true
			} else if (type == "removeFromCollection") {//从影库移出
				this.api.post('/api/movieApi/removeIndexFromCollection', {
					indexIdList: [this.selectedFile.id]
				}).then((res) => {
					if (!res.code) {
						this.showVsNotification(this.$t('common.operationSuccess'))
						this.removeSelectedFileFromList()
					}
				}).catch((error) => { })
			} else if (type == "FAVORITE") {
				//收藏
				this.favoriteMovie(this.selectedIndex)
			}
		},
		onSelectCollection() {
			console.log("onSelectCollection")
			if (this.$refs.movieCollectionList) {
				let collectionId = this.$refs.movieCollectionList.getSelectedCollectionId()
				if (!collectionId) {
					return
				}
				movieUtil.onSelectCollection(this, this.selectedFile, collectionId, () => {
					this.showCollectionSelectDialog = false
					this.showVsNotification(this.$t('common.operationSuccess'))
					this.removeSelectedFileFromList()
				})
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
			this.$nextTick(() => {
				if (this.itemBaseWidth != this.sliderValue) {
					this.itemBaseWidth = this.sliderValue
					this.calImageWidth()
				}
			})
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
		//滚动回调
		onPageScroll(e) {
			if (e.target.id != "movie-list-wrapper") {
				return
			}
			//滚动的时候清空计时器 防止触发菜单
			if (this.longPressTimeout) {
				clearTimeout(this.longPressTimeout);
				this.longPressTimeout = null
			}
			if (this.$refs.scrollBar) {
				this.$refs.scrollBar.onScroll(e)
			}
			this.dealOnPageScroll(e, () => {
				this.loadNextPage();
			}, (showTopBtn) => {
			})
		},
		loadNextPage() {
			this.getMovies(true)
		},
		movieClick(index) {
			//电影点击
			this.selectedIndex = index
			this.showMovieInfoDetail = true
			this.pushState()
		},
		playClick(index) {

			if (this.movieList[index].is_tvplay == 1) {
				//点击的时电视剧 则先进入详情
				this.movieClick(index)
			} else {
				console.log("显示播放器")
				if (localStorage.getItem("rawPlayer") == "1") {
					//调用原生播放器
					jsBridge.playVideo({
						playIndex: index,
						playList: this.movieList,
						token: this.$store.state.token,
						fromFileBrower: false,
						serverType: "movie"
					})
				} else {
					//继续使用网页播放器
					this.showVideoDetail = true;
					this.$nextTick(() => {
						this.$refs.videoPlayer.playVideo(this.movieList, index);
					});
					this.pushState()
				}
			}
		},
		getMovies(append) {
			if (this.showMovieInfoDetail || this.showVideoDetail) {
				return
			}
			if (this.nextLoading || !this.nextHasMore) {
				return
			}
			if (!append) {
				this.movieList = []
			}
			this.$nextTick(() => {
				this.nextLoading = true
				let params = {
					collectionPwd: this.collectionPwd,
					libraryId:this.libraryId,
					collectionId: this.collectionId,
					hideLoading: true,
					count: this.count,
					excludeIds: [],
					sortField: this.sortField,
					sortType: this.sortType,
					searchStr: this.searchStr,
					offset: this.movieList.length,
					listType: this.listType,
					firstLetter: this.firstLetter
				}
				if (this.selectedSourceFolder && this.selectedSourceFolder.length > 0) {
					params.sourceFolderList = JSON.stringify(this.selectedSourceFolder)
				}

				//资源类型筛选 1是电影 2是电视剧
				if (this.selectedSourceType && this.selectedSourceType != this.$t('common.all')) {
					console.log("this.selectedSourceType", this.selectedSourceType)
					if (this.selectedSourceType == this.$t('movie.movie')) {
						params.sourceType = 1
					} else if (this.selectedSourceType == this.$t('movie.tvdrama')) {
						params.sourceType = 2
					}
				}
				if (this.selectedGenres && this.selectedGenres.length > 0) {
					params.movieGenres = JSON.stringify(this.selectedGenres)
				}
				if (this.selectedLanguage && this.selectedLanguage.length > 0) {
					params.movieLanguage = JSON.stringify(this.selectedLanguage)
				}
				if (this.selectedRegion && this.selectedRegion.length > 0) {
					params.movieRegion = JSON.stringify(this.selectedRegion)
				}
				this.api
					.post("/api/movieApi/getMovies", params)
					.then((res) => {
						if (!res.code) {
							this.showMovieInfoName = res.movieShowMatchName == 1

							movieUtil.dealMovieList(this.showMovieInfoName, res.data)

							if (append) {
								this.movieList=this.movieList.concat(res.data)
							} else {
								this.movieList = res.data
							}
							
							if (res.data.length < this.count) {
								console.log('没有更多了')
								this.nextHasMore = false
							} else {
								this.nextHasMore = true
							}
							this.nextLoading = false
							this.$nextTick(() => {
								this.calImageWidth();
								setTimeout(() => {
									this.calImageWidth();
								}, 300);
							})
						}
					})
					.catch((error) => {
						this.nextLoading = false
					});
			})
		}
	}
}
</script>
<style lang="scss" scoped>
.dialog-filter-title {
	width: 100%;
	text-align: left;
	font-weight: bold;
	margin-bottom: 5px
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

.movie-list-column {
	display: flex;
	flex-direction: column;
	width: 100%;
	cursor: pointer;
}

.movie-item-root {
	position: relative;
	display: inline-flex;
	flex-direction: column;
	align-items: center;
}


.collection-item {
	margin-top: 5px;
	margin-bottom: 5px;
	background-color: #eee;
	padding-top: 5px;
	padding-bottom: 5px;
	cursor: pointer;
	font-size: 16px;
	border-radius: 5px;
	color: $nas-text-grey;
}
</style>
