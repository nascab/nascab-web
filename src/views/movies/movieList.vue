<template>
	<div class="movie-list-root">
		<!-- 头部 -->
		<div class="movie-header">
			<div style="display: flex;align-items: center;">
				<!-- grid list 切换 -->
				<div>
					<Icon color="#386DF2" size="35" class="icon-showtype" v-if="showType == 'grid'" type="ios-apps"
						@click="onSelectShowType('list')" />
					<Icon color="#386DF2" size="35" class="icon-showtype" v-else type="md-list"
						@click="onSelectShowType('grid')" />
				</div>
				<!-- 筛选来源文件夹的按钮 -->
				<Icon v-if="(sourceFolderList.length > 1)" color="#386DF2" size="35" class="icon-showtype"
					type="ios-funnel" @click="onSelectSourceType()" />
				<!-- 创建时间排序 文件名排序 -->
				<my-menu-select style="flex-shrink:0;margin-right: 20px;" :withOrder="true" @onItemClick="clickOrder"
					:optionList="orderMenuOptionList"></my-menu-select>

				<!-- 改变图片大小 -->
				<div class="nas-mobile-none">
					<Slider v-if="showType == 'grid'" class="zoom-slider" show-tip="never" v-model="sliderValue"
						:min="sliderMin" :max="sliderMax" :step="10" @on-input="onSizeChange">
					</Slider>
				</div>
			</div>
			<!-- 搜索栏 -->
			<my-search :placeholder="$t('movie.searchPlaceHolder')" @onSearch="onSearch"></my-search>
		</div>

		<div style="width:100%;height: 100%;display:flex;flex-direction:row;overflow: hidden;padding-top: 80px;">
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
						<Button type="primary" v-if="movie.hover" @click.stop="playClick(index)" class="icon-play"
							shape="circle" icon="md-play"></Button>
						<!-- 视频的时长 -->
						<p class="icon-duration">{{ utils.formatSeconds(movie.duration) }}</p>
					</div>
					<div v-if="movie.hover"
						style="position: absolute;left: 10px;top: 10px;height: 30px;display: flex;align-items: center;">

						<img v-if="movieList[index].movie_douban_id"
							@click.stop="utils.checkDouban(movieList[index].filename, parseInt(movieList[index].movie_douban_id))"
							style="width: 30px;height: 30px;" src="@/static/social-douban.png" />

						<img v-if="movieList[index].movie_imdb_id"
							@click.stop="utils.checkImdb(movieList[index].filename, movieList[index].movie_imdb_id)"
							style="border-radius: 5px; width: 30px;height: 30px;margin-left: 10px;"
							src="@/static/icon_imdb.png" />
					</div>
					<!-- 名称 -->
					<p class="filename">
						{{ movie.filename }}
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
							<Button type="primary" v-if="movie.hover" @click.stop="playClick(index)" class="icon-play"
								shape="circle" icon="md-play"></Button>
							<!-- 视频的时长 -->
							<p class="icon-duration-list">{{ utils.formatSeconds(movie.duration) }}</p>
						</div>

						<div v-if="movie.hover"
							style="position: absolute;left: 15px;top: 5px;height: 30px;display: flex;align-items: center;">
							<img v-if="movieList[index].movie_douban_id"
								@click.stop="utils.checkDouban(movieList[index].filename, parseInt(movieList[index].movie_douban_id))"
								style="width: 30px;height: 30px;" src="@/static/social-douban.png" />
							<img v-if="movieList[index].movie_imdb_id"
								@click.stop="utils.checkImdb(movieList[index].filename, movieList[index].movie_imdb_id)"
								style="border-radius: 5px; width: 30px;height: 30px;margin-left: 10px;"
								src="@/static/icon_imdb.png" />
						</div>
						<!-- 名称 -->
						<div style="display:flex;flex-direction:column;height: 100%;">
							<p class="filename max-line-three">
								{{ movie.filename }}
							</p>
							<p class="filepath max-line-three">
								{{ movie.path }}
							</p>
							<p class="filepath max-line-three">
								{{ movie.sizeStr }}
							</p>
						</div>
					</div>
					<div style="width: 100%;height: 1px;background-color: #eee;margin-top: 10px;margin-bottom: 10px;">
					</div>
				</div>
				<!-- 底部的loading和没有更多 -->
				<div style="display: flex;justify-content: center;width: 100%;flex-direction:column;align-items:center">
					<!-- 手动加载更多的按钮 -->
					<Button v-if="nextHasMore && movieList.length > 0" @click="loadNextPage()" type="default"
						style="width: 250px;margin-top: 30px;height:45px;border-radius:20px">{{ $t('common.loadmore')
						}}</Button>
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


		<Modal v-model="showVideoDetail" fullscreen footer-hide :closable="false">
			<video-detail propsServerType="movie" v-if="showVideoDetail" @onClose="showVideoDetail = false"
				ref="videoPlayer"></video-detail>
		</Modal>
		<!-- 电影详情页 -->
		<Modal v-model="showMovieInfoDetail" fullscreen footer-hide>
			<movie-info-detail @onClose="showMovieInfoDetail = false" :propsDetailMovieList="movieList"
				:propsDetailIndex="selectedIndex" ref="movieInfoDetail" v-if="showMovieInfoDetail"
				@onMarkType="markType">
			</movie-info-detail>
		</Modal>
		<!-- 右键菜单 -->
		<easy-cm @ecmcb="rightMenuClick" :list="rightMenuList"></easy-cm>

		<!-- 手机端长按条目的时候弹出的菜单 -->
		<vs-dialog v-model="showLongPressMenu">
			<h4 v-if="selectedFile" class="max-line-one" style="word-break:break-all">{{ selectedFile.filename }}</h4>
			<vs-button border v-for="menu in rightMenuList" @click="rightMenuClick(null, menu.type)"
				style="width:100%;margin-top:15px">
				{{ menu.text }}
			</vs-button>
		</vs-dialog>

		<vs-dialog v-model="showSelectSourceFolder">
			<h4>{{ $t('movie.selectSourceFolder') }}</h4>
			<div style="margin-top:20px;cursor: pointer;">
				<div>
					<div @click="onSourceFolderClick('')" class="source-item">{{ $t('common.all') }}</div>
				</div>
				<div v-for="source in sourceFolderList">
					<div @click="onSourceFolderClick(source)" class="source-item">{{ source }}</div>
				</div>
			</div>
		</vs-dialog>
	</div>
