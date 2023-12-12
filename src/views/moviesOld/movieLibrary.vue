<template>
	<div class="list-root">

		<!-- 无数据提示 -->
		<my-nodata v-if="!loading && dataList.length < 1" @onBtnClick="showAdd" :title="$t('movie.addLibraryAlert')"
			:btnTitle="$store.state.currentUser.is_admin == 1?$t('movie.addLibrary'):null" style="position: absolute;width: 100%;margin-top: 150px;">
		</my-nodata>

		<div :style="{ 'height': '100%' }" style="display:flex;flex-direction:row;overflow: hidden;">
			<!-- 列表 -->
			<div class="album-list-root" ref="wrapper">
				<vs-card v-for="(library, index) in dataList" type='1' @click="onLibraryClick(index)"
					:style="{ 'margin': itemMargin + 'px', 'width': itemWidth + 'px' }">
					<template #title>
						<h3 class="max-line-one" style="text-align: left;">{{ library.title }}</h3>
					</template>

					<template #img>
						<div class="img-inner-wrapper" v-if="library.dataPreview.length > 3"
							:style="{ width: itemWidth + 'px', height: itemWidth + 'px' }">
							<img class="img-inner-four" :src="library.dataPreview[0].url"
								:style="{ width: itemWidth / 2 + 'px', height: itemWidth / 2 + 'px' }" />
							<img class="img-inner-four" :src="library.dataPreview[1].url"
								:style="{ width: itemWidth / 2 + 'px', height: itemWidth / 2 + 'px' }" />
							<img class="img-inner-four" :src="library.dataPreview[2].url"
								:style="{ width: itemWidth / 2 + 'px', height: itemWidth / 2 + 'px' }" />
							<img class="img-inner-four" :src="library.dataPreview[3].url"
								:style="{ width: itemWidth / 2 + 'px', height: itemWidth / 2 + 'px' }" />
						</div>

						<img v-else-if="library.dataPreview.length > 0" style="object-fit:cover"
							v-lazy="library.dataPreview[0].url"
							:style="{ width: itemWidth + 'px', height: itemWidth  + 'px' }" />
						<img v-else style="object-fit: cover;"
							:style="{ 'width': itemWidth + 'px', 'height': itemWidth + 'px' }"
							src="@/static/photo/icon-album-empty.png" />
					</template>

					<template #text>
						<p class="item-subtitle max-line-one">{{ library.create_time }}</p>
					</template>
					<template #interactions>
						<!-- 编辑 -->
						<vs-button v-if="$store.state.currentUser.is_admin == 1" icon class="btn-chat" shadow primary @click.stop="showAdd(library)">
							<Icon type="md-settings" size="20" />
						</vs-button>
						<!-- 删除 -->
						<vs-button v-if="$store.state.currentUser.is_admin == 1"  icon class="btn-chat" shadow primary @click.stop="deleteLibrary(library)">
							<Icon type="md-trash" size="20" />
						</vs-button>
					</template>
				</vs-card>
				<!-- 添加合集 -->
				<div v-if="dataList.length > 0 && $store.state.currentUser.is_admin == 1" @click="showAdd()"
					:style="{ 'margin': itemMargin + 'px', 'width': itemWidth + 'px' }"
					style=" background-color: white;border-radius: 10px;display: flex;flex-direction: column;justify-content: center;cursor: pointer;">
					<span class="nasIcons icon-add-album icon-add"></span>
					<div style="font-size: 16px;font-weight: bold;margin-bottom: 60px;">
						{{ $t('movie.addLibrary') }}
						<Icon @click.stop="showVsAlertDialog($t('common.alert'), $t('movie.addLibraryAlert'))"
							style="cursor: pointer;" size="16" type="ios-help-circle-outline" />
					</div>
				</div>
			</div>
		</div>

		<!-- 新增/编辑对话框 -->
		<vs-dialog v-model="showAddDialog" scroll>
			<template #header>
				<div style="display: flex;align-items: center;margin-top: 20px;">
					<img style="width: 22px;height: 22px;margin-right: 10px;" src="@/static/common/icon-dialog-alert.png" />
					<p style="color: #333333;font-size: 22px;text-align: center;">
						{{ dialogTitle }}
					</p>
				</div>
			</template>

			<!-- 内容 -->
			<div style="word-break: break-all;text-align: left;max-width: 100%;">

			</div>
			<!-- 输入框 合集名称-->
			<vs-input autocapitalize="off" autocorrect="off" type="text" v-model="inputLibraryName"
				:placeholder="$t('movie.addLibraryPlaceholder')">
				<template #icon>
					<Icon color="#99AABF" type="ios-bookmarks" />
				</template>
			</vs-input>

			<Divider></Divider>
			<!-- 路径列表 -->
			<div>
				<div class="flex-row">
					<p style="margin-right: 20px;">{{ $t('movie.libraryIncludePath') }}</p>
					<!-- <a @click="showChooseFolder = true">{{ $t("common.add") }}</a> -->
				</div>
				<div  class="flex-row" style="margin-top: 5px;flex-wrap: wrap;">
					<Tag v-for="item in libraryPathList" type="border" closable color="primary" @on-close="onDeletePath(item)">
						{{ item.showPath }}</Tag>
					<Button icon="ios-add" type="dashed" size="small" @click="showChooseFolder = true">{{ $t("common.addPath")}}</Button>

				</div>
			</div>

			<Divider></Divider>
			<!-- 是否共享给子用户 -->
			<div style="display:flex;align-items: center;">
				<p style="margin-right: 20px;">{{ $t('shareForSubUser') }}</p>
				<i-switch v-model="shareForSubUser" />
			</div>
			<div style="margin-top:5px" v-if="shareForSubUser">
				<p class="text-user-alert">{{ $t("movie.libraryUserAlert") }}</p>
				<!-- <div  class="flex-row" style="margin-top: 5px;flex-wrap: wrap;">
					<Tag v-for="item in userList" type="border" closable color="primary" @on-close="onDeleteUser(item)">{{
						item.username }}</Tag>
					<Button icon="ios-add" type="dashed" size="small" @click="showChooseUser = true">{{ $t("common.selectSubuser") }}</Button>
				</div> -->
			</div>

			<Divider></Divider>

			<template #footer>
				<div style="margin-bottom: 10px;">
					<!-- 按钮 -->
					<my-btn block @click="operationLibrary(selectedLibrary ? 'EDIT' : 'ADD')" :title="dialogTitle"
						style="width:100%">
					</my-btn>
				</div>

			</template>
		</vs-dialog>

		<!-- 合集详情 -->
		<Modal v-model="showDetail" fullscreen footer-hide :closable="false" class-name="modal-style-nopadding">
			<!-- 照片合集 用的相册详情这个组件 -->
			<album-detail v-if="showDetail&&isPhotoLibrary" @onClose="showDetail = false" :propsShowSearchBtn="false"
					:propsTitle="$t('movie.library')+':'+selectedLibrary.title" :propsShowAddToAlbum="true" :propsShowDelete="false"
					:propsShowModeSwitch="true"  :propsLibraryId="selectedLibrary.id + ''">
			</album-detail>
			<!-- 影音合集 -->
			<library-detail  v-if="showDetail&&!isPhotoLibrary" @onClose="showDetail=false" :title="$t('movie.library')+':'+selectedLibrary.title" :libraryId="selectedLibrary.id" :isPhotoLibrary="isPhotoLibrary"></library-detail>
		</Modal>


		<!-- 来源路径选择 -->
		<vs-dialog v-model="showChooseFolder" prevent-close scroll :full-screen="isMobile">
			<template #header>
				<h4 style="font-size: 16px;">
					{{ $t('file.chooseFolder') + '[' + $t('file.doubleClickFolderEnter') + ']' }}
				</h4>
			</template>
			<file-select ref="fileSelector" v-if="showChooseFolder" parent="root" :type="2" @onSelect='onSelectPath'
				@onCancel="showChooseFolder = false" :initPath="isPhotoLibrary?'sourceFolderPhoto':'sourceFolderMovie'"></file-select>
			<template #footer>
				<file-select-bar @back="$refs.fileSelector.goBack()" @select="$refs.fileSelector.onSelect()"
					@create="(newFolderName) => $refs.fileSelector.createNewFolder(newFolderName)"></file-select-bar>
			</template>
		</vs-dialog>

		<!-- 要授权的用户选择 -->
		<vs-dialog v-model="showChooseUser">
			<template #header>
				<h4 style="font-size: 16px;">
					{{ $t('common.chooseUser') }}
				</h4>
			</template>
			<user-select v-if="showChooseUser" :hideAdmin="true" parent="root" :type="2"
				@onSelect='onSelectUser'></user-select>
		</vs-dialog>

	</div>
