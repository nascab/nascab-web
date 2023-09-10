<template>
	<div class="movie-list-root">
		<!-- 头部 -->
		<div class="movie-header">
			<div style="display: flex;align-items: center;">

				<Badge :count="filterConditionCount" class="operation-icon" :style="{ 'margin-left': itemMargin + 'px' }">
					<!-- 筛选按钮 -->
					<span class="nasIcons icon-filter " @click="showFilterDialog = true"></span>
				</Badge>

				<!-- 排序按钮 -->
				<Poptip placement="bottom">
					<span v-if="sortType == 'asc'" class="nasIcons icon-sort-alpha-up operation-icon"></span>
					<span v-if="sortType == 'desc'" class="nasIcons icon-sort-alpha-down-alt operation-icon"></span>
					<template #content>
						<div class="sort-root">
							<div>{{ $t("common.sortField") }}</div>
							<RadioGroup @on-change="clickOrder" style="margin-top:5px" v-model="sortField" vertical>

								<Radio label="check_time">
									<span>{{ $t('checkTime') }}</span>
								</Radio>
								<Radio label="filename">
									<span>{{ $t('movie.filename') }}</span>
								</Radio>
								<Radio label="create_time">
									<span>{{ $t('movie.createTime') }}</span>
								</Radio>
							</RadioGroup>
							<div style="margin-top:15px">{{ $t("common.sortType") }}</div>
							<RadioGroup @on-change="clickOrder" style="margin-top:5px" v-model="sortType" vertical>
								<Radio label="asc">
									<span>{{ $t('common.asc') }}</span>
								</Radio>
								<Radio label="desc">
									<span>{{ $t('common.desc') }}</span>
								</Radio>
							</RadioGroup>
						</div>
					</template>
				</Poptip>
				<!-- 全部/收藏/风格 -->
				<my-menu-select :shrinkModeTh="260" @onItemClick="onChooseDataType" ref="listTypeMenu"
					:optionList="typeMenuOptionList" :initValue="listType"></my-menu-select>

			</div>
			<!-- 搜索栏 -->
			<my-search ref="mySearch" :placeholder="$t('movie.searchPlaceHolder')" @onSearch="onSearch"></my-search>
		</div>

		<div style="width:100%;height: 100%;display:flex;flex-direction:row;overflow: hidden;padding-top: 70px;">
			<!-- 电影列表/收藏内容 -->
			<movie-list-content v-if="isMovieListPage" ref="movieListContent" :sliderValue="sliderValue"
				:sortField="sortField" :sortType="sortType" :searchStr="searchStr" :showType="showType" :listType="listType"
				:firstLetter="firstLetter" :sourceFolderList="sourceFolderList" :selectedSourceType="selectedSourceType"
				:selectedSourceFolder="selectedSourceFolder" :selectedLanguage="selectedLanguage"
				:libraryId="libraryId"
				:collectionId="collectionId" :collectionPwd="collectionPwd" :selectedRegion="selectedRegion"
				:selectedGenres="selectedGenres" :isAiCollection="isAiCollection"></movie-list-content>
			<!-- 字母索引表 -->
			<letter-index ref="letterIndex" v-if="isMovieListPage" style="flex-shrink:0"
				@onLetterClick="onLetterClick"></letter-index>

			<!-- 按风格查看 -->
			<movie-list-genres ref="movieListGenres" v-if="listType == 'GENRES'" genresType="movie_genres"
				:sliderValue="sliderValue">
			</movie-list-genres>

			<!-- 按地区查看 -->
			<movie-list-regions ref="movieListRegions" v-if="listType == 'REGIONS'" genresType="movie_regions"
				:sliderValue="sliderValue">
			</movie-list-regions>
		</div>

		<!-- 筛选来源文件夹 国别 语言 类型 -->
		<vs-dialog scroll v-model="showFilterDialog" :title="$t('movie.movieFilter')" scroll>
			<div>
				<div style="height:10px"></div>
				<!-- 改变图片大小 -->
				<div class="nas-mobile-none slider-root">
					<!-- 海报尺寸 -->
					<p style="text-align:left;flex-shrink:0;font-weight:bold" >{{
						$t('movie.posterSize') }}:</p>
					<Slider  class="zoom-slider" show-tip="never" v-model="sliderValue"
						:min="sliderMin" :max="sliderMax" :step="10" @on-input="onSizeChange">
					</Slider>
				</div>
				<!-- 展示方式 -->
				<Divider v-if="isMovieListPage"></Divider>
				<div style="display:flex;align-items:center" v-if="isMovieListPage">
					<p style="text-align:left;flex-shrink:0;font-weight:bold">{{ $t('file.showType') }}:</p>
					<RadioGroup style="text-align:left;margin-left:10px" v-model="showType" @on-change="onSelectShowType">
						<Radio label="grid">
							<Icon type="md-grid" />
							<span>{{ this.$t('movie.gridView') }}</span>
						</Radio>
						<Radio label="list">
							<Icon type="md-list" />
							<span>{{ this.$t('movie.listView') }}</span>
						</Radio>
					</RadioGroup>
				</div>

				<!-- 资源类型 -->
				<Divider></Divider>
				<div style="display:flex;align-items:center">
					<p style="text-align:left;flex-shrink:0;font-weight:bold">{{ $t('movie.resources') }}:</p>
					<RadioGroup style="text-align:left;margin-left:10px" v-model="selectedSourceType"
						@on-change="onFilterFinish">
						<Radio :label="this.$t('common.all')">
							<Icon type="logo-buffer" />
							<span>{{ this.$t('common.all') }}</span>
						</Radio>
						<Radio :label="this.$t('movie.movie')">
							<Icon type="md-videocam" />
							<span>{{ this.$t('movie.movie') }}</span>
						</Radio>
						<Radio :label="this.$t('movie.tvdrama')">
							<Icon type="md-desktop" />
							<span>{{ this.$t('movie.tvdrama') }}</span>
						</Radio>
					</RadioGroup>
				</div>

				<div v-if="sourceFolderList && sourceFolderList.length > 1">
					<Divider></Divider>
					<p class="dialog-filter-title">{{
						$t('movie.selectSourceFolder') }}:</p>
					<CheckboxGroup v-model="selectedSourceFolder" @on-change="onFilterFinish">
						<Checkbox v-for="source in sourceFolderList" :label="source">{{ ' ' + source }}</Checkbox>
					</CheckboxGroup>
				</div>
				<div v-if="languageList && languageList.length > 0">
					<Divider></Divider>
					<p class="dialog-filter-title">{{ $t('movie.selectLanguage')
					}}:</p>
					<CheckboxGroup v-model="selectedLanguage" @on-change="onFilterFinish(true)">
						<Checkbox v-for="source in languageList" :label="source">{{ ' ' + source }}</Checkbox>
					</CheckboxGroup>
				</div>
				<div v-if="regionList && regionList.length > 0">
					<Divider></Divider>
					<p class="dialog-filter-title">{{ $t('movie.selectRegion') }}:
					</p>
					<CheckboxGroup v-model="selectedRegion" @on-change="onFilterFinish(true)">
						<Checkbox v-for="source in regionList" :label="source">{{ ' ' + source }}</Checkbox>
					</CheckboxGroup>
				</div>
				<div v-if="genresList && genresList.length > 0">
					<Divider></Divider>
					<p class="dialog-filter-title">{{ $t('movie.selectGenres') }}:
					</p>
					<CheckboxGroup v-model="selectedGenres" @on-change="onFilterFinish(true)">
						<Checkbox v-for="source in genresList" :label="source">{{ ' ' + source }}</Checkbox>
					</CheckboxGroup>
				</div>
			</div>


			<template #footer>
				<Divider />
				<div>
					<my-btn @click="showFilterDialog = false" type="white" :title="$t('common.close')"></my-btn>
					<my-btn @click="resetFilterData()" type="primary" :title="$t('common.resetDefault')"></my-btn>
				</div>
			</template>
		</vs-dialog>
	</div>
