<template>
	<div class="list-root">

		<!-- 无数据提示 -->
		<my-nodata v-if="!loading && dataList.length < 1" @onBtnClick="showAdd" :title="$t('movie.addCollectionAlert')"
			:btnTitle="$t('movie.addCollection')" style="position: absolute;width: 100%;margin-top: 150px;">
		</my-nodata>

		<div style="width:100%;display:flex;height: 100%;flex-direction:row;overflow: hidden;">
			<!-- 列表 -->
			<div class="album-list-root" ref="wrapper">
				<vs-card v-for="(collection, index) in dataList" type='1' @click="onCollectionClick(index)"
					@contextmenu="showRightMenu($event, $root, album, index)"
					:style="{ 'margin': itemMargin + 'px', 'width': itemWidth + 'px' }">
					<template #title>
						<h3 class="max-line-one" style="text-align: left;">{{ collection.title }}</h3>
					</template>
					<template #img>
						<img v-if="collection.collection_cover_path && collection.enable_pwd != 1" style="object-fit: cover;"
							:style="{ 'width': itemWidth + 'px', 'height': itemWidth + 'px' }"
							v-lazy="axios.getRawFileUrl(collection.collection_cover_path,'cover.jpg')" />
						
						<img v-if="!collection.collection_cover_path && collection.enable_pwd != 1" style="object-fit: cover;"
							:style="{ 'width': itemWidth + 'px', 'height': itemWidth + 'px' }"
							src="@/static/photo/icon_movie_collection.png" />


						<img v-if="collection.enable_pwd==1" style="object-fit: cover;"
							:style="{ 'width': itemWidth + 'px', 'height': itemWidth + 'px' }"
							src="@/static/photo/icon_movie_collection_lock.png" />
					</template>
					<template #text>
						<p class="item-subtitle">{{ collection.create_time }}</p>
					</template>
					<template #interactions>
						<vs-button icon class="btn-chat" shadow primary @click.stop="showAdd(collection)">
							<Icon type="md-settings" size="20" />
						</vs-button>
						<vs-button icon class="btn-chat" shadow primary @click.stop="deleteCollection(collection)">
							<Icon type="md-trash" size="20" />
						</vs-button>
					</template>
				</vs-card>
				<!-- 添加影集 -->
				<div v-if="dataList.length > 0" @click="showAdd()"
					:style="{ 'margin': itemMargin + 'px', 'width': itemWidth + 'px' }"
					style=" background-color: white;border-radius: 10px;display: flex;flex-direction: column;justify-content: center;cursor: pointer;">
					<span class="nasIcons icon-add-album icon-add"></span>
					<div style="font-size: 16px;font-weight: bold;margin-bottom: 60px;">
						{{ $t('movie.addCollection') }}
						<Icon @click.stop="showVsAlertDialog($t('common.alert'), $t('movie.addCollectionAlert'))"
							style="cursor: pointer;" size="16" type="ios-help-circle-outline" />
					</div>
				</div>
			</div>
		</div>

		<!-- 新增/编辑对话框 -->
		<vs-dialog v-model="showAddDialog">
			<template #header>
				<div style="display: flex;align-items: center;margin-top: 20px;">
					<img style="width: 22px;height: 22px;margin-right: 10px;" src="@/static/common/icon-dialog-alert.png" />
					<p style="color: #333333;font-size: 22px;text-align: center;">
						{{ dialogTitle }}
					</p>
				</div>
			</template>
			<div style="display:flex;flex-direction:column;align-items:center">
				<!-- 封面 -->
				<img class="img-cover" v-if="coverPath" :src="axios.getRawFileUrl(coverPath,'cover.jpg')"/>
				<!-- 选择封面 -->
				<a style="margin-top:10px" @click="onChooseCover">{{coverPath ? $t("movie.deleteCover") :  $t("movie.addCover") }}</a>
			</div>
			<!-- 内容 -->
			<div style="word-break: break-all;text-align: left;max-width: 100%;">

			</div>
			<!-- 输入框 -->
			<vs-input autocapitalize="off" autocorrect="off" type="text" v-model="inputCollectionName" :placeholder="$t('movie.addCollectionPlaceholder')">
				<template #icon>
					<Icon color="#99AABF" type="ios-bookmarks" />
				</template>
			</vs-input>

			<!-- 密码输入框 -->
			<vs-input autocapitalize="off" autocorrect="off" v-if="enablePwd" type="password" v-model="password"
				:placeholder="$t('movie.collectionPwdPlaceholder')">
				<template #icon>
					<Icon color="#99AABF" type="ios-key" />
				</template>
			</vs-input>

			<!-- 访问是否需要密码 -->
			<div style="display:flex;align-items: center;">
				<p style="margin-right: 20px;">{{ $t('movie.collectionIsNeedPwd') }}</p>
				<i-switch v-model="enablePwd" />
			</div>

			<template #footer>
				<div style="margin-top: 20px;margin-bottom: 10px;">
					<!-- 按钮 -->
					<vs-button block @click="onAddBtnClick">
						{{ dialogTitle }}
					</vs-button>
				</div>

			</template>
		</vs-dialog>

		<Modal v-model="showCollectionDetail" fullscreen footer-hide :closable="false" class-name="modal-style-nopadding">
			<collection-detail @onClose="showCollectionDetail = false" v-if="showCollectionDetail"
				:collectionId="selectedCollection.id" :title="selectedCollection.title"
				:collectionPwd="collectionPwd"></collection-detail>
		</Modal>


		<my-dialog-input @onOkClick="checkPwd" :isPwd="true" :showCloseBtn="true" ref="inputPwdDialog"
			:closeOnClickBtn="false" :clearOnOpen="true" :title="$t('registerAdmin.placeholderPassword')"
			:content="$t('registerAdmin.placeholderPassword')">
		</my-dialog-input>


		<!-- 封面选择对话框 -->
		<vs-dialog v-model="showChooseCover" scroll :full-screen="isMobile">
			<template #header>
				<h4 style="font-size: 16px;">
					{{ $t('movie.addCover') + '[' + $t('file.doubleClickFolderEnter') + ']' }}
				</h4>
			</template>
			<file-select ref="fileSelector" v-if="showChooseCover" parent="root" @onSelect="onSelectedCover"
				@onCancel="showChooseCover = false" :fileType="0"></file-select>
			<template #footer>
				<file-select-bar @back="$refs.fileSelector.goBack()" @select="$refs.fileSelector.onSelect()"
					@create="(newFolderName) => $refs.fileSelector.createNewFolder(newFolderName)"></file-select-bar>
			</template>
		</vs-dialog>


	</div>
