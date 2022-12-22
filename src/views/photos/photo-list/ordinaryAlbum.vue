<template>
	<div class="ordinary-album-root-wrapper">

		<!-- 无数据提示 -->
		<my-nodata v-if="!loading && albumList.length < 1" @onBtnClick="$refs.addAlbumDialog.setShow(true)"
			:title="$t('album.noOrdinaryAlubmDesc')" :btnTitle="$t('album.addAOrdinaryAlbum')"
			style="position: absolute;width: 100%;margin-top: 150px;">
		</my-nodata>


		<div style="width:100%;display:flex;height: 100%;flex-direction:row;overflow: hidden;">
			<!-- 相册列表 -->
			<div class="album-list-root" ref="photoWrapper">
				<vs-card v-for="(album, index) in albumList" type='1' @click="onAlbumClick(index)"
					@contextmenu="showRightMenu($event, $root, album, index)"
					:style="{ 'margin': itemMargin + 'px', 'width': itemWidth + 'px' }">
					<template #title>
						<h3 class="max-line-one" style="text-align: left;">{{ album.name }}</h3>
					</template>
					<template #img>
						<img style="object-fit: cover;" v-if="album.imgList.length > 0"
							:style="{ 'width': itemWidth + 'px', 'height': itemWidth + 'px' }"
							:src="album.imgList[0].url" />
						<img v-else style="object-fit: cover;"
							:style="{ 'width': itemWidth + 'px', 'height': itemWidth + 'px' }"
							src="@/static/photo/icon-album-empty.png" />
					</template>
					<template #text>
						<p class="item-subtitle">{{ album.create_time }}</p>
					</template>
					<template #interactions>
						<vs-button icon>
							{{ $t('photo.ordinaryAlbum') }}
						</vs-button>
						<vs-button icon class="btn-chat" shadow primary @click.stop="showChangeNameModal(index)">
							<Icon type="md-settings" size="20" />
						</vs-button>
					</template>
				</vs-card>
				<!-- 添加相册 -->
				<div v-if="albumList.length > 0" @click="$refs.addAlbumDialog.setShow(true)"
					:style="{ 'margin': itemMargin + 'px', 'width': itemWidth + 'px' }"
					style="background-color: white;border-radius: 10px;display: flex;flex-direction: column;justify-content: center;cursor: pointer;">
					<span class="nasIcons icon-add-album icon-add"></span>
					<div style="font-size: 20px;font-weight: bold;margin-bottom: 60px;">
						{{ $t('album.addAOrdinaryAlbum') }}</div>
				</div>
			</div>
		</div>

		<!--添加相册对话框 -->
		<my-dialog-input @onOkClick="onAddAlbum" :placeholder="$t('album.albumName')" :showCloseBtn="true"
			ref="addAlbumDialog" :content="$t('album.albumName')" :title="$t('album.addAOrdinaryAlbum')">
		</my-dialog-input>

		<!--修改相册名 -->
		<my-dialog-input @onOkClick="onChangeAlbumName" :placeholder="$t('album.albumName')" :showCloseBtn="true"
			ref="changeAlbumDialog" :content="$t('album.albumName')" :title="$t('album.changeAlbumName')"
			:initValue="changeAlbumName">
		</my-dialog-input>

		<!-- 相册详情对话框 -->
		<Modal @on-visible-change="onDetailClose" footer-hide ref="myModal" class-name="modal-style-nopadding"
			v-model="showAlbumDetail" fullscreen :closable="false">

			<album-detail v-if="showAlbumDetail" @onClose="showAlbumDetail = false" :propsShowSearchBtn="false"
				:propsTitle="selectedAlbum.name" :propsShowAddToAlbum="false" :propsShowDelete="true"
				:propsShowModeSwitch="true" @onDelete="deleteAlbum" :propsOrdinaryAlbumId="selectedAlbum.id + ''"
				:propsShowRemoveFromAlbum="true">
			</album-detail>

		</Modal>
		<!-- 右键菜单 -->
		<easy-cm @ecmcb="rightMenuClick" :list="rightMenuList"></easy-cm>
	</div>

</template>

<script>
import adlbumAdd from "@/views/photos/components/albumAdd.vue";
import axios from "@/plugins/axios";
import albumDetail from "@/views/photos/photo-list/albumDetail.vue"

