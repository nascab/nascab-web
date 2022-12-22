<template>
	<div class="browser-root" ref="rootWrapper">
		<div v-if="!selectMode" class="path-root">
			<div style="display:flex;justify-content:flex-start;width:100%;">
				<a style="font-size:16px;flex-shrink: 0;" @click="parentPathClick(pitem, index)"
					v-for="(pitem, index) in parentPathList">
					{{ pitem }}</a>
				<a v-if="parentPathList.length < 1">{{ $t('file.rootPath') }}</a>
			</div>
		</div>

		<div :style="{ 'padding-top': selectMode ? '0' : '30px' }" style="overflow:hidden">
			<div class="list-root" ref="wrapper">
				<div v-if="fileTree.length < 1" style="margin-top: 20px;width: 100%;">{{ this.$t('common.noMore') }}
				</div>

				<div :id="'file_' + index" v-for="(file, index) in fileTree"
					@contextmenu="showRightMenu($event, $root, file, index)" @touchstart="touchstart(file, index)"
					@touchend="touchend">
					<div class="list-item"
						:style="{ 'background-color': selectedIndex == index ? 'rgba(0,0,0,0.1)' : 'transparent', 'padding': itemMargin + 'px' }"
						@click="(e) => { clickTree(e, file, index) }">

						<div style="display: flex;justify-content: center;align-items: center;"
							:style="{ 'width': itemWidth + 'px', 'height': itemWidth + 'px' }">
							<span v-if="file.type == 2" class="nasIcons icon-img-folder item-icon-folder"
								:style="{ 'font-size': itemWidth + 'px' }"></span>

							<!-- 视频和图片显示缩略图 -->
							<img @dragstart.prevent class="item-img"
								v-if="file.type == 1 && (file.fileType == 'image' || file.fileType == 'video')"
								v-lazy="file.url" />
							<img style="width:28%;position:absolute;pointer-events: none;"
								src="@/static/icon_play_white.png" v-if="file.type == 1 && file.fileType == 'video'" />

							<img @dragstart.prevent class="item-img" v-if="file.type == 1 && file.fileType == 'text'"
								src="@/static/icon-folder-text.png" />
							<img @dragstart.prevent class="item-img" v-if="file.type == 1 && file.fileType == 'file'"
								src="@/static/icon-folder-file.png" />
						</div>
						<p class="filename" :style="{ 'width': itemWidth + 'px' }">{{ file.name }}</p>
					</div>
				</div>
			</div>
		</div>
		<!-- 照片详情弹窗 -->
		<Modal v-model="showPhotoDetail" fullscreen footer-hide style="background-color: transparent;">
			<photo-detail v-if="showPhotoDetail" @onClose="showPhotoDetail = false" :fromFolderBrower="true"
				ref="photoDetail"></photo-detail>
		</Modal>

		<!-- 点击照片后弹出的视频播放器详情 -->
		<Modal v-model="showVideoDetail" fullscreen footer-hide :closable="false">
			<video-detail propsServerType="photo" :fromFileBrower="true" v-if="showVideoDetail"
				@onClose="showVideoDetail = false" ref="videoPlayer"></video-detail>
		</Modal>
		<!-- 右键菜单 -->
		<easy-cm @ecmcb="rightMenuClick" :list="rightMenuList"></easy-cm>
		<!-- 显示文件属性的对话框 -->
		<vs-dialog v-model="attrDialogIsShow">
			<template #header>
				<div style="display: flex;align-items: center;margin-top: 20px;">
					<img style="width: 22px;height: 22px;margin-right: 10px;"
						src="@/static/common/icon-dialog-alert.png" />
					<p style="color: #333333;font-size: 22px;text-align: center;">
						{{ $t('file.attr') }}
					</p>
				</div>
			</template>
			<!-- 文件属性 -->
			<div v-if="selectedFileAttr"
				style="display: flex;flex-direction: column;justify-content: flex-start;max-width: 600px;">
				<div class="item-attr" v-if="selectedFile">{{ $t('file.location') }}:<span>{{ selectedFile.tipName
				}}</span></div>
				<div class="item-attr">{{ $t('movie.createTime') }}:<span>{{ selectedFileAttr.ctime |
						dateFormat('YYYY-MM-DD HH: mm')
				}}</span></div>
				<div class="item-attr">{{ $t('file.modifyTime') }}:<span>{{ selectedFileAttr.mtime |
						dateFormat('YYYY-MM-DD HH: mm')
				}}</span></div>
				<div v-if="selectedFileAttr.sizeStr" class="item-attr">
					{{ $t('file.size') }}:<span>{{ selectedFileAttr.sizeStr }}</span></div>
			</div>
		</vs-dialog>

		<!-- 返回顶部按钮 -->
		<my-btn-icon v-if="showToTopBtn && !selectMode" style="position:fixed;right:30px;bottom:10px;"
			iIcon="md-arrow-up" @click="scrollToTop"></my-btn-icon>


		<!-- 手机端长按条目的时候弹出的菜单 -->
		<vs-dialog v-model="showLongPressMenu">
			<h4 v-if="selectedFile" class="max-line-one" style="word-break:break-all">{{ selectedFile.name }}</h4>
			<vs-button border v-for="menu in rightMenuList" @click="rightMenuClick(null, menu.type)"
				style="width:100%;margin-top:15px">
				{{ menu.text }}
			</vs-button>
		</vs-dialog>
	</div>
