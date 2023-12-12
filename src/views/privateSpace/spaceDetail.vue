<template>
	<div class="root-wrapper-space-detail">
		<div style="width:100%;height:100%;">
			<div class="album-detail-header">
				<div style="display: flex;align-items:center">
					<vs-button icon style="flex-shrink: 0;">
						<Icon style="cursor:pointer" @click="goBack" size="20" type="md-return-left" />
					</vs-button>
					<div
						style="font-size: 18px;font-weight: bold;height: 100%;margin-left: 20px;display: flex;align-items: center;">
						<p style="margin-right: 20px;">{{ selectedSpace ? selectedSpace.space_name : "" }} </p>
						<p style="word-break: break-all">{{ $t('private.spaceFolder') }}:{{
							selectedSpace ?
							selectedSpace.folder_path : ""
						}}</p>
					</div>
				</div>
			</div>
			<div class="album-detail-content">
				<div class="content-root">
					<div class="list-top-root">
						<div style="display:flex;align-items:center">
							<div style="margin-right:10px">
								<my-menu-select :shrinkModeTh="550" @onItemClick="onChooseFileType"
									:optionList="typeMenuOptionList"></my-menu-select>
							</div>
							<my-menu-select :shrinkModeTh="550" :withOrder="true" @onItemClick="onChooseOrder"
								:optionList="orderMenuOptionList">
							</my-menu-select>
							<!-- 改变图片大小 -->
							<Slider class="zoom-slider" show-tip="never" v-model="sliderValue" :min="sliderMin"
								:max="sliderMax" :step="10" @on-input="onSizeChange">
							</Slider>
						</div>
						<!-- 上传和刷新 pc端按钮 -->
						<div class="private-header-mobile-none">
							<div style="display: flex;align-items: center;white-space: nowrap;">
								<!-- 上传 -->
								<my-btn :title="$t('private.uploadFile')" @click="uploadFiles()"></my-btn>
								<!-- 刷新 -->
								<my-btn :title="$t('common.refresh')" @click="loadFirstPage()" type="white"></my-btn>
							</div>
						</div>
						<!-- 上传和刷新 手机端按钮 -->
						<div class="private-header-mobile-show">
							<div style="display: flex;align-items: center;white-space: nowrap;">
								<my-btn-icon style="margin-right:10px" iIcon="md-cloud-upload" @click="uploadFiles()"></my-btn-icon>
								<my-btn-icon iIcon="md-sync" @click="loadFirstPage()"></my-btn-icon>
							</div>
						</div>
					</div>
					<!-- 列表 -->
					<div class="list-content-root">
						<div class="file-list" ref="photoWrapper" @scroll="onPageScroll">
							<div v-for="(file, index) in dataList"
								:style="{ 'margin': itemMargin + 'px', 'width': itemWidth + 'px' }"
								@mouseenter="mouseEnterImg(index)" @mouseleave="mouseLeaveImg(index)" :key="file.id"
								@touchstart="touchstart(index)" @touchend="touchend">
								<!-- 图片 -->
								<div class="item-folder" @click="clickFile(index)">
									<div class="item-image-root">
										<!-- 图片 -->
										<img v-if="file.file_type == 'image'" @dragstart.prevent v-lazy="file.tinyUrl"
											class="item-img"
											:style="{ 'width': itemWidth + 'px', 'height': itemWidth + 'px' }" />
										<!-- 视频 -->
										<div v-if="file.file_type == 'video'" style="position:relative"
											class="item-image-root">
											<img @dragstart.prevent :src="file.tinyUrl" class="item-img"
												:style="{ 'width': itemWidth + 'px', 'height': itemWidth + 'px' }" />
											<!-- 播放按钮 -->
											<div class="icon-play-root">
												<!-- 视频的时长 -->
												<span style="color: white;font-size: 30px;"
													class="nasIcons icon-play"></span>
												<p class="icon-duration">{{ utils.formatSeconds(file.duration) }}
												</p>

											</div>
										</div>
										<!-- 其他类型 -->
										<img v-if="file.file_type == 'other'" @dragstart.prevent
											src="@/static/icon-folder-file.png" class="item-img"
											:style="{ 'width': itemWidth + 'px', 'height': itemWidth + 'px' }" />

										<!-- hover层 -->
										<div class="photo-hover-mask" v-show="file.hover && !file.selected">
											<span @click.stop="hoverSelect(index)"
												class="photo-select-icon-hover nasIcons icon-radio-unchecked"></span>
										</div>
										<!-- 选择层 -->
										<div class="photo-select-mask" v-if="file.selected">
											<span class="photo-select-icon-hover nasIcons icon-radio-checked"></span>
										</div>
									</div>
									<p class="filename"
										style="width: 100%;margin-top: 5px;word-break: break-all;text-align: center;">
										{{ file.filename }}
									</p>
								</div>
							</div>

							<!-- 底部的loading和没有更多 -->
							<div
								style="display: flex;justify-content: center;width: 100%;flex-direction:column;align-items:center">
								<Button v-if="hasMore && dataList.length > 0" @click="loadNextPage()" type="default"
									style="width: 500px;margin-top: 30px;height:45px;border-radius:20px">{{
										$t('common.loadmore')
									}}</Button>

								<Spin size="large" v-if="loading" style="margin-top:30px"></Spin>
								<span v-if="!loading && !hasMore" style="margin-top: 30px;">{{
									$t('common.noMore')
								}}</span>
								<div style="height:160px"></div>

							</div>
						</div>
					</div>
				</div>
				<div v-if="selectedFileIds.length > 0" class="bottom-root">
					<!-- 删除按钮 -->
					<div @click="deleteSelectFiles">
						<my-btn type="red" :title="$t('common.delete')"></my-btn>
					</div>

					<!-- 取消已选 -->
					<div @click="clearSelect">
						<my-btn type="white" :title="$t('common.cancelSelect')"></my-btn>
					</div>

				</div>
			</div>
		</div>

		<!-- 点击照片后弹出的照片详情 -->
		<Modal v-model="showPhotoDetail" fullscreen footer-hide style="background-color: transparent;">
			<photo-detail :fromSpace="true" v-if="showPhotoDetail" @onClose="showPhotoDetail = false" ref="photoDetail">
			</photo-detail>
		</Modal>


		<!-- 点击照片后弹出的视频播放器详情 -->
		<Modal v-model="showVideoDetail" fullscreen footer-hide :closable="false">
			<video-detail propsServerType="photo" :fromFileBrower="false" v-if="showVideoDetail"
				@onClose="showVideoDetail = false" ref="videoPlayer"></video-detail>
		</Modal>

		<Modal v-model="showUploadModal" footer-hide @on-visible-change="onUploadDialogVisibleChange">
			<template #header>
				<h4 style="font-size: 16px;">
					{{ $t('private.uploadFileToSpace') }}
				</h4>
			</template>
			<div>
				<Upload @fileUploaded="hasNewFileUploaded = true" ref="spaceUpload" :spaceId="spaceId"></Upload>
			</div>
		</Modal>
		<my-scroll-bar ref="scrollBar" v-if="!showPhotoDetail&&!showVideoDetail"></my-scroll-bar>

	</div>
