<template>
	<div class="private-root">
		<my-bg></my-bg>
		<div class="nas-mobile-none">
			<p class="my-header-position"></p>
		</div>
		<div class="nas-mobile-none">
			<my-header></my-header>
		</div>
		<my-btn-icon v-if="!isFromApp" type="grey" class="nas-mobile-show" style="position:fixed;bottom:50px;left:15px;z-index:1000" iIcon="md-home" @click="goHome"></my-btn-icon>
		<!-- 无数据提示 -->
		<my-nodata v-if="!loading && spaceList.length < 1" @onBtnClick="showAddModal = true"
			:title="$t('private.privateSpaceDescA')"
			style="position: absolute;width: 100%;margin-top: 250px;z-index:2;">
		</my-nodata>

		<div class="main-layout  nas-padding-right-zero nas-padding-left-zero">
			<div class="private-list-parent">
				<div class="header-root">
					<div style="display: flex;white-space: nowrap;">
						<my-btn @click="showAddModal = true" :title="$t('private.addPrivateSpace')"></my-btn>
						<my-btn @click="showImportModal = true" :title="$t('common.import')"></my-btn>
						<!-- 导出空间数据 -->
						<my-btn type="white" @click="exportFolderPath = ''; showExportModal = true"
							:title="$t('common.export')">
						</my-btn>
					</div>
				</div>
				<div class="private-list-root">
					<div ref="privateWrapper"
						style=" width:100%;height: 100%;display:flex;flex-direction:row;overflow: auto;;flex-wrap: wrap;">
						<vs-card v-for="(space, index) in spaceList" type='1' @click="spaceClick(space)"
							:style="{ 'margin': itemMargin + 'px', 'width': itemWidth + 'px' }"
							@contextmenu="showRightMenu($event, $root, space, index)"
							@touchstart="touchstart(space, index)" @touchend="touchend">
							<template #title>
								<h3
									style="text-align: left;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">
									{{ space.space_name }}
								</h3>
							</template>
							<!-- 空间名称 -->
							<template #img>
								<img src="@/static/private/bg-item.png" style="pointer-events: none;"
									:style="{ 'width': itemWidth + 'px', 'height': itemWidth + 'px' }" />
							</template>
							<!-- 创建日期 -->
							<template #text>
								<div style="display: flex;justify-content: flex-start;width: 100%;">
									<p style="word-break: break-all;text-align: left;pointer-events: none;" class="max-line-one">
										{{ space.create_time }}
									</p>
								</div>
							</template>
							<template #interactions>
								<vs-button danger icon @click.stop="deleteSpace(space)">
									<Icon type="ios-beaker" />
								</vs-button>
								<vs-button icon class="btn-chat" shadow primary
									@click.stop="showChangeNameModal(space)">
									<Icon type="md-settings" />
								</vs-button>
							</template>
						</vs-card>
					</div>
				</div>
			</div>
		</div>
		<!-- 输入密码的对话框 -->
		<my-dialog-input @onOkClick="checkPwd" :isPwd="true" :showCloseBtn="true" ref="inputPwdDialog"
			:closeOnClickBtn="false" :clearOnOpen="true" :title="$t('private.inputSpacePwd')"
			:content="$t('private.inputSpacePwd')">
		</my-dialog-input>
		<!-- 输入空间新名字对话框 -->
		<my-dialog-input :initValue="spaceNewName" @onOkClick="changeSpaceName" :showCloseBtn="true" ref="renameDialog"
			:title="$t('private.changeSpaceName')">
		</my-dialog-input>

		<!--添加加密空间对话框 -->
		<vs-dialog v-model="showAddModal">
			<template #header>
				<h4 style="font-size: 16px;">
					{{ $t('private.addPrivateSpace') }}
				</h4>
			</template>
			<space-add v-if="showAddModal" @onSuccess="onAddSuccess"></space-add>
		</vs-dialog>

		<!--导入加密空间对话框 -->
		<vs-dialog v-model="showImportModal">
			<template #header>
				<h4 style="font-size: 16px;">
					{{ $t('private.importPrivateSpace') }}
				</h4>
			</template>
			<space-import v-if="showImportModal" @onSuccess="onAddSuccess"></space-import>
		</vs-dialog>

		<!--导出空间数据对话框 -->
		<vs-dialog v-model="showExportModal">
			<template #header>
				<h4 style="font-size: 16px;">
					{{ $t('private.exportSpaceData') }}
				</h4>
			</template>
			<space-export v-if="showExportModal" @onSuccess="onAddSuccess" :exportFolderPath="exportFolderPath">
			</space-export>
		</vs-dialog>


		<!-- 空间详情 -->
		<Modal class-name="space-detail-modal" footer-hide ref="spaceDetail" v-model="showSpaceDetail" fullscreen
			:closable="false" @on-visible-change="onDetailVisibleChange">

			<space-detail @onClose="(showSpaceDetail = false)" ref="spaceDetail" v-if="showSpaceDetail"
				:propsSelectedSpace="selectedSpace">
			</space-detail>
		</Modal>

		<easy-cm @ecmcb="rightMenuClick" :list="rightMenuList"></easy-cm>

		<!-- 手机端长按条目的时候弹出的菜单 -->
		<vs-dialog v-model="showLongPressMenu">
			<h4 v-if="selectedSpace" class="max-line-one" style="word-break:break-all">{{ selectedSpace.space_name }}
			</h4>
			<my-selector-phone :optionList="rightMenuList" @onItemClick="(item)=>(rightMenuClick(null, item.type))"></my-selector-phone>
		</vs-dialog>
	</div>