</template>
<script>
import axios from "@/plugins/axios";
import videoDetail from "@/views/videoDetail/videoDetail.vue";
import MovieInfoDetail from "@/views/movies/movieDetail.vue";

export default {
	created() {
		console.log('created created ')
	},
	mounted() {
		console.log('mounted mounted ')

		//在header的mounted中触发加载第一页数据 在onChooseRange
		let showType = localStorage.getItem("movie-list-show-type");
		if (showType) {
			this.showType = showType;
			this.onSelectShowType(this.showType)
		}

		this.loadFirstPage()

		//查询是否设置了来源文件夹 没有设置用户设置
		if (this.$store.state.currentUser.is_admin == 1) {
			this.api.post('/api/sourceFolderApi/getPathByType', {
				type: 'movie',
			}).then((res) => {
				if (!res.code) {
					if (res.data.length < 1) {
						this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('movie.noSourceSetAlert'),
							() => {
								this.$router.push({
									path: '/setting',
									query: {
										index: 3
									}
								})
							}, null, this.$t('photo.goToSet'))
					}
				}
			}).catch((error) => { })
		}

		// 监听滚动条
		window.addEventListener("scroll", this.onPageScroll, true);
		//窗口变化监听
		window.addEventListener("resize", this.onWindowResize);

		let saveSliderValue = localStorage.getItem('MovieImageSize')
		if (saveSliderValue && parseInt(saveSliderValue) >= 100) {
			this.sliderValue = parseInt(saveSliderValue)
			this.onSizeChange()
		}
		this.getSourceFolder()
	},
	beforeDestroy() {
		window.removeEventListener("scroll", this.onPageScroll, true);
		window.removeEventListener("resize", this.onWindowResize);
		if (this.sliderValue) localStorage.setItem('MovieImageSize', this.sliderValue)

	},
	components: {
		videoDetail,
		MovieInfoDetail
	},
	data() {
		return {
			showSelectSourceFolder: false,
			sourceFolderList: [],
			selectedSourceFolder: '',
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
			sliderMin: 130,
			sliderMax: 280,
			sliderValue: 130,
			itemBaseWidth: 130,
			itemWidth: 130,
			itemMargin: 6,
			sortField: 'recent',
			sortType: 'desc',
			count: 50,
			movieList: [],
			nextHasMore: true, //后面还有没有更多了
			nextLoading: false, //上一页是否正在加载
			sortField: 'check_time',
			sortType: 'desc',
			searchStr: '',
			showType: 'grid',
			selectedIndex: null,
			selectedFile: null,
			longPressTimeout: null,
			showLongPressMenu: false
		};
	},
	computed: {

	},
	methods: {
		onSourceFolderClick(source) {
			console.log('onSourceFolderClick', source)
			this.selectedSourceFolder = source
			this.loadFirstPage()
			this.showSelectSourceFolder = false
		},
		//展示选择来源文件夹的对话框
		onSelectSourceType() {
			this.showSelectSourceFolder = true
		},
		//获取来源文件夹
		getSourceFolder() {
			this.api.post('/api/sourceFolderApi/getPathByType', {
				type: 'movie',
			}).then((res) => {
				if (!res.code) {
					this.sourceFolderList = []
					for (let i in res.data) {
						this.sourceFolderList.push(res.data[i].path)
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
			}, {
				text: this.$t('common.delete'),
				type: "DELETE"
			}]
			console.log('file.is_tvplay', file.is_tvplay)
			if (file.is_tvplay == 1) {
				this.rightMenuList.push({
					text: this.$t('movie.setAsMovie'),
					type: "setAsMovie"
				})

			} else {
				this.rightMenuList.push({
					text: this.$t('movie.setAsTv'),
					type: "setAsTv"
				})
			}
		},
		showRightMenu(event, root, file, index) {
			if (this.isMobile) return event.preventDefault()
			this.selectedFile = file
			this.selectedIndex = index
			this.initRightMenu(file)
			this.$easycm(event, root)
		},
		deleteApi(needRefresh) {
			this.api.post('/api/fileApi/deleteFromDisk', {
				ids: [this.selectedFile.id],
				serverType: "movie"
			}).then((res) => {
				if (!res.code) {
					if (res.errCount > 0) {
						this.showVsNotification(this.$t('file.deleteFail'));
					} else {
						this.showVsNotification(this.$t('file.deleteSuc'));
						for (let i in this.movieList) {
							if (this.movieList[i].id == this.selectedFile.id) {
								this.movieList.splice(i, 1)
								this.selectedFile = null
								break
							}
						}
					}
				}
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
			} else if (type == 'setAsTv') { //设置为电视剧
				this.markType(1, this.selectedFile.id)
			} else if (type == 'setAsMovie') { //设置为电影
				this.markType(2, this.selectedFile.id)
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
		//滚动回调
		onPageScroll(e) {
			let scrollTop = null;
			let scrollHeight = null;
			if (e.srcElement.scrollingElement) {
				scrollTop = e.srcElement.scrollingElement.scrollTop
				scrollHeight = e.srcElement.scrollingElement.scrollHeight
			} else if (e.srcElement) {
				scrollTop = e.srcElement.scrollTop
				scrollHeight = e.srcElement.scrollHeight
			} else if (e.target) {
				scrollTop = e.target.scrollTop
				scrollHeight = e.target.scrollHeight
			}
			this.scrollTop = scrollTop
			let windowHeight = document.documentElement.clientHeight;
			if (!scrollHeight && e.srcElement.scrollingElement) {
				scrollHeight = e.srcElement.scrollingElement.scrollHeight;
			}
			if (this.scrollTop > windowHeight) {
				this.showToTopBtn = true
			} else {
				this.showToTopBtn = false
			}
			if (this.scrollTop + windowHeight >= scrollHeight - 5) {
				this.loadNextPage();
			}
		},
		loadNextPage() {
			this.getMovies(true)
		},
		movieClick(index) {
			//电影点击
			this.selectedIndex = index
			if (this.isMobile) {
				//手机端直接跳页面
				this.$router.push({
					name: 'movieDetail',
					params: {
						detailMovieList: this.movieList,
						detailIndex: this.selectedIndex
					}
				});
			} else {
				this.showMovieInfoDetail = true
			}
		},
		playClick(index) {
			if (this.isMobile) {
				//手机端直接跳页面
				this.$router.push({
					name: 'videoDetail',
					params: {
						passVideoList: this.movieList,
						passPlayIndex: index,
						serverType: 'movie'
					},
				});
			} else {
				this.showVideoDetail = true;
				this.$nextTick(() => {
					this.$refs.videoPlayer.playVideo(this.movieList, index);
				});
			}
		},
		getMovies(append) {
			if (this.nextLoading || !this.nextHasMore) {
				return
			}
			if (!append) {
				this.movieList = []
			}
			this.nextLoading = true
			let params = {
				hideLoading: true,
				count: this.count,
				excludeIds: [],
				sortField: this.sortField,
				sortType: this.sortType,
				searchStr: this.searchStr,
				offset: this.movieList.length
			}
			if (this.selectedSourceFolder) {
				params.sourceFolder = axios.encodePath(this.selectedSourceFolder)
			}
			this.api
				.post("/api/movieApi/getMovies", params)
				.then((res) => {
					for (let i = 0; i < res.data.length; i++) {
						let url = axios.getImgFullPath(res.data[i].id, true, res.data[i].filename, 'movie');
						let rawUrl = axios.getImgFullPath(res.data[i].id, false, res.data[i].filename, 'movie');
						res.data[i].url = url
						if (res.data[i].movie_cover_path) {
							//如果有封面 则使用封面
							res.data[i].url = axios.getRawFileUrl(res.data[i].movie_cover_path, '', 'movie')
						}
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
					if (append) {
						this.movieList.push(...res.data)
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
		margin-left: 10px;
		border-radius: 10px;
		background-color: black;
		width: 150px;
		height: 200px;
		object-fit: cover;
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
}

.cover-root {
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}

.icon-play {
	border-radius: 50%;
	width: 60px;
	height: 60px;
	position: absolute;
}

.icon-duration {
	font-size: 14px;
	color: #eee;
	position: absolute;
	left: 5%;
	bottom: 5%;
	font-weight: bold;
}

.icon-duration-list {
	font-size: 14px;
	color: #eee;
	position: absolute;
	left: 15%;
	bottom: 5%;
	font-weight: bold;
}

.movie-cover {
	pointer-events: none; //禁止响应点击事件
	border-radius: 10px;
	background-color: black;
	width: 100%;
	object-fit: cover;
}


.movie-header {
	left: 0;
	position: absolute;
	z-index: 2;
	width: 100%;
	position: absolute;
	height: 80px;
	padding-left: 10px;
	padding-right: 10px;

	@media not all and (max-width:640px) {
		padding-left: 30px;
		padding-right: 30px;
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
