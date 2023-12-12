<template>
	<div style="width:100%">

		<my-nodata v-if="genresList.length < 1" :title="$t('common.noMore')"
					style="position: absolute;width: 100%;margin-top: 150px;">
		</my-nodata>
		<div class="movie-list" ref="listWrapper">

			<vs-card @click="onGenresTitleClick(genres)" type="1" v-for="(genres, genresIndex) in genresList" v-if="genres.movieList&&genres.movieList.length>0" :style="{width: itemWidth + 'px' ,'margin':itemMargin+'px'}">
				<template #title>
				  <p class="max-line-one" style="font-weight:bold">{{ genres.genresValue }}</p>
				</template>
				<template #img>
					<div class="img-inner-wrapper" v-if="genres.movieList.length>3" :style="{ width: itemWidth + 'px' , height: itemWidth + 'px'}">
						<img class="img-inner-four"  :src="genres.movieList[0].url" :style="{ width: itemWidth/2 + 'px' , height: itemWidth / 2+ 'px'}" />
						<img class="img-inner-four"  :src="genres.movieList[1].url" :style="{ width: itemWidth/2 + 'px' , height: itemWidth / 2+ 'px'}" />
						<img class="img-inner-four"  :src="genres.movieList[2].url" :style="{ width: itemWidth/2 + 'px' , height: itemWidth / 2+ 'px'}" />
						<img class="img-inner-four"  :src="genres.movieList[3].url" :style="{ width: itemWidth/2 + 'px' , height: itemWidth / 2+ 'px'}" />
					</div>
					
					<img v-else-if="genres.movieList.length>0" style="object-fit:cover" v-lazy="genres.movieList[0].url" :style="{ width: itemWidth + 'px' , height: itemWidth + 'px'}" />
					<img v-else style="object-fit: cover;" :style="{ width: itemWidth + 'px' , height: itemWidth + 'px'}"  src="@/static/photo/icon_movie_collection.png" />
				</template>
				<template #text>
				  <p>
				  </p>
				</template>
				<template #interactions>
				  <vs-button class="btn-chat" shadow primary v-if="$store.state.currentUser.is_admin ==1">
					<i class='bx bx-chat' ></i>
					<span class="span" >
						{{genres.indexCount}}
					</span>
				  </vs-button>
				</template>
			  </vs-card>

			<!-- <div class="genres-item-root" v-for="(genres, genresIndex) in genresList" v-if="genres.movieList&&genres.movieList.length>0">
				<div :style="{ 'margin-left': itemMargin + 'px' }" class="genres-title"
				
				@click="onGenresTitleClick(genres)">{{ genres.genresValue }}
				<a v-if="$store.state.currentUser.is_admin ==1">[{{genres.indexCount}}] </a><a>></a>
				</div>
				<div class="genres-movie-list-root">
					<div class="genres-movie-list-item" :style="{ 'margin': itemMargin + 'px', width: itemWidth + 'px' }"
						@click="movieClick(genresIndex, index)" 
						v-for="(movie, index) in genres.movieList" @mouseenter="mouseEnterImg(genresIndex, index)"
						@mouseleave="mouseLeaveImg(genresIndex, index)"
						@contextmenu="showRightMenu($event, $root, movie, genresIndex, index)" :key="movie.id"
						@touchstart="touchstart($event, movie, genresIndex, index)" @touchend="touchend">
						<movie-list-item-grid :movie="movie" :itemWidth="itemWidth"
							@playClick="playClick(genresIndex, index)"
							@favoriteMovie="favoriteMovie(genresIndex, index)"></movie-list-item-grid>
					</div>
				</div>
			</div> -->
		</div>

		<!-- 返回顶部按钮 -->
		<my-btn-icon v-if="showToTopBtn" style="position:fixed;right:20px;bottom:10px;" iIcon="md-arrow-up"
			@click="scrollToTop"></my-btn-icon>

		<Modal v-model="showVideoDetail" fullscreen footer-hide>
			<video-detail propsServerType="movie" v-if="showVideoDetail" @onClose="showVideoDetail = false"
				ref="videoPlayer"></video-detail>
		</Modal>
		<!-- 电影详情页 -->
		<Modal v-model="showMovieInfoDetail" fullscreen footer-hide :closable="false" class-name="modal-style-nopadding"
			@onClose="showMovieInfoDetail = false">
			<movie-info-detail @onClose="showMovieInfoDetail = false" :propsDetailMovieList="selectedGenres.movieList"
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


		<Modal v-model="showGenresDetail" fullscreen footer-hide :closable="false" class-name="modal-style-nopadding">
			<movie-genres-detail @onClose="showGenresDetail = false" v-if="showGenresDetail"
				:initGenres="selectedGenres"
				:initRegion="selectedRegion"></movie-genres-detail>
		</Modal>
	</div>
