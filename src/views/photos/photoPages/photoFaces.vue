<template>
		<div class="album-root-wrapper">
			<!-- 无数据提示 -->

			<div
				style="position: absolute;width: 100%;margin-top:150px;display:flex;flex-direction: column;align-items:center">
				<my-nodata v-if="!loading && dataList.length < 1" :title="$t('photo.noPersonPlaceHolder')">
				</my-nodata>
				<my-btn v-if="!enable" @click="enableAiFace" :title="$t('photo.enableAiFace')" style="margin-top:20px;">
				</my-btn>

				<div style="margin-top:10px" v-if="enable&&dealState">[{{ dealState }}]</div>
			</div>

			<div style="width:100%;display:flex;height: 100%;flex-direction:row;overflow: hidden;">
				<!-- 分类列表 -->
				<div class="album-list-root" ref="listWrapper">
					<vs-card v-for="(item, index) in dataList" type='1' @click="onAlbumClick(index)"
						@contextmenu="showRightMenu($event, $root, item, index)"
						:style="{ 'margin': itemMargin + 'px', 'width': itemWidth + 'px' }"
						@mouseenter="mouseEnterImg(index)" @mouseleave="mouseLeaveImg(index)"
						@touchstart="touchstart(item, index)" @touchend="touchend">
						<template #title>
							<div
								style="display: flex;align-items: center;width: 100%;justify-content: center;margin-top: 10px;">
								<p class="item-name max-line-one">{{
									item.face_name ? item.face_name :
									$t('photo.unnamed')
								}}</p>
							</div>
						</template>
						<template #img>
							<img style="object-fit: cover;pointer-events: none;" v-if="item.url"
								:style="{ 'width': itemWidth + 'px', 'height': itemWidth + 'px' }" v-lazy="item.url" />
							<img v-else style="object-fit: cover;pointer-events: none;"
								:style="{ 'width': itemWidth + 'px', 'height': itemWidth + 'px' }"
								src="@/static/photo/icon-album-empty.png" />
							<!-- 选中后的遮罩层 -->
							<div v-if="item.selected"
								style="width:100%;height:100%;background-color:rgba(0, 0, 0, 0.5);position: absolute;display: flex;align-items: center;justify-content: center;">
								<Icon type="md-checkmark-circle-outline" color='white' size='50' />
							</div>
						</template>
						<template #text >
							<p style="text-align: center;margin-top: 5px;" v-if="$store.state.currentUser.is_admin == 1">{{
								$t('photo.photoCount', { photoCount: item.face_photo_count }) }}</p>
								<p v-else></p>
						</template>
						<template #interactions>

							<div v-if="item.hover && !selectMode"
								style="display: flex;justify-content: flex-end;width: 100%;">
								<!-- 编辑按钮 -->
								<vs-button class="btn-chat" shadow @click.stop="onShowChangeName(index)">
									<span class="nasIcons icon-bianji"></span>
								</vs-button>

								<vs-button class="btn-chat" shadow @click.stop="itemSelect(index)">
									<span class="nasIcons icon-setting-common"
										:style="{ 'color': item.selected ? '#386DF2' : '' }"></span>
								</vs-button>
							</div>


						</template>
					</vs-card>
					<div style="width:100%;height:80px"></div>
				</div>

				<!-- 选择模式下的菜单 -->
				<div v-if="selectMode" class="bottom-select-root">
					<!-- 取消 -->
					<div @click="exitSelectMode">
						<my-btn type="white" icon="md-add" :title="$t('common.cancel')"></my-btn>
					</div>
					<!-- 删除 -->
					<div @click="deleteSelect">
						<my-btn type="red" icon="md-add" :title="$t('common.delete')"></my-btn>
					</div>
					<!-- 合并 -->
					<div @click="mergeSelect">
						<my-btn icon="md-add" :title="$t('photo.mergePerson')"></my-btn>
					</div>
				</div>
			</div>

			<!-- 相册详情对话框 -->
			<Modal :scrollable="false" footer-hide ref="myModal" class-name="modal-style-nopadding"
				v-model="showAlbumDetail" fullscreen :closable="false">

				<album-detail v-if="showAlbumDetail" @onClose="showAlbumDetail = false" :propsShowSearchBtn="false"
					:propsTitle="selectedItem.face_name ? selectedItem.face_name : $t('photo.unnamed')"
					:propsShowAddToAlbum="false" :propsShowDelete="false" :propsShowModeSwitch="false"
					:propsFaceId="selectedItem.id + ''">
				</album-detail>

			</Modal>

			<!-- 修改姓名的对话框 -->
			<vs-dialog v-model="showChangeName">
				<template #header>
					<h4 style="font-size: 16px;">
						{{ $t('photo.inputPersonName') }}
					</h4>
				</template>
				<div class="con-form">
					<img :src="selectedItem.url"
						style=" width: 50px;height: 50px;border-radius: 10px;object-fit: cover;margin-right: 10px;" />
					<div>
						<p class="input-alert">{{ $t('photo.sameNameMerged') }}</p>
					</div>
					<AutoComplete v-model="inputName" :data="autoNameArr" style="width:100%;"
						:placeholder="$t('photo.inputPersonName')">
					</AutoComplete>
				</div>
				<template #footer>
					<div class="footer-dialog">
						<vs-button block @click="onSaveName">
							{{ $t('common.ok') }}
						</vs-button>
						<div style="margin-top: 10px;">
							<a href="#" @click.stop="onDeletePerson"> {{ $t('photo.deletePerson') }}</a>
						</div>
					</div>
				</template>
			</vs-dialog>

			<!-- 右键菜单 -->
			<easy-cm @ecmcb="rightMenuClick" :list="rightMenuList"></easy-cm>

			<!-- 手机端长按条目的时候弹出的菜单 -->
			<vs-dialog v-model="showLongPressMenu">
				<h4 v-if="selectedItem" class="max-line-one" style="word-break:break-all">{{
					selectedItem.face_name ?
					selectedItem.face_name : $t('photo.unnamed')
				}}</h4>
				<my-selector-phone :optionList="rightMenuList"
					@onItemClick="(item) => (rightMenuClick(null, item.type))"></my-selector-phone>
			</vs-dialog>

		</div>
