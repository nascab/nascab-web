<template>
	<div @contextmenu.stop="showRightMenuBg($event, $root)" class="browser-root" ref="rootWrapper">
		<div v-if="!selectMode" class="path-root">
			<div style="display:flex;justify-content:flex-start;width:100%;">
				<a style="font-size:14px;flex-shrink: 0;margin-left: 5px;" @click="parentPathClick(pitem, index)"
					v-for="(pitem, index) in parentPathList"
					:style="{ 'color': index == parentPathList.length - 1 ? '#386DF2' : '#999999' }">
					{{ pitem }}</a>
				<a v-if="parentPathList.length < 1">{{ $t('file.rootPath') }}</a>
			</div>
		</div>

		<div :style="{ 'padding-top': selectMode ? '0' : '30px', 'height': showInWindow ? '550px' : 'auto' }"
			style="overflow:hidden;">
			<div class="list-root" ref="wrapper">
				<div v-if="fileTree.length < 1" style="margin-top: 20px;width: 100%;">{{ this.$t('common.noMore') }}
				</div>

				<div :id="'file_' + index" v-for="(file, index) in fileTree"
					:class="{ 'list-item-root-list': showType == 'list' }"
					:style="{ 'background-color': selectedIndex == index ? 'rgba(0,0,0,0.1)' : 'transparent', 'padding': itemMargin / 2 + 'px' }"
					@contextmenu.stop="showRightMenu($event, $root, file, index)" @touchstart="touchstart(file, index)"
					@mouseenter="mouseEnterImg(index)" @mouseleave="mouseLeaveImg(index)" @touchend="touchend">

					<div :class="{ 'list-item-list': showType == 'list', 'list-item-grid': showType == 'grid' }"
						@click="(e) => { clickTree(e, file, index) }">
						<div style="display: flex;justify-content: center;align-items: center;"
							:style="{ 'width': itemWidth + 'px', 'height': itemWidth + 'px', 'margin': itemMargin / 2 + 'px' }">

							<img v-if="file.type == 2 && !file.isCustomPath" :style="{ 'width': itemWidth + 'px' }"
								src="@/static/folder/icon_folder.png">
							<img v-if="file.type == 2 && file.isCustomPath" :style="{ 'width': itemWidth + 'px' }"
								src="@/static/folder/icon_custom.png">

							<!-- 视频和图片显示缩略图 -->
							<img @dragstart.prevent class="item-img"
								v-if="file.type == 1 && (file.fileType == 'image' || file.fileType == 'video')"
								v-lazy="file.url" />
							<span v-if="file.type == 1 && file.fileType == 'video'"
								class="play-icon nasIcons icon-play"></span>

							<img @dragstart.prevent class="item-img" v-if="file.type == 1 && file.fileType == 'text'"
								src="@/static/icon-folder-text.png" />
							<img @dragstart.prevent class="item-img" v-if="file.type == 1 && file.fileType == 'file'"
								src="@/static/icon-folder-file.png" />
						</div>


						<!-- 文件名称 -->
						<p class="filename" :style="{ 'width': itemWidth + 'px' }">{{
							file.isCustomPath && file.remark ? `[${file.remark}] ${file.name}` : file.name }}</p>
						<div class="mask-root" v-if="!selectMode && selectedIndex != index">
							<!-- hover层 -->
							<div class="hover-mask" v-if="!selectMode && file.hover">
								<!-- 勾选框 -->
								<span @click.stop="selectFileItem(file, index)"
									class="select-icon-hover nasIcons icon-radio-unchecked"></span>
							</div>
							<!-- 选择层 -->
							<div class="select-mask" v-if="!selectMode && file.selected">
								<!-- 已选 -->
								<span @click.stop="selectFileItem(file, index)"
									class="select-icon-hover nasIcons icon-radio-checked"></span>
							</div>
						</div>
					</div>
				</div>

				<div @click="$refs.addLocalPathDialog.setShow(true)"
					v-if="isRoot && $store.state.currentUser.is_admin == 1 && source == 'list'"
					:class="{ 'list-item-root-list': showType == 'list' }" :style="{ 'padding': itemMargin / 2 + 'px' }">
					<div :class="{ 'list-item-list': showType == 'list', 'list-item-grid': showType == 'grid' }">
						<div style="cursor: pointer; display: flex;justify-content: center;align-items: center;"
							:style="{ 'width': itemWidth + 'px', 'height': itemWidth + 'px', 'margin': itemMargin / 2 + 'px' }">
							<img :style="{ 'width': itemWidth + 'px' }" src="@/static/folder/icon_custom_add.png">
						</div>
						<!-- 文件名称 -->
						<p class="filename" :style="{ 'width': itemWidth + 'px' }">{{ $t('common.add') }}</p>
					</div>
				</div>
				<!-- 最大显示数量提示 -->
				<div v-if="fileTree.length >= 1000" class="max-count">{{ $t("file.maxShowCountAlert") }}</div>
			</div>
		</div>
		<!-- 手动新增本地路径 -->
		<my-dialog-input v-if="isRoot && $store.state.currentUser.is_admin == 1"
			@onOkClick="(inputPath, pathName) => operationLocalPath('add', inputPath, null, pathName)" :showCloseBtn="true"
			ref="addLocalPathDialog" :title="$t('file.addLocalPath')" :content="$t('file.addLocalPathAlert')"
			:placeholder="$t('file.inputPath')" :contentB="$t('common.name')">
		</my-dialog-input>

		<!-- 底部多选操作条 -->
		<div class="bottom-select-root" v-if="doingSelect">
			<div style="display:flex;align-items: center;">
				<Checkbox @on-change="onSelectAll" v-model="checkAll"></Checkbox>
				<div style="color:white">{{ $t('common.selectAll') }}</div>
				<div @click="cancelMultipleSelect" style="color:white;margin-left: 10px;">{{ $t('common.cancel') }}</div>

			</div>
			<div style="display:flex;align-items: center;">
				<div @click="copyCutSelectedList('copy')"><my-btn type="whtie" :title="$t('file.copy')"></my-btn></div>
				<div @click="copyCutSelectedList('cut')"><my-btn :title="$t('file.cut')"></my-btn></div>
				<div @click="deleteSelectedList"><my-btn type="red" :title="$t('common.delete')"></my-btn></div>
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
		<easy-cm :arrow="true" :tag="parent" @ecmcb="rightMenuClick" :list="rightMenuList"></easy-cm>
		<!-- 显示文件属性的对话框 -->
		<vs-dialog v-model="attrDialogIsShow">
			<template #header>
				<div style="display: flex;align-items: center;margin-top: 20px;">
					<img style="width: 22px;height: 22px;margin-right: 10px;" src="@/static/common/icon-dialog-alert.png" />
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
				<div class="item-attr">{{ $t('movie.createTime') }}:<span>{{ utils.formatTimeStamp(selectedFileAttr.ctime)
				}}</span></div>
				<div class="item-attr">{{ $t('file.modifyTime') }}:<span>{{ utils.formatTimeStamp(selectedFileAttr.mtime)
				}}</span></div>
				<div v-if="selectedFileAttr.sizeStr" class="item-attr">
					{{ $t('file.size') }}:<span>{{ selectedFileAttr.sizeStr }}</span></div>
			</div>
		</vs-dialog>



		<!-- 手机端长按条目的时候弹出的菜单 -->
		<vs-dialog v-model="showLongPressMenu">
			<h3 v-if="selectedFile" class="max-line-one" style="word-break:break-all;margin-top: 10px;">{{ selectedFile.name
			}}</h3>
			<my-selector-phone :optionList="rightMenuList"
				@onItemClick="(item) => (rightMenuClick(null, item.type))"></my-selector-phone>
		</vs-dialog>
		<!-- 新建文件夹 -->
		<my-dialog-input @onOkClick="createNewFolder" :showCloseBtn="true" ref="newFolderDialog"
			:title="$t('file.newFolder')" :content="$t('file.inputNewFolderName')">
		</my-dialog-input>

		<!-- 重命名对话框 -->
		<my-dialog-input @onOkClick="onRenameInput" :placeholder="$t('file.inputNewFileName')" :showCloseBtn="true"
			ref="renameDialog" :initValue="selectedFile ? selectedFile.name : ''"
			:content="selectedFile ? selectedFile.name : ''" :title="$t('common.rename')">
		</my-dialog-input>

		<!-- 弹出的新窗口 -->
		<Modal width="80" v-for="(window, index) in newWindowList" :mask-closable="false" v-model="window.show" draggable
			scrollable :mask="false" :title="$t('home.fileBrower')" footer-hide>
			<my-folder-brower v-if="window.show" :initPath="window.initPath" :showInWindow="true"></my-folder-brower>
		</Modal>

		<!-- 压缩 解压选择目的地 -->
		<vs-dialog v-model="showChooseTargetFolder" prevent-close scroll :full-screen="isMobile">
			<template #header>
				<h4 v-if="currentOperationType == 'ZIP'" style="font-size: 16px;">
					{{ $t("backup.chooseTargetPath") + " " + $t("file.zip") + ":" + selectedFile.name }}
				</h4>
				<h4 v-if="currentOperationType == 'UNZIP'" style="font-size: 16px;">
					{{ $t("backup.chooseTargetPath") + " " + $t("file.unzip") + ":" + selectedFile.name }}
				</h4>
			</template>
			<file-select ref="fileSelector" v-if="showChooseTargetFolder" parent="root" :type="2"
				@onSelect='onSelectTargetFolder' @onCancel="showChooseTargetFolder = false"></file-select>
			<template #footer>
				<file-select-bar @back="$refs.fileSelector.goBack()" @select="$refs.fileSelector.onSelect()"
					@create="(newFolderName) => $refs.fileSelector.createNewFolder(newFolderName)"></file-select-bar>
			</template>
		</vs-dialog>
	</div>
