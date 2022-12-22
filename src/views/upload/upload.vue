<template>
	<div :class="{ 'app-upload-root': !spaceId, 'app-upload-root-no-border': spaceId }">
		<div v-if="!spaceId"
			style="margin-bottom: 10px; width: 100%;flex-direction: column; display: flex;justify-content: center;align-items: center;padding-left: 20px;padding-right: 20px;padding-top: 20px;">
			<div v-if="targetPath" style="font-weight:bold">
				{{ $t('upload.targetFolder') + " : " }}
			</div>
			<Tag color="primary" v-if="targetPath" closable @on-close="targetPath = ''">{{ targetPath }}</Tag>
			<!-- 选择上传文件夹 -->
			<Button v-else @click="selectPath" type="primary" style="border-radius:20px">{{ $t('upload.selectTargetFolder') }}</Button>

			<!-- 最近使用的文件夹 -->
			<div v-if="lastUsePath && !targetPath && !spaceId"
				style="margin-top:20px; margin-bottom: 10px; padding-left: 10px;padding-right: 10px;display: flex;align-items: flex-start;flex-direction: row;font-weight: bold;align-items: center;">
				<div style="flex-shrink:0">{{ $t('upload.recentUseFolder') }}:</div>
				<a @click="selectRecrentFolder" >{{ lastUsePath }}</a>
			</div>
		</div>

		<div v-if="targetPath && !spaceId"
			style="display: flex;flex-direction: row;margin-bottom: 20px;padding-left: 20px;align-items: center;">
			<div style="margin-right: 10px;">{{ $t('upload.onFileNameConflict') + " : " }}</div>
			<vs-radio v-model="overMode" val="skip" style="margin-right: 10px;">
				{{ $t('upload.skip') }}
			</vs-radio>
			<vs-radio v-model="overMode" val="over" style="margin-right: 10px;">
				{{ $t('upload.over') }}
			</vs-radio>
			<vs-radio v-model="overMode" val="rename">
				{{ $t('upload.rename') }}
			</vs-radio>
		</div>
		<Upload :action="uploadUrl" ref="upload" :show-upload-list="false" :on-error="onUploadError"
			:on-success="onUploadSuccess" :before-upload="onBeforeUpload" :on-progress="onUploadProgress"
			v-show="targetPath || spaceId" multiple type="drag">
			<div style="padding: 20px 0;position: relative;">
				<Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
				<div style="display:flex;align-items: center;justify-content: center;">
					<p style="margin-right:10px">{{ this.$t('upload.dropFilesUpload') }}</p>
					<Button v-if="uploadList.length > 0" @click.stop="uploadList = []" @click="uploadList = []"
						size="small">{{ $t('upload.clearRecord') }}</Button>
				</div>
			</div>
		</Upload>

		<!-- 上传文件列表 -->
		<div style="overflow:auto;max-height: 300px;padding-bottom: 20px;">
			<div v-for="(item, index) in uploadList"
				style="padding:10px;display:flex;flex-direction: column;border-bottom: 1px solid #eee;">

				<!-- 文件名称 -->
				<div style="display:flex;width:100%;align-items: center;">
					<!-- 成功的标志 -->
					<Icon v-if="item.status == 'finished'" type="md-checkmark-circle" size="20" color="green"
						style="margin-right: 5px;" />
					<!-- 失败的标志 -->
					<Icon v-if="item.status == 'error'" type="ios-close-circle" size="20" color="red"
						style="margin-right: 5px;" />
					<!-- 文件名称 -->
					<div style="text-align: left;flex: 1;word-break: break-all;"
						:class="{ uploadError: item.status == 'error' }">{{ item.name }}</div>
					<!-- 删除按钮 -->
					<Icon style="flex-shrink: 0; cursor: pointer;" type="ios-trash" @click="handleRemove(item, index)"
						size="20"></Icon>
				</div>
				<Progress v-if="item.status == 'uploading'" :percent="item.percentage" hide-info></Progress>
			</div>
		</div>
		<!-- 文件树 -->
		<vs-dialog v-model="showChooseFolder" prevent-close scroll :full-screen="isMobile" >
			<template #header>
				<h4 style="font-size: 16px;">
					{{ $t('file.chooseFolder') + '[' + $t('file.doubleClickFolderEnter') + ']' }}
				</h4>
			</template>
			<file-select ref="fileSelector" v-if="showChooseFolder" parent="root" :type="2" @onSelect='onSelectPath'
				@onCancel="showChooseFolder = false"></file-select>
			<template #footer>
				<file-select-bar @back="$refs.fileSelector.goBack()" @select="$refs.fileSelector.onSelect()"
					@create="(newFolderName) => $refs.fileSelector.createNewFolder(newFolderName)"></file-select-bar>
			</template>
		</vs-dialog>


		<!-- 关闭按钮 -->
		<vs-button v-if="!spaceId" @click="switchUpload()" icon class="closs-btn">
			<Icon type="md-close-circle" color="#386DF2" size="25" />
		</vs-button>
	</div>
</template>

<script>
import axios from "@/plugins/axios";
import fileSelect from "@/components/file-select/file-select.vue"
import base64 from '@/plugins/base64/index.js' // 导入vue-i18n
import fileSelectBar from "@/components/file-select/file-select-bar.vue"