</template>

<script>
import typeData from "@/components/folder-brower/type-data.js"
import axios from "@/plugins/axios";
import base64 from '@/plugins/base64/index.js'
import videoDetail from "@/views/videoDetail/videoDetail.vue";
//照片点击详情
import photoDetail from "@/views/photos/components/photoDetail.vue";
//视频点击详情
export default {
	components: {
		videoDetail,
		photoDetail
	},
	computed: {},
	props: {
		selectMode: { //选择模式
			default: false,
			type: Boolean
		},
		fileType: { //显示的类型 0全部  2文件夹
			default: 0,
			type: Number
		}
	},
	data() {
		return {
			showLongPressMenu: false,
			showPhotoDetail: false,
			showToTopBtn: false,
			attrDialogIsShow: false,//属性对话框是否显示
			rightMenuList: [],
			itemBaseWidth: 80,
			itemWidth: 80,
			itemMargin: 10,
			showVideoDetail: false,
			source: "list",
			visible: false,
			scroll: null,
			clickTimeout: null,
			selectedIndex: null,
			selectedFile: null,
			selectedFileAttr: null,
			isRoot: true,
			parent: "",
			pathSep: '/',
			fileTree: [],
			platform: '',
			typeData: typeData,
			parentPathList: [],
			longPressTimeout: null
		}
	},
	mounted() {
		this.init()
	},
	methods: {
		scrollToTop() {
			console.log('scrollToTop')
			this.$refs.wrapper.scrollTo({ top: 0, behavior: 'smooth' })
		},
		touchstart(item, index) {
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
			this.showLongPressMenu = true
		},
		initRightMenuList() {
			this.rightMenuList = []
			this.rightMenuList.push({
				text: this.$t('file.check'),
				type: "CHECK",
			})

			if (!(this.source == 'collect' && this.isRoot)) {
				this.rightMenuList.push({
					text: this.$t('file.collect'),
					type: "COLLECT"
				})
			}
			if (this.source == 'collect' && this.isRoot) {
				this.rightMenuList.push({
					text: this.$t('file.cancelCollect'),
					type: "CANCEL_COLLECT"
				})
			}
			if (this.source == 'recent' && this.isRoot) {
				this.rightMenuList.push({
					text: this.$t('file.deleteFromRecent'),
					type: "DELETE_RECENT"
				})
			}
			//删除
			if (this.parent && this.parent != "/") {
				this.rightMenuList.push({
					text: this.$t('common.delete'),
					type: "DELETE",
				})
			}

			// 属性
			this.rightMenuList.push({
				text: this.$t('file.attr'),
				type: "ATTR",
			})
		},
		getFileStatApi() {//获取文件属性
			this.api
				.post("/api/file/getPathState", {
					fullPath: this.selectedFile.tipName
				}).then((res) => {
					if (!res.code) {
						this.selectedFileAttr = res.data
					}
				})
		},
		deleteFileApi() {//获取文件属性
			this.api
				.post("/api/file/deleteByPath", {
					fullPath: this.selectedFile.fileFullPath
				}).then((res) => {
					if (!res.code) {
						this.showVsNotification(this.$t('common.deleteSuccess'))
						this.getFileTree(this.parent)
					}
				})
		},
		showRightMenu(event, root, file, index) {
			if (this.isMobile) return event.preventDefault()
			this.selectedIndex = index
			this.selectedFile = file
			this.$easycm(event, root)
		},
		//右键菜单点击
		rightMenuClick(indexList, clickType) {
			this.showLongPressMenu = false
			let type = clickType ? clickType : this.rightMenuList[indexList[0]].type
			if (type == 'CHECK') { //查看
				this.onDoubleClick(this.selectedFile, this.selectedIndex)
			} else if (type == 'COLLECT') { //收藏
				this.addFileRecord('collect', this.selectedFile)
			} else if (type == 'CANCEL_COLLECT') { //取消收藏
				this.deleteFileRecord('collect', this.selectedFile, false)
			} else if (type == 'DELETE_RECENT') { //从最近中删除
				this.deleteFileRecord('recent', this.selectedFile, false)
			} else if (type == 'ATTR') { //查看文件属性
				this.attrDialogIsShow = true
				this.selectedFileAttr = null
				this.getFileStatApi()
			} else if (type == 'DELETE') { //删除文件
				this.showVsConfirmDialog(this.$t('common.alert'), this.$t('file.fileDeleteSure'), () => {
					// 调用删除的api
					this.deleteFileApi()
				}, null, this.$t('common.delete'), this.$t('common.cancel'), 2500, true)
			}
		},
		setItemBaseWidth(baseWidth) {
			this.itemBaseWidth = baseWidth
		},
		//计算item宽度
		calImageWidth() {
			let wrapper = this.$refs.wrapper.getBoundingClientRect();
			let itemWidth = this.utils.calItemWidth(wrapper, this.itemBaseWidth, this.itemMargin)
			if (itemWidth) this.itemWidth = itemWidth
		},

		// 清空收藏夹
		clearCollect(file) {
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('file.sureClearCollect'), () => {
				this.deleteFileRecord('collect', file, true)
			})
		},
		// 清空最近记录
		clearRecent(file) {
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('file.sureClearRecents'), () => {
				this.deleteFileRecord('recent', file, true)
			})
		},
		changeShowType(source) {
			this.parentPathList = []
			this.source = source
			this.selectedIndex = null
			this.selectedFile = null
			this.init()
		},
		parentPathClick(pathSeg, index) {
			let enterPath = ''
			for (let i = 0; i <= index; i++) {
				enterPath += this.parentPathList[i]
			}
			console.log('enterPath', enterPath)
			if (enterPath.length > 3 && enterPath.endsWith(this.pathSep)) {
				enterPath = enterPath.substring(0, enterPath.lastIndexOf(this.pathSep))
			}
			this.getFileTree(enterPath)

		},
		parseParentPath() {
			console.log(this.parent)
			this.parentPathList = []
			let pathArr = this.parent.split(this.pathSep)
			console.log(pathArr)
			for (let i in pathArr) {
				if (this.platform == "win32") {
					let pushItem = pathArr[i]
					if (!pushItem) {
						continue
					}
					if (i != pathArr.length - 1) {
						pushItem += this.pathSep
					}
					this.parentPathList.push(pushItem)
				} else {
					if (pathArr[i]) {
						this.parentPathList.push(this.pathSep + pathArr[i])
					}
				}
			}
		},
		init() {
			this.isRoot = true
			this.parent = ''
			this.fileTree = []

			if (this.source == 'list') {
				this.getFileTree('')
			} else {
				//collect recent
				this.getFileRecord(this.source)
				let showTitle = ''
				if (this.source == "recent") {
					showTitle = this.$t('file.recent')
				} else if (this.source == "collect") {
					showTitle = this.$t('file.collect')
				}
				this.$emit('onParentChange', showTitle, true)
			}

		},
		//双击触发
		onDoubleClick(data, index) {
			if (data.type == 2) {
				this.enterPath(data)
			} else if (data.type == 1) {
				this.addFileRecord('recent', data)
				if (data.fileType == "image") {
					this.goPreviewImage(index)
				} else if (data.fileType == 'video') {
					this.goPreviewVideo(index)
				} else {
					window.open(this.getRawUrl(index, this.fileTree[index].name), '_blank');
				}
			}
		},
		//目录点击事件
		clickTree(e, data, index) {

			if (this.selectedIndex == index) {
				//双击
				this.onDoubleClick(data, index)
			}
			this.selectedIndex = index
			this.selectedFile = data
		},
		getRawUrl(index) {
			//分享文件
			let filePath = this.fileTree[index].parent + this.fileTree[index].pathSep + this.fileTree[index].name
			let durl = axios.getRawFileUrl(filePath, this.fileTree[index].name)
			return durl
		},
		onSelectedPath(data, index) {
			//选择模式下当文件夹被选中
			let filePath = this.getFileFullPath(data)
			this.$emit('onSelect', filePath)
		},
		getCurrentSelectedPath() {
			if (!this.selectedFile) {
				this.showVsNotification(this.$t('file.noFolderSelected'))
				return false
			} else {
				return this.getFileFullPath(this.selectedFile)
			}
		},
		getFileFullPath(fileObj) {
			//根据文件对象拼接完整访问物理路径
			let fileName = fileObj.name
			let prix = fileObj.parent == fileObj.pathSep ? fileObj.parent : fileObj.parent + fileObj.pathSep
			if (this.platform == "win32") {
				//win平台
				if (fileObj.parent) {
					prix = fileObj.parent + fileObj.pathSep
				} else {
					prix = ''
					if (!fileName.endsWith(fileObj.pathSep)) {
						fileName = fileName + fileObj.pathSep
					}
				}
			}
			return prix + fileName
		},
		goBack() {
			//点击了返回上一级
			let lastSepIndex = this.parent.lastIndexOf(this.pathSep) > 0 ? this.parent.lastIndexOf(this.pathSep) :
				1
			let lastPath = this.parent.substring(0, lastSepIndex)
			console.log('this.parent', this.parent)
			if (this.platform == "win32" && lastPath.length == 2 && lastPath[1] == ':') {
				//处理特殊情况 就是返回的上一级是个盘符如 D: 需要后面拼接一下分隔符
				lastPath += this.pathSep
			}
			if (this.platform == "win32" && this.parent.length <= 4 && this.parent[1] == ':') {
				//处理特殊情况 当前处于某个盘的根目录 D:\ 返回上级的话要返回根目录
				lastPath = ''
			}
			console.log('lastPath', lastPath)
			this.getFileTree(lastPath)
		},
		enterPath(fileObj) {
			// 进入文件夹
			this.getFileTree(this.getFileFullPath(fileObj))
		},

		//点击了图片 跳转到图片详情
		goPreviewImage(index) {
			//将文件对象包装为indexObj的格式 方便使用一套代码展示 从物理路径跳过去无法使用加入回收站功能 因为没有indexId
			let useList = []
			let showIndex = 0
			for (let i = 0; i < this.fileTree.length; i++) {
				if (this.fileTree[i].fileType != 'image') {
					continue
				}
				useList.push({
					title: this.fileTree[i].name,
					type: 1,
					url: this.fileTree[i].url
				})
			}
			for (let i = 0; i < useList.length; i++) {
				if (this.fileTree[index].name == useList[i].title) {
					showIndex = i
					break
				}
			}
			this.showPhotoDetail = true;
			this.$nextTick(() => {
				this.$refs.photoDetail.showImg(useList, showIndex);
			});
		},
		//点击了图片 跳转到图片详情
		goPreviewVideo(index) {
			//将文件对象包装为indexObj的格式 方便使用一套代码展示 从物理路径跳过去无法使用加入回收站功能 因为没有indexId
			let useList = []
			let showIndex = 0
			for (let i = 0; i < this.fileTree.length; i++) {
				if (this.fileTree[i].fileType != 'video') {
					continue
				}
				let filePath = this.getFileFullPath(this.fileTree[i])
				filePath = encodeURI(filePath)
				filePath = base64.encode(filePath)
				this.fileTree[i].filePath = filePath
				this.fileTree[i].rawUrl = this.getRawUrl(i, this.fileTree[i].name)
				this.fileTree[i].id = i
				if (i == index) {
					showIndex = useList.length
				}
				useList.push({
					...this.fileTree[i],
					type: 2
				})
			}
			this.showVideoDetail = true;
			this.$nextTick(() => {
				console.log(useList)
				this.$refs.videoPlayer.playVideo(useList, showIndex);
			});
		},
		//添加到最近访问或者收藏
		addFileRecord(type, fileObj) {
			let params = {
				parent: fileObj.parent,
				path_sep: fileObj.pathSep,
				name: fileObj.name,
				ext: fileObj.ext,
				record_type: type,
				is_file: fileObj.type == 1 ? 1 : 0,
			}
			if (type == 'recent') {
				params.hideLoading = true
			}
			this.api
				.post("/api/fileRecordApi/addFileRecord", params).then((res) => {
					if (!res.code) {
						if (type == 'collect') {
							console.log('collectSuccess')
							this.showVsNotification(this.$t('file.collectSuccess'));
						}
					}
				})
		},
		deleteFileRecord(type, fileObj, deleteAll) {
			let params = {
				id: fileObj ? fileObj.id : '',
				type: type,
				deleteAll: deleteAll
			}
			this.api
				.post("/api/fileRecordApi/deleteFileRecord", params).then((res) => {
					if (!res.code) {
						this.showVsNotification(this.$t('common.deleteSuccess'));
						if (deleteAll) {
							this.init()
						} else {
							for (let i in this.fileTree) {
								if (this.fileTree[i].id == fileObj.id) {
									this.fileTree.splice(i, 1)
								}
							}
						}

					}
				})
		},
		addPathTipName(item) {
			if (this.parent) {
				if (this.parent.endsWith(this.pathSep)) {
					item.tipName = this.parent + item.name
				} else {
					item.tipName = this.parent + this.pathSep + item.name
				}
			} else {
				item.tipName = item.name
			}
		},
		getFileRecord(type) {
			this.api
				.post("/api/fileRecordApi/getFileRecord", {
					type: type,
					count: 500
				}).then((res) => {
					if (!res.code) {
						for (let i in res.data) {
							if (res.data[i].is_file == 1) {
								res.data[i].type = 1
							} else {
								res.data[i].type = 2
							}
							res.data[i].pathSep = res.data[i].path_sep
							let fname = res.data[i].name.toLowerCase()
							let lastIndex = fname.lastIndexOf('.')
							if (lastIndex >= 0) {
								let ext = fname.substring(lastIndex)
								res.data[i].ext = ext
								res.data[i].fileType = this.getFileType(ext)
							} else {
								//没有后缀名 归类为普通文件
								res.data[i].fileType = "file"
							}

							this.addPathTipName(res.data[i])
							res.data[i].url = axios.getTinyUrlByFilePath(res.data[i].parent + res.data[i].path_sep + res.data[i].name)

						}
						this.fileTree = res.data
						this.initRightMenuList()

					}
				})
		},
		//创建新文件夹 
		createNewFolder(folderName) {
			if (!this.parent) {
				return this.showVsNotification('无法在当前位置创建')
			}
			let ppath = encodeURI(this.parent)
			ppath = base64.encode(ppath)
			this.api
				.post("/api/file/addNewFolder", {
					parentPath: ppath,
					folderName: folderName
				}).then((res) => {
					if (!res.code) {
						// 刷新
						this.getFileTree(this.parent)
						this.showVsNotification(this.$t('common.operationSuccess'))
					}
				})
		},
		//根据扩展名获得文件类型
		getFileType(ext) {
			let typeSign = this.typeData[ext]
			switch (typeSign) {
				case 1:
					return "image"
					break;
				case 2:
					return "video"
					break;
				case 3:
					return "text"
					break;
				default:
					return "file"
			}
		},
		getFileTree(parentPath) {
			this.api
				.post("/api/file/getPathTree", {
					parent: parentPath,
					type: this.fileType
				}).then((res) => {
					console.log(res)
					this.selectedIndex = null
					this.selectedFile = null
					if (!res.code) {
						if (parentPath == "" || parentPath == "/" || parentPath == this.pathSep) {
							this.isRoot = true
						} else {
							this.isRoot = false
						}
						this.parent = res.data.parent
						this.parseParentPath()
						this.pathSep = res.data.sep
						this.platform = res.data.platform
						let children = res.data.children
						//根据文件名字判断不同类型 显示不同图标
						for (let i = 0; i < children.length; i++) {
							this.addPathTipName(children[i])


							children[i].parent = res.data.parent
							children[i].pathSep = res.data.sep

							let fname = children[i].name.toLowerCase()
							let lastIndex = fname.lastIndexOf('.')
							if (lastIndex >= 0) {
								let ext = fname.substring(lastIndex)
								children[i].ext = ext
								children[i].fileType = this.getFileType(ext)
							} else {
								//没有后缀名 归类为普通文件
								children[i].fileType = "file"
							}
							children[i].url = axios.getTinyUrlByFilePath(children[i].fileFullPath)
						}
						console.log(children)
						this.fileTree = children
						this.showToTopBtn = this.fileTree.length > 100
						this.$emit('onParentChange', this.parent, this.isRoot)
						this.$nextTick(() => {
							this.calImageWidth()
						})
						this.initRightMenuList()
					} else if (res.code == 2) {
						this.showVsAlertDialog(
							this.$t('common.alert'), this.$t('common.noAccess'));
					}
				})
		}
	}
}
</script>

<style lang="scss" scoped>
.browser-root {
	width: 100%;
	position: static;
	display: flex;
	flex-direction: column;
}

.item-icon-folder {
	text-align: center;
	color: $nas-main;
}

.list-root {
	height: 100%;
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	flex-direction: row;
	position: relative;
	display: inline-flex;
	overflow-y: auto;

	@media all and (max-width:640px) {
		-webkit-overflow-scrolling: touch;
	}
}

.clean-icon {
	position: fixed;
	right: 60px;
	bottom: 30px;
	cursor: pointer;
}

.list-item {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.item-img {
	pointer-events: none;
	border-radius: 10px;
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.img-root {
	position: relative;
}

.item-more {
	right: 10px;
	top: 10px;
	position: absolute;
}

.filename {
	color: $nas-text-title;
	margin-top: 10px;
	text-align: center;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 3;
	word-break: break-all;
}

.item-attr {
	font-weight: bold;
	text-align: left;
	margin-top: 10px;

	span {
		font-weight: normal;
	}
}

.path-root {
	width: calc(100% - 30px);
	margin-bottom: 20px;
	padding-left: 10px;
	position: absolute;
	top: 80px;
	padding-right: 50px;
	overflow-x: auto;
}
</style>
