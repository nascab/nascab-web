<template>
	<div class="brower-root">
		<my-bg></my-bg>
		<div class="main-layout temp-share-padding">
			<!-- 左上角logo -->
			<img style="position: fixed;left: 30px;top: 15px;height: 30px;object-fit: contain;"
				src="@/static/common/naslogo.png" mode="widthFix" />

			<div class="content-root">
				<!-- 返回上一级 -->
				<div style="display:flex;align-items: center;margin-bottom:20px">
					<my-btn-icon :disabled="isRoot" iIcon="md-arrow-round-back" @click="goBack()"></my-btn-icon>
					<p style="margin-left:10px">{{ $t("file.returnLastPath") }}</p>
				</div>
				<div class="list-root">
					<!-- 共享文件内容 -->
					<div :id="'file_' + index" v-for="(file, index) in fileTree">
						<div class="list-item-list" @click="(e) => { onItemClick(file, index) }">
							<div
								style="display: flex;justify-content: center;align-items: center;width:90px;height:90px;margin:5px">
								<img v-if="file.type == 2" style="width:90px" src="@/static/folder/icon_folder.png">
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
								<img @dragstart.prevent class="item-img" v-if="file.type == 1 && file.fileType == 'pdf'"
									src="@/static/icon-folder-pdf.png" />
							</div>
							<!-- 文件名称 -->
							<p class="filename" style="width:90px">{{ file.name ? file.name : file.fileFullPath }}</p>
						</div>
					</div>
				</div>
			</div>
			<!-- 无数据提示 -->
			<my-nodata v-if="fileTree.length < 1" :title="$t('file.withoutSharedFile')"
				style="position: absolute;width: 100%;margin-top: 150px;">
			</my-nodata>
		</div>

		<!-- 密码输入对话框 -->
		<my-dialog-input @onOkClick="pwd => getFileTree('', pwd)" :showCloseBtn="true" ref="pwdDialog"
			:title="$t('file.accessPwd')" :content="''">
		</my-dialog-input>


		<!-- 照片详情弹窗 -->
		<Modal v-model="showPhotoDetail" fullscreen footer-hide style="background-color: transparent;">
			<photo-detail v-if="showPhotoDetail" @onClose="showPhotoDetail = false" :fromFolderBrower="true"
				ref="photoDetail"></photo-detail>
		</Modal>



	</div>
</template>

<script>
import typeData from "@/components/folder-brower/type-data.js"
import axios from "@/plugins/axios";
import base64 from '@/plugins/base64/index.js' // 导入vue-i18n
import photoDetail from "@/views/photos/components/photoDetail.vue";

