<template>
	<div class="folder-root">
		<div class="folder-header">
			<div class="top-operation">

				<!-- grid list 切换 -->
				<div :style="{'margin-left': itemMargin + 'px'}">
					<span v-if="showType == 'grid'" class="nasIcons icon-grid operation-icon "
						@click="showType = 'list'"></span>
					<span v-else class="nasIcons icon-list operation-icon" @click="showType = 'grid'"></span>
				</div>

				<my-menu-select style="margin-right:20px" v-if="currentParentPath" @onItemClick="onChooseFileType" :optionList="typeMenuOptionList">
				</my-menu-select>


				<!-- 改变图片大小 -->
				<div>
					<Slider class="zoom-slider" show-tip="never" v-model="sliderValue" :min="sliderMin" :max="sliderMax"
						:step="10" @on-input="onSizeChange">
					</Slider>
				</div>


				<div class="search-root">
					<!-- 搜索栏 -->
					<my-search :placeholder="$t('photo.searchPlaceHolder')" @onSearch="onSearch"></my-search>
				</div>
			</div>

		</div>
		<div style="width:100%;height:100%;display:flex;flex-direction:column;overflow: hidden;padding-top: 70px;">
			<!-- 返回上一级 -->
			<div  v-if="currentParentPath" style="height:30px;margin-bottom:10px" @click="returnLast">
				<Button type="dashed" style="text-align:left;width:100%;text-align:center;border-radius:20px">{{$t("file.returnLastPath")}}</Button>
		   </div>
			<div class="file-list" ref="photoWrapper" @scroll="onPageScroll">
				

				<div style="cursor: pointer;" v-for="(file, index) in indexFileList"
					:style="{ 'margin': itemMargin + 'px', 'width': showType == 'grid' ? itemWidth + 'px' : '100%' }"
					:key="file.id" @touchstart="touchstart($event, file, index)" @touchend="touchend"
					@contextmenu="showRightMenu($event, $root, file, index)">

					<!-- 文件夹类型 -->
					<div v-if="parseInt(file.is_file) == 0"
						:class="{ 'item-folder': showType == 'grid', 'item-folder-list': showType == 'list' }"
						@click="clickFolder(index)">
						<img :style="{ 'width': itemWidth + 'px' }" src="@/static/folder/icon_folder.png" />
						<p :class="{ 'filename': showType == 'grid', 'filename-list': showType == 'list' }">{{ file.root ?
							file.path : file.filename }}</p>
					</div>

					<!-- 图片 -->
					<div v-if="parseInt(file.is_file) == 1"
						:class="{ 'item-folder': showType == 'grid', 'item-folder-list': showType == 'list' }"
						@click="clickFile(index)">
						<div style="display: flex;align-items: center;justify-content: center;">
							<div style="position: relative;display: flex;align-items: center;justify-content: center;">
								<img @dragstart.prevent v-lazy="file.url" style="object-fit: cover;border-radius: 6px;"
									:style="{ 'width': itemWidth + 'px', 'height': itemWidth + 'px' }" />
								<!-- 播放按钮 -->
								<div class="icon-play-root" v-if="file.type == 2">
									<!-- 视频的时长 -->
									
									<Button type="text" ghost  style="height:30px;" >
										<span class="nasIcons icon-play" style="font-size:30px;line-height:30px" ></span>
									</Button>

									<p class="icon-duration">{{ utils.formatSeconds(file.duration) }}</p>

								</div>

							</div>
						</div>
						<p :class="{ 'filename': showType == 'grid', 'filename-list': showType == 'list' }">{{ file.filename
						}}
						</p>
					</div>

				</div>


				<!-- 底部的loading和没有更多 -->
				<div style="display: flex;justify-content: center;width: 100%;flex-direction:column;align-items:center">
					<!-- 手动加载更多的按钮 -->
					<Button v-if="hasMore && indexFileList.length > 0" @click="loadNextPage()" type="default"
						style="width:250px;margin-top: 30px;height:45px;border-radius:20px">{{ $t('common.loadmore')
						}}</Button>
					<Spin size="large" v-if="loading" style="margin-top:30px"></Spin>
					<span v-if="!loading && !hasMore" style="margin-top: 30px;">{{
						$t('common.noMore')
					}}</span>
					<div style="height:80px"></div>
				</div>
			</div>
		</div>

		<!-- 点击照片后弹出的照片详情 -->
		<Modal v-model="showPhotoDetail" fullscreen footer-hide style="background-color: transparent;">
			<photo-detail :serverType="serverType" v-if="showPhotoDetail" @onClose="showPhotoDetail = false"
				ref="photoDetail"></photo-detail>
		</Modal>
		<Modal v-model="showVideoDetail" fullscreen footer-hide :closable="false">
			<video-detail :propsServerType="serverType" v-if="showVideoDetail" @onClose="showVideoDetail = false"
				ref="videoPlayer"></video-detail>
		</Modal>


		<!-- 右键菜单 -->
		<easy-cm @ecmcb="rightMenuClick" :list="rightMenuList"></easy-cm>


		<!-- 手机端长按条目的时候弹出的菜单 -->
		<vs-dialog v-model="showLongPressMenu">
			<h4 v-if="selectedFile" class="max-line-one" style="word-break:break-all">{{ selectedFile.filename }}</h4>
			<my-selector-phone :optionList="rightMenuList"
				@onItemClick="(item) => (rightMenuClick(null, item.type))"></my-selector-phone>
		</vs-dialog>

		<!-- 新建相册 -->
		<my-dialog-input @onOkClick="createAlbumByFolderApi" :placeholder="$t('album.albumName')" :showCloseBtn="true"
			ref="addAlbumDialog" :content="$t('album.albumName')" :title="$t('album.addAOrdinaryAlbum')">
		</my-dialog-input>

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
		<my-scroll-bar ref="scrollBar" v-if="!showCollectionSelectDialog&&!showPhotoDetail&&!showVideoDetail"></my-scroll-bar>
	</div>