</template>

<script>
import myHeader from "@/components/my-header/my-header.vue"
import spaceAdd from "@/views/privateSpace/spaceAdd.vue"
import spaceImport from "@/views/privateSpace/spaceImport.vue"
import base64 from '@/plugins/base64/index.js' // 导入vue-i18n
import spaceDetail from "@/views/privateSpace/spaceDetail.vue"
import spaceExport from "@/views/privateSpace/spaceExport.vue"

export default {
	components: {
		myHeader,
		spaceAdd,
		spaceDetail,
		spaceImport,
		spaceExport
	},
	data() {
		return {
			rightMenuList: [{
				text: this.$t('file.check'),
				type: "CHECK",
			}, {
				text: this.$t('private.spaceInfo'),
				type: "INFO",
			}, {
				text: this.$t('photo.changeName'),
				type: "MODIFY",
			}, {
				text: this.$t('private.exportSpaceData'),
				type: "EXPORT"
			}, {
				text: this.$t('common.delete'),
				type: "DELETE",
			}],
			spaceNewName: "",
			itemBaseWidth: 230,
			itemWidth: 230,
			itemMargin: 10,
			showExportModal: false,
			showImportModal: false,
			showSpaceDetail: false,
			inputPwd: "",
			selectedSpace: null,
			showAddModal: false,
			spaceList: [],
			loading: false,
			exportFolderPath: "",
			longPressTimeout: null,
			showLongPressMenu: false
		}
	},
	mounted() {
		this.getSpaceList()
		window.addEventListener("resize", this.calImageWidth);
	},
	beforeDestroy() {
		window.removeEventListener("resize", this.calImageWidth);
	},
	methods: {
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
			this.selectedSpace = item
			this.showLongPressMenu = true
		},

		showRightMenu(event, root, val, index) {
			if (this.isMobile) return event.preventDefault()

			this.selectedSpace = val
			this.$easycm(event, root)
		},
		onDetailVisibleChange(visible) {
			if (!visible) {
				this.api
					.post("/api/privateSpaceApi/exitSpaceId", {
						spaceId: this.selectedSpace.id
					})
					.then((res) => {

					})
					.catch((error) => { });
			}
		},
		//计算item宽度
		calImageWidth() {
			let wrapper = this.$refs.privateWrapper.getBoundingClientRect();
			let itemWidth = this.utils.calItemWidth(wrapper, this.itemBaseWidth, this.itemMargin)
			if (itemWidth) this.itemWidth = itemWidth
		},
		//右键菜单点击
		rightMenuClick(indexList, clickType) {
			this.showLongPressMenu = false
			let type = clickType ? clickType : this.rightMenuList[indexList[0]].type
			if (type == 'CHECK') { //查看
				this.spaceClick(this.selectedSpace)
			} else if (type == "DELETE") {
				this.deleteSpace(this.selectedSpace)
			} else if (type == "MODIFY") {
				this.showChangeNameModal(this.selectedSpace)
			} else if (type == 'EXPORT') {
				this.exportFolderPath = this.selectedSpace.folder_path
				this.showExportModal = true
			} else if (type == 'INFO') {
				this.showVsAlertDialog(null, this.$t('private.spaceFolder') + ':' + this.selectedSpace.folder_path)
			}
		},

		showChangeNameModal(space) {
			this.selectedSpace = space
			this.spaceNewName = space.space_name
			this.$refs.renameDialog.setShow(true)
		},
		changeSpaceName(inputVal) {
			this.spaceNewName = inputVal
			//修改空间名称
			this.api
				.post("/api/privateSpaceApi/updateSpaceName", {
					spaceId: this.selectedSpace.id,
					spaceName: this.spaceNewName
				})
				.then((res) => {
					if (!res.code) {
						this.showVsNotification(this.$t('common.operationSuccess'))
						this.getSpaceList()
					}
				})
				.catch((error) => { });
		},
		deleteSpace(space) {
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('private.deleteSpaceAlert'), () => {
				setTimeout(() => {
					this.showVsConfirmDialog(this.$t('common.confirm'), this.$t(
						'private.sureDeleteSpace') + this.$t('private.spaceName') + ":" + space
							.space_name, () => {
								this.api
									.post("/api/privateSpaceApi/deleteSpace", {
										spaceId: space.id
									})
									.then((res) => {
										if (!res.code) {
											this.showVsNotification(this.$t(
												'common.operationSuccess'))
											this.getSpaceList()
										}
									})
									.catch((error) => { });
							})
				}, 300);
			})
		},
		spaceClick(item) {
			this.selectedSpace = item
			this.inputPwd = ''
			this.$refs.inputPwdDialog.setShow(true)
		},
		checkPwd(pwdVal) {
			this.inputPwd = pwdVal
			let pwdBase64 = base64.encode(this.inputPwd)
			this.api
				.post("/api/privateSpaceApi/checkPwd", {
					checkStr: pwdBase64,
					spaceId: this.selectedSpace.id
				})
				.then((res) => {
					if (!res.code) {
						this.$refs.inputPwdDialog.setShow(false)
						//密码验证成功 保存到vuex
						this.$store.state.privateSpace[this.selectedSpace.id] = res.token

						if (this.isMobile) {
							//手机直接跳转页面
							this.$router.push({
								name: 'spaceDetail',
								params: {
									selectedSpace: this.selectedSpace
								}
							})
						} else {
							this.showSpaceDetail = true
						}
					}
				})
				.catch((error) => { });
		},
		onAddSuccess() {
			this.showAddModal = false
			this.showImportModal = false
			this.showExportModal = false
			this.getSpaceList()
		},
		getSpaceList() {
			this.loading = true
			this.api
				.post("/api/privateSpaceApi/getAllSpace", this.formData)
				.then((res) => {
					if (!res.code) {
						this.spaceList = res.data
						this.$nextTick(() => {
							this.calImageWidth()
						});
					}

					// this.spaceList.push(res.data[0])
					// this.spaceList.push(res.data[0])
					this.loading = false
				})
				.catch((error) => {
					this.loading = false
				});
		}
	}
}
</script>
<style lang="scss" scoped>
::v-deep .vs-input {
	width: 100%;
}

