<template>
	<div class="space-export-root">
		<!-- 原空间对应的文件夹 -->
		<div style="margin-top: 20px;">{{$t('private.rawSpaceFolderPath')}}</div>
		<div v-if="formData.folderPath" style="margin-top: 20px;">
			<Tag size="large" style="border-radius: 20px;" closable @on-close="formData.folderPath=''">
				{{formData.folderPath}}
			</Tag>
		</div>
		<div style="width: 100%;display: flex;justify-content: center;margin-top: 20px;" v-else>
			<Button style="border-radius: 20px;" type="default"
				@click="showChoose(false)">{{$t('file.chooseFolder')}}</Button>
		</div>
		<Divider></Divider>
		<!-- 目标文件夹 -->
		<div style="margin-top: 20px;">{{$t('private.exportFolder')}}</div>
		<div v-if="formData.targetFolderPath" style="margin-top: 20px;">
			<Tag size="large" style="border-radius: 20px;" closable @on-close="formData.targetFolderPath=''">
				{{formData.targetFolderPath}}</Tag>
		</div>
		<div style="width: 100%;display: flex;justify-content: center;margin-top: 20px;" v-else>
			<Button style="border-radius: 20px;" type="default"
				@click="showChoose(true)">{{$t('file.chooseFolder')}}</Button>
		</div>
		<Divider></Divider>

		<!-- 原空间密码 -->
		<vs-input type="password" style="width: 100%;margin-top: 30px;" :label-placeholder="$t('private.rawSpacePwd')"
			v-model="formData.spacePwd" />


		<!-- 导出按钮 -->
		<vs-button @click="exportSpace" type="primary" style="border-radius: 20px;width: 100%;margin-top: 30px;">
			<Icon type="ios-albums" style="margin-right: 5px;" />
			{{ $t('private.exportSpaceData')}}
		</vs-button>
		<div style="width: 100%;justify-content: center;display: flex;margin-top: 10px;">
			<p style="text-align: center;">{{$t('private.exportSpaceDataDes')}}</p>
		</div>

		<vs-dialog v-model="showChooseFolder" prevent-close scroll  :full-screen="isMobile">
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

	</div>
</template>

<script>
import axios from "@/plugins/axios";
import fileSelect from "@/components/file-select/file-select.vue"
import base64 from '@/plugins/base64/index.js' // 导入vue-i18n
import fileSelectBar from "@/components/file-select/file-select-bar.vue"

export default {
	props: {
		exportFolderPath: {
			default: "",
			type: String
		}
	},
	data() {
		return {
			showChooseFolder: false,
			selectTarget: false,
			formData: {
				spaceName: "",
				spacePwd: "",
				folderPath: "",
				targetFolderPath: ""
			}
		}
	},
	components: {
		fileSelect,
		fileSelectBar
	},
	mounted() {
		if (this.exportFolderPath) {
			this.formData.folderPath = this.exportFolderPath
		}
	},
	methods: {
		showChoose(isTarget) {
			this.selectTarget = isTarget
			this.showChooseFolder = true
		},
		exportSpace() {
			if (!this.formData.folderPath || !this.formData.targetFolderPath) {
				return this.showVsNotification(this.$t('private.chooseExportPathFirst'))
			}
			this.api
				.post("/api/privateSpaceApi/exportSpace", {
					folderPath: this.formData.folderPath,
					targetFolderPath: this.formData.targetFolderPath,
					spacePwd: base64.encode(this.formData.spacePwd)
				})
				.then((res) => {
					if (!res.code) {
						this.showVsNotification(this.$t('private.exportTaskInLine'))
						this.$emit('onSuccess')
					}
				})
				.catch((error) => { });
		},
		onSelectPath(path) {
			if (this.selectTarget) {
				this.formData.targetFolderPath = path
			} else {
				this.formData.folderPath = path
			}

			this.showChooseFolder = false
		}
	}

}
</script>

<style lang="scss" scoped>
.space-export-root {
	min-height: 300px;
	max-width: 500px;
}

.date-root {
	margin-top: 30px;
}
</style>