</template>

<script>
import Upload from "@/views/upload/upload"
import axios from "@/plugins/axios";
import videoDetail from "@/views/videoDetail/videoDetail.vue";
import photoDetail from "@/views/photos/components/photoDetail.vue";
import { Base64 } from "js-base64"
import jsBridge from "@/plugins/jsBridge"
import myScrollBar from "@/components/my-components/my-scrollbar/my-scrollbar"

export default {
	watch: {
		showUploadModal: function (newVal, oldVal) {
			if (!newVal) {
				this.uploadClose()
			}
		}
	},
	props: {
		propsSelectedSpace: {
			default: null,
			type: Object
		}
	},
	data() {
		return {
			openAsPage: false,
			spaceId: "",
			selectedSpace: {},
			hasNewFileUploaded: false,
			typeMenuOptionList: [{
				title: this.$t('photo.all'),
				id: "all"
			}, {
				title: this.$t('photo.photo'),
				id: "image"
			}, {
				title: this.$t('photo.video'),
				id: "video"
			}, {
				title: this.$t('common.other'),
				id: "other"
			}],
			orderMenuOptionList: [{
				title: this.$t('file.recent'),
				id: "check_time"
			}, {
				title: this.$t('movie.createTime'),
				id: "create_time"
			}, {
				title: this.$t('private.shootTime'),
				id: "original_time"
			}],
			selectedFileIds: [],
			editMode: false,
			showFileType: 'all',
			itemBaseWidth: 160,
			itemWidth: 160,
			itemMargin: 5,

			sliderMin: 160,
			sliderMax: 400,
			sliderValue: 160,
			lastSliderValue: 0,

			pageCount: 100,
			showUploadModal: false,
			dataList: [],
			orderField: 'check_time',
			orderType: 'desc',
			loading: false,
			hasMore: true,
			showPhotoDetail: false,
			showVideoDetail: false,
			scrollTop: 0,
			longPressTimeout: null
		}
	},
	components: {
		myScrollBar,
		Upload,
		videoDetail,
		photoDetail
	},
	mounted() {
		let passParams = this.$route.params
		if (this.propsSelectedSpace) {
			this.spaceId = this.propsSelectedSpace.id + ''
			this.selectedSpace = this.propsSelectedSpace
		} else {
			this.openAsPage = true
			this.spaceId = passParams.selectedSpace.id + ''
			this.selectedSpace = passParams.selectedSpace
		}

		if (!this.$store.state.privateSpace[this.spaceId]) {
			this.showVsAlertDialog(this.$t('common.alert'), this.$t('private.passwordInvalid'))
		} else {
			this.getFileList(false)
		}
		//窗口变化监听
		window.addEventListener("resize", this.onWindowResize);
		window.addEventListener('popstate', this.onPopstate)

	},
	beforeDestroy() {
		window.removeEventListener("resize", this.onWindowResize);
		window.removeEventListener('popstate', this.onPopstate);

	},
	methods: {
		onPopstate() {
			//后退按钮被点击 如果当前正在播放视频 则关闭视频 如果每播放 则后退
			if (this.showPhotoDetail || this.showVideoDetail) {
				this.showPhotoDetail = false
				this.showVideoDetail = false
			} else {
				this.$router.go(-1)
			}
		},
		goBack() {
			if (this.openAsPage) {
				this.$router.go(-1)
			} else {
				this.$emit('onClose')
			}
		},
		//slider图像大小切换
		onSizeChange(value) {
			// 防止高频率重复触发
			if (this.lastSliderValue != value) {
				this.lastSliderValue = value;
				this.itemBaseWidth = value
				this.calImageWidth()
			}
		},
		touchstart(index) {
			clearTimeout(this.longPressTimeout); //再次清空定时器，防止重复注册定时器
			this.longPressTimeout = setTimeout(() => {
				this.hoverSelect(index)
			}, 800);
		},
		touchend() {
			clearTimeout(this.longPressTimeout); //清空定时器，防止重复注册定时器
		},
		onChooseOrder(orderField, orderType) {
			this.orderField = orderField
			this.orderType = orderType
			this.loadFirstPage()
		},
		onUploadDialogVisibleChange(visible) {
			if (!visible) {
				// 上传对话框关闭的时候调用 如果期间有新文件上传完毕 刷新列表
				if (this.hasNewFileUploaded) {
					this.loadFirstPage()
				}
			}
		},
		clearSelect() {
			this.editMode = false
			for (let i in this.dataList) {
				this.dataList[i].selected = false
			}
			this.selectedFileIds = []
		},
		deleteSelectFiles() {
			if (this.selectedFileIds.length < 1) {
				return
			}
			//删除选中文件
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('private.fileWillDeleteForever'), () => {
				this.api
					.post("/api/privateSpaceApi/deleteSpaceFiles", {
						spaceId: this.spaceId,
						ids: JSON.stringify(this.selectedFileIds)
					})
					.then((res) => {
						if (!res.code) {
							this.showVsNotification(res.deleteCount + this.$t('file.fileDeleteSuc'))
							this.selectedFileIds = []
							this.editMode = false
							if (res.deleteList && res.deleteList.length > 0) {
								for (let i in res.deleteList) {
									console.log(res.deleteList[i])
									for (let j in this.dataList) {
										if (res.deleteList[i] == this.dataList[j].id) {
											console.log('删除', this.dataList[j].id)
											this.dataList.splice(j, 1)
											break
										}
									}
								}
							}
							this.calImageWidth()
						}
					})
					.catch((error) => { });
			})
		},
		hoverSelect(index) {
			if (this.dataList[index].selected) {
				this.$set(this.dataList[index], "selected", false);
				for (let i in this.selectedFileIds) {
					if (this.selectedFileIds[i] == this.dataList[index].id) {
						this.selectedFileIds.splice(i, 1)
					}
				}
				if (this.selectedFileIds.length < 1) {
					this.editMode = false
				}
			} else {
				this.editMode = true
				this.$set(this.dataList[index], "selected", true);
				this.selectedFileIds.push(this.dataList[index].id)
				console.log(this.selectedFileIds)
			}
			console.log(this.selectedFileIds)
		},
		mouseEnterImg(index) {
			if (!this.isMobile) {
				this.$set(this.dataList[index], "hover", true);
			}

		},
		mouseLeaveImg(index) {
			if (!this.isMobile) {
				this.dataList[index].hover = false;
			}
		},
		onChooseFileType(type) {
			this.showFileType = type
			this.$nextTick(() => {
				this.loadFirstPage()
			})
		},
		loadFirstPage() {
			this.dataList = []
			this.hasMore = true
			this.clearSelect()
			this.getFileList()
		},
		uploadClose(vis) {
			if (!vis) {
				//上传对话框关闭 查看一下上传成功了几个 如果大于0则刷新
				if (this.$refs.spaceUpload.uploadSucCount > 0) {
					this.loadFirstPage()
				}
			}
		},
		//窗口变化回调
		onWindowResize() {
			this.calImageWidth()
		},
		//计算图片宽度
		calImageWidth() {
			let wrapper = this.$refs.photoWrapper.getBoundingClientRect();
			let itemWidth = this.utils.calItemWidth(wrapper, this.itemBaseWidth, this.itemMargin)
			if (itemWidth) this.itemWidth = itemWidth
		},
		//点击了图片 跳转到图片详情
		goPreviewImage(index) {
			//将文件对象包装为indexObj的格式 方便使用一套代码展示 从物理路径跳过去无法使用加入回收站功能 因为没有indexId
			let useList = []
			let showIndex = 0
			for (let i = 0; i < this.dataList.length; i++) {
				if (this.dataList[i].file_type != 'image') {
					continue
				}
				useList.push({
					title: this.dataList[i].filename,
					type: 1,
					url: this.dataList[i].tinyUrl
				})
			}
			for (let i = 0; i < useList.length; i++) {
				if (this.dataList[index].filename == useList[i].title) {
					showIndex = i
					break
				}
			}
			this.showPhotoDetail = true;
			this.$nextTick(() => {
				this.$refs.photoDetail.showImg(useList, showIndex);
			});
			this.pushState()

		},
		//点击了视频跳转到图片详情
		goPreviewVideo(index) {
			console.log('goPreviewVideo', index, this.dataList)
			//将文件对象包装为indexObj的格式 方便使用一套代码展示 从物理路径跳过去无法使用加入回收站功能 因为没有indexId
			let useList = []
			let showIndex = 0
			for (let i = 0; i < this.dataList.length; i++) {
				if (this.dataList[i].file_type != 'video') {
					continue
				}
				this.dataList[i].filePath = axios.encodePath(this.dataList[i].filename_enc)
				this.dataList[i].spaceToken = this.$store.state.privateSpace[this.spaceId]
				this.dataList[i].spaceId = this.spaceId
				if (i == index) {
					showIndex = useList.length
				}
				this.dataList[i].type = 2
				useList.push(this.dataList[i])
			}
			console.log("useList",useList)
			if (localStorage.getItem("rawPlayer") == "1") {
				//调用原生播放器
				jsBridge.playVideo({
					playIndex: showIndex,
					playList: useList,
					token: this.$store.state.token,
					fromFileBrower: false,
					serverType: "photo"
				})
			} else {
				//继续使用网页播放器
				this.showVideoDetail = true;
				setTimeout(() => {
					this.$refs.videoPlayer.playVideo(useList, showIndex);
				}, 500);
				this.pushState()
			}
		},
		clickFile(idx) {
			if (this.editMode) {
				this.hoverSelect(idx)
			} else {
				if (this.dataList[idx].file_type == 'image') {
					this.goPreviewImage(idx)
				} else if (this.dataList[idx].file_type == 'video') {
					this.goPreviewVideo(idx)
				} else {
					window.open(this.dataList[idx].rawUrl, '_blank');
				}
			}
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
				this.getFileList(true)
			}, (showTopBtn) => {
			})

		},
		uploadFiles() {
			if (this.isFromApp && jsBridge) {
				jsBridge.onClickSpaceUpload(parseInt(this.spaceId), this.$store.state.privateSpace[this.spaceId])
			} else {
				this.selectedFileIds = []
				this.editMode = false
				for (let i in this.dataList) {
					this.dataList[i].selected = false
				}
				this.showUploadModal = true
			}
		},

		getFileList(append) {
			if (this.loading || !this.hasMore) {
				return
			}
			this.loading = true
			this.api
				.post("/api/privateSpaceApi/getFileList", {
					fileType: this.showFileType,
					count: this.pageCount,
					offsetCount: this.dataList.length,
					spaceId: this.spaceId,
					spaceToken: this.$store.state.privateSpace[this.spaceId],
					orderField: this.orderField,
					orderType: this.orderType
				})
				.then((res) => {
					if (!res.code) {
						for (let i in res.data) {
							let dataItem = res.data[i]
							res.data[i].filename = Base64.decode(res.data[i].filename)
							if (res.data[i].tiny_path && res.data[i].tiny_path != 'undefined') {
								res.data[i].tinyUrl = axios.getPrivateSpaceFileUrl(this.spaceId, this.$store.state.privateSpace[this.spaceId], dataItem.filename, 'tiny',
									dataItem.id)
							} else {
								if (res.data[i].file_type == 'image') {
									res.data[i].tinyUrl = require(`@/static/icon-folder-image.png`)
								} else if (res.data[i].file_type == 'video') {
									res.data[i].tinyUrl = require(`@/static/icon-folder-video.png`)
								}
							}
							//解析stream_info
							if (res.data[i].stream_info) {
								res.data[i].stream_info = JSON.parse(res.data[i].stream_info)
							}
							res.data[i].rawUrl = axios.getPrivateSpaceFileUrl(this.spaceId, this.$store.state.privateSpace[this.spaceId], dataItem.filename, 'raw', dataItem.id)
						}
						console.log(res.data)
						if (res.data.length < this.pageCount) {
							this.hasMore = false
						}
						console.log('res.data', res.data)
						if (append) {
							for (var i = 0; i < res.data.length; i++) {
								this.dataList.push(res.data[i]);
							}
						} else {
							this.dataList = res.data

							this.$nextTick(() => {
								setTimeout(() => {
									this.calImageWidth()
								}, 300);
							});
						}
					}
					setTimeout(() => {
						this.loading = false
					}, 500);
				})
				.catch((error) => {
					this.loading = false
				});
		}
	}
}
</script>