export default {
	components: {
		photoDetail
	},
	data() {
		return {
			showPhotoDetail: false,
			isRoot: true,
			parent: "",
			shareToken: "",
			fileTree: [],
			pathSep: "/",
			platform: "",
			password: "",
			selectedFile: null,
			typeData: typeData
		}
	},
	mounted() {
		let query = this.$route.query;
		this.shareToken = query.shareToken
		this.getFileTree("")

		//禁止后退
		history.pushState(null, null, document.URL);
		window.addEventListener('popstate', function () {
			history.pushState(null, null, document.URL);
		});

	},
	beforeDestroy() {

	},
	methods: {
		goPreviewPdf(fileUrl){
			let pdfUrl=axios.getPdfUrl(fileUrl)
			if(this.isMobile){
				window.location.href=pdfUrl
			}else{
				window.open(pdfUrl, "_blank")
			}
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

		getRawUrl(index) {
			//分享文件
			let durl = axios.getRawFileUrl(this.fileTree[index].fileFullPath, this.fileTree[index].name, "", true) + "&shareToken=" + this.shareToken + "&sharePwd=" + base64.encode(this.password)
			return durl
		},
		getDealedPath(path) {
			//处理路径
			let ppath = encodeURIComponent(path)
			ppath = base64.encode(ppath)
			return ppath
		},


		goBack() {
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
			this.getFileTree(lastPath)
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
				case 4:
					return "pdf"
				default:
					return "file"
			}
		},
		onItemClick(fileObj, index) {
			this.selectedFile = fileObj
			if (fileObj.type == 2) {
				this.enterPath(fileObj)
			} else {
				if (fileObj.fileType == "image") {
					this.goPreviewImage(index)
				} else if (fileObj.fileType == 'pdf') {
					this.goPreviewPdf(this.getRawUrl(index, this.fileTree[index].name))
				} else {
					window.open(this.getRawUrl(index, this.fileTree[index].name), "_blank")
				}
			}
		},
		enterPath(fileObj) {
			// 进入文件夹
			this.getFileTree(fileObj.fileFullPath)
		},

		getFileTree(parentPath, inputPwd) {
			console.log("parentPath", parentPath)
			if (inputPwd) {
				this.password = inputPwd
			}
			this.api.post('/api/file/getTempShareFiles',
				{
					parent: parentPath,
					shareToken: this.shareToken,
					password: this.password
				}).then((res) => {
					if (!res.code) {
						this.parent = res.data.parent
						this.isRoot = this.parent == ""
						this.platform = res.data.platform
						this.pathSep = res.data.sep
						this.fileTree = res.data.children
						for (let i in this.fileTree) {
							if (this.fileTree[i].type == 1) {
								let fname = this.fileTree[i].name
								let lastIndex = fname.lastIndexOf('.')
								if (lastIndex >= 0) {
									let ext = fname.substring(lastIndex).toLowerCase()
									this.fileTree[i].ext = ext
									this.fileTree[i].fileType = this.getFileType(ext)
									console.log(this.fileTree[i].fileType)
								} else {
									//没有后缀名 归类为普通文件
									this.fileTree[i].fileType = "file"
								}
								this.fileTree[i].url = axios.getTinyUrlByFilePath(this.fileTree[i].fileFullPath, true,this.fileTree[i].name) + "&shareToken=" + this.shareToken + "&sharePwd=" + base64.encode(this.password)
								console.log(this.fileTree)
							}
						}
						this.$refs.pwdDialog.setShow(false)
					}
				}).catch(err => {
					if (err.code == 2) {
						this.$refs.pwdDialog.setShow(true)
						if (err.message) {
							this.showVsNotification(err.message)
						}
					}
				})
		}
	}
}
</script>

<style scoped lang="scss">
.temp-share-padding {
	@media all and (max-width:640px) {
		padding-left: 10px;
		padding-right: 10px;
		padding-top: 60px
	}



	@media not all and (max-width:640px) {
		padding-left: 30px;
		padding-right: 30px;
		padding-top: 60px
	}
}

.brower-root {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
}

.list-root {
	padding-bottom: 100px;
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
	align-content: flex-start;
	position: relative;
	overflow-y: auto;

	@media all and (max-width:640px) {
		-webkit-overflow-scrolling: touch;
	}
}

.item-img {
	pointer-events: none;
	border-radius:6px;
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.content-root {
	position: relative;
	width: 100%;
	height: 100%;
	padding-top: 20px;
	border-top-left-radius: 20px;
	border-top-right-radius: 20px;
	padding-left: 20px;
	padding-right: 20px;

	background-color: rgba(255, 255, 255, 0.6);

}

.main-layout {
	position: relative;
	display: flex;
	flex-direction: row;
	width: 100%;
	height: 100%;
	overflow: hidden;
}


.list-item-list {
	position: relative;
	display: flex;
	justify-content: flex-start;
	width: 100%;
	align-items: center;

	.play-icon {
		color: white;
		font-size: 30px;
		position: absolute;
		pointer-events: none;
	}

	.filename {
		margin-left: 10px;
		flex: 1;
		text-align: left;
		color: $nas-text-title;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		word-break: break-all;
	}
}
</style>
