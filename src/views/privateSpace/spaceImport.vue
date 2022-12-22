<template>
	<div class="space-import-root">

		<div>{{$t('private.rawSpaceFolderPath')}}</div>

		<div v-if="formData.folderPath" style="margin-top: 20px;">
			<Tag size="large" style="border-radius: 20px;" closable @on-close="formData.folderPath=''">
				{{formData.folderPath}}</Tag>
		</div>

		<div style="width: 100%;display: flex;justify-content: center;margin-top: 20px;" v-else>
			<Button style="border-radius: 20px;" type="default"
				@click="showChooseFolder=true">{{$t('file.chooseFolder')}}</Button>
		</div>

		<vs-input type="password" style="width: 100%;margin-top: 30px;" :label-placeholder="$t('private.rawSpacePwd')"
			v-model="formData.spacePwd" />

		<vs-input style="width: 100%;margin-top: 30px;" :label-placeholder="$t('private.newSpaceName')"
			v-model="formData.spaceName" />

		<!-- 导入按钮 -->
		<vs-button style="border-radius: 20px;width: 100%;margin-top: 30px;" @click="addSpace" type="primary">
			<Icon type="md-log-in" />
			{{ $t('private.importPrivateSpace')}}
		</vs-button>
		<div style="width: 100%;justify-content: center;display: flex;margin-top: 10px;">
			<p>{{$t('private.importPrivateSpaceDes')}}</p>
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
	data() {
		return {
			showChooseFolder: false,
			formData: {
				spaceName: "",
				spacePwd: "",
				folderPath: ""
			}
		}
	},
	components: {
		fileSelect,
		fileSelectBar
	},
	mounted() { },
	methods: {
		addSpace() {
			this.api
				.post("/api/privateSpaceApi/importSpace", {
					folderPath: this.formData.folderPath,
					spaceName: this.formData.spaceName,
					spacePwd: base64.encode(this.formData.spacePwd)
				})
				.then((res) => {
					if (!res.code) {
						console.log("创建成功")
						this.showVsNotification(this.$t('common.operationSuccess'))
						this.$emit('onSuccess')
					}
				})
				.catch((error) => { });
		},
		onSelectPath(path) {
			this.formData.folderPath = path
			this.showChooseFolder = false
		}
	}

}
</script>

<style lang="scss" scoped>
.space-import-root {
	min-height: 300px;
	width: 100%;
}

.date-root {
	margin-top: 30px;
}
</style>