<style lang="scss" scoped>
.root-wrapper-space-detail {
	//最外层容器
	width: 100%;
	height: 100%;
	padding-left: 30px;
	padding-right: 30px;
	overflow: hidden;
	background-color: $nas-second;

	@media all and (max-width:640px) {
		padding-left: 10px;
		padding-right: 10px;
	}
}

.album-detail-header {
	// 返回按钮 空间名称的header容器
	height: 80px;
	position: absolute;
	flex-shrink: 0;
	width: 100%;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;

	@media all and (max-width:640px) {
		height: 60px;
	}
}

.album-detail-content {
	// 列表容器 外层
	width: 100%;
	height: 100%;
	padding-top: 60px;
	@media not all and (max-width:640px) {
		padding-top: 80px;
	}
	.content-root {
		// 列表容器 包含列表头和列表内容
		width: 100%;
		height: 100%;
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
		background-color: rgba(255, 255, 255, 0.6);
		padding-left: 10px;
		padding-right: 10px;

		@media not all and (max-width:640px) {
			padding-left: 30px;
			padding-right: 30px;
		}

		.list-top-root {
			// 列表头
			justify-content: space-between;
			left: 0;
			height: 80px;
			width: 100%;
			display: flex;
			align-items: center;
		}

		.list-content-root {
			// 列表内容容器
			width: 100%;
			display: flex;
			height: 100%;
			flex-direction: row;
			overflow: hidden;

			.file-list {
				// 列表外层
				width: 100%;
				height: 100%;
				display: flex;
				flex-direction: row;
				align-content: flex-start;
				flex-wrap: wrap;
				overflow-y: auto;
				overflow-x: hidden;
			}
		}
	}
}




