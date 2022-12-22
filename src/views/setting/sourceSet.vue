<template>
	<div class="source-setting-root">


		<!-- 来源设置 -->
		<div
			style="display: flex;flex-direction: column;align-items: flex-start;width: 100%;height: 100%;position: relative;">
			<p v-if="sourceType == 'photo'" class="add-title">{{ $t('setting.photoSourceSettingAlert') }}</p>
			<p v-if="sourceType == 'movie'" class="add-title">{{ $t('setting.movieSourceSettingAlert') }}</p>
			<!-- <div v-if="pathList.length > 0" style="font-weight: bold;margin-top: 20px;">
				{{ $t('setting.yourCurrentSources') }}:
			</div> -->
			<Divider></Divider>

			<my-nodata v-if="pathList.length < 1" @onBtnClick="selectPath"
				:title="sourceType == 'photo' ? $t('setting.photoSourceSettingAlert') : $t('setting.movieSourceSettingAlert')"
				:btnTitle="$t('setting.btAddSource')" style="position: absolute;width: 100%;margin-top: 150px;">
			</my-nodata>

			<div v-else style="width: 100%;overflow: auto;height: 100%;">
				<Card style="margin-bottom: 20px; width: 100%;border-radius: 10px;" v-for="(item, index) in pathList">
					<!-- 当前路径 -->
					<div class="item-title">
						<span style="font-weight:bold">{{ $t('common.path') }} : </span>{{ item.path }}
					</div>
					<!-- 当前状态 -->
					<div class="item-title">
						<span style="font-weight:bold">{{ $t('common.state') }} : </span><span
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
						<p class="add-text">{{ $t('setting.btAddSource') }}</p>
					</div>
				</Card>

			</div>
		</div>

		<!-- 文件树 -->
		<vs-dialog v-model="showChooseFolder" prevent-close scroll  :full-screen="isMobile">
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

		<!-- 变更来源文件夹位置 -->
		<vs-dialog v-model="showChangeSourcePosition" prevent-close scroll  :full-screen="isMobile">
			<template #header>
				<h4 style="font-size: 16px;">
					{{ $t('setting.source.reChoose') + selectedItem.path }}
				</h4>
			</template>
			<file-select ref="fileSelector" v-if="showChangeSourcePosition" parent="root" :type="2" @onSelect='onSelectPathRelocate'
				@onCancel="showChangeSourcePosition = false"></file-select>
			<template #footer>
				<file-select-bar @back="$refs.fileSelector.goBack()" @select="$refs.fileSelector.onSelect()"
					@create="(newFolderName) => $refs.fileSelector.createNewFolder(newFolderName)"></file-select-bar>
			</template>
		</vs-dialog>

	</div>
</template>

<script>
import folderBrowerOperationBar from "@/components/folder-brower/folder-brower-operation-bar.vue"
import fileSelectBar from "@/components/file-select/file-select-bar.vue"
import fileSelect from "@/components/file-select/file-select.vue"

export default {
	props: {
		sourceType: {
			default: "",
			type: String
		}
	},
	mounted() {
		this.getPathList()
	},
	components: {
		fileSelectBar,
		fileSelect,
		folderBrowerOperationBar
	},

	data() {
		return {
			showChangeSourcePosition: false,
			canAddPath: true, //在electron内选文件夹会短时间内回调两次 弄个标记做一下防重
			showChooseFolder: false,
			runInElectron: this.$store.state.runInElectron,
			pathList: [],
			selectedItem: {}
		}
	},
	computed: {

	},
	methods: {
		onFolderBack() {
			console.log('onFolderBack')
			console.log(this.$refs.fileSelector)
			if (this.$refs.fileSelector) this.$refs.fileSelector.goBack()
		},
		onShowRelocate(item) {
			this.selectedItem = item
			this.showChangeSourcePosition = true
		},
		onSelectPath(path) {
			this.addPathReq(path)
			this.showChooseFolder = false
		},
		onSelectPathRelocate(path) {
			this.relocateReq(path)
		},
		relocateReq(path) {
			// 添加来源目录的网络请求
			this.api.post('/api/sourceFolderApi/relocatePath', {
				type: this.sourceType,
				path: path,
				rawPathId: this.selectedItem.id
			}).then((res) => {
				if (!res.code) {
					this.showVsNotification(this.$t('common.operationSuccess'))
					this.getPathList()
					this.showChangeSourcePosition = false
				}
			}).catch((error) => { })
		},
		getPathList() {
			this.api.post('/api/sourceFolderApi/getPathByType', {
				type: this.sourceType,
			}).then((res) => {
				if (!res.code) {
					this.pathList = res.data

					// for(let i=0;i<10;i++){
					// 	this.pathList.push(res.data[0])
					// }
				}
			}).catch((error) => { })
		},
		selectPath() {
			console.log("this.runInElectron", this.runInElectron)
			this.showChooseFolder = true
		},
		addPathReq(path) {
			// 添加来源目录的网络请求
			this.api.post('/api/sourceFolderApi/addPath', {
				type: this.sourceType,
				path: path
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
				this.api.post('/api/sourceFolderApi/deletePath', {
					id: path.id
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
	background-color: rgba(255, 255, 255);
	padding: 10px;
	border-top-left-radius: 20px;
	border-top-right-radius: 20px;

	@media not all and (max-width:640px) {
		padding: 20px;

	}

	height: 100%;
	display: flex;
	justify-content: flex-start;
	flex-direction: column;
	align-items: center;
	width: 100%;
	overflow: hidden;

	.add-title {
		font-size: 16px;
		text-align: left;
	}
}

.item-title {
	word-break: break-all;
	margin-top: 10px;
	margin-bottom: 10px;
	width: 100%;
	text-align: left;
	font-size: 14px;
}

.add-text {
	color: $nas-grey;
	font-size: 20px;
}
</style>
