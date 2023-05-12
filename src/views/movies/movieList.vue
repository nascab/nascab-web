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
				<!-- 筛选按钮 -->
				<Icon color="#386DF2" size="35" class="icon-showtype" type="ios-funnel" @click="showFilterDialog = true" />
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
						<!-- <Button type="primary"
							shape="circle" icon="md-play"></Button> -->
						<img v-if="movie.hover" @click.stop="playClick(index)" class="icon-play"
							src="@/static/icon_play.png" />
						<!-- 视频的时长 -->
						<p class="icon-duration">{{ utils.formatSeconds(movie.duration) }}</p>

						<!-- 电影评分 -->
						<div v-if="movie.movie_douban_score && movie.movie_douban_score > 0" class="movie-score-bg">
							<span class="movie-score">{{
								movie.movie_douban_score
							}}</span>
						</div>
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
						{{ movie.show_name }}
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
							<Button type="primary" v-if="movie.hover" @click.stop="playClick(index)" class="icon-play"
								shape="circle" icon="md-play"></Button>
							<!-- 视频的时长 -->
							<p class="icon-duration-list">{{ utils.formatSeconds(movie.duration) }}</p>

							<!-- 电影评分 -->
							<div v-if="movie.movie_douban_score && movie.movie_douban_score > 0" class="movie-score-bg">
								<span class="movie-score">{{
									movie.movie_douban_score
								}}</span>
							</div>
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
								{{ movie.show_name }}
								<span v-if="movie.movie_year">[{{ parseInt(movie.movie_year) }}]</span>
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
			<movie-info-detail @onClose="showMovieInfoDetail = false" :propsDetailMovieList="movieList"
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

		<!-- 选择影集的对话框 -->
		<vs-dialog scroll v-model="showCollectionSelectDialog">
			<template #header>
				<h4 class="not-margin">
					{{ $t('movie.whichCollectionWantoMove') }}
				</h4>
			</template>
			<div v-for="collection in collectionList">
				<div class="collection-item" @click="onSelectCollection(collection)">
					{{ collection.title }}
				</div>
			</div>
			<div v-if="collectionList && collectionList.length < 1" class="collection-item">{{ $t('movie.noCollection') }}</div>

		</vs-dialog>



		<!-- 筛选来源文件夹 国别 语言 类型 -->
		<vs-dialog v-model="showFilterDialog">
			<h4>{{ $t('movie.movieFilter') }}</h4>
			<Divider></Divider>
			<div>
				<p style="width:100%;text-align:left">{{ $t('movie.selectSourceFolder') }}</p>
				<Select v-model="selectedSourceFolder" style="width:100%;margin-top: 10px;" @on-change="onFilterFinish">
					<Option v-for="source in sourceFolderList" :value="source" :key="source">{{ source }}</Option>
				</Select>
				<!-- 资源类型 -->
				<p style="width:100%;text-align:left;margin-top: 10px;">{{ $t('movie.resources') }}</p>
				<Select v-model="selectedSourceType" style="width:100%;margin-top: 10px;" @on-change="onFilterFinish">
					<Option v-for="source in sourcTypeList" :value="source" :key="source">{{ source }}</Option>
				</Select>
				<p style="width:100%;text-align:left;margin-top: 10px;">{{ $t('movie.selectLanguage') }}</p>
				<Select v-model="selectedLanguage" style="width:100%;margin-top: 10px;" @on-change="onFilterFinish">
					<Option v-for="source in languageList" :value="source" :key="source">{{ source }}</Option>
				</Select>
				<p style="width:100%;text-align:left;margin-top: 10px;">{{ $t('movie.selectRegion') }}</p>
				<Select v-model="selectedRegion" style="width:100%;margin-top: 10px;" @on-change="onFilterFinish">
					<Option v-for="source in regionList" :value="source" :key="source">{{ source }}</Option>
				</Select>
				<p style="width:100%;text-align:left;margin-top: 10px;">{{ $t('movie.selectGenres') }}</p>
				<Select v-model="selectedGenres" style="width:100%;margin-top: 10px;" @on-change="onFilterFinish">
					<Option v-for="source in genresList" :value="source" :key="source">{{ source }}</Option>
				</Select>

				<div style="width:100%;margin-top: 30px;" @click="resetFilterData">
					<my-btn type="white" :title="$t('common.resetDefault')" style="max-width:300px;width:100%"></my-btn>
				</div>
			</div>
		</vs-dialog>
	</div>
