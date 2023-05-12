<template>
	<div class="root">
		<div id="vviewRoot"></div>
		<Icon @click.stop="onClose" type="md-return-left" size="30" color="white"
			style="z-index:999;position:fixed;left:20px;top:20px" />
		<photo-exif :serverType="serverType" @onIndexUpdate="onIndexUpdate" ref="exif" v-if="showExif" :indexObj="indexObj"
			@closeExif="closeExif">
		</photo-exif>

		<!-- <Modal v-model="showPhotoEditor" fullscreen footer-hide>
			<tui-image-editor ref="photoEditor" @onClose="onEditorClose"> </tui-image-editor>
		</Modal> -->
	</div>
</template>

<script>
import photoExif from "./photoExif.vue"
import tuiImageEditor from "./photoEditor.vue"
import jsBridge from "@/plugins/jsBridge"

export default {
	name: "photo-detail",
	components: {
		photoExif,
		tuiImageEditor
	},
	props: {
		fromSpace: {
			default: false,
			type: Boolean
		},
		fromFolderBrower: {
			default: false,
			type: Boolean
		},
		serverType: {
			default: 'photo',
			type: String
		}
	},
	data() {
		return {
			// showPhotoEditor: false,
			imgIndex: 0,
			showExif: false,
			indexObj: null,
			showList: []
		};
	},
	mounted() {
		// let show = localStorage.getItem('showExif')
		// if (show == "1") {
		// 	this.showExif = true
		// } else if (show == "0") {
		// 	this.showExif = false
		// }
	},
	methods: {
		//当索引被更新
		onIndexUpdate(updatedIndex) {
			console.log('photoDetail onIndexUpdate', updatedIndex)
			for (let i in this.showList) {
				if (this.showList[i].id == updatedIndex.id) {
					this.showList[i] = updatedIndex
					this.indexObj = updatedIndex
				}
			}
		},
		// onEditorClose(change) {
		// 	//编辑器关闭回调
		// 	this.showPhotoEditor = false
		// 	if (change) {
		// 		//图片有修改
		// 		this.$Spin.show();
		// 		this.$emit('onImageChange')
		// 	}
		// },
		onClose() {
			this.$emit('onClose')
		},
		closeExif() {
			this.showExif = false
			localStorage.setItem('showExif', '0')
		},
		showImg(photoList, index, keepRawUrl) {
			console.log("photoList", photoList)
			console.log("index", index)

			//加载太多会有问题 列表只加载60个 即前30个 后30个 从原列表截取
			let showUrl = photoList[index].url
			let urlList = []
			let showCount = 600

			this.showList = []
			// 总列表的前面取一部分 后面取一部分 最多取showCount个 只取type=1即图片类型的
			for (let i = index - 1; i >= 0; i--) {
				if (photoList[i].type == 1) {
					this.showList.push(photoList[i])
				}
				if (this.showList.length >= showCount / 2) {
					break
				}
			}
			console.log(this.showList)
			this.showList.reverse();
			for (let i = index; i < photoList.length; i++) {
				if (photoList[i].type == 1) {
					this.showList.push(photoList[i])
				}
				if (this.showList.length >= showCount) {
					break
				}
			}
			let showIndex = 0
			for (let i = 0; i < this.showList.length; i++) {
				urlList.push(this.showList[i].url)
				if (this.showList[i].url == showUrl) {
					showIndex = i
				}
			}
			let toolbar = {}
			if (!this.fromFolderBrower && !this.fromSpace) {
				toolbar.exif = () => {
					this.showExif = !this.showExif
					localStorage.setItem('showExif', this.showExif ? '1' : '0')
					this.$nextTick(() => {
						if (this.$refs.exif && this.showExif) {
							//exif组件是监听indexobj变化获取数据的 手动打开不会触发 所以调用一下获取exif的接口
							this.$refs.exif.getExifInfo()
							this.$refs.exif.getPositionStr()
						}
					})
				}
			}
			toolbar.download = () => {
				console.log(this.indexObj)
				let Url = this.indexObj.url
				if (Url.indexOf('type=tiny') != -1) {
					Url = Url.replace('type=tiny', 'type=raw');
				}
				Url = Url.replace('tinyImg', 'rawFile');


				let fullUrl = window.location.protocol + "//" + window.location.host + Url
				if (this.isFromApp) {
					jsBridge.openInBrowser(fullUrl)
				} else {
					window.open(Url, "_blank")
				}

			}
			if (!this.isMobile) {//pc可以编辑
				toolbar.zoomOut = {
					show: true
				}
			}
			toolbar.rotateLeft = true
			toolbar.prev = {
				show: true
			}
			// toolbar.play = {
			// 	show: true
			// }
			toolbar.next = {
				show: true
			}
			toolbar.rotateRight = {
				show: true
			}
			if (!this.isMobile) {//pc可以编辑
				toolbar.oneToOne = {
					show: true
				}
				toolbar.zoomIn = {
					show: true
				}
				//去掉图片编辑
				// if (!this.fromFolderBrower && !this.fromSpace) {
				// 	toolbar.edit = () => {
				// 		let lowExt = this.indexObj.ext.toLowerCase()
				// 		this.showPhotoEditor = true
				// 		this.$nextTick(() => {
				// 			this.$refs.photoEditor.editImage(this.indexObj, this.serverType);
				// 		})
				// 	}
				// }

			}
			//只有照片管理提供删除
			if (this.serverType == 'photo' && !this.fromFolderBrower && !this.fromSpace) {
				toolbar.delete = () => {
					this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('photo.confirmPutInTrash'), () => {
						//加入回收站
						this.api.post('/api/fileApi/inOutTrash', {
							ids: [this.showList[this.imgIndex].id],
							trash: 1
						}).then((res) => {
							if (!res.code) {
								//加入回收站成功 全局事件提示photoListContent在列表删除相应id的项目
								this.$bus.$emit('removeIndexById', this.showList[this
									.imgIndex].id)
								this.showVsNotification(this.$t('file.putInTrashSuc'));
								this.showList.splice(this.imgIndex, 1)
								viewer.destroy()
								if (this.showList.length > 0) {
									this.$nextTick(() => {
										if (this.imgIndex > this.showList
											.length - 1) {
											this.imgIndex = this.showList
												.length - 1
										}
										this.showImg(this.showList, this
											.imgIndex)
									})
								} else {
									//删除完就没了 关闭
									this.onClose()
								}
							}
						}).catch((error) => { console.log(error) })
					})
				}
			}
			let viewer = this.$viewerApi({
				options: {
					//android 和 pc端不显示动画 太卡 && !/(Android)/i.test(navigator.userAgent)
					transition: this.isMobile,
					button: false,
					className: "viewerroot",
					initialViewIndex: showIndex,
					zoomRatio: 0.5,
					zIndex: 100,
					zIndexInline: 100,
					title: [1, (image, imageData) => {
						let obj = this.showList[this.imgIndex]
						if (this.fromFolderBrower || this.fromSpace) {
							//从文件浏览器调过来的时候赋值的
							return obj.title
						}

						return `${obj.original_date} - ${obj.filename} `
					}],
					toolbar: toolbar,
					rotated: (event) => {
						console.log('旋转了', event)
						// let degree=event.detail.degree%360
						// this.api.post('/api/fileApi/rotateImage', {
						// 	filePath:axios.encodePath(this.indexObj.path),
						// 	fileName:axios.encodePath(this.indexObj.filename),
						// 	degree
						// }).then((res) => {
						// 	if (!res.code) {

						// 	}
						// }).catch((error) => { })
					},
					view: (event) => {
						let isToRight = true
						if (event.detail.index < this.imgIndex) {
							isToRight = false
						}
						this.imgIndex = event.detail.index
						this.indexObj = this.showList[this.imgIndex]

						// 预加载 
						let needPreLoad = true
						let nextUrl = ''
						if (isToRight) {
							if (this.imgIndex + 1 > this.showList.length) {
								needPreLoad = false
							} else {
								nextUrl = this.showList[this.imgIndex + 1] ? this.showList[this.imgIndex + 1].url : ""
							}
						} else {
							if (this.imgIndex - 1 < 0) {
								needPreLoad = false
							} else {
								nextUrl = this.showList[this.imgIndex - 1] ? this.showList[this.imgIndex - 1].url : ""
							}
						}
						if (needPreLoad && nextUrl) {
							let img = new Image()
							if (nextUrl.indexOf('type=tiny') != -1) {
								nextUrl = nextUrl.replace('type=tiny', 'type=raw');
							}
							nextUrl = nextUrl.replace('tinyImg', 'rawFile');
							console.log('预加载', nextUrl)
							img.src = nextUrl
						}
					},
					ready: (res) => { },
					//照片隐藏的时候 此组件一起隐藏
					hidden: () => {
						this.$emit('onClose')
					},
					// 去哪里获取原始url
					url(image) {
						if (keepRawUrl) {
							return image.src
						}
						if (image.src.indexOf('type=tiny') != -1) {
							return image.src.replace('type=tiny', 'type=raw');
						}
						return image.src.replace('tinyImg', 'rawFile');
					},
					play: (e) => {
						this.showExif = false
					},
					container: "#vviewRoot"
				},
				images: urlList
			})
		}
	}
}
</script>
<style>
.viewer-root {
	z-index: 100;
}

