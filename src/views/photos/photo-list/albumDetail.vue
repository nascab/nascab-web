<template>
	<div class="album-detail-root">
		<my-bg></my-bg>
		<div style="overflow: hidden; width: 100%;height: 100%; ">
			<div class="album-detail-header">
				<div style="display: flex;align-items:center">
					<!-- 返回按钮 -->
					<vs-button icon>
						<Icon style="cursor:pointer" @click="goBack" size="24" type="md-return-left" />
					</vs-button>
					<!-- 地图模式切换 -->
					<vs-button v-if="!isMobile && showModeSwitch" icon style="margin-left: 15px;flex-shrink:0">
						<Icon v-if="dataMode == 'list'" @click="dataMode = 'map'" style="cursor:pointer;" size="24"
							type="md-map" />
						<Icon v-if="dataMode == 'map'" @click="dataMode = 'list'" style="cursor:pointer;" size="24"
							type="md-grid" />
					</vs-button>
					<!-- 标题 -->
					<div class="max-line-one" style="font-size: 18px;font-weight: bold;height: 100%;margin-left: 20px;">
						{{ title }}</div>
				</div>
				<!-- 删除相册按钮 -->
				<vs-button danger v-if="showDelete" @click="deleteAlbum">
					{{ $t('photo.deleteAlbum') }}
				</vs-button>
			</div>
			<div class="album-detail-content">
				<!-- 地图模式 -->
				<photo-map :albumDetailInner="true" v-if="!isMobile && dataMode == 'map'" :albumId="albumId + ''"
					:ordinaryAlbumId="ordinaryAlbumId + ''">
				</photo-map>
				<!-- 列表模式 -->
				<photo-list v-if="dataMode == 'list'" :nearMode="nearMode" :showSearchBtn="showSearchBtn"
					:showAddToAlbum="showAddToAlbum" :geohash="geoHash ? geoHash : ''"
					:ordinaryAlbumId="ordinaryAlbumId ? ordinaryAlbumId + '' : ''"
					:albumId="albumId ? albumId + '' : ''" :faceId="faceId ? faceId + '' : ''"
					:aiClassId="aiClassId ? aiClassId + '' : ''" :showRemoveFromAlbum="showRemoveFromAlbum">
				</photo-list>

			</div>
		</div>
	</div>
</template>

<script>
// 相册弹出窗口
const photoList = () => import('@/views/photos/photo-list/photoList.vue')
const photoMap = () => import('@/views/photos/photo-list/photoMap.vue')

export default {

	props: {
		propsGeoHash: {
			default: '',
			type: String
		},
		propsOrdinaryAlbumId: {
			default: "",
			type: String
		},
		propsAlbumId: {
			default: '',
			type: String
		},
		propsNearMode: {
			default: false,
			type: Boolean
		},
		propsShowRemoveFromAlbum:{
			default:false,
			type:Boolean
		},
		propsShowAddToAlbum: {
			default: false,
			type: Boolean
		},
		propsShowSearchBtn: {
			default: false,
			type: Boolean
		},
		propsTitle: {
			default: "",
			type: String
		},
		propsShowModeSwitch: {
			default: false,
			type: Boolean
		},
		propsShowDelete: {
			default: false,
			type: Boolean
		},
		propsFaceId: {
			default: "",
			type: String
		},
		propsAiClassId: {
			default: "",
			type: String
		}
	},
	components: {
		photoList,
		photoMap
	},
	data() {
		return {
			aiClassId: "",
			faceId: "",
			ordinaryAlbumId: "",
			showAddToAlbum: false,
			dataMode: "list",
			showDelete: false,
			showModeSwitch: false,
			title: "",
			geoHash: "",
			albumId: "",
			nearMode: false,
			showSearchBtn: false,
			openAsPage: false,
			showRemoveFromAlbum:false
		}
	},
	mounted() {
		let passParams = this.$route.params

		if (this.propsAiClassId || this.propsFaceId || this.propsGeoHash || this.propsAlbumId || this.propsOrdinaryAlbumId) {
			//处理组件弹窗方式打开
			this.title = this.propsTitle
			this.geoHash = this.propsGeoHash
			this.albumId = this.propsAlbumId
			this.nearMode = this.propsNearMode
			this.showSearchBtn = this.propsShowSearchBtn
			this.showModeSwitch = this.propsShowModeSwitch
			this.showDelete = this.propsShowDelete
			this.showAddToAlbum = this.propsShowAddToAlbum
			this.ordinaryAlbumId = this.propsOrdinaryAlbumId
			this.faceId = this.propsFaceId
			this.aiClassId = this.propsAiClassId
			this.showRemoveFromAlbum=this.propsShowRemoveFromAlbum
		} else {
			this.openAsPage = true
			//处理单独页面方式打开 主要是手机
			this.title = passParams.title
			this.geoHash = passParams.geoHash
			this.albumId = passParams.albumId
			this.nearMode = passParams.nearMode
			this.showSearchBtn = passParams.showSearchBtn
			this.showModeSwitch = passParams.showModeSwitch
			this.showDelete = passParams.showDelete
			this.showAddToAlbum = passParams.showAddToAlbum
			this.ordinaryAlbumId = passParams.ordinaryAlbumId
			this.faceId = passParams.faceId
			this.aiClassId = passParams.aiClassId
			this.showRemoveFromAlbum=passParams.showRemoveFromAlbum
		}
	},
	beforeDestroy() {

	},
	methods: {
		onClickAlbum() {
			if (this.openAsPage) {
				this.deleteAlbum()
			} else {
				this.$emit('onDelete')
			}
		},
		deleteAlbum() {
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('common.deleteSure'), () => {
				let apiUrl = ''
				let params = {}
				if (this.albumId) {
					apiUrl = "/api/photoApi/deleteAlbum"
					params.id = this.albumId
				} else if (this.ordinaryAlbumId) {
					apiUrl = "/api/ordinaryAlbumApi/deleteAlbum"
					params.id = this.ordinaryAlbumId
				}
				this.api
					.post(apiUrl, params)
					.then((res) => {
						if (!res.code) {
							this.showVsNotification(this.$t('common.deleteSuccess'))
							if (this.albumId) {
								sessionStorage.setItem('albumDelete',this.albumId)
							} else if (this.ordinaryAlbumId) {
								sessionStorage.setItem('ordinaryAlbumDelete',this.ordinaryAlbumId)
							}
							this.$router.go(-1)
						}
					})
					.catch((error) => { });
			})
		},
		goBack() {
			console.log('this.openAsPage',this.openAsPage)
			if (this.openAsPage) {
				this.$router.go(-1)
			} else {

				this.$emit('onClose')
			}
		}
	}
}
</script>
<style lang="scss" scoped>
.album-detail-root {

	width: 100%;
	height: 100%;
}

.album-detail-header {
	padding-left: 30px;
	padding-right: 30px;
	height: 80px;

	@media all and (max-width:640px) {
		padding-left: 10px;
		padding-right: 10px;
	}

	position: absolute;
	flex-shrink: 0;
	z-index: 2;
	width: 100%;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
}


.album-detail-content {
	width: 100%;
	height: 100%;
	padding-top: 80px;

	@media not all and (max-width:640px) {
		padding-left: 30px;
		padding-right: 30px;
	}
}
</style>