::v-deep .space-detail-modal {
	.ivu-modal-header {
		padding: 0 !important;
	}

	.ivu-modal-body {
		padding: 0 !important;

	}
}


.private-list-parent {
	width: 100%;
	height: 100%;
	overflow: hidden;

	// @media not all and (max-width:640px) {
	// 	padding-left: 20px;
	// 	padding-right: 20px;
	// }

}

.root-wrapper {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
}

.space-root {
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	align-content: flex-start;
	overflow-y: auto;
}

.header-root {
	padding-left: 10px;
	padding-right: 10px;

	@media not all and (max-width:640px) {
		padding-left: 30px;
		padding-right: 30px;
	}

	justify-content: space-between;
	z-index: 1;
	position: absolute;
	height: 80px;
	width: 100%;
	display: flex;
	align-items: center;
}

.private-root {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
}

.private-list-root {
	width: 100%;
	height: 100%;
	padding-top: 80px;

	position: relative;
	position: relative;
	padding-left: 10px;
	padding-right: 10px;

	@media not all and (max-width:640px) {
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
		padding-left: 30px;
		padding-right: 30px;
	}

	background-color: rgba(255, 255, 255, 0.6);
	overflow: hidden;
}

.main-layout {
	position: relative;
	display: flex;
	flex-direction: row;
	width: 100%;
	height: 100%;
	overflow: hidden;
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