</template>
<script>
import libraryDetail from "@/views/movies/libraryDetail.vue"
import axios from "@/plugins/axios";
import userSelect from "@/components/user-select/user-select.vue"
import movieUtil from "@/views/movies/utils/movieUtil";
import albumDetail from "@/views/photos/photoPages/albumDetail.vue"

export default {
	props:{
		//ture则为照片的合集 false为影音合集 这两个功能界面差不多 调用接口不一样 所以这里做一个标记判断
		isPhotoLibrary:{
			default:false,
			type:Boolean
		}
	},
	created() {
	},
	mounted() {
		this.operationLibrary("GET")
		window.addEventListener("resize", this.calImageWidth);
		//监听后退事件
		window.addEventListener('popstate', this.onPopstate)
	},
	beforeDestroy() {
		window.removeEventListener("resize", this.calImageWidth);
		window.removeEventListener('popstate', this.onPopstate);
	},
	components: {
		albumDetail,
		userSelect,
		libraryDetail
	},
	data() {
		return {
			operation: "ADD",//ADD  EDIT  DELETE
			showChooseUser: false,//是否显示选择用户
			userList: [],//授权的用户列表
			libraryPathList: [],//选择的路径列表
			showChooseFolder: false,
			rightMenuList: [{
				text: this.$t('file.check'),
				type: "CHECK",
			}, {
				text: this.$t('common.delete'),
				type: "DELETE"
			}],
			showChooseCover: false,
			showDetail: false,
			dialogTitle: "",
			selectedLibrary: "",
			itemBaseWidth: 200,
			itemWidth: 200,
			itemMargin: 10,
			dataList: [],
			loading: false,
			showAddDialog: false,
			shareForSubUser: true,
			inputLibraryName: "",
			selectedIndex: false
		};
	},
	methods: {
		//弹出对话框 创建/修改 影集
		showAdd(library) {
			this.selectedLibrary = library
			this.shareForSubUser = true
			this.userList = []//授权的用户列表
			this.libraryPathList = []//选择的路径列表
			if (library) {
				//编辑 回填数据
				this.dialogTitle = this.$t("common.edit")
				this.inputLibraryName = library.title
				this.shareForSubUser = library.share_for_subuser == 1
				if (library.path_list) {
					try {
						let pathList = JSON.parse(library.path_list)
						for (let path of pathList) {
							this.onSelectPath(path)
						}
					} catch (e) { }
				}
				if (library.user_list) {
					try {
						for (let user of library.user_list) {
							this.onSelectUser(user)
						}
					} catch (e) { }
				}
			} else {
				this.dialogTitle = this.$t("movie.addLibrary")
				this.inputLibraryName = ""
			}
			this.showAddDialog = true

		},
		onSelectUser(user) {
			if (user.is_admin) {
				this.showVsNotification(this.$t('share.adminHasPowerDefault'))
			} else {
				let alreadyHad = false
				for (let uu of this.userList) {
					if (uu.username == user.username) {
						alreadyHad = true
					}
				}
				if (!alreadyHad) {
					this.userList.push(user)
				}
				this.showChooseUser = false
			}
		},
		onDeleteUser(delUser) {
			if (!delUser) return
			for (let i in this.userList) {
				if (this.userList[i].username == delUser.username) {
					this.userList.splice(i, 1)
					break
				}
			}
		},
		onDeletePath(delPath) {
			if (!delPath) return
			for (let i in this.libraryPathList) {
				if (this.libraryPathList[i].path == delPath.path) {
					this.libraryPathList.splice(i, 1)
					break
				}
			}
		},
		onSelectPath(path) {
			if (!path) { return }
			let showPath = path;
			if (path.length > 41) {
				showPath = "..." + path.substring(path.length - 41)
			}
			for(let lPath of this.libraryPathList){
				if(lPath.path==path){
					this.showVsNotification(this.$t("common.pathExist"))
					return
				}
			}
			this.libraryPathList.push({
				showPath, path
			})
			this.showChooseFolder = false
		},

		//选择封面的回调
		onSelectedCover(filePath) {
			if (!filePath.endsWith('.jpg')
				&& !filePath.endsWith('.jpeg')
				&& !filePath.endsWith('.JPG')
				&& !filePath.endsWith('.JPEG')
				&& !filePath.endsWith('.png')
				&& !filePath.endsWith('.PNG')) {
				this.showVsAlertDialog(this.$t('common.alert'), this.$t('movie.coverFileNoSupport'));
			} else {
				this.showChooseCover = false
				//调用修改接口
				this.coverPath = filePath
			}
		},
		onPopstate() {
			console.log("后退点击")
			//后退按钮被点击 如果当前正在播放视频 则关闭视频 如果每播放 则后退
			if (this.showDetail) {
				this.showDetail = false
			} else {
				this.$router.go(-1)
			}
		},
		onLibraryClick(index) {
			this.selectedLibrary = this.dataList[index]
			this.showDetail = true
			this.pushState()
		},

		//计算item宽度
		calImageWidth() {
			let wrapper = this.$refs.wrapper.getBoundingClientRect();
			let itemWidth = this.utils.calItemWidth(wrapper, this.itemBaseWidth, this.itemMargin)
			if (itemWidth) this.itemWidth = itemWidth
		},
		deleteLibrary(library) {
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('common.deleteSure'), () => {
				this.selectedLibrary = library
				this.operationLibrary("DELETE")
			})
		},
		operationLibrary(operation) {

			let params = {
				operation: operation,
				title: this.inputLibraryName,
				libraryId: this.selectedLibrary?this.selectedLibrary.id:"",
				shareForSubUser: this.shareForSubUser ? "1" : "0"
			}
			if (operation == "ADD" || operation == "EDIT") {
				if (!this.inputLibraryName) {
					return this.showVsNotification(this.$t('movie.pleaseInputCollectionName'))
				}
				if (!this.libraryPathList || this.libraryPathList.length < 1) {
					return this.showVsNotification(this.$t('movie.atleastOnePath'))
				}

				let pathList = []
				for (let i of this.libraryPathList) {
					pathList.push(i.path)
				}
				let shareUidList = []
				for (let i of this.userList) {
					shareUidList.push(i.id)
				}
				params.pathList = pathList
				params.shareUidList = shareUidList
			}
			let apiUrl='/api/movieApi/operationLibrary'
			if(this.isPhotoLibrary){
				apiUrl='/api/photoApi/operationLibrary'
			}

			this.api.post(apiUrl, params).then((res) => {
				if (!res.code) {
					this.showAddDialog = false
					if (operation == "GET") {
						//获取列表成功
						this.dataList = res.data
						for (let i in this.dataList) {
							let libraryItem=this.dataList[i]
							if(this.isPhotoLibrary){
								if(libraryItem.dataPreview&&libraryItem.dataPreview.length>0){
									for(let previewItem of libraryItem.dataPreview){
										previewItem.url=axios.getImgFullPath(previewItem.id, true, previewItem.filename);
									}

								}

							}else{
								movieUtil.dealMovieList(false, libraryItem.dataPreview)
							}
						}
						this.$nextTick(()=>{
							this.calImageWidth()
						})
					} else {
						this.showVsNotification(this.$t('common.operationSuccess'))
						this.operationLibrary("GET")
					}
				}
			}).catch((error) => { })
		},
	}
}
</script>
<style lang="scss" scoped>
::v-deep .vs-input-content {
	margin: 10px 0px;
	width: calc(100%);
}