.viewer-exif {
	color: #fff;
	font-size: 0.8rem;
	font-weight: bolder;
	line-height: 24px;
	text-align: center;
}

.viewer-exif::before {
	font-family: "iconfont" !important;
	content: "\e628";
}

.viewer-download {
	color: #fff;
	font-size: 0.8rem;
	font-weight: bolder;
	line-height: 24px;
	text-align: center;
}

.viewer-download::before {
	font-family: "iconfont" !important;
	content: "\2193";
}


.viewer-edit {
	color: #fff;
	font-weight: bolder;
	font-size: 0.8rem;
	line-height: 24px;
	text-align: center;

}

.viewer-edit::before {
	font-family: "iconfont" !important;
	content: "\e60d";
}

.viewer-delete {
	color: #fff;
	font-weight: bolder;
	font-size: 0.8rem;
	line-height: 24px;
	text-align: center;
}

.viewer-delete::before {
	font-family: "iconfont" !important;
	content: "\ec45";
}
</style>
<style lang="scss" scoped>
::v-deep .viewer-toolbar ul {
	transform: scale(1.2) !important;
}

.viewerroot {
	margin-right: 250px;
}

.root {
	background-color: black;
	display: flex;
	flex-direction: row;
	height: 100%;
	width: 100%;
	z-index: 999;
	position: fixed;
	top: 0;
	left: 0;
}
</style>
