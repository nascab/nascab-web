<template>
	<div class="bottom-select-root">
		<div v-if="!trashMode"
			style="width: 100%; display: flex;flex-direction: row;align-items: center;justify-content: space-between;">
			<div style="display: flex;align-items: center;">
				<span class="select-text">{{ $t('common.selected') }}：{{ selectedList.length }}{{ $t('photo.fileCount')
				}}</span>
			</div>
			<!-- 加入相册 取消 已选 手机ui -->
			<div class="bottom-root-mobile">
				<!-- 添加到相册按钮 -->
				<my-btn-icon v-if="showAddToAlbum" style="margin-right:10px;" iIcon="md-add"
					@click="onAddToAlbum"></my-btn-icon>
				<!-- 从相册移除 -->
				<my-btn-icon v-if="showRemoveFromAlbum" style="margin-right:10px;" iIcon="md-remove"
					@click="removeFromAlbum"></my-btn-icon>
				<!-- 删除按钮 -->
				<my-btn-icon type="red" style="margin-right:10px;" iIcon="md-trash" @click="trashPhotos(1)"></my-btn-icon>
				<!-- 取消 -->
				<my-btn-icon type="white" style="margin-right:10px;" iIcon="md-close" @click="onUnSelect"></my-btn-icon>
			</div>
			<!-- 加入相册按钮/取消已选 -->
			<div class="bottom-root-pc">
				<!-- 添加到相册按钮 -->
				<my-btn v-if="showAddToAlbum" @click="onAddToAlbum" :title="$t('photo.addToAlbum')"></my-btn>
				<!-- 从相册移除 -->
				<my-btn v-if="showRemoveFromAlbum" @click="removeFromAlbum" :title="$t('photo.removeFromAlbum')">
				</my-btn>
				<!-- 删除按钮 -->
				<my-btn @click="trashPhotos(1)" type="red" :title="$t('common.delete')">
				</my-btn>
				<!-- 取消 -->
				<my-btn @click="onUnSelect" :title="$t('common.cancel')" type="white"></my-btn>
			</div>
		</div>

		<!-- 在回收站内显示的ui -->
		<div v-if="trashMode" style="display: flex;flex-direction: row;justify-content: space-between;width: 100%;">
			<div style="display: flex;flex-direction: row;align-items: center;">
				<div class="left-root" @click="trashPhotos(0)">
					<my-btn v-if="selectedList.length > 0" :title="$t('file.restore') + ':' + selectedList.length">
					</my-btn>
					<!-- 全部恢复 -->
					<my-btn v-if="selectedList.length <1" :title="$t('file.restoreAll')"></my-btn>
				</div>
				<div class="right-root" @click="deleteFromDisk()">
					<my-btn v-if="selectedList.length > 0" type="red"
						:title="$t('file.delete') + ':' + selectedList.length"></my-btn>
					<!-- 全部删除 -->
					<my-btn v-if="selectedList.length <1" :title="$t('file.deleteAll')" type="red"></my-btn>
				</div>
			</div>
			<!-- 取消已选 -->
			<my-btn style="margin-right: 30px;" v-if="selectedList.length > 0" @click="onUnSelect"
				:title="$t('common.cancel')" type="white"></my-btn>
		</div>

		<!-- 相册选择modal 让用户选择添加到哪个相册 -->
		<vs-dialog v-model="showSelectAlbum">
			<template #header>
				<h4 style="font-size: 16px;">
					{{ $t('photo.whichAlbumWanToAdd') }}
				</h4>
			</template>
			<Form label-position="top">
				<!-- 待选相册列表 -->
				<CellGroup>
					<div v-for="(album, index) in albumList" @click="onAddToAlbumSelect(album)">
						<Cell :title="album.name" />
					</div>
				</CellGroup>
			</Form>
		</vs-dialog>

	</div>
</template>

