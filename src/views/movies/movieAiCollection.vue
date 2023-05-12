<template>
	<div class="list-root">

		<!-- 无数据提示 -->
		<my-nodata v-if="!loading && dataList.length < 1" @onBtnClick="showAdd" :title="$t('movie.addSmartCollectionAlert')"
			:btnTitle="$t('movie.addSmartCollection')" style="position: absolute;width: 100%;margin-top: 150px;">
		</my-nodata>

		<div style="width:100%;display:flex;height: 100%;flex-direction:row;overflow: hidden;">
			<!-- 相册列表 -->
			<div class="album-list-root" ref="photoWrapper">
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
						<!-- <vs-button icon class="btn-chat" shadow primary @click.stop="showAdd(collection)">
							<Icon type="md-settings" size="20" />
						</vs-button> -->
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
						<Icon @click.stop="showVsAlertDialog($t('common.alert'), $t('movie.addSmartCollectionAlert'))"
							style="cursor: pointer;" size="16" type="ios-help-circle-outline" />
					</div>
				</div>
			</div>
		</div>

		<!-- 新增/编辑对话框 -->
		<Modal v-model="showAddDialog" footer-hide>
			<smart-collection-add  @onAdd="onAddFinish"></smart-collection-add>
		</Modal>

		<Modal v-model="showCollectionDetail" fullscreen footer-hide :closable="false" class-name="modal-style-nopadding">
			<collection-detail @onClose="showCollectionDetail = false" v-if="showCollectionDetail"
				:collectionId="selectedCollection.id" :title="selectedCollection.title"
				:collectionPwd="collectionPwd"></collection-detail>
		</Modal>


		<my-dialog-input @onOkClick="checkPwd" :isPwd="true" :showCloseBtn="true" ref="inputPwdDialog"
			:closeOnClickBtn="false" :clearOnOpen="true" :title="$t('registerAdmin.placeholderPassword')"
			:content="$t('registerAdmin.placeholderPassword')">
		</my-dialog-input>



	</div>
</template>
<script>
import collectionDetail from "@/views/movies/collectionDetail.vue"
import smartCollectionAdd from "@/views/movies/components/smartCollectionAdd.vue"

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
		smartCollectionAdd,
		collectionDetail
	},
	data() {
		return {

			showCollectionDetail: false,
			dialogTitle: "",
			selectedCollection: "",
			itemBaseWidth: 200,
			itemWidth: 200,
			itemMargin: 10,
			dataList: [],
			loading: false,
			showAddDialog: false,
			inputCollectionName: "",
			collectionPwd: ""
		};
	},
	computed: {

	},
	methods: {
		onPopstate() {
			console.log("后退点击")
			//后退按钮被点击 如果当前正在播放视频 则关闭视频 如果每播放 则后退
			if (this.showCollectionDetail) {
				this.showCollectionDetail = false
			} else {
				this.$router.go(-1)
			}
		},
		onAddFinish() {
			this.showAddDialog = false
			this.loadCollection()
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
			if (collection) {
				this.dialogTitle = this.$t("movie.editCollection")
				this.inputCollectionName = collection.title
			} else {
				this.dialogTitle = this.$t("movie.addSmartCollection")
				this.inputCollectionName = ""
			}
			this.showAddDialog = true
		},
		//计算item宽度
		calImageWidth() {
			let wrapper = this.$refs.photoWrapper.getBoundingClientRect();
			let itemWidth = this.utils.calItemWidth(wrapper, this.itemBaseWidth, this.itemMargin)
			if (itemWidth) this.itemWidth = itemWidth
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
				type: "smart"
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

.icon-add {
	margin-top: 30px;
	margin-bottom: 20px;
	font-size: 50px;
	color: $nas-main;
}
</style>