</template>

<script>
import axios from "@/plugins/axios";
//照片点击详情
import photoDetail from "@/views/photos/components/photoDetail.vue";
//视频点击详情
import videoDetail from "@/views/videoDetail/videoDetail.vue";
import jsBridge from "@/plugins/jsBridge"
const movieCollectionList = () => import('@/views/movies/movieCollection.vue')
import myScrollBar from "@/components/my-components/my-scrollbar/my-scrollbar"

export default {
	props: {
		serverType: {
			type: String,
			default: "photo"
		},
	},
	components: {
		myScrollBar,
		movieCollectionList,
		photoDetail,
		videoDetail,
	},
	data() {
		return {
			showType: "grid",//展示方式
			showCollectionSelectDialog: false,//选择影集的对话框
			typeMenuOptionList: [{
				title: this.$t('photo.all'),
				id: "0"
			}, {
				title: this.$t('photo.photo'),
				id: "1"
			}, {
				title: this.$t('photo.video'),
				id: "2"
			}, {
				title: this.$t('common.folder'),
				id: "3"
			}],
			sliderMin: 100,
			sliderMax: 300,
			sliderValue: 100,
			itemBaseWidth: 100,
			itemWidth: 100,
			itemMargin: 5,
			indexFileList: [],
			showFileType: '0',
			systemSep: '/', //系统路径分隔符
			selectedIndex: null,
			selectedFile: null,
			showPhotoDetail: false,
			showVideoDetail: false,
			scrollTop: 0,
			currentParentPath: "",
			loading: false,
			hasMore: true,
			sourcePathList: [],
			longPressTimeout: null,
			showLongPressMenu: false,
			searchStr: "",
			rightMenuList: [{
				text: this.$t('file.check'),
				type: "CHECK",
			}]

		}
	},
	created() {
		this.getFileTree('')
		// 监听滚动条
		window.addEventListener("resize", this.calImageWidth);
		let saveSliderValue = localStorage.getItem('folderImageSize')
		if (saveSliderValue && parseInt(saveSliderValue) >= 100) {
			this.sliderValue = parseInt(saveSliderValue)
			this.onSizeChange()
		}
		//监听后退事件
		window.addEventListener('popstate', this.onPopstate)

	},
	beforeDestroy() {
		window.removeEventListener("resize", this.calImageWidth);
		window.removeEventListener('popstate', this.onPopstate);

		if (this.sliderValue) localStorage.setItem('folderImageSize', this.sliderValue)
	},
	methods: {
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
		showRightMenu(event, root, file, index) {
			if (this.isMobile) return event.preventDefault()
			this.selectedFile = file
			this.selectedIndex = index
			this.initRightMenu()
			this.$easycm(event, root)
		},
		initRightMenu(file) {
			this.rightMenuList = [{
				text: this.$t('file.check'),
				type: "CHECK",
			}]
			// 创建相册
			if (this.serverType == 'photo' && this.selectedFile.is_file != 1) {
				this.rightMenuList.push({
					text: this.$t('photo.createAlbumByFolder'),
					type: "CREATE_ALBUM"
				})
			}
			// 添加到影集
			if (this.serverType == 'movie') {
				this.rightMenuList.push({
					text: this.$t('movie.addToCollection'),
					type: "ADD_TO_COLLECTION"
				})
			}

		},
		//右键菜单点击
		rightMenuClick(indexList, clickType) {
			let type = clickType ? clickType : this.rightMenuList[indexList[0]].type
			if (type == 'CHECK') { //查看
				this.clickFolder(this.selectedIndex)
			} else if (type == 'CREATE_ALBUM') { //以文件夹创建相册
				this.$refs.addAlbumDialog.setShow(true)
			} else if (type == "ADD_TO_COLLECTION") {//添加到影集
				this.showChooseCollection()
			}
		},
		showChooseCollection() {
			this.showCollectionSelectDialog = true
		},
		onSelectCollectionApi() {
			if(this.$refs.movieCollectionList){
				let collectionId=this.$refs.movieCollectionList.getSelectedCollectionId()
				if(!collectionId){
					return
				}
				// 移动到影集
				let params = {
					collectionId: collectionId
				}
				if (this.selectedFile.id) {
					params.indexId = this.selectedFile.id
				} else {
					params.filepath = this.selectedFile.path
					params.filename = this.selectedFile.filename
				}
				this.api.post('/api/movieApi/addIndexToCollection', params).then((res) => {
					if (!res.code) {
						this.showCollectionSelectDialog = false
						this.showVsNotification(this.$t('common.operationSuccess'))
						this.removeSelectedFileFromList()
					}
				}).catch((error) => { })
			}
		},
		onSelectCollection(collection) {
			if (this.selectedFile.is_file != 1) {
				this.showVsConfirmDialog(this.$t('common.confirm'), this.$t(
					'movie.addToCollectionFolderAlert'), () => {
						this.onSelectCollectionApi(collection)
					})
			} else {
				this.onSelectCollectionApi(collection)
			}
		},
		createAlbumByFolderApi(albumName) {
			if (!albumName) {
				return
			}
			//以文件夹创建相册
			let parentPath = this.selectedFile.path
			if (!this.selectedFile.root) {
				parentPath = this.selectedFile.path + this.systemSep + this.selectedFile.filename
			}
			this.api
				.post("/api/ordinaryAlbumApi/addAlbum", {
					name: albumName,
					parentPath: parentPath
				})
				.then((res) => {
					if (!res.code) this.showVsNotification(this.$t('common.operationSuccess'))
					this.showLongPressMenu = false
				})
		},
		onPopstate() {
			//后退按钮被点击 如果当前正在播放视频 则关闭视频 如果每播放 则后退
			if (this.showPhotoDetail || this.showVideoDetail) {
				this.showPhotoDetail = false
				this.showVideoDetail = false
			} else if (this.currentParentPath) {
				//非root 路径后退
				this.returnLast()
			} else {
				this.$router.go(-1)
			}
		},
		onSearch(searchStr) {
			console.log('searchStr:', searchStr)
			this.searchStr = searchStr
			this.onChooseFileType(this.showFileType)
		},
		onSizeChange() {
			if (this.itemBaseWidth != this.sliderValue) {
				this.itemBaseWidth = this.sliderValue
				this.calImageWidth()
			}
		},
		//计算item宽度
		calImageWidth() {
			if (!this.$refs.photoWrapper) {
				return
			}
			let wrapper = this.$refs.photoWrapper.getBoundingClientRect();
			let itemWidth = this.utils.calItemWidth(wrapper, this.itemBaseWidth, this.itemMargin)
			if (itemWidth) this.itemWidth = itemWidth
		},
		onChooseFileType(val) {
			this.hasMore = true
			this.loading = false
			this.indexFileList = []
			this.showFileType = val
			this.getFileTree(this.currentParentPath)
		},
		//滚动回调
		onPageScroll(e) {
			if (this.showPhotoDetail || this.showVideoDetail || this.loading) {
				return
			}
			if (this.$refs.scrollBar) {
				this.$refs.scrollBar.onScroll(e)
			}
			//滚动的时候清空计时器 防止触发菜单
			if (this.longPressTimeout) {
				clearTimeout(this.longPressTimeout);
				this.longPressTimeout = null
			}
			this.dealOnPageScroll(e, () => {
				this.loadNextPage();
			}, (showTopBtn) => {
			})
		},
		returnLast() {
			//返回上一级
			this.hasMore = true
			this.loading = false
			this.indexFileList = []
			this.showFileType = '0'
			let lastIsSourcePath = false
			for (let i = 0; i < this.sourcePathList.length; i++) {
				if (this.currentParentPath == this.sourcePathList[i]) {
					//上级目录是来源根目录
					lastIsSourcePath = true
					break
				}
			}
			if (lastIsSourcePath) {
				//加载最外层
				this.getFileTree('', false, true)
			} else {
				//加载上一层 切分目录 去掉最后一段
				let lastSepIndex = this.currentParentPath.lastIndexOf(this.systemSep)
				let targetPath = this.currentParentPath.substr(0, lastSepIndex)
				this.getFileTree(targetPath, false, true)
			}
		},
		loadNextPage() {
			this.getFileTree(this.currentParentPath, true)
		},
		clickFolder(index) {
			this.selectedFile = this.indexFileList[index]
			this.hasMore = true
			this.loading = false
			this.indexFileList = []
			this.showFileType = "0"
			this.searchStr = ""
			if (this.selectedFile.root) {
				//根路径直接使用
				this.getFileTree(this.selectedFile.path)
			} else {
				//非根路径拼接文件夹名称
				this.getFileTree(this.selectedFile.path + this.systemSep + this.selectedFile.filename)
			}
		},
		clickFile(index) {

			// 非编辑模式 点击后进入详情展示
			if (this.indexFileList[index].type == 1) {
				this.showPhotoDetail = true;
				this.$nextTick(() => {
					this.$refs.photoDetail.showImg(this.indexFileList, index);
				});
				this.pushState()
			} else if (this.indexFileList[index].type == 2) {
				if (localStorage.getItem("rawPlayer") == "1") {
					//调用原生播放器
					jsBridge.playVideo({
						playIndex: index,
						playList: this.indexFileList,
						token: this.$store.state.token,
						fromFileBrower: false,
						serverType: this.serveType
					})
				} else {
					//继续使用网页播放器
					this.showVideoDetail = true;
					this.$nextTick(() => {
						this.$refs.videoPlayer.playVideo(this.indexFileList, index);
					});
					this.pushState()
				}
			}
		},
		//获取文件树
		getFileTree(parent, append, isGoBack) {
			let count = 100
			if (this.loading || !this.hasMore) {
				console.log("return")
				return
			}
			this.loading = true
			let lastId = 0

			if (this.indexFileList.length > 0) {
				lastId = this.indexFileList[this.indexFileList.length - 1].id
			}
			let params = {
				parent: parent,
				serveType: this.serverType,
				count: count,
				lastId: lastId,
				showFileType: this.showFileType
			}
			if (this.searchStr) {
				params.searchStr = this.searchStr
			}
			this.api
				.post("/api/photoApi/getFileTreePhoto", params)
				.then((res) => {
					if (!res.code) {

						if (!parent) {
							//获取跟目录的时候保存起来 返回上一级的时候判断用
							for (let i = 0; i < res.data.length; i++) {
								this.sourcePathList.push(res.data[i].path)
							}
						}
						this.currentParentPath = parent
						console.log("返回个数:" + res.data.length)
						if (res.data.length < count) {
							this.hasMore = false
						}
						this.systemSep = res.sep
						for (let i = 0; i < res.data.length; i++) {
							let item = res.data[i]

							if (item.root) {
								res.data[i].tipName = item.path
							} else {
								if (item.path.endsWith(this.systemSep)) {
									res.data[i].tipName = item.path + item.filename
								} else {
									res.data[i].tipName = item.path + this.systemSep + item.filename
								}
							}
							//设置缩略图url
							if (item.is_file && (item.type == 1 || item.type == 2)) {
								item.url = axios.getImgFullPath(res.data[i].id, true, res.data[i].filename, this
									.serverType);
								item.rawUrl = axios.getImgFullPath(res.data[i].id, false, res.data[i].filename,
									this.serverType);
							}
						}
						if (append) {
							for (var i = 0; i < res.data.length; i++) {
								this.indexFileList.push(res.data[i]);
							}
						} else {
							this.indexFileList = res.data
						}

					}
					this.loading = false
					this.$nextTick(() => {
						this.calImageWidth()
					})
					if (!isGoBack) {
						//非后退的情况下 pushstate
						console.log("this.pushState()")
						this.pushState()
					}
					console.log('hasMore', this.hasMore)
				})
				.catch((error) => {
					this.loading = false
				});
		}
	}
}
</script>