export default {
	props: {
		//是否为加密空间上传
		spaceId: {
			default: '',
			type: String
		}
	},
	components: {
		fileSelect,
		fileSelectBar
	},
	computed: {

	},
	data() {
		return {
			uploadUrl: "",
			currentUploadFile: null,
			overMode: 'over',
			uploadList: [],
			targetPath: "",
			lastUsePath: "",
			uploadSucCount: 0,
			showChooseFolder: false,
		};
	},
	created() {

	},
	mounted() {
		this.lastUsePath = localStorage.getItem('lastUsePath')
	},
	methods: {
		onBeforeUpload(file) {
			return new Promise((resolve, reject) => {
				if (!this.$store.state.token) {
					this.uploadList.unshift({
						status: "error",
						name: this.$t('common.tokenExpire')
					})
					return reject()
				}
				if (file.name.length > 120) {
					this.uploadList.unshift({
						status: "error",
						name: this.$t('upload.filenameTooLong')
					})
					return reject()
				}
				// 未选择目标上传文件夹
				if (!this.targetPath && !this.spaceId) {
					this.uploadList.unshift({
						status: "error",
						name: this.$t('upload.noTargetPath')
					})
					return reject()
				}
				let uploadUrl = axios.uploadUrl() + `&savePath=${axios.encodePath(this.targetPath)}&overMode=${this.overMode}`
				if (this.spaceId) {
					uploadUrl = axios.privateSpaceUploadUrl() + `&spaceId=${this.spaceId}&overMode=over&spaceToken=${this.$store.state.privateSpace[this.spaceId]}&filename=${base64.encode(file.name)}`
				}
				this.uploadUrl = uploadUrl
				file.uploadUrl = uploadUrl
				return resolve(file)
			})
		},
		//从列表删除
		handleRemove(item, index) {
			let canceled = false
			if (item.uid && item.status == 'uploading' && item.percentage < 95) {
				//上传中的如果删除 需要先中断
				for (let i in this.$refs.upload.fileList) {
					if (this.$refs.upload.fileList[i].uid == item.uid) {
						if (this.$refs.upload.fileList[i].xhr) {
							this.$refs.upload.fileList[i].xhr.abort()
							canceled = true
						}
					}
				}
			}

			this.uploadList.splice(index, 1)
			if (canceled) {
				//任务被取消 添加一个错误记录
				let cancelName = this.$t('common.cancelled')
				if (item.name) {
					cancelName += ":" + item.name
				}
				this.uploadList.unshift({
					status: "error",
					name: cancelName
				})
			}
		},
		//上传成功的回调
		onUploadSuccess(response, file, fileList) {
			console.log(response, file, fileList)
			//先把uploading状态的移除掉
			for (let i in this.uploadList) {
				if (this.uploadList[i].uid == file.uid) {
					this.uploadList.splice(i, 1)
					break
				}
			}
			if (response.code) {
				//失败了
				this.uploadList.unshift({
					status: "error",
					name: file.name + ':' + response.message
				})
			} else {
				//成功了
				console.log('上传成功')
				this.$emit('fileUploaded', file)
				this.uploadList.unshift(file)
			}
		},
		onUploadProgress(event, file, fileList) {
			console.log('更新进度')
			for (let i in this.uploadList) {
				if (this.uploadList[i].uid == file.uid) {
					this.uploadList[i].percentage = file.percentage
					this.uploadList[i].file = file
					return
				}
			}
			//走到这里说明是第一次调用进度还没加入到列表
			this.uploadList.unshift({
				status: 'uploading',
				name: file.name,
				percentage: 1,
				uid: file.uid,
				file: file
			})
		},
		onUploadError(error, file, fileList) {
			console.log('错误', file)
			this.uploadList.unshift({
				status: "error",
				name: this.$t('upload.uploadFail')
			})
		},
		selectRecrentFolder() {
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('upload.useRecentFolder', {
				recentFolder: this.lastUsePath
			}), () => {
				this.onSelectPath(this.lastUsePath)
			})
		},
		selectPath() {
			this.showChooseFolder = true
		},
		onSelectPath(path) {
			//检查选择的文件夹是否有写入权限
			this.api
				.post("/api/file/checkFolderPower", {
					checkPath: axios.encodePath(path),
					checkPower: 'all'
				})
				.then((res) => {
					if (!res.code) {
						if (res.access) {
							this.showChooseFolder = false
							this.targetPath = path
							localStorage.setItem('lastUsePath', path)
						} else {
							this.showVsNotification(this.$t('file.noAccessPower'))
						}
					}
				})
				.catch((error) => { });
		}
	}
}
</script>

<style lang="scss" scoped>
::v-deep .ivu-upload-list {
	max-height: 160px;
	overflow: auto;
}

.app-upload-root {
	z-index: 12;
	width: 100%;
	border-radius: 20px;
	background-color: rgba(255, 255, 255, 1);
	box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.3);
	border: solid 1px $nas-grey;
}

.app-upload-root-no-border {
	z-index: 12;
	width: 100%;
	border-radius: 20px;
}

.uploader-example {
	width: 100%;
	height: 100%;
	font-size: 12px;
}

.closs-btn {
	border: solid 1px $nas-grey;
	position: absolute;
	right: -12px;
	top: -12px;
	background-color: white;
}

.uploadError {
	font-weight: bold;
	color: $nas-red;
}

.uploader-example .uploader-btn {
	margin-right: 4px;
}

.uploader-example .uploader-list {
	overflow: auto;
	overflow-x: hidden;
	overflow-y: auto;
}
</style>