</template>

<script>

import typeData from "@/components/folder-brower/type-data.js"
import axios from "@/plugins/axios";
import base64 from '@/plugins/base64/index.js'
import videoDetail from "@/views/videoDetail/videoDetail.vue";
import jsBridge from "@/plugins/jsBridge"
import utils from "@/plugins/utils";

//照片点击详情
import photoDetail from "@/views/photos/components/photoDetail.vue";
//视频点击详情
export default {
	name: "MyFolderBrower",
	components: {
		videoDetail,
		photoDetail,
	},
	computed: {},
	props: {
		showInWindow: {
			default: false,
			type: Boolean
		},
		//sourceFolderPhoto或sourceFolderMovie为选择来源文件夹 用户给子用户授权来源文件夹子目录的时候使用
		initPath: {
			default: '',
			type: String
		},
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
			showAddLocalPath: false,//新增本地路径的对话框是否显示
			supportUnzipFormat: ['.tar', '.gzip', '.tgz', '.zip'],//支持的解压缩格式
			currentOperationType: "",//当前正在进行的文件操作类型
			showChooseTargetFolder: false,//选择目的地文件夹的dialog是否显示 现在用于zip和unzip
			showType: "grid",//展示方式 grid为图片 list为竖向列表
			checkAll: false,//多选模式下 是否全选的标记
			selectedFileList: [],//多选的列表
			doingSelect: false,//是否正在多选
			newWindowList: [],//新窗口列表
			showLongPressMenu: false,
			showPhotoDetail: false,
			attrDialogIsShow: false,//属性对话框是否显示
			rightMenuList: [],
			itemBaseWidth: 100,
			itemWidth: 100,
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
			parent: this.initPath,
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
		//当接收到这个事件 证明要上传到当前文件夹 这时候应该呼出上传组件 
		//如果是手机端 应该调用手机上传页面并且传入路径
		if (!this.showInWindow) {
			this.$bus.$on("onUploadToCurrentPath", () => {
				console.log("onUploadToCurrentPath")
				this.switchUpload(true, this.parent)
			})
		}

		window.addEventListener("scroll", this.onPageScroll, true);
		//监听后退事件
		window.addEventListener('popstate', this.onPopstate)
		if (localStorage.folderBrowerShowType) {
			this.showType = localStorage.folderBrowerShowType
		}
	},
	beforeDestroy() {
		console.log("beforeDestroy")
		if (!this.showInWindow) {
			this.$bus.$off("onUploadToCurrentPath")
		}
		window.removeEventListener("scroll", this.onPageScroll, true);
		window.removeEventListener('popstate', this.onPopstate);

	},
	methods: {
		operationLocalPath(operationType, localPath, pathId, pathName) {
			this.api.post('/api/file/operationPathMount',
				{
					url: localPath,
					type: 'local',
					id: pathId,
					pathName: pathName,
					operationType: operationType
				}).then((res) => {
					if (!res.code) {
						//操作已完成
						if (operationType == 'get') {
							console.log(res.data)
							if (res.data) {
								//把自定义的路径添加到现有列表
								for (let i in res.data) {
									this.fileTree.push({
										parent: "",
										pathSep: this.pathSep,
										name: res.data[i].url,
										fileFullPath: res.data[i].url,
										type: 2,
										isCustomPath: true,
										customPathId: res.data[i].id,
										remark: res.data[i].remark
									})
								}
							}
						} else {
							this.showVsAlertDialog(this.$t('common.alert'), this.$t('common.operationSuccess'))
							this.getFileTree(this.parent)
						}
					}
				})
		},
		//压缩 解压选择目的地文件夹后回调
		onSelectTargetFolder(targetFolder) {
			if (this.currentOperationType == 'ZIP' || this.currentOperationType == 'UNZIP') {
				this.zipApi(targetFolder)
			}
			this.showChooseTargetFolder = false
		},
		onSelectAll(isSelectAll) {
			if (isSelectAll) {
				for (let i in this.fileTree) {
					this.fileTree[i].selected = true
					this.selectedFileList.push(this.fileTree[i])
				}
			} else {
				this.cancelMultipleSelect()
			}
		},
		//取消多选
		cancelMultipleSelect() {
			this.doingSelect = false
			this.checkAll = false
			for (let i in this.selectedFileList) {
				this.selectedFileList[i].selected = false
			}
			this.selectedFileList = []
		},
		// 根据已选文件列表数量 定义是否正在进行多选 doingSelect
		setIsDoingSelect() {
			this.doingSelect = this.selectedFileList.length > 0
			if (this.doingSelect) {
				this.selectedIndex = -1
			}
		},
		//勾选框的点击事件 
		selectFileItem(file, index) {
			if (this.fileTree[index].selected) {
				this.$set(this.fileTree[index], "selected", false);
				for (let i in this.selectedFileList) {
					if (this.selectedFileList[i].fileFullPath == file.fileFullPath) {
						this.selectedFileList.splice(i, 1)
						break
					}
				}
			} else {
				this.$set(this.fileTree[index], "selected", true)
				this.selectedFileList.push(this.fileTree[index])
			}
			this.setIsDoingSelect()
		},
		//目录点击事件
		clickTree(e, data, index) {
			if (this.doingSelect) {
				this.selectFileItem(data, index)
			} else {
				if (this.selectedIndex == index) {
					//双击
					this.onDoubleClick(data, index)
				}
				this.selectedIndex = index
				this.selectedFile = data
			}
		},
		mouseEnterImg(index) {
			if (this.isMobile || this.isRoot) return
			this.$set(this.fileTree[index], "hover", true);
		},
		mouseLeaveImg(index) {
			if (this.isMobile || this.isRoot) return
			this.fileTree[index].hover = false;
		},
		onPopstate() {
			//后退按钮被点击 如果当前正在播放视频 则关闭视频 如果每播放 则后退
			if (this.showPhotoDetail || this.showVideoDetail) {
				this.showPhotoDetail = false
				this.showVideoDetail = false
			} else if (!this.isRoot) {
				//非root 路径后退
				this.goBack()
			} else {
				this.$router.go(-1)
			}
		},
		onPageScroll() {
			//滚动的时候清空计时器 防止触发菜单
			if (this.longPressTimeout) {
				clearTimeout(this.longPressTimeout);
				this.longPressTimeout = null
			}
		},
		onRenameInput(newName) {
			// 重命名输入后
			this.api.post('/api/file/operationFolder',
				{
					sourcePath: this.getDealedPath(this.selectedFile.fileFullPath),
					targetPath: this.getDealedPath(this.selectedFile.parent),
					newName: newName,
					type: 'rename'
				}).then((res) => {
					if (!res.code) {
						if (res.isOver && res.isOver == 1) {
							//操作已完成
							this.showVsAlertDialog(this.$t('common.alert'), this.$t('common.operationSuccess'))
						} else {
							//操作未完成
							this.showVsAlertDialog(this.$t('common.alert'), this.$t('common.checkAfter'))
						}
						this.getFileTree(this.parent)
					}
				})
		},
		refresh() {
			//刷新当前列表
			this.getFileTree(this.parent)
		},
		getDealedPath(path) {
			//处理路径
			let ppath = encodeURIComponent(path)
			ppath = base64.encode(ppath)
			return ppath
		},
		zipApi(targetFolder) {//调用压缩文件接口
			this.api
				.post("/api/file/zipFile", {
					sourcePath: this.selectedFile.fileFullPath,
					targetPath: targetFolder,
					type: this.currentOperationType.toLowerCase()
				}).then((res) => {
					if (!res.code) {
						this.showVsAlertDialog(this.$t('common.alert'), this.$t('common.checkAfter'))
					}
				})
		},
		copy() {
			if (!localStorage.copyPath || !localStorage.operationType) {
				//没选中目录不能复制
				return this.showVsAlertDialog(this.$t('common.alert'), this.$t('file.noSelectAnything'))
			}
			let copyPathList = JSON.parse(localStorage.copyPath)
			let operationType = localStorage.operationType
			if (this.isRoot || !this.parent) {
				//不能复制到根目录
				return this.showVsAlertDialog(this.$t('common.alert'), this.$t('file.canNotCopyToHere'))
			}
			//复制剪切板中的内容
			let alertPathTitle = copyPathList.length < 10 ? copyPathList : this.$t("file.fileCount", { count: copyPathList.length })
			let alertTile = operationType == 'cut' ? this.$t("file.cutToHere", { path: alertPathTitle }) : this.$t("file.copyToHere", { path: alertPathTitle })
			this.showVsConfirmDialog(this.$t('common.confirm'), alertTile, () => {
				if (copyPathList.length <= 1) {
					this.api.post('/api/file/operationFolder',
						{
							sourcePath: this.getDealedPath(copyPathList),
							targetPath: this.getDealedPath(this.parent),
							type: operationType
						}).then((res) => {
							if (!res.code) {
								localStorage.removeItem("copyPath")
								this.showVsAlertDialog(this.$t('common.alert'), this.$t('common.checkAfter'))
								this.getFileTree(this.parent)
								this.$bus.$emit("onShowPaste", false);
							}
						})
				} else {
					this.api.post('/api/file/operationFileList',
						{
							sourcePathList: copyPathList,
							targetPath: this.parent,
							type: operationType
						}).then((res) => {
							if (!res.code) {
								localStorage.removeItem("copyPath")
								this.showVsAlertDialog(this.$t('common.alert'), this.$t('common.checkAfter'))
								this.getFileTree(this.parent)
								this.$bus.$emit("onShowPaste", false);
							}
						})
				}
			})
		},
		scrollToTop() {
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
			this.initRightMenuList(this.selectedFile)
			this.showLongPressMenu = true
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

		deleteFileApi(deletePath, onSuc, onErr) {//获取文件属性
			this.api
				.post("/api/file/deleteByPath", {
					fullPath: deletePath
				}).then((res) => {
					if (!res.code) {
						if (onSuc) onSuc()
					} else {
						if (onErr) onErr()
					}
				}).catch(err => {
					if (onErr) onErr()
				})
		},
		showRightMenu(event, root, file, index) {
			if (this.doingSelect) {
				//当前正在多选模式 只显示一个取消多选的菜单
				this.rightMenuList = [{
					text: this.$t('file.cancelMutipleSelect'),
					type: "CANCEL_SELECT",
				}]
			} else {
				if (this.isMobile) return event.preventDefault()
				this.selectedIndex = index
				this.selectedFile = file
				this.initRightMenuList(this.selectedFile)
			}
			this.$easycm(event, root, this.parent)

		},
		showRightMenuBg(event, root) {
			if (this.isMobile || this.doingSelect) return event.preventDefault()
			this.initRightMenuListBg()
			this.$easycm(event, root, this.parent)
		},
		initRightMenuListBg() {//右键点击背景时候的菜单
			this.rightMenuList = [{
				text: this.$t('file.newFolder'),
				type: "CREATE_NEW_FOLDER",
			}, {
				text: this.$t('common.refresh'),
				type: "REFRESH",
			}]
			if (localStorage.copyPath) {
				this.rightMenuList.push({
					text: this.$t('file.paste'),
					type: "PASTE",
				})
			}
			this.rightMenuList.push({//排列方式
				text: this.$t('file.showType'),
				type: "SHOW_TYPE",
				children: [
					{
						text: this.$t('movie.gridView'),
						type: "SHOW_TYPE_GRID",
					}, {
						text: this.$t('movie.listView'),
						type: "SHOW_TYPE_LIST",
					}
				]
			})
		},
		initRightMenuList(file) {
			this.rightMenuList = []
			if (file.type == 2 && !this.selectMode && !this.isMobile) {
				this.rightMenuList.push({
					text: this.$t('file.openInNewWindow'),
					type: "OPEN_NEW_WINDOW",
				})
			} else {
				this.rightMenuList.push({
					text: this.$t('file.check'),
					type: "CHECK",
				})
			}
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
				// 多选
				this.rightMenuList.push({
					text: this.$t('common.multiSelect'),
					type: "MULTIPLE_SELECT",
				})
				// 剪切
				this.rightMenuList.push({
					text: this.$t('file.cut'),
					type: "CUT",
				})
				// 复制
				this.rightMenuList.push({
					text: this.$t('file.copy'),
					type: "COPY",
				})
				this.rightMenuList.push({
					text: this.$t('common.delete'),
					type: "DELETE",
				})
				// 重命名
				this.rightMenuList.push({
					text: this.$t('common.rename'),
					type: "RENAME",
				})

				// 解压缩
				let isZipFile = false
				for (let i in this.supportUnzipFormat) {
					if (this.selectedFile.name.endsWith(this.supportUnzipFormat[i])) {
						isZipFile = true
						break
					}
				}
				if (isZipFile) {
					this.rightMenuList.push({
						text: this.$t('file.unzip'),
						type: "UNZIP",
					})
				} else {
					// 压缩
					this.rightMenuList.push({
						text: this.$t('file.zip'),
						type: "ZIP",
					})
				}
			}
			// 文件的话加一个下载
			if (file.type == 1) {
				this.rightMenuList.push({
					text: this.$t('common.download'),
					type: "DOWNLOAD",
				})
			}
			// 属性
			this.rightMenuList.push({
				text: this.$t('file.attr'),
				type: "ATTR",
			})

			this.rightMenuList.push({//排列方式
				text: this.$t('file.showType'),
				type: "SHOW_TYPE",
				children: [
					{
						text: this.$t('movie.gridView'),
						type: "SHOW_TYPE_GRID",
					}, {
						text: this.$t('movie.listView'),
						type: "SHOW_TYPE_LIST",
					}
				]
			})
			//自定义路径 添加一个删除
			if (file.isCustomPath) {
				this.rightMenuList.push({
					text: this.$t('file.deletePath'),
					type: "DELETE_CUSTOM_PATH",
				})
			}
		},
		//递归调用删除接口进行删除
		deleteBySelectedIndexOnByOne(dealingIndex, sucCount, errCount) {
			if ((sucCount + errCount) >= this.selectedFileList.length) {
				//全部调用完成了
				this.showVsNotification(this.$t('common.deleteSuccessWithCount', { sucCount: sucCount, errCount: errCount }))
				this.getFileTree(this.parent)
				return
			}
			this.deleteFileApi(this.selectedFileList[dealingIndex].fileFullPath, () => {
				this.deleteBySelectedIndexOnByOne(dealingIndex + 1, sucCount + 1, errCount)
			}, () => {
				this.deleteBySelectedIndexOnByOne(dealingIndex + 1, sucCount, errCount + 1)
			})
		},
		//删除已选
		deleteSelectedList() {
			if (this.selectedFileList.length < 1) return
			this.showVsConfirmDialog(this.$t('common.alert'), this.$t('file.fileDeleteSure'), () => {
				this.deleteBySelectedIndexOnByOne(0, 0, 0)
			}, null, this.$t('common.delete'), this.$t('common.cancel'), 300, true)

		},
		//复制或者剪切已选列表
		copyCutSelectedList(operationType) {
			if (this.selectedFileList.length < 1) return
			let pathList = []
			for (let i in this.selectedFileList) {
				let operationFullPath = this.getFileFullPath(this.selectedFileList[i])
				pathList.push(operationFullPath)
			}
			localStorage.setItem("copyPath", JSON.stringify(pathList))
			localStorage.setItem("operationType", operationType)
			this.showVsNotification(operationType == 'cut' ? this.$t('file.cutted', { count: pathList.length }) : this.$t('file.copied', { count: pathList.length }))
			this.$bus.$emit("onShowPaste", true);
			this.cancelMultipleSelect()
		},
		//右键菜单点击
		rightMenuClick(indexList, clickType) {
			this.showLongPressMenu = false

			let type = clickType ? clickType : this.rightMenuList[indexList[0]].type
			if (indexList && indexList.length == 2) {
				type = clickType ? clickType : this.rightMenuList[indexList[0]].children[[indexList[1]]].type
			}
			this.currentOperationType = type
			if (type == "CREATE_NEW_FOLDER") {
				this.$refs.newFolderDialog.setShow(true)
			} else if (type == "PASTE") {
				this.copy()
			} else if (type == "REFRESH") {
				this.refresh()
			} else if (type == "OPEN_NEW_WINDOW") {
				this.newWindowList.push({
					show: true,
					initPath: this.getFileFullPath(this.selectedFile)
				})
			} else if (type == 'CHECK') { //查看
				this.onDoubleClick(this.selectedFile, this.selectedIndex)
			} else if (type == 'COLLECT') { //收藏
				this.addFileRecord('collect', this.selectedFile)
			} else if (type == 'CUT') { //剪切
				this.selectedFileList.push(this.selectedFile)
				this.copyCutSelectedList('cut')
			} else if (type == 'COPY') { //复制
				this.selectedFileList.push(this.selectedFile)
				this.copyCutSelectedList('copy')
			} else if (type == 'RENAME') { //重命名
				localStorage.setItem("operationType", "rename")
				this.$refs.renameDialog.setShow(true)
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
					this.deleteFileApi(this.selectedFile.fileFullPath, () => {
						this.showVsNotification(this.$t('common.deleteSuccess'))
						this.getFileTree(this.parent)
					})
				}, null, this.$t('common.delete'), this.$t('common.cancel'), 300, true)
			} else if (type == "DOWNLOAD") {
				//下载this.selectedFile
				this.downloadFile(this.getRawUrl(this.selectedIndex))
			} else if (type == "CANCEL_SELECT") {
				this.cancelMultipleSelect()
			} else if (type == "MULTIPLE_SELECT") {
				this.selectFileItem(this.selectedFile, this.selectedIndex)
			} else if (type == "SHOW_TYPE_GRID") {
				this.showType = 'grid'
			} else if (type == "SHOW_TYPE_LIST") {
				this.showType = 'list'
			} else if (type == "SHOW_TYPE") {
				this.showType = this.showType == 'list' ? 'grid' : 'list'
			} else if (type == "ZIP") {
				//压缩
				this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('file.zipAlert'), () => {
					this.showChooseTargetFolder = true
				})
			} else if (type == "UNZIP") {
				//压缩
				this.showChooseTargetFolder = true
			} else if (type == "DELETE_CUSTOM_PATH") {
				//删除自定义路径
				this.operationLocalPath('delete', null, this.selectedFile.customPathId)
			}
			localStorage.setItem("folderBrowerShowType", this.showType)
		},
		downloadFile(url) {
			let fullUrl = window.location.protocol + "//" + window.location.host + url
			if (this.isFromApp) {
				jsBridge.openInBrowser(fullUrl)
			} else {
				window.open(url, "_blank")
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
		parentPathClick(pathSep, index) {
			let enterPath = ''
			for (let i = 0; i <= index; i++) {
				enterPath += this.parentPathList[i]
			}
			if (enterPath.length > 3 && enterPath.endsWith(this.pathSep)) {
				enterPath = enterPath.substring(0, enterPath.lastIndexOf(this.pathSep))
			}
			this.getFileTree(enterPath)

		},
		parseParentPath() {
			this.parentPathList = []
			let pathArr = this.parent.split(this.pathSep)
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
			this.parent = this.initPath
			this.fileTree = []

			if (this.source == 'list') {
				this.getFileTree(this.parent)
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
		onSearch(searchStr) {
			if (!this.isRoot) {
				this.getFileTree(this.parent, false, searchStr)
			}
		},
		//双击触发
		onDoubleClick(data, index) {
			if (data.type == 2) {
				this.enterPath(data)
			} else if (data.type == 1) {
				if (this.selectMode) {
					//选择模式
					this.$emit('onSelect', this.getFileFullPath(data))
				} else {
					this.addFileRecord('recent', data)
					if (data.fileType == "image") {
						this.goPreviewImage(index)
					} else if (data.fileType == 'video') {
						this.goPreviewVideo(index)
					} else {
						this.downloadFile(this.getRawUrl(index, this.fileTree[index].name))
					}
				}
			}
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
            if (this.parent == "sourceFolderPhoto" || this.parent == "sourceFolderMovie") {
				return fileObj.fileFullPath
			}
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
			//选择来源文件夹状态 直接返回到根目录
			if(this.initPath=="sourceFolderPhoto"||this.initPath=="sourceFolderMovie"){
				return this.getFileTree(this.initPath, true)
			}
			//点击了返回上一级
			let lastSepIndex = this.parent.lastIndexOf(this.pathSep) > 0 ? this.parent.lastIndexOf(this.pathSep) :
				1
			let lastPath = this.parent.substring(0, lastSepIndex)
			if (this.platform == "win32" && lastPath.length == 2 && lastPath[1] == ':') {
				//处理特殊情况 就是返回的上一级是个盘符如 D: 需要后面拼接一下分隔符
				lastPath += this.pathSep
			}
			if (this.platform == "win32" && this.parent.length <= 4 && this.parent[1] == ':') {
				//处理特殊情况 当前处于某个盘的根目录 D:\ 返回上级的话要返回根目录
				lastPath = ''
			}
			this.getFileTree(lastPath, true)
		},
		enterPath(fileObj) {
			// 进入文件夹
			let enterFullPath = this.getFileFullPath(fileObj)
			console.log("enterFullPath", enterFullPath)
			this.getFileTree(enterFullPath)
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
			this.pushState()
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
				filePath = this.getDealedPath(filePath)
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
			if (localStorage.getItem("rawPlayer") == "1") {
				//调用原生播放器
				jsBridge.playVideo(JSON.stringify({
					playIndex: showIndex,
					playList: useList,
					token: this.$store.state.token,
					fromFileBrower:true,
					serverType:"photo"
				}))
			} else {
				//继续使用网页播放器
				this.showVideoDetail = true;
				this.$nextTick(() => {
					this.$refs.videoPlayer.playVideo(useList, showIndex);
				});
				this.pushState()
			}
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

					}
				})
		},
		//创建新文件夹 
		createNewFolder(folderName) {
			if (!this.parent) {
				return this.showVsNotification('无法在当前位置创建')
			}
			let ppath = this.getDealedPath(this.parent)
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
				case 2:
					return "video"
				case 3:
					return "text"
				default:
					return "file"
			}
		},
		getFileTree(parentPath, isGoBack, searchStr) {

			let params = {
				parent: parentPath,
				type: this.fileType
			}
			if (searchStr) {
				params.searchStr = searchStr
			}
			this.api
				.post("/api/file/getPathTree", params).then((res) => {
					this.selectedIndex = null
					this.selectedFile = null
					this.cancelMultipleSelect()
					if (!res.code) {
						if (parentPath == "" || parentPath == "/" || parentPath == this.pathSep) {
							this.isRoot = true
						} else {
							this.isRoot = false
							if (!isGoBack) {
								//非后退的情况下 pushstate
								this.pushState()
							}
						}
						this.parent = res.data.parent
						this.pathSep = res.data.sep
						this.platform = res.data.platform
						this.parseParentPath()

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
						this.fileTree = children
						this.$emit('onParentChange', this.parent, this.isRoot)

						if (this.isRoot) {
							//获取用户自定义路径
							console.log("获取用户自定义路径")
							this.operationLocalPath('get', null)
						}
						this.$nextTick(() => {
							this.calImageWidth()
						})
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
@import './folder-brower.scss'
</style>