</template>
<script>
import collectionDetail from "@/views/movies/collectionDetail.vue"
import axios from "@/plugins/axios";

export default {
	created() {
	},
	mounted() {
		this.loadCollection()
		window.addEventListener("resize", this.calImageWidth);
		//监听后退事件
		window.addEventListener('popstate', this.onPopstate)
	},
	beforeDestroy() {
		window.removeEventListener("resize", this.calImageWidth);
		window.removeEventListener('popstate', this.onPopstate);
	},
	components: {
		collectionDetail
	},
	data() {
		return {
			showChooseCover:false,
			coverPath:"",
			showCollectionDetail: false,
			dialogTitle: "",
			selectedCollection: "",
			itemBaseWidth: 200,
			itemWidth: 200,
			itemMargin: 10,
			dataList: [],
			loading: false,
			showAddDialog: false,
			password: "",
			enablePwd: false,
			inputCollectionName: "",
			editCollectionId: "",
			collectionPwd: "" 
		};
	},
	methods: {
		onChooseCover(){
			if(this.coverPath){
				this.coverPath=""
			}else{
			this.showChooseCover=true 
			}
		},
		//选择封面的回调
		onSelectedCover(filePath){
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
				this.coverPath=filePath
			}
		},
		onPopstate() {
			console.log("后退点击")
			//后退按钮被点击 如果当前正在播放视频 则关闭视频 如果每播放 则后退
			if (this.showCollectionDetail) {
				this.showCollectionDetail = false
			} else {
				this.$router.go(-1)
			}
		},
		checkPwd(pwdVal) {
			this.collectionPwd = pwdVal
			this.api
				.post("/api/movieApi/checkCollectionPwd", {
					pwd: pwdVal,
					collectionId: this.selectedCollection.id
				})
				.then((res) => {
					if (!res.code) {
						this.$refs.inputPwdDialog.setShow(false)
						this.showCollectionDetail = true
						this.pushState()
					}
				})
				.catch((error) => { });
		},
		onCollectionClick(index) {
			this.selectedCollection = this.dataList[index]
			if (this.selectedCollection.enable_pwd == 1) {
				this.$refs.inputPwdDialog.setShow(true)
			} else {
				this.showCollectionDetail = true
				this.pushState()
			}
		},
		//弹出对话框 创建/修改 影集
		showAdd(collection) {
			this.password = ""
			this.enablePwd = false
			if (collection) {
				this.dialogTitle = this.$t("movie.editCollection")
				this.editCollectionId = collection.id
				this.inputCollectionName = collection.title
				this.coverPath=collection.collection_cover_path
			} else {
				this.dialogTitle = this.$t("movie.addCollection")
				this.inputCollectionName = ""
			}
			this.showAddDialog = true

		},
		//计算item宽度
		calImageWidth() {
			let wrapper = this.$refs.wrapper.getBoundingClientRect();
			let itemWidth = this.utils.calItemWidth(wrapper, this.itemBaseWidth, this.itemMargin)
			if (itemWidth) this.itemWidth = itemWidth
		},
		onAddBtnClick() {
			if (!this.inputCollectionName) {
				return this.showVsNotification(this.$t('movie.pleaseInputCollectionName'))
			}
			this.api.post('/api/movieApi/addCollection', {
				collectionId: this.editCollectionId,
				title: this.inputCollectionName,
				enablePwd: this.enablePwd ? "1" : "0",
				pwd: this.password,
				coverPath:this.coverPath
			}).then((res) => {
				if (!res.code) {
					this.showAddDialog = false
					this.showVsNotification(this.$t('common.operationSuccess'))
					this.loadCollection()
				}
			}).catch((error) => { })
		},
		deleteCollection(collection) {//删除影集
			console.log(collection)
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('common.deleteSure'), () => {
				this.api.post('/api/movieApi/deleteCollection', {
					collectionId: collection.id
				}).then((res) => {
					if (!res.code) {
						this.loadCollection()
						this.showVsNotification(this.$t('common.operationSuccess'))
					}
				}).catch((error) => {
					this.showVsNotification(this.$t('common.operationFail'))
				})
			})
		},
		loadCollection() {
			this.api.post('/api/movieApi/getCollection', {
			}).then((res) => {
				if (!res.code) {
					this.dataList = res.data
					this.$nextTick(() => {
						this.calImageWidth()
					})
				}
			}).catch((error) => { })
		}

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

.list-root {
	padding-top: 10px;
	position: relative;
	width: 100%;
	height: 100%;

	background-color: rgba(255, 255, 255, 0.6);
	padding-left: 10px;
	padding-right: 10px;

	@media not all and (max-width:640px) {
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
		padding-left: 20px;
		padding-right: 20px;
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
.img-cover{
	width:100px;
	height:100px;
	border-radius:10px;
	object-fit:cover;

}

::v-deep .vs-card {
	border-radius: 10px;

	.vs-card__img {
		border-top-left-radius: 10px !important;
		border-top-right-radius: 10px !important;
		border-bottom-left-radius: 0 !important;
		border-bottom-right-radius: 0 !important;

		img {
			border-top-left-radius: 10px !important;
			border-top-right-radius: 10px !important;
			border-bottom-left-radius: 0 !important;
			border-bottom-right-radius: 0 !important;
		}
	}
}
</style>
