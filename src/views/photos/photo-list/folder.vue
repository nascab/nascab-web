<template>
	<div class="folder-root">
		<div class="folder-header">
			<div class="top-operation">
				<!-- 返回上一级 pc-->
				<div class="nas-mobile-none">
					<my-btn style="margin-right: 20px;" @click="returnLast" v-if="currentParentPath"
						:title="$t('file.returnLastPath')">
					</my-btn>
				</div>
				<!-- 返回上一级 app-->
				<div class="nas-mobile-show">
					<my-btn-icon style="margin-right:10px;" iIcon="md-arrow-back" @click="returnLast"></my-btn-icon>
				</div>
				<my-menu-select v-if="currentParentPath" @onItemClick="onChooseFileType"
					:optionList="typeMenuOptionList">
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
		<div style="width:100%;height:100%;display:flex;flex-direction:column;overflow: hidden;padding-top: 80px;">
			<div class="file-list" ref="photoWrapper">

				<div style="cursor: pointer;" v-for="(file, index) in indexFileList"
					:style="{ 'margin': itemMargin + 'px', 'width': itemWidth + 'px' }" :key="file.id">

					<!-- 文件夹类型 -->
					<div v-if="parseInt(file.is_file) == 0" class="item-folder" @click="clickFolder(index)">
						<span class="nasIcons icon-img-folder item-folder"
							:style="{ 'font-size': itemWidth / 3 * 2 + 'px' }"></span>

						<p class="filename" style="width: 100%;">{{ file.root ? file.path : file.filename }}</p>
					</div>
					<vs-tooltip>
						<!-- 图片 -->
						<div v-if="parseInt(file.is_file) == 1" class="item-folder" @click="clickFile(index)">
							<div style="display: flex;align-items: center;justify-content: center;">
								<div
									style="position: relative;display: flex;align-items: center;justify-content: center;">
									<img @dragstart.prevent v-lazy="file.url"
										style="object-fit: cover;border-radius: 10px;"
										:style="{ 'width': itemWidth + 'px', 'height': itemWidth + 'px' }" />


									<!-- 播放按钮 -->
									<div class="icon-play-root" v-if="file.type == 2">
										<!-- 视频的时长 -->
										<img @dragstart.prevent src="@/static/icon_play_white.png" />
										<p class="icon-duration">{{ utils.formatSeconds(file.duration) }}</p>

									</div>

								</div>
							</div>
							<p class="filename" style="width: 100%;margin-top: 5px;">{{ file.filename }}</p>
						</div>
						<template #tooltip>
							<p style="word-break: break-all;">{{ file.tipName }}</p>
						</template>
					</vs-tooltip>
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

		<!-- 返回顶部按钮 -->
		<my-btn-icon v-if="showToTopBtn" style="position:fixed;right:10px;bottom:55px;z-index:9999;" iIcon="md-arrow-up"
			@click="$refs.photoWrapper.scrollTo({ top: 0, behavior: 'smooth' })"></my-btn-icon>

	</div>

</template>

<script>
import axios from "@/plugins/axios";
//照片点击详情
import photoDetail from "@/views/photos/components/photoDetail.vue";
//视频点击详情
import videoDetail from "@/views/videoDetail/videoDetail.vue";
import { ifError } from "assert";

export default {
	props: {
		serverType: {
			type: String,
			default: "photo"
		},
	},
	components: {
		photoDetail,
		videoDetail,
	},
	data() {
		return {
			showToTopBtn: false,
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
				title: this.$t('movie.viewFolder'),
				id: "3"
			}],
			sliderMin: 130,
			sliderMax: 300,
			sliderValue: 130,
			itemBaseWidth: 130,
			itemWidth: 130,
			itemMargin: 5,
			indexFileList: [],
			showFileType: '0',
			systemSep: '/', //系统路径分隔符
			selectedFile: '',
			showPhotoDetail: false,
			showVideoDetail: false,
			scrollTop: 0,
			currentParentPath: "",
			loading: false,
			hasMore: true,
			sourcePathList: [],
			searchStr: ""
		}
	},
	created() {
		this.getFileTree('')
		// 监听滚动条
		window.addEventListener("scroll", this.onPageScroll, true);
		window.addEventListener("resize", this.calImageWidth);
		let saveSliderValue = localStorage.getItem('folderImageSize')
		if (saveSliderValue && parseInt(saveSliderValue) >= 100) {
			this.sliderValue = parseInt(saveSliderValue)
			this.onSizeChange()
		}
	},
	beforeDestroy() {
		window.removeEventListener("scroll", this.onPageScroll, true);
		window.removeEventListener("resize", this.calImageWidth);
		if (this.sliderValue) localStorage.setItem('folderImageSize', this.sliderValue)
	},
	methods: {
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
			if (this.scrollTop > windowHeight) {
				this.showToTopBtn = true
			} else {
				this.showToTopBtn = false
			}
			if (this.scrollTop + windowHeight >= scrollHeight) {
				//加载下一页
				this.loadNextPage()
			}
		},
		returnLast() {
			//返回上一级
			this.hasMore = true
			this.loading = false
			this.indexFileList = []
			this.showFileType = '0'
			let lastIsSourcePaht = false
			for (let i = 0; i < this.sourcePathList.length; i++) {
				if (this.currentParentPath == this.sourcePathList[i]) {
					//上级目录是来源根目录
					lastIsSourcePaht = true
					break
				}
			}
			if (lastIsSourcePaht) {
				//加载最外层
				this.getFileTree('')
			} else {
				//加载上一层 切分目录 去掉最后一段
				let lastSepIndex = this.currentParentPath.lastIndexOf(this.systemSep)
				let targetPath = this.currentParentPath.substr(0, lastSepIndex)
				this.getFileTree(targetPath)
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
			} else if (this.indexFileList[index].type == 2) {
				this.showVideoDetail = true;
				this.$nextTick(() => {
					this.$refs.videoPlayer.playVideo(this.indexFileList, index);
				});
			}
		},
		//获取文件树
		getFileTree(parent, append) {
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
							//获取的是根目录 为设置来源目录提示用户去设置
							if (res.data.length < 1) {
								this.showVsConfirmDialog(this.$t('common.confirm'), this.$t(
									'photo.noSourceSetAlert'), () => {
										this.$router.push({
											path: '/setting',
											query: {
												index: 2
											}
										})
									}, null, this.$t('photo.goToSet'))
							}

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
.item-folder {
	color: $nas-main;
}

.filename {
	color: $nas-text-title;
	word-break: break-all;
	text-align: center;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 3;
	overflow: hidden;
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
		height: 80px;
		display: flex;
		align-items: center;
		padding-left: 30px;
		padding-right: 30px;

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
		padding-left: 30px;
		padding-right: 30px;
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
	}

	padding-left: 10px;
	padding-right: 10px;
	width: 100%;
	height: 100%;
	background-color: rgba(255, 255, 255, 0.6);
}

.zoom-slider {
	margin-left: 20px;
	width: 60px;
	display: inline-flex;

	@media all and (max-width:640px) {
		width: 40px;
		margin-left: 10px;
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
		margin-right: 8px;
		margin-top: 3px;
		font-size: 16px;
		color: white;
		// font-weight: bold;
	}
}
</style>
