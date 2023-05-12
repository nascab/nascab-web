<template>
	<div class="space-add-root">
		<vs-input autocapitalize="off" autocorrect="off" style="width: 100%;margin-top: 10px;" :label-placeholder="$t('private.spaceName')"
			v-model="formData.spaceName" />
		<vs-input autocapitalize="off" autocorrect="off" style="width: 100%;margin-top: 30px;" :label-placeholder="$t('private.spacePwd')"
			v-model="formData.spacePwd" />

		<div style="margin-top: 20px;">{{$t('private.folderPath')}}</div>
		<!-- 所选路径 -->
		<div v-if="formData.folderPath" style="margin-top: 20px;">
			<Tag size="large" style="border-radius: 20px;"  closable @on-close="formData.folderPath=''">{{formData.folderPath}}</Tag>
		</div>

		<div style="width: 100%;display: flex;justify-content: center;margin-top: 20px;" v-else>
			<Button style="border-radius: 20px;" type="default"
				@click="showChooseFolder=true">{{$t('file.chooseFolder')}}</Button>
		</div>

		<!-- 创建按钮 -->
		<div @click="addSpace" style="margin-top: 20px;">
			<my-btn style="width: 100%;" :title="$t('private.createPrivateSpace')"></my-btn>
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
		mounted() {},
		methods: {
			addSpace() {
				this.api
					.post("/api/privateSpaceApi/addPrivateSpace", this.formData)
					.then((res) => {
						if (!res.code) {
							console.log("创建成功")
							this.showVsNotification(this.$t('common.operationSuccess'))
							this.$emit('onSuccess')
						}
					})
					.catch((error) => {});
			},
			onSelectPath(path) {
				this.formData.folderPath = path
				this.showChooseFolder = false
			}
		}

	}
</script>

<style lang="scss" scoped>


	.space-add-root {
		min-height: 300px;
		width: 100%;
		display: flex;
		flex-direction: column;

	}

	.date-root {
		margin-top: 30px;
	}
</style>
