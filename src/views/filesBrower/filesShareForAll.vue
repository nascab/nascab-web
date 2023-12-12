<template>
	<div class="source-setting-root" :class="{ 'setting-padding': hasPadding }">
		<div class="content-root">
			<div class="flex-row" style="justify-content: right;flex-wrap: wrap;">
					<!-- 顶部文字提示 -->
					<p class="add-title">{{ $t('file.shareFolderAlert') }}</p>
			</div>
			<Divider></Divider>
			<div v-if="pathList.length > 0" style="width: 100%;overflow: auto;height: 100%;">
				<Card style="margin-bottom: 20px; width: 100%;border-radius: 10px;" v-for="(item, index) in pathList">
					<!-- 当前路径 -->
					<div class="item-title">
						<span class="item-label">{{ $t('file.sharePath') }} : </span>{{ item.path }}
					</div>
					<!-- 当前状态 -->
					<div class="item-title">
						<span class="item-label">{{ $t('common.state') }} : </span><span
							:style="{ color: item.exist == 0 ? '#DE4545' : '#386DF2' }" style="font-weight: bold;">{{
								item.exist == 0
								? $t('common.unavailable') : $t('common.available')
							}}</span>
						<!-- 目录已经移动到其他位置 -->
						<a v-if="item.exist == 0" @click="onShowRelocate(item)" style="margin-left: 30px;">{{
							$t('setting.source.directoryMoved')
						}}</a>
					</div>
					
					<!-- 删除按钮 -->
					<span @click="deletePath(item)"
						style="position: absolute;right: 10px;bottom: 10px;font-size: 20px;cursor: pointer;color: #99AABF;"
						class="nasIcons icon-trash"></span>
				</Card>

				<!-- 新增按钮 -->
				<Card style="margin-bottom: 20px; width: 100%;border-radius: 10px;cursor: pointer;">
					<div @click="selectPath"
						style="width: 100%;height: 100%;display: flex;justify-content: center;align-items: center;padding-left:30px;padding-right: 30px;">
						<span class="nasIcons icon-add-album"
							style="color: #386DF2;font-size: 50px;margin-right: 20px;"></span>
						<p class="add-text">{{ $t('file.addShareFoler') }}</p>
					</div>
				</Card>

			</div>
		</div>
		<my-nodata v-if="pathList.length < 1" @onBtnClick="selectPath" :title="$t('file.shareFolderAlert')"
			:btnTitle="$t('file.addShareFoler')" style="position: absolute;width: 100%;margin-top: 150px;">
		</my-nodata>
		<!-- 文件树 -->
		<vs-dialog v-model="showChooseFolder" prevent-close scroll :full-screen="isMobile">
			<template #header>
				<h4 style="font-size: 16px;">
					{{ $t('file.chooseFolder') + '[' + $t('file.doubleClickFolderEnter') + ']' }}
				</h4>
			</template>
			<file-select ref="fileSelector" @cancel="showChooseFolder = false" v-if="showChooseFolder" parent="root"
				:type="2" @onSelect='onSelectPath' @onCancel="showChooseFolder = false"></file-select>
			<template #footer>
				<file-select-bar @back="$refs.fileSelector.goBack()" @select="$refs.fileSelector.onSelect()"
					@create="(newFolderName) => $refs.fileSelector.createNewFolder(newFolderName)"></file-select-bar>
			</template>
		</vs-dialog>
	</div>
</template>

<script>
import fileSelectBar from "@/components/file-select/file-select-bar.vue"
import fileSelect from "@/components/file-select/file-select.vue"

export default {
	props: {
		hasPadding: {
			default: false,
			type: Boolean
		}
	},
	mounted() {
		this.getPathList()
	},
	components: {
		fileSelectBar,
		fileSelect
	},

	data() {
		return {
			canAddPath: true, //在electron内选文件夹会短时间内回调两次 弄个标记做一下防重
			showChooseFolder: false,
			pathList: [],
			selectedItem: {},
			publicUserName:"nascabPublicUser"
		}
	},
	computed: {

	},
	methods: {
		onFolderBack() {
			if (this.$refs.fileSelector) this.$refs.fileSelector.goBack()
		},
		onSelectPath(path) {
			this.addPathReq(path)
			this.showChooseFolder = false
		},
		getPathList() {
			this.api.post('/api/usersApi/getUserPower', {
				username: this.publicUserName
			}).then((res) => {
				if (!res.code) {
					this.pathList=res.userPower
				}
			}).catch((error) => {
				this.showVsNotification(this.$t('common.getFail'))
			})
		},
		selectPath() {
			this.showChooseFolder = true
		},
		addPathReq(setPath) {
			this.api.post('/api/usersApi/setUserPower', {
				username: this.publicUserName,
				path: setPath,
				server_type: "folder",
				power_get: 1
			}).then((res) => {
				if (!res.code) {
					this.showVsNotification(this.$t('common.operationSuccess'))
					this.getPathList()
				}
			}).catch((error) => { })
		},
		deletePath(path) {
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('setting.ifDeletePath'), () => {
				//删除目录
				this.api.post('/api/usersApi/cancelUserPathPower', {
					username:this.publicUserName,
					path: path.path,
					server_type: "folder"
				}).then((res) => {
					if (!res.code) {
							this.getPathList()
					}
				}).catch((error) => { })
			})
		}
	}
}
</script>

<style lang="scss" scoped>

.source-setting-root {

	background-color: rgba(255, 255, 255, 0.6);
	padding: 10px;

	@media not all and (max-width:640px) {
		padding: 20px;
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
	}

	height: 100%;
	display: flex;
	justify-content: flex-start;
	flex-direction: column;
	align-items: center;
	width: 100%;
	overflow: hidden;

	.content-root {
		padding: 20px;
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
		background-color: white;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		width: 100%;
		height: 100%;
		position: relative;
	}

	.add-title {
		font-size: 16px;
		text-align: left;
	}
}

.item-title {
	word-break: break-all;
	margin-top: 15px;
	margin-bottom: 15px;
	width: 100%;
	text-align: left;
	font-size: 14px;
	display: flex;
	align-items: center;

	.item-label {
		font-weight: bold;
		margin-right: 10px;
	}
}

.add-text {
	color: $nas-grey;
	font-size: 20px;
}

.setting-padding {
	padding-top: 20px;
	position: relative;
	width: 100%;
	height: 100%;
	padding-left: 10px;
	padding-right: 10px;

	@media not all and (max-width:640px) {
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
		padding-left: 20px;
		padding-right: 20px;
	}


}
</style>