export default {
	components: {
		adlbumAdd,
		albumDetail
	},
	data() {
		return {
			rightMenuList: [{
				text: this.$t('file.check'),
				type: "CHECK",
			}, {
				text: this.$t('common.delete'),
				type: "DELETE"
			}],
			dataMode: 'list', //列表模式 map为地图模式
			changeAlbumName: "",
			addAlbumName: "",
			itemBaseWidth: 220,
			itemWidth: 220,
			itemMargin: 10,
			selectedAlbum: '',
			showAlbumDetail: false,
			albumList: [],
			loading: false,
			selectedIndex: false

		}
	},
	mounted() {
		this.getAlbumList()
		window.addEventListener("resize", this.calImageWidth);
	},
	activated() {
		let deleteAlbumId = sessionStorage.getItem('ordinaryAlbumDelete')
		if (!deleteAlbumId) {
			return
		}
		sessionStorage.removeItem('ordinaryAlbumDelete')
		for (let i in this.albumList) {
			if (this.albumList[i].id == deleteAlbumId) {
				return this.albumList.splice(i, 1)
			}
		}
	},
	beforeDestroy() {
		window.removeEventListener("resize", this.calImageWidth);
	},
	methods: {
		showRightMenu(event, root, album, index) {
			if (this.isMobile) return event.preventDefault()
			this.selectedIndex = index
			this.selectedAlbum = album
			this.$easycm(event, root)
		},
		//右键菜单点击
		rightMenuClick(indexList) {
			let type = this.rightMenuList[indexList[0]].type
			if (type == 'CHECK') { //查看
				this.onAlbumClick(this.selectedIndex)
			} else if (type == 'DELETE') { //删除
				this.deleteAlbum()
			}
		},
		changeDataMode(mode) {
			this.dataMode = mode
		},
		onDetailClose(v) {
			if (!v) {
				//关闭详情对话框的时候刷新下列表
				this.getAlbumList()
			}
		},
		showChangeNameModal(index) {
			this.selectedAlbum = this.albumList[index]
			this.changeAlbumName = this.selectedAlbum.name
			this.$nextTick(() => {
				this.$refs.changeAlbumDialog.setShow(true)
			})
		},
		onChangeAlbumName(inputValue) {
			this.changeAlbumName = inputValue
			//当点击添加相册
			if (this.changeAlbumName.length < 1) {
				this.showVsNotification(this.$t('album.pleaseInputAlbumName'));
			}
			this.api
				.post("/api/ordinaryAlbumApi/updateAlbum", {
					id: this.selectedAlbum.id,
					name: this.changeAlbumName
				})
				.then((res) => {
					if (!res.code) {
						this.showVsNotification(this.$t('common.changeSuccess'));
						this.getAlbumList()
					}
				})
				.catch((error) => { });
		},
		onAddAlbum(inputVal) {
			this.addAlbumName = inputVal
			//当点击添加相册
			if (this.addAlbumName.length < 1) {
				this.showVsNotification(this.$t('album.pleaseInputAlbumName'));
			}
			this.api
				.post("/api/ordinaryAlbumApi/addAlbum", {
					name: this.addAlbumName
				})
				.then((res) => {
					if (!res.code) {
						this.getAlbumList()
					}
				})
				.catch((error) => { });
		},
		//计算item宽度
		calImageWidth() {
			let wrapper = this.$refs.photoWrapper.getBoundingClientRect();
			let itemWidth = this.utils.calItemWidth(wrapper, this.itemBaseWidth, this.itemMargin)
			if (itemWidth) this.itemWidth = itemWidth
		},
		onAlbumClick(index) {
			this.selectedAlbum = this.albumList[index]


			if (this.isMobile) {
				//手机端直接跳页面
				this.$router.push({
					name: 'albumDetail',
					params: {
						showModeSwitch: true,
						showDelete: true,
						showAddToAlbum: false,
						ordinaryAlbumId: this.selectedAlbum.id,
						showSearchBtn: false,
						title: this.selectedAlbum.name,
					}
				});
			} else {
				this.showAlbumDetail = true
			}


		},
		getAlbumList() {
			this.loading = true
			this.api
				.post("/api/ordinaryAlbumApi/getAllAlbum", {})
				.then((res) => {
					if (!res.code) {
						this.albumList = res.data;
						for (let i = 0; i < this.albumList.length; i++) {
							let albumObj = this.albumList[i]
							for (let j = 0; j < albumObj.imgList.length; j++) {
								let url = axios.getImgFullPath(albumObj.imgList[j].id, true);
								this.albumList[i].imgList[j].url = url
							}
						}

						this.$nextTick(() => {
							setTimeout(() => {
								this.calImageWidth()
							}, 100);
						});

						// for(let i=0;i<20;i++){
						// 	this.albumList.push(res.data[0])
						// }
					}
					this.loading = false
				})
				.catch((error) => {
					this.loading = false
				});
		},
		deleteAlbum() {
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('common.deleteSure'), () => {
				this.api
					.post("/api/ordinaryAlbumApi/deleteAlbum", {
						id: this.selectedAlbum.id
					})
					.then((res) => {
						if (!res.code) {
							this.showVsNotification(this.$t('common.deleteSuccess'))
							this.getAlbumList()
							this.showAlbumDetail = false
						}
					})
					.catch((error) => { });
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.album-detail-header {
	padding-left: 30px;
	padding-right: 30px;

	@media all and (max-width:640px) {
		padding-left: 10px;
		padding-right: 10px;
	}

	position: absolute;
	flex-shrink: 0;
	z-index: 2;
	width: 100%;
	height: 80px;
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

.ordinary-album-root-wrapper {
	position: relative;
	z-index: 1;
	width: 100%;
	height: 100%;

	@media not all and (max-width:640px) {
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
		padding: 10px;

	}

	background-color: rgba(255, 255, 255, 0.6);


	.icon-add {
		margin-top: 30px;
		margin-bottom: 20px;
		font-size: 50px;
		color: $nas-main;
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

	.delete-album {
		margin-right: 20px;
		cursor: pointer;
		color: $nas-red;
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
}
</style>