</template> 
<script>
import letterIndex from "@/views/movies/components/letterIndex.vue";
import movieListContent from "@/views/movies/components/movieListContent.vue";
import movieListGenres from "@/views/movies/components/movieListGenres.vue";
import movieListRegions from "@/views/movies/components/movieListGenres.vue";

export default {
	props: {
		//是否恢复上次的筛选项
		restoreFilter: {
			default: false,
			type: Boolean
		},
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
		initGenres: {
			default: "",
			type: String
		},
		initRegion: {
			default: "",
			type: String
		}
	},
	created() {
		let showType = localStorage.getItem("movie-list-show-type");
		if (showType) {
			this.showType = showType;
		}
	},
	mounted() {

		if (!this.collectionId && !this.initGenres && !this.initRegion &&!this.libraryId) {
			this.typeMenuOptionList.push({
				title: this.$t('movie.genres'),
				id: "GENRES"
			})
			this.typeMenuOptionList.push({
				title: this.$t('movie.regions'),
				id: "REGIONS"
			})
			if (localStorage.MovieListType) {
				this.listType = localStorage.MovieListType
				if (this.$refs.listTypeMenu) {
					this.$refs.listTypeMenu.setSelectedId(this.listType)
				}
			}
		}
		//点击风格/地区的标题进来的
		if (this.initGenres) {
			this.selectedGenres = [this.initGenres]
		}
		if (this.initRegion) {
			this.selectedRegion = [this.initRegion]
		}
		let saveSliderValue = localStorage.getItem('MovieImageSize')
		if (saveSliderValue && parseInt(saveSliderValue) >= 100) {
			this.sliderValue = parseInt(saveSliderValue)
			this.onSizeChange()
		}
		//恢复排序选项
		if(localStorage.cacheMovieSortField){
			this.sortField=localStorage.cacheMovieSortField
		}
		if(localStorage.cacheMovieSortType){
			this.sortType=localStorage.cacheMovieSortType
		}
		this.getSourceFolder()
		this.getMovieKeys()
	},
	beforeDestroy() {

	},
	computed: {
		isMovieListPage: function () {
			return this.listType == 'ALL' || this.listType == 'FAVORITE'
		},
		filterConditionCount: function () {
			if (this.listType == 'ALL' || this.listType == 'FAVORITE') {
				let count = this.selectedSourceFolder.length + this.selectedLanguage.length + this.selectedRegion.length + this.selectedGenres.length
				if (this.selectedSourceType != this.$t('common.all')) {
					count += 1
				}
				return count
			} else {
				return 0
			}
		}
	},
	components: {
		movieListRegions,
		movieListGenres,
		movieListContent,
		letterIndex
	},
	data() {
		return {
			showFilterDialog: false,
			sourcTypeList: [this.$t('common.all'), this.$t('movie.movie'), this.$t('movie.tvdrama')],
			sourceFolderList: [],
			selectedSourceType: this.$t('common.all'),
			selectedSourceFolder: [],//已选的来源文件夹
			selectedLanguage: [],//已选的语言
			selectedRegion: [],//已选的地区
			selectedGenres: [],//已选的电影类型
			typeMenuOptionList: [{
				title: this.$t('movie.listView'),
				id: "ALL"
			}, {
				title: this.$t('movie.favorite'),
				id: "FAVORITE"
			}],
			sliderMin: 120,
			sliderMax: 280,
			sliderValue: 120,
			itemMargin: 6,
			sortField: 'check_time',
			sortType: 'desc',
			searchStr: '',
			showType: 'grid',
			firstLetter: "",
			listType: "ALL",
			genresList: [],//类型
			languageList: [],//语言
			regionList: []//地区
		};
	},
	methods: {
		loadFirstPage(forceToList) {
			//除了列表和收藏 其他界面搜索都要跳转到列表页展示
			if (forceToList && this.listType != "ALL" && this.listType != "FAVORITE") {
				this.listType = "ALL"
				if (this.$refs.listTypeMenu) {
					this.$refs.listTypeMenu.setSelectedId(this.listType)
				}
			}
			// 读取一下缓存的筛选项
			function restoreFilterOptions(cacheKey, restoreVal, restoreCompareVal) {
				//从本地读取上次选择的缓存 如果还存在 则恢复上次选择的 否则加载第一页
				let cacheJson = window.localStorage.getItem(cacheKey)
				if (cacheJson) {
					let catchSelected = JSON.parse(cacheJson)
					if (catchSelected instanceof Array) {
						for (let i in catchSelected) {
							for (let j in restoreCompareVal) {
								if (catchSelected[i] == restoreCompareVal[j]) {
									restoreVal.push(catchSelected[i])
								}
							}
						}
					} else {
						for (let j in restoreCompareVal) {
							if (catchSelected == restoreCompareVal[j]) {
								restoreVal = catchSelected
							}
						}
					}
				}
				return restoreVal
			}
			if (this.restoreFilter) {
				this.selectedSourceType = restoreFilterOptions("cacheMovieSelectedSourceType", this.selectedSourceType, this.sourcTypeList)
				this.selectedSourceFolder = restoreFilterOptions("cacheMovieSelectedSourceFolder", [], this.sourceFolderList)
			}
			this.$nextTick(() => {
				if (this.$refs.movieListContent) {
					this.$refs.movieListContent.loadFirstPage()
				}
			})
		},
		onSizeChange() {
			this.$nextTick(() => {
				if (this.$refs.movieListContent) {
					this.$refs.movieListContent.onSizeChange()
				} else if (this.$refs.movieListGenres) {
					this.$refs.movieListGenres.onSizeChange()
				} else if (this.$refs.movieListRegions) {
					this.$refs.movieListRegions.onSizeChange()
				}
				if (this.sliderValue) localStorage.setItem('MovieImageSize', this.sliderValue)
			})
		},
		onLetterClick(letter) {
			this.firstLetter = letter
			this.onFilterFinish()
		},
		onChooseDataType(type) {
			this.listType = type
			localStorage.setItem('MovieListType', this.listType)
			//跳转到 地区 风格页面的时候 不用请求
			if (this.isMovieListPage) {
				this.onFilterFinish(true)
			}
			this.onSizeChange()
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
			this.selectedSourceFolder = []
			this.selectedGenres = []
			this.selectedLanguage = []
			this.selectedRegion = []
			this.selectedSourceType = this.$t('common.all')
			this.onFilterFinish(true)
		},
		//缓存筛选项
		cacheFilterOperation() {
			function cacheItem(cacheKey, cacheValue) {
				try {
					if (cacheValue) {
						let cacheStr = JSON.stringify(cacheValue)
						window.localStorage.setItem(cacheKey, cacheStr)
					} else {
						window.localStorage.removeItem(cacheKey)
					}
				} catch (e) {
					window.localStorage.removeItem(cacheKey)
				}

			}
			//缓存一下
			if (this.restoreFilter) {
				cacheItem("cacheMovieSelectedSourceType", this.selectedSourceType)
				cacheItem("cacheMovieSelectedSourceFolder", this.selectedSourceFolder)
			}
		},
		onFilterFinish(clearFirstLetter) {

			if (clearFirstLetter) {
				this.firstLetter = ""
				if (this.$refs.letterIndex) {
					this.$refs.letterIndex.currentLetter = ""
				}
			}
			this.searchStr = ""
			this.$refs.mySearch.clearSearchValue()
			this.cacheFilterOperation()

			this.$nextTick(() => {
				this.loadFirstPage(true)
			})
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
				this.loadFirstPage(true)

			}).catch((error) => { })
		},

		scrollToTop() {
			this.$nextTick(() => {
				this.$refs.listWrapper.scrollTo({
					top: 0,
					behavior: "smooth"
				});
			})
		},

		onSelectShowType() {
			localStorage.setItem("movie-list-show-type", this.showType);
			this.onFilterFinish()
		},
		clickOrder() {
			//缓存一下
			localStorage.cacheMovieSortField=this.sortField
			localStorage.cacheMovieSortType=this.sortType
			this.loadFirstPage(true)
		},
		onSearch(searchStr) {
			this.searchStr = searchStr
			this.loadFirstPage(true)
		},
		onSearchClear() {
			this.searchStr = ''
			this.loadFirstPage(true)
		}
	}
}
</script>
<style lang="scss" scoped>
::v-deep .ivu-divider-horizontal {
	margin: 15px 0px;
}

::v-deep .ivu-radio-wrapper {
	text-align: left;
}

::v-deep .ivu-checkbox-group {
	text-align: left;
}

::v-deep .ivu-icon-ios-close {
	display: none;
}

::v-deep .ivu-select-dropdown {
	width: 90%;
}

.dialog-filter-title {
	width: 100%;
	text-align: left;
	font-weight: bold;
	margin-bottom: 5px
}

.movie-list-root {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
	background-color: rgba(255, 255, 255, 0.6);
	padding-left: 10px;
	padding-right: 10px;

	@media not all and (max-width:640px) {
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
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



.sort-root {
	width: 100px;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: flex-start
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

	display: flex;
	align-items: center;
	justify-content: space-between;
}

.slider-root {
	display: flex;
	align-items: center;

	.zoom-slider {
		margin-left: 20px;
		width: 60px;
		display: inline-flex;

		@media all and (max-width:640px) {
			width: 40px;
			margin-left: 10px;
		}
	}
}

.operation-icon {
	line-height: 30px;
	font-size: 30px;
	color: $nas-main;
	margin-right: 20px;
	cursor: pointer;

	span {
		font-size: 30px;
	}

	@media all and (max-width:640px) {
		margin-right: 15px;
	}
}
</style>