<style lang="scss" scoped>
.operation-icon {
	font-size: 30px;
	color: $nas-main;
	margin-right: 20px;
	line-height: 30px;
	cursor: pointer;
}

.filename {
	color: $nas-text-title;
	word-break: break-all;
	text-align: center;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 3;
	overflow: hidden;
	width: 100%;
	margin-top: 5px;
}

.filename-list {
	color: $nas-text-title;
	word-break: break-all;
	text-align: left;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 5;
	overflow: hidden;
	margin-left: 10px;
}

.folder-header {
	z-index: 100;
	display: flex;
	align-items: center;
	position: absolute;
	left: 0;
	flex-direction: column;
	width: 100%;
	border-top-left-radius: 20px;
	border-top-right-radius: 20px;

	.top-operation {
		width: 100%;
		height: 70px;
		display: flex;
		align-items: center;
		padding-left: 20px;
		padding-right: 20px;

		@media all and (max-width:640px) {
			padding-left: 10px;
			padding-right: 10px;
		}

	}

	.top-path {
		color: $nas-grey;
		padding-left: 30px;
		display: flex;
		align-items: center;
		height: 30px;
		width: 100%;
	}
}

.search-root {
	position: absolute;

	@media all and (max-width:640px) {
		right: 10px
	}

	@media not all and (max-width:640px) {
		right: 30px
	}
}