</template>
<script>
import videoDetail from "@/views/videoDetail/videoDetail.vue";
import MovieInfoDetail from "@/views/movies/movieDetail.vue";
import jsBridge from "@/plugins/jsBridge"
import movieListItemGrid from "@/views/movies/components/movieListItemGrid.vue";
import movieListItemList from "@/views/movies/components/movieListItemList.vue";
import movieUtil from "../utils/movieUtil";
import movieGenresDetail from "@/views/movies/components/movieGenresDetail.vue"
const movieCollectionList = () => import('@/views/movies/movieCollection.vue')

export default {
	props: {
		sliderValue: {
			default: 120,
			type: Number
		},
		genresType:{
			default:"movie_genres",
			type:String
		}
	},
	created() {
	},
	mounted() {
		this.loadFirstPage()
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
		movieCollectionList,
		movieGenresDetail,
		movieListItemList,
		movieListItemGrid,
		videoDetail,
		MovieInfoDetail
	},
	data() {
		return {
			showGenresDetail:false,
			selectedGenres:"",//点击标题时的风格
			selectedRegion:"", //点击标题时的地区
			showCollectionSelectDialog: false,//选择影集的对话框
			showFilterDialog: false,
			showMovieInfoDetail: false,
			showToTopBtn: false,
			showVideoDetail: false,
			rightMenuList: [],
			itemBaseWidth: 210,
			itemWidth: 210,
			itemMargin: 6,
			count: 50,
			movieList: [],
			genresList: [],//风格列表 
			nextHasMore: true, //后面还有没有更多了
			nextLoading: false, //上一页是否正在加载
			selectedGenresIndex: null,
			selectedGenres: null,
			selectedIndex: null,
			selectedFile: null,
			longPressTimeout: null,
			showLongPressMenu: false,
			showMovieInfoName: false, //是否显示匹配后的名字
		};
	},
	methods: {
		onSizeChange() {
			
		},
		onGenresTitleClick(genresObj){
			if(genresObj.genresType=="movie_genres"){
				this.selectedGenres=genresObj.genresValue
				this.selectedRegion=""
			}else if(genresObj.genresType=="movie_regions"){
				this.selectedGenres=""
				this.selectedRegion=genresObj.genresValue
			}
			this.showGenresDetail=true 
			this.pushState()
		},
		onFavoriteChange(indexId, favorite) {
			let movieList = this.genresList[this.selectedGenresIndex].movieList
			for (let i in movieList) {
				if (movieList[i].id == indexId) {
					movieList[i].favorite = favorite
					break
				}
			}
		},
		favoriteMovie(genresIndex, index) {
			let movieList = this.genresList[genresIndex].movieList
			let movieIndex = movieList[index]
			movieUtil.favoriteMovie(this, movieIndex, (isFavorite) => { })
		},
		
		onPopstate() {
			if (this.showGenresDetail) {
				this.showGenresDetail=false
			}else if (this.showMovieInfoDetail) {
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
		touchstart(event, item, genresIndex, index) {
			clearTimeout(this.longPressTimeout); //再次清空定时器，防止重复注册定时器
			this.longPressTimeout = setTimeout(() => {
				this.onLongPress(item, genresIndex, index)
			}, 800);
		},
		touchend() {
			clearTimeout(this.longPressTimeout); //清空定时器，防止重复注册定时器
		},
		onLongPress(item, genresIndex, index) {
			this.selectedFile = item
			this.selectedIndex = index
			this.selectedGenresIndex = genresIndex
			this.selectedGenres = this.genresList[genresIndex]
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
			let movieList = this.genresList[this.selectedGenresIndex].movieList
			this.rightMenuList = movieUtil.initRightMenu(this, file, movieList[this.selectedIndex], 0)
		},
		showRightMenu(event, root, file, genresIndex, index) {
			if (this.isMobile) return event.preventDefault()
			this.selectedGenresIndex = genresIndex
			this.selectedGenres = this.genresList[genresIndex]
			this.selectedFile = file
			this.selectedIndex = index
			this.initRightMenu(file)
			this.$easycm(event, root)
		},
		deleteApi() {
			movieUtil.deleteApi(this, this.selectedFile)
		},
		removeSelectedFileFromList() {
			let movieList = this.genresList[this.selectedGenresIndex].movieList

			for (let i in movieList) {
				if (movieList[i].id == this.selectedFile.id) {
					movieList.splice(i, 1)
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
			if (type == 'CHECK') { //查看
				this.movieClick(this.selectedGenresIndex, this.selectedIndex)
			} else if (type == 'DELETE') { //收藏
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
				this.favoriteMovie(this.selectedGenresIndex, this.selectedIndex)
			}
		},
		onSelectCollection() {
			if(this.$refs.movieCollectionList){
				let collectionId=this.$refs.movieCollectionList.getSelectedCollectionId()
				if(!collectionId){
					return
				}
				movieUtil.onSelectCollection(this, this.selectedFile, collectionId,() => {
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
			let wrapper = this.$refs.listWrapper.getBoundingClientRect();
			let itemWidth = this.utils.calItemWidth(wrapper, this.itemBaseWidth, this.itemMargin)
			if (itemWidth) this.itemWidth = itemWidth

		},

		mouseEnterImg(genresIndex, index) {
			let movieList = this.genresList[genresIndex].movieList
			if (!this.isMobile) {
				this.$set(movieList[index], "hover", true);
			}
		},
		mouseLeaveImg(genresIndex, index) {
			let movieList = this.genresList[genresIndex].movieList
			if (!this.isMobile) {
				movieList[index].hover = false;
			}
		},
		//窗口变化回调
		onWindowResize() {
			//重新计算照片高度
			this.calImageWidth();
		},

		movieClick(genresIndex, index) {
			//电影点击
			this.selectedIndex = index
			this.selectedGenresIndex = genresIndex
			this.selectedGenres = this.genresList[genresIndex]
			console.log("显示详情")
			this.showMovieInfoDetail = true
			this.pushState()
		},
		playClick(genresIndex, index) {
			let movieList = this.genresList[genresIndex].movieList
			if (movieList[index].is_tvplay == 1) {
				//点击的时电视剧 则先进入详情
				this.movieClick(genresIndex, index)
			} else {
				console.log("显示播放器")
				if (localStorage.getItem("rawPlayer") == "1") {
					//调用原生播放器
					jsBridge.playVideo({
						playIndex: index,
						playList: movieList,
						token: this.$store.state.token,
						fromFileBrower: false,
						serverType: "movie"
					})
				} else {
					//继续使用网页播放器
					this.showVideoDetail = true;
					this.$nextTick(() => {
						this.$refs.videoPlayer.playVideo(movieList, index);
					});
					this.pushState()
				}
			}
		},
		getMovies() {
			if (this.showMovieInfoDetail || this.showVideoDetail) {
				return
			}
			if (this.nextLoading || !this.nextHasMore) {
				return
			}
			this.$nextTick(() => {
				this.nextLoading = true
				console.log("开始请求数据")
				this.api
					.post("/api/movieApi/getMoviesByGenres", {genresType:this.genresType,pageCount:4})
					.then((res) => {
						this.showMovieInfoName = res.movieShowMatchName == 1
						this.genresList = res.data
						for (let genresObj of this.genresList) {
							// console.log(genresObj.movieList)
							movieUtil.dealMovieList(this.showMovieInfoName, genresObj.movieList)
						}
						this.$nextTick(() => {
							this.calImageWidth()
						})
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
	scrollbar-width: none;
	align-content: flex-start;

	@media all and (max-width:640px) {
		-webkit-overflow-scrolling: touch;
	}

}
.img-inner-wrapper{
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	
	.img-inner-four{
		object-fit: cover;
		border-radius: 0px !important;

	}
}
.genres-title {
	cursor: pointer;
	margin-bottom:10px;
	width: 100%;
	text-align: left;
	font-size: 18px;
	font-weight: bolder;
	display: flex;
	align-items: center;

	a{
		margin-left: 10px;
		font-size: 14px;
	}
	span {
		margin-left: 10px;
		font-size: 16px;
	}
}

.genres-item-root {
	border-radius: 10px;
	width: 100%;
	margin-top: 10px;
	margin-bottom: 10px;
	overflow-x:hidden;
	.genres-movie-list-root {
		display: flex;
		flex-direction: row;
		flex-wrap:wrap;
		align-content: flex-start;
		overflow-x: auto;
		width:100%;

		.genres-movie-list-item {
			padding-bottom: 10px;
			cursor: pointer;
			flex-shrink: 0;
			position: relative;
			display: inline-flex;
			flex-direction: column;
			align-items: center;
		}
	}
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