</template>
<script>
import axios from "@/plugins/axios";
import videoDetail from "@/views/videoDetail/videoDetail.vue";
import MovieInfoDetail from "@/views/movies/movieDetail.vue";
import jsBridge from "@/plugins/jsBridge"

export default {
	props: {
		collectionPwd: {
			default: "",
			type: String
		},
		collectionId: {
			default: 0,
			type: Number
		}
	},
	created() {
	},
	mounted() {
		console.log("mounted")
		let showType = localStorage.getItem("movie-list-show-type");
		if (showType) {
			this.showType = showType;
			this.onSelectShowType(this.showType)
		}

		this.loadFirstPage()

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
		this.getMovieKeys()

		//监听后退事件
		window.addEventListener('popstate', this.onPopstate)

	},
	beforeDestroy() {
		window.removeEventListener("scroll", this.onPageScroll, true);
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
			showCollectionSelectDialog: false,//选择影集的对话框
			collectionList: null,
			showFilterDialog: false,
			sourcTypeList: [this.$t('common.all'), this.$t('movie.movie'), this.$t('movie.tvdrama')],
			sourceFolderList: [this.$t('common.all')],
			selectedSourceType: this.$t('common.all'),
			selectedSourceFolder: this.$t('common.all'),//已选的来源文件夹
			selectedLanguage: this.$t('common.all'),//已选的语言
			selectedRegion: this.$t('common.all'),//已选的地区
			selectedGenres: this.$t('common.all'),//已选的电影类型
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
			sliderMin: 150,
			sliderMax: 280,
			sliderValue: 150,
			itemBaseWidth: 150,
			itemWidth: 150,
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
			showLongPressMenu: false,
			showMovieInfoName: false, //是否显示匹配后的名字
			genresList: [this.$t('common.all')],//类型
			languageList: [this.$t('common.all')],//语言
			regionList: [this.$t('common.all')]//地区
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
		resetFilterData() {
			this.selectedSourceFolder = this.$t('common.all')
			this.selectedGenres = this.$t('common.all')
			this.selectedLanguage = this.$t('common.all')
			this.selectedRegion = this.$t('common.all')
			this.selectedSourceType = this.$t('common.all')
			this.onFilterFinish()
		},
		onFilterFinish() {
			console.log('onFilterFinish')
			this.searchStr = ""
			this.loadFirstPage()
		},
		//获取来源文件夹
		getSourceFolder() {
			this.api.post('/api/sourceFolderApi/getPathByType', {
				type: 'movie',
			}).then((res) => {
				if (!res.code) {

					//查询是否设置了来源文件夹 没有设置用户设置
					if (this.$store.state.currentUser.is_admin == 1 && this.collectionId == 0) {

						if (res.data.length < 1) {
							this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('movie.noSourceSetAlert'),
								() => {
									this.$emit('setViewType', 'sourceSet')
								}, null, this.$t('photo.goToSet'))
						} else {
							for (let i in res.data) {
								if (res.data[i].exist == 0) {
									this.showVsConfirmDialog(this.$t('common.confirm'), this.$t(
										'photo.sourcePathUnusable', { path: res.data[i].path }), () => {
											this.$emit('setViewType', 'sourceSet')
										}, null, this.$t('photo.goToSet'))
									break
								}
							}
						}
					}
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
			}]
			if (file.is_tvplay == 0) {
				this.rightMenuList.push({
					text: this.$t('common.delete'),
					type: "DELETE"
				})
			}
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
			if (this.collectionId == 0) {
				// 菜单： 添加到影库
				this.rightMenuList.push({
					text: this.$t('movie.addToCollection'),
					type: "addToCollection"
				})
			} else {
				//菜单 从影库移出
				this.rightMenuList.push({
					text: this.$t('movie.removeFromCollection'),
					type: "removeFromCollection"
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
						this.removeSelectedFileFromList()
					}
				}).catch((error) => { })
			}).catch((error) => { })
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
			} else if (type == "addToCollection") {//移动到影集
				this.showCollectionSelectDialog = true
				if (this.collectionList == null) {
					this.api.post('/api/movieApi/getCollection', {
					}).then((res) => {
						if (!res.code) {
							this.collectionList = res.data
						}
					}).catch((error) => { })
				}

			} else if (type == "removeFromCollection") {//从影库移出
				this.api.post('/api/movieApi/removeIndexFromCollection', {
					indexIdList: [this.selectedFile.id]
				}).then((res) => {
					if (!res.code) {
						this.showVsNotification(this.$t('common.operationSuccess'))
						this.removeSelectedFileFromList()
					}
				}).catch((error) => { })
			}
		},
		onSelectCollection(collection) {
			// 移动到影集
			this.api.post('/api/movieApi/addIndexToCollection', {
				collectionId: collection.id,
				indexId: this.selectedFile.id
			}).then((res) => {
				if (!res.code) {
					this.showCollectionSelectDialog = false
					this.showVsNotification(this.$t('common.operationSuccess'))
					this.removeSelectedFileFromList()
				}
			}).catch((error) => { })
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
			//滚动的时候清空计时器 防止触发菜单
			if (this.longPressTimeout) {
				clearTimeout(this.longPressTimeout);
				this.longPressTimeout = null
			}
			this.dealOnPageScroll(e, () => {
				this.loadNextPage();
			}, (showTopBtn) => {
				this.showToTopBtn = showTopBtn
			})
		},
		loadNextPage() {
			this.getMovies(true)
		},
		movieClick(index) {
			//电影点击
			this.selectedIndex = index

			console.log("显示详情")

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
					jsBridge.playVideo(JSON.stringify({
						playIndex: index,
						playList: this.movieList,
						token: this.$store.state.token,
						fromFileBrower: false,
						serverType: "movie"
					}))
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
			console.log("loadFirstPage", this.nextLoading, this.nextHasMore)

			if (this.nextLoading || !this.nextHasMore) {
				return
			}
			if (!append) {
				this.movieList = []
			}
			this.nextLoading = true
			let params = {
				collectionPwd: this.collectionPwd,
				collectionId: this.collectionId,
				hideLoading: true,
				count: this.count,
				excludeIds: [],
				sortField: this.sortField,
				sortType: this.sortType,
				searchStr: this.searchStr,
				offset: this.movieList.length
			}
			console.log("params", params)
			if (this.selectedSourceFolder && this.selectedSourceFolder != this.$t('common.all')) {
				params.sourceFolder = axios.encodePath(this.selectedSourceFolder)
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
			if (this.selectedGenres && this.selectedGenres != this.$t('common.all')) {
				params.movieGenres = this.selectedGenres
			}
			if (this.selectedLanguage && this.selectedLanguage != this.$t('common.all')) {
				params.movieLanguage = this.selectedLanguage
			}
			if (this.selectedRegion && this.selectedRegion != this.$t('common.all')) {
				params.movieRegion = this.selectedRegion
			}
			this.api
				.post("/api/movieApi/getMovies", params)
				.then((res) => {

					this.showMovieInfoName = res.movieShowMatchName == 1
					for (let i = 0; i < res.data.length; i++) {
						let url = axios.getImgFullPath(res.data[i].id, true, res.data[i].filename, 'movie');
						let rawUrl = axios.getImgFullPath(res.data[i].id, false, res.data[i].filename, 'movie');
						res.data[i].url = url
						if (res.data[i].movie_cover_path && res.data[i].movie_info_state == 1) {
							//如果有封面 则使用封面
							res.data[i].url = axios.getRawFileUrl(res.data[i].movie_cover_path, '', 'movie')
						} else if (res.data[i].folder_cover_path) {
							//没有封面 看看有没有同文件夹下匹配的海报
							res.data[i].url = axios.getRawFileUrl(res.data[i].folder_cover_path, '', 'movie')
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

						if (!res.data[i].show_name) {
							if (this.showMovieInfoName && res.data[i].movie_info_state == 1 && res.data[i].movie_info_name) {
								res.data[i].show_name = res.data[i].movie_info_name
							}
							if(!res.data[i].show_name){
								res.data[i].show_name=res.data[i].filename
							}
						}



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
						setTimeout(() => {
							this.calImageWidth();
						}, 300);
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

.movie-score-bg {
	position: absolute;
	right: 5%;
	bottom: 5%;
	width: 28px;
	height: 28px;
	background: white;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);


	.movie-score {
		padding-top: 2px;
		color: #ff9900;
		font-size: 12px;
		font-weight: bold;
		text-align: center;
	}

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
	box-shadow: 2px 5px 5px rgba(0, 0, 0, .2);
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
