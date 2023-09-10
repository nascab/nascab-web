<template>
	<div class="source-setting-root" :class="{ 'setting-padding': hasPadding }">


		<!-- 来源设置 -->
		<div class="content-root">
			<div class="flex-row" style="justify-content: right;flex-wrap: wrap;">
				<p class="add-title">{{ $t('setting.movieSourceSettingAlert') }}</p>
			</div>
			<div style="display:flex;align-items:center;margin-top:5px">
				<a style="height:25px" @click="showAddExclude('excludePathMovie')" border>{{
					$t('setting.excludePath') }}</a>
				<a style="margin-left:15px;height:25px" @click="showAddExclude('excludeFilenameMovie')" border>{{
					$t('setting.excludeFilename') }}</a>
				<!-- 刷新索引按钮 -->
				<a @click="refreshIndex('movie')" border style="margin-left:15px;height: 25px;">
					{{ $t('setting.refreshIndex') }}
				</a>
			</div>
			<Divider></Divider>
			<div v-if="pathList.length > 0" style="width: 100%;overflow: auto;height: 100%;">
				<Card style="margin-bottom: 20px; width: 100%;border-radius: 10px;" v-for="(item, index) in pathList">
					<!-- 当前路径 -->
					<div class="item-title">
						<span class="item-label">{{ $t('common.path') }} : </span>{{ item.path }}
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
					<!-- 电影 电视剧切换 -->
					<div class="item-title">
						<span class="item-label">{{ $t('movie.mediaType') }} : </span>
						<RadioGroup v-model="item.media_type" @on-change="(value) => onChooseMediaType(value, item)">
							<Radio label="movie">{{ $t('movie.movie') }}</Radio>
							<Radio label="tvplay">{{ $t('movie.tvdrama') }}</Radio>
						</RadioGroup>
					</div>
					<div class="item-title">
						<!-- 是否禁用自动信息匹配 -->
						<span class="item-label">{{ $t('movie.enableInfoMatch') }} : </span>
						<i-switch v-model="item.ignore_match_info" :true-value="0" :false-value="1"
							@on-change="(value) => matchInfoSwitch(item, value)" />
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
		<my-nodata v-if="pathList.length < 1" @onBtnClick="selectPath" :title="$t('setting.movieSourceSettingAlert')"
			:btnTitle="$t('setting.btAddSource')" style="position: absolute;width: 100%;margin-top: 150px;">
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

		<!-- 变更来源文件夹位置 -->
		<vs-dialog v-model="showChangeSourcePosition" prevent-close scroll :full-screen="isMobile">
			<template #header>
				<h4 style="font-size: 16px;">
					{{ $t('setting.source.reChoose') + selectedItem.path }}
				</h4>
			</template>
			<file-select ref="fileSelector" v-if="showChangeSourcePosition" parent="root" :type="2"
				@onSelect='onSelectPathRelocate' @onCancel="showChangeSourcePosition = false"></file-select>
			<template #footer>
				<file-select-bar @back="$refs.fileSelector.goBack()" @select="$refs.fileSelector.onSelect()"
					@create="(newFolderName) => $refs.fileSelector.createNewFolder(newFolderName)"></file-select-bar>
			</template>
		</vs-dialog>

		<!-- 路径排除对话框 -->
		<vs-dialog v-model="showAddExcludeDialog" scroll :full-screen="isMobile">
			<template #header>
				<h4 v-if="excludeType" style="font-size: 16px;">
					{{ excludeType == 'excludePathMovie' ? $t('setting.excludePath') : $t('setting.excludeFilename') }}
				</h4>
			</template>
			<!-- 添加路径排除 -->
			<Input autocapitalize="off" autocorrect="off" search :enter-button="$t('common.add')"
				:placeholder="$t('setting.addExcludePathPlaceholder')" @on-search="onAddExcludePath" />

			<p v-if="excludePathList.length > 0" style="text-align: left;margin-top: 15px;color:#999999">
				{{ excludeType == 'excludePathMovie' ? $t('setting.excludePathAlert') : $t('setting.excludeFilenameAlert') }}:</p>
			<div class="flex-row" style="margin-top: 5px;flex-wrap: wrap;">
				<Tag v-for="item in excludePathList" type="dot" closable color="primary"
					@on-close="onDeleteExcludePath(item)">{{ item }}</Tag>
			</div>
		</vs-dialog>
	</div>