.zoom-slider {
	margin-left: 20px;
	margin-right: 20px;
	width: 60px;
	display: inline-flex;

	@media all and (max-width:880px) {
		display: none;
	}

	@media all and (max-width:640px) {
		margin-left: 10px;
		margin-right: 10px;
		width: 40px;
	}
}


.private-header-mobile-show {
	@media all and (max-width:825px) {
		display: block !important;
	}

	@media not all and (max-width:825px) {
		display: none !important;
	}
}

.private-header-mobile-none {
	@media all and (max-width:825px) {
		display: none !important;
	}

	@media not all and (max-width:825px) {
		display: block !important;
	}
}

.item-folder {
	position: relative;
	justify-content: center;
	align-items: center;
	display: flex;
	flex-direction: column;
}

.photo-select-icon-hover {
	color: white;
	font-size: 20px;
	border-radius: 10px;
	right: 10px;
	bottom: 10px;
	height: 28px;
	width: 28px;
	position: absolute;
}

.item-image-root {
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}

.photo-select-mask {
	border-radius: 10px;
	top: 0.5%;
	left: 0.5%;
	position: absolute;
	width: 99%;
	height: 99%;
	background: rgba(0, 0, 0, 0.5);
}

.photo-select-icon {
	width: 15%;
	right: 10px;
	bottom: 10px;
	position: absolute;
}

.photo-hover-mask {
	border-radius: 10px;
	top: 0.5%;
	left: 0.5%;
	position: absolute;
	width: 99%;
	height: 99%;
	background: linear-gradient(to bottom,
			rgba(0, 0, 0, 0),
			rgba(0, 0, 0, 0.2));
}

.item-img {
	object-fit: cover;
	border-radius:6px;
}

.bottom-root {
	position: absolute;
	left: 0;
	bottom: 0;
	height: 60px;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	background-color: rgba(0, 0, 0, 0.7);

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


	.icon-duration {
		margin-right: 8px;
		margin-top: 3px;
		font-size: 16px;
		color: white;
		// font-weight: bold;
	}
}

// 覆盖iview按钮的自带border颜色
.ivu-btn {
	border: 0px;
	border-color: transparent !important;
}
</style>