<script>
export default {
	name: "photo-bottom-select",
	props: {
		showAddToAlbum: {
			default: true,
			type: Boolean
		},
		showRemoveFromAlbum: {
			default: false,
			type: Boolean
		},
		editMode: {
			default: false,
			type: Boolean
		},
		ordinaryAlbumId: {
			default: '',
			type: String
		},
		photoList: {
			type: Array,
			default: () => []
		},
		trashMode: false //回收站模式 和正常模式ui不一样
	},
	data() {
		return {
			albumList: [],
			showSelectAlbum: false,
			selectedList: []
		};
	},
	mounted() {
		console.log("created onTrashMsg")

		this.$bus.$on('onTrashMsg', (photoIndexId) => {
			console.log("onTrashMsg onTrashMsg onTrashMsg",photoIndexId)
			this.inOutTrashApi(1, false, [photoIndexId], () => {
				this.$bus.$emit("removeIndexById", photoIndexId)
			})
		})
	},
	beforeDestroy() {
		console.log("beforeDestroy onTrashMsg")
		this.$bus.$off('onTrashMsg')
	},
	methods: {
		//点击按钮添加到普通相册 弹出modal让用户选择添加到哪个相册
		onAddToAlbum() {
			if (this.albumList.length > 0) {
				this.showSelectAlbum = true
			} else {
				this.getAlbumList(() => {
					this.showSelectAlbum = true
				})
			}
		},
		removeFromAlbum() {
			if (this.selectedList.length < 1) {
				return
			}
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('photo.removeFromAlbum') + "?", () => {
				this.api
					.post("/api/ordinaryAlbumApi/deleteFromAlbum", {
						indexIdArr: this.selectedList,
						albumId: this.ordinaryAlbumId
					})
					.then((res) => {
						if (!res.code) {
							console.log('deleteFromAlbum')
							this.showVsNotification(this.$t('photo.removeFromAlbumSuc'));
							this.$emit('onRemoveFromAlbum')
							this.$emit('onUnSelect')
						}
					})
					.catch((error) => { });
			})
		},
		onAddToAlbumSelect(album) {
			//在弹出的选择相册对话框中选择了具体要添加到的相册
			if (this.selectedList.length < 1) {
				return
			}
			this.api
				.post("/api/ordinaryAlbumApi/addToAlbum", {
					indexIdArr: this.selectedList,
					albumId: album.id
				})
				.then((res) => {
					if (!res.code) {
						this.$emit('onUnSelect')
						this.showSelectAlbum = false
						this.showVsNotification(this.$t('photo.addAlbumSuc'))
					}
				})
				.catch((error) => { });

		},
		onUnSelect() {
			this.$emit('onUnSelect')
		},
		getAlbumList(suc) {
			this.api
				.post("/api/ordinaryAlbumApi/getAllAlbum", {
					cover: false
				})
				.then((res) => {
					if (!res.code) {
						if (res.data.length > 0) {
							this.albumList = res.data;
							if (suc) {
								suc()
							}
						} else {
							this.showVsAlertDialog(this.$t('common.alert'), this.$t('photo.youHaveNoAlbum'))
						}
					}
				})
				.catch((error) => { });
		},
		inOutApi(trash, needRefresh) {
			this.inOutTrashApi(trash, needRefresh, this.selectedList, () => {
				this.selectedList = []
				if (trash == 1) {
					this.$emit('onTrashInSuc')
					this.showVsNotification(this.$t('file.putInTrashSuc'));
					this.$emit('onUnSelect')
				} else {
					this.$emit('onTrashOutSuc')
					this.showVsNotification(this.$t('file.putOutTrashSuc'));
				}
				if (needRefresh) {
					//是否需要通知照片列表进行刷新
					this.$emit('onNeedRefresh')
				}
			})
		},
		inOutTrashApi(trash, needRefresh, idList, onSuc) {
			this.api.post('/api/fileApi/inOutTrash', {
				ids: idList,
				trash: trash
			}).then((res) => {
				if (!res.code) {
					if (onSuc) { onSuc() }


				}
			}).catch((error) => { })
		},
		// 恢复全部已选
		restoreAll(photoList) {
			this.showVsConfirmDialog(this.$t('common.confirm'), photoList.length + this.$t('file.doAllRestore'),
				() => {
					for (let i = 0; i < photoList.length; i++) {
						photoList[i].selected = true
						this.selectedList.push(photoList[i].id)
					}
					this.inOutApi(0, true)
				})
		},
		//彻底删除全部已选
		deleteAll(photoList) {
			this.showVsConfirmDialog(this.$t('common.confirm'), photoList.length + this.$t('file.doAllDelete'), () => {
				for (let i = 0; i < photoList.length; i++) {
					photoList[i].selected = true
					this.selectedList.push(photoList[i].id)
				}
				this.deleteApi(true)
			})
		},
		trashPhotos(trash) {
			if (this.selectedList.length < 1 && this.trashMode) {
				//全部恢复点击
				this.$emit('restoreAll')
			} else {
				this.inOutApi(trash)
			}
		},
		deleteApi(needRefresh) {
			this.api.post('/api/fileApi/deleteFromDisk', {
				ids: this.selectedList
			}).then((res) => {
				if (!res.code) {
					//删除成功的id
					let deletedIds = res.deletedIds
					this.selectedList = []
					this.showVsNotification(deletedIds.length + this.$t('file.fileDeleteSuc'));
					this.$emit('onDeleteSuc', deletedIds)
					if (needRefresh) {
						this.showVsAlertDialog(this.$t('common.alert'), this.$t('common.operationSuccess') + ":" + this.$t('common.checkAfter'), () => {
							//是否需要通知照片列表进行刷新
							this.$emit('onNeedRefresh')
						});
					}
				}
			}).catch((error) => { })
		},
		deleteFromDisk() {
			if (this.selectedList.length < 1 && this.trashMode) {
				//全部删除点击
				this.$emit('deleteAll')
			} else {
				this.showVsConfirmDialog(this.$t('common.confirm'), this.selectedList.length + this.$t(
					'file.doAllDelete'), () => {
						this.deleteApi(true)
					})
			}
		},
		addSelected(id) {
			this.selectedList.push(id)
		},
		removeSelected(id) {
			for (let i = this.selectedList.length; i >= 0; i--) {
				if (this.selectedList[i] == id) {
					this.selectedList.splice(i, 1);
				}
			}
		},
		//清除已选数据
		clearSelected() {
			this.selectedList = []
		},
	}
}
</script>

<style lang="scss" scoped>
.bottom-root {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-right: 10px;
	display: none;
}

.bottom-root-mobile {
	@extend .bottom-root;

	@media all and (max-width:640px) {
		display: flex;
	}
}

.bottom-root-pc {
	@extend .bottom-root;

	@media not all and (max-width:640px) {
		display: flex;
	}
}

.bottom-btn {
	margin-left: 10px;
}

.bottom-select-root {
	// 多选后的底部操作栏
	position: relative;
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	background-color: rgba(0, 0, 0, 0.7);
	// border-top-left-radius: 20px;
	// border-top-right-radius: 20px;
	padding-left: 20px;

	.select-text {
		color: white;
		font-size: 1rem;
	}

}

.icon-btn-trash {
	width: 25px;
}

.left-root {
	margin-right: 10px;
	display: flex;
	flex-direction: row;
	align-items: center;
}

.right-root {
	display: flex;
	flex-direction: row;
	align-items: center;
}


// 覆盖iview按钮的自带border颜色
.ivu-btn {
	border: 0px;
	border-color: transparent !important;
}
</style>