::v-deep .vs-input {
	width: 100%;
}

.img-inner-wrapper {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;

	.img-inner-four {
		border-top-left-radius:0 !important;
		border-top-right-radius:0 !important;
		object-fit: cover;
		border-radius: 0px !important;
	}
}

.list-root {
	position: relative;
	width: 100%;
	height: 100%;
	background-color: rgba(255, 255, 255, 0.6);
	display: flex;

	@media not all and (max-width:640px) {
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
	}
}

.album-list-root {
	scrollbar-width: none;
	/* Firefox 64 */
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	overflow-y: auto;
	align-content: flex-start;
}

.album-header {
	z-index: 100;
	position: absolute;
	left: 0;
	height: 80px;
	width: 100%;
	display: flex;
	padding-left: 30px;
	padding-right: 30px;
	align-items: center;
}

.item-subtitle {
	text-align: left;
	font-size: 14px;
	color: $nas-grey;
}

.icon-add {
	margin-top: 30px;
	margin-bottom: 20px;
	font-size: 50px;
	color: $nas-main;
}

.img-cover {
	width: 100px;
	height: 100px;
	border-radius: 10px;
	object-fit: cover;

}

.text-user-alert {
	font-size: 12px;
	text-align: left;
	color: $nas-text-grey;
}

</style>