</template>

<script>
import folderBrowerOperationBar from "@/components/folder-brower/folder-brower-operation-bar.vue"
import fileSelectBar from "@/components/file-select/file-select-bar.vue"
import fileSelect from "@/components/file-select/file-select.vue"

export default {
	props: {
		hasPadding: {
			default: false,
			type: Boolean
		},
		sourceType: {
			default: "movie",
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
			excludeType: "",
			excludePathList: [],//排除路径列表
			showAddExcludeDialog: false,//路径排除对话框 
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
		refreshIndex(sourceType) {
			this.api.post('/api/sourceFolderApi/refreshIndex', {
				sourceType: sourceType
			}).then((res) => {
				this.showVsNotification(this.$t('backup.orderSent'))
			}).catch((error) => { })
		},
		showAddExclude(type) {
			this.excludeType = type
			this.excludePathList = []
			this.getExcludeConfig()
			this.showAddExcludeDialog = true
		},
		onAddExcludePath(newPath) {
			if (!newPath) return
			if (newPath.length > 35) {
				this.showVsAlertDialog(this.$t('common.alert'), this.$t('common.textTooLong'))
				return
			}
			for (let i in this.excludePathList) {
				if (this.excludePathList[i] == newPath) {
					return
				}
			}
			this.excludePathList.push(newPath)
			this.saveConfig()
		},
		onDeleteExcludePath(delPath) {
			if (!delPath) return
			for (let i in this.excludePathList) {
				if (this.excludePathList[i] == delPath) {
					this.excludePathList.splice(i, 1)
					break
				}
			}
			this.saveConfig()
		},
		getExcludeConfig() {
			this.api.post('/api/commonApi/getAllConfig', {
				hideLoading: true,
				keys: `('${this.excludeType}')`
			}).then((res) => {
				for (let i = 0; i < res.data.allConfig.length; i++) {
					let configItem = res.data.allConfig[i]
					if (configItem.title == this.excludeType) {
						this.excludePathList = JSON.parse(configItem.value)
					}
				}
			}).catch((error) => { })
		},
		saveConfig() {
			let params = {}
			params[this.excludeType] = this.excludePathList
			this.api.post('/api/commonApi/saveConfig', params).then((res) => {
				if (!res.code) {
					this.showVsNotification(this.$t('common.operationSuccess'))
					this.getExcludeConfig()
				}
			}).catch((error) => { })
		},
		onChooseMediaType(mediaType, sourceFolder) {
			if (mediaType == 'tvplay') {
				this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('movie.setAsTvAlert'),
					() => {
						this.setAsTvMovie(1, sourceFolder)
					}, () => {
						this.getPathList()
					})
			} else {
				this.setAsTvMovie(0, sourceFolder)
			}
		},
		setAsTvMovie(isTvPlay, sourceFolder) {
			this.api.post('/api/movieApi/setTvplay', {
				isTvPlay: isTvPlay,
				sourceFolderId: sourceFolder.id,
			}).then((res) => {
				if (!res.code) {
					this.showVsNotification(this.$t('common.operationSuccess'))
				}
				this.getPathList()
			}).catch((error) => { })
		},
		matchInfoSwitch(sourceObj, ignoreMatchInfo) {
			console.log("sourceObj", sourceObj)
			// 添加来源目录的网络请求
			this.api.post('/api/movieApi/switchMatchInfo', {
				sourceFolderId: sourceObj.id,
				ignoreMatchInfo: ignoreMatchInfo,
			}).then((res) => {
				if (!res.code) {
					this.showVsNotification(this.$t('common.operationSuccess'))
				}
			}).catch((error) => {
				this.getPathList()
			})

		},
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
						this.showVsAlertDialog(this.$t('common.alert'), this.$t('setting.sourceFolderDeleteInBg'), () => {
							this.getPathList()
						})
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