</template>

<script>
import axios from "@/plugins/axios";
import albumDetail from "@/views/photos/photoPages/albumDetail.vue"
import photoBase from "@/views/photos/photoBase";

export default {
	components: {
		albumDetail,
		photoBase
	},
	data() {
		return {
			dealState: "",
			inputName: '',
			autoNameArr: [],
			showChangeName: false,
			rightMenuList: [{
				text: this.$t('file.check'),
				type: "CHECK",
			}, {
				text: this.$t('common.multiSelect'),
				type: "SELECT",
			}, {
				text: this.$t('photo.changeName'),
				type: "MODIFY",
			}, {
				text: this.$t('common.delete'),
				type: "DELETE",
			}],
			changeAlbumName: "",
			itemBaseWidth: 180,
			itemWidth: 180,
			itemMargin: 10,
			selectedItem: '',
			showAlbumDetail: false,
			showAddAlbum: false,
			dataList: [],
			loading: false,
			selectedIndex: false,
			showLongPressMenu: false,
			longPressTimeout: null,
			selectMode: false,
			enable: true,
			checkStateTimeout: null
		}
	},
	mounted() {
		this.getFacesList()
		window.addEventListener("resize", this.calImageWidth);
		window.addEventListener('popstate', this.onPopstate)
		window.addEventListener("scroll", this.onPageScroll, true);

	},
	beforeDestroy() {
		window.removeEventListener("resize", this.calImageWidth);
		window.removeEventListener('popstate', this.onPopstate);
		window.removeEventListener("scroll", this.onPageScroll, true);
		clearTimeout(this.checkStateTimeout)
	},
	methods: {
		//滚动回调
		onPageScroll(e) {
			//滚动时取消长按定时器 防止误触发
			if (this.longPressTimeout) clearTimeout(this.longPressTimeout);
		},
		onPopstate() {
			//后退按钮被点击 如果当前正在播放视频 则关闭视频 如果每播放 则后退
			if (this.showAlbumDetail) {
				this.showAlbumDetail = false
			} else {
				this.$router.go(-1)
			}
		},
		enableAiFace() {
			this.api.post('/api/commonApi/saveConfigPhoto', { aiFaceEnable: '1' }).then((res) => {
				this.getFacesList()
			}).catch((error) => { })
		},
		// 退出选择模式
		exitSelectMode() {
			this.selectMode = false
			for (let i in this.dataList) {
				this.dataList[i].selected = false
			}
		},
		itemSelect(index) {
			this.dataList[index].selected = !this.dataList[index].selected
			this.$forceUpdate()
			let selectMode = false
			for (let i in this.dataList) {
				if (this.dataList[i].selected) {
					selectMode = true
					break
				}
			}
			this.selectMode = selectMode
		},
		getSelectedIdList() {
			let selectedIdList = []
			for (let i in this.dataList) {
				if (this.dataList[i].selected) {
					selectedIdList.push(this.dataList[i].id)
				}
			}
			return selectedIdList
		},
		//删除已选
		deleteSelect() {
			this.onDeletePerson(this.getSelectedIdList())
		},
		//合并已选
		mergeSelect() {
			let selectedIdList = this.getSelectedIdList()
			if (selectedIdList.length < 2) {
				return this.showVsNotification(this.$t('photo.atleastTwoPersonMerge'))
			}
			this.showVsConfirmDialog(
				this.$t('common.confirm'),
				this.$t('photo.mergePersonAlert'), () => {
					//保存人物名称
					this.api
						.post("/api/photoApi/mergeFace", {
							faceIdList: selectedIdList
						})
						.then((res) => {
							if (!res.code) {
								this.showVsNotification(this.$t('common.operationSuccess'))
								this.getFacesList()
								this.exitSelectMode()
							}
						})
						.catch((error) => { });
				})
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
			this.selectedItem = item
			this.selectedIndex = index
			this.showLongPressMenu = true
		},
		onShowChangeName(index) {
			this.selectedIndex = index
			this.selectedItem = this.dataList[index]
			if (this.selectedItem.face_name) {
				this.inputName = this.selectedItem.face_name
			} else {
				this.inputName = ""
			}
			this.showChangeName = true
		},
		onSaveName() {
			if (!this.inputName) {
				return this.showVsNotification(this.$t('photo.inputPersonName'))
			} else if (this.inputName.length > 50) {
				return this.showVsNotification(this.$t('photo.personNameTooLong'))
			}
			this.showVsConfirmDialog(
				this.$t('common.confirm'),
				this.$t('photo.changeUserName', {
					name: this.inputName
				}), () => {
					//保存人物名称
					this.api
						.post("/api/photoApi/updatePhotoFace", {
							faceId: this.selectedItem.id,
							faceName: this.inputName
						})
						.then((res) => {
							if (!res.code) {
								this.showVsNotification(this.$t('common.operationSuccess'))
								this.getFacesList()
								this.showChangeName = false
							}
						})
						.catch((error) => { });
				})
		},
		onDeletePerson(faceIdList) {
			this.showVsConfirmDialog(
				this.$t('common.confirm'),
				this.$t('photo.sureDeletePerson'), () => {
					let params = {
						disabled: 1
					}
					if (faceIdList) {
						params.faceIdList = faceIdList
					} else {
						params.faceId = this.selectedItem.id
					}
					//保存人物名称
					this.api
						.post("/api/photoApi/updatePhotoFace", params)
						.then((res) => {
							if (!res.code) {
								this.showVsNotification(this.$t('common.operationSuccess'))
								this.getFacesList()
								this.showChangeName = false
								this.exitSelectMode()
							}
						})
						.catch((error) => { });
				})
		},
		mouseEnterImg(index) {
			if (this.isMobile) return
			this.$set(this.dataList[index], "hover", true);
		},
		mouseLeaveImg(index) {
			if (this.isMobile) return
			this.$set(this.dataList[index], "hover", false);
		},
		showRightMenu(event, root, classVal, index) {
			if (this.isMobile) return event.preventDefault()

			this.selectedIndex = index
			this.selectedItem = classVal
			this.$easycm(event, root)
		},
		//右键菜单点击
		rightMenuClick(indexList, clickType) {
			this.showLongPressMenu = false
			let type = clickType ? clickType : this.rightMenuList[indexList[0]].type
			if (type == 'CHECK') { //查看
				this.onAlbumClick(this.selectedIndex)
			} else if (type == "DELETE") {
				this.onDeletePerson()
			} else if (type == "MODIFY") {
				this.onShowChangeName(this.selectedIndex)
			} else if (type == 'SELECT') {
				this.itemSelect(this.selectedIndex)
			}
		},
		//计算item宽度
		calImageWidth() {
			// if (this.dataList.length < 2) {
			// 	return
			// }
			let wrapper = this.$refs.listWrapper.getBoundingClientRect();
			let itemWidth = this.utils.calItemWidth(wrapper, this.itemBaseWidth, this.itemMargin)
			if (itemWidth) this.itemWidth = itemWidth
		},
		onAlbumClick(index) {
			if (this.selectMode) {
				this.itemSelect(index)
			} else {
				this.selectedItem = this.dataList[index]
				this.showAlbumDetail = true
				this.pushState()
			}
		},
		getFacesList() {
			this.autoNameArr = []
			this.loading = true
			this.api
				.post("/api/photoApi/getPhotoFaces", {})
				.then((res) => {
					if (!res.code) {
						this.dataList = res.data;
						this.enable = res.enable
						console.log('人脸数量', this.dataList.length)
						for (let i = 0; i < this.dataList.length; i++) {
							let faceObj = this.dataList[i]
							let url = axios.getFaceImageUrl(faceObj.id);
							this.dataList[i].url = url + '&time=' + new Date().getTime()
							if (this.autoNameArr.length < 10 && faceObj.face_name) {
								this.autoNameArr.push(faceObj.face_name)
							}
							this.dataList[i].selected = false
						}
						if (this.dataList.length < 1 && this.enable) {
							//没有人脸 查一下是不是还在处理中
							this.getFaceDealState()
						}
						this.$nextTick(() => {
							this.calImageWidth()
						});
					}
					this.loading = false
				})
				.catch((error) => {
					this.loading = false
				});
		},
		//获取人脸处理状态
		getFaceDealState() {
			this.api
				.post("/api/photoApi/getAiDealState", {
					hideLoading: true,
					type: "faceapi"
				})
				.then((res) => {
					if (!res.code) {
						if (res.data) {
							if (res.data.isIndexing == 1) {
								this.dealState = this.$t("photo.indexingNoAi")
							} else if(res.data.faceApiWaitDealCount){
								//正在扫描
								this.dealState = this.$t("photo.waitDealCount", { count: res.data.faceApiWaitDealCount })
								if (res.data.faceApiWaitDealCount > 1 ) {
									this.checkStateTimeout = setTimeout(() => {
										this.getFaceDealState()
									}, 8000);
								}
							}else if(res.data.faceApiWaitCompareCount){
								//正在对比
								this.dealState = this.$t("photo.waitCompareFaceCount", { count: res.data.faceApiWaitCompareCount })
								if (res.data.faceApiWaitCompareCount>1) {
									this.checkStateTimeout = setTimeout(() => {
										this.getFaceDealState()
									}, 8000);
								}
							}
						}
					}
				})
				.catch((error) => {
				});
		}
	}
}
</script>
<style lang="scss" scoped>
.bottom-select-root {
	// 多选后的底部操作栏
	position: absolute;
	bottom: 0;
	left: 0;
	height: 60px;
	width: 100%;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-end;
	background-color: rgba(0, 0, 0, 0.7);
	padding-left: 20px;
	padding-right: 20px;
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

// 覆盖iview按钮的自带border颜色
.ivu-btn {
	border: 0px;
	border-color: transparent !important;
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

.icon-add {
	margin-top: 30px;
	margin-bottom: 20px;
	font-size: 50px;
	color: $nas-main;
}

.album-root-wrapper {
	position: relative;
	z-index: 1;
	width: 100%;
	height: 100%;


}

.album-list-root {
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

.item-name {
	font-weight: bold;
	text-align: center;
	line-height: 16px;
	font-size: 16px;
	color: $nas-text-title;
	margin-right: 5px;
}

.item-edit {
	text-align: center;
	line-height: 16px;
	font-size: 16px;
	color: $nas-grey;
}

.input-alert {
	color: $nas-grey;
	font-size: 14px;
	margin-bottom: 10px;
}

::v-deep .vs-card__interactions {
	right: 0 !important;
	width: 100%;

	button {
		width: 30px;
		height: 30px;
	}
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