.folder-root {
	position: relative;
	z-index: 1;

	@media not all and (max-width:640px) {
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
	}

	padding-left: 20px;
	padding-right: 20px;

	@media all and (max-width:640px) {
		padding-left: 10px;
		padding-right: 10px;
	}

	width: 100%;
	height: 100%;
	background-color: rgba(255, 255, 255, 0.6);
}

.zoom-slider {
	margin-right: 20px;
	width: 60px;
	display: inline-flex;

	@media all and (max-width:640px) {
		width: 40px;
		margin-right: 15px;
	}

}


.file-list {
	scrollbar-width: none;
	/* Firefox 隐藏滚动条 */
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	width: 100%;
	height: 100%;
	overflow-y: auto;
	align-content: flex-start;

	@media all and (max-width:640px) {
		-webkit-overflow-scrolling: touch;
	}
}

.file-list::-webkit-scrollbar {
	display: none
}

.item-folder {
	position: relative;
	justify-content: center;
	align-items: center;
	display: flex;
	flex-direction: column;

}

.item-folder-list {
	width: 100%;
	flex-wrap: nowrap;
	position: relative;
	justify-content: flex-start;
	align-items: center;
	display: flex;
	flex-direction: row;
}



.icon-play-root {
	border-top-left-radius: 10px;
	border-top-right-radius: 10px;
	top: 0;
	padding: 3% 5%;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	flex-direction: column;
	position: absolute;
	justify-content: center;

	img {
		width: 25px;
	}

	.icon-duration {
		text-align: center;
		color: white;
		// font-weight: bold;
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
	border-radius: 6px;
	color: $nas-text-grey;
}</style>
