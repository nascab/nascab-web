<template>
	<div>
		<vs-dialog v-model="showAddTempShareFolder" prevent-close scroll :full-screen="isMobile">
			<template #header>
				<h4 style="font-size: 16px;">
					{{ $t('file.addShareTemp') }}
				</h4>
			</template>

			<div class="add-temp-root">
				<!-- 临时共享路径 -->
				<p style="width:100%;text-align:left">{{ $t("file.sharePath") }}:<a style="margin-left:5px" @click="showChooseFolder=true">{{ tempSharePath?tempSharePath:$t("share.chooseShareFold") }}</a></p>
				<!-- 访问密码 -->
				<div class="add-item-root">
					<p>{{ $t("file.accessPwd") }}:</p>
					<Input autocapitalize="off" autocorrect="off" type="text" v-model="tempSharePassword"
						:placeholder="$t('file.shareTempPwdPh')">
					<template #icon>
						<Icon color="#99AABF" type="ios-key" />
					</template>
					</Input>
				</div>
				<div class="add-item-root">
					<p>{{ $t("file.validity") }}:</p>
					<!-- 有效期 -->
					<Input autocapitalize="off" autocorrect="off" type="number" v-model="tempShareDays"
						>
					<template #icon>
						<Icon color="#99AABF" type="ios-key" />
					</template>
					</Input>
				</div>
				<my-btn style="margin-top:20px" @click="addPathReq()" :title="$t('file.addShareTemp')"></my-btn>
			</div>

		</vs-dialog>
		<!-- 文件树 -->
		<vs-dialog v-model="showChooseFolder" prevent-close scroll :full-screen="isMobile">
			<template #header>
				<h4 style="font-size: 16px;">
					{{ $t('file.chooseFolder') + '[' + $t('file.doubleClickFolderEnter') + ']' }}
				</h4>
			</template>
			<file-select ref="fileSelector" @cancel="showChooseFolder = false" v-if="showChooseFolder" parent="root"
				:fileType="0" @onSelect='onSelectPath' @onCancel="showChooseFolder = false"></file-select>
			<template #footer>
				<file-select-bar @back="$refs.fileSelector.goBack()" @select="$refs.fileSelector.onSelect()"
					@create="(newFolderName) => $refs.fileSelector.createNewFolder(newFolderName)"></file-select-bar>
			</template>
		</vs-dialog>

		<!-- 链接展示组件 -->
		<files-quick-share-showing  ref="qrCodeShowing" />
	</div>	
</template>

<script>

import axios from "@/plugins/axios";
import filesQuickShareShowing from "./filesQuickShareShowing.vue"
//未解之谜 fileSelect普通引入会导致失败
const fileSelect = () => import("@/components/file-select/file-select")
import fileSelectBar from "@/components/file-select/file-select-bar.vue"
export default {
	props: {
		showAfterAdd:{
			default:true,
			type:Boolean
		}
	},
	mounted() {
	},
	components: {
		fileSelectBar,
		fileSelect,
		filesQuickShareShowing
	},
	data() {
		return {
			showAddTempShareFolder:false,
			showChooseFolder: false,
			tempSharePassword: "", //临时共享密码
			tempShareDays: 30, //临时共享期限
			tempSharePath:""
		}
	},
	computed: {

	},
	methods: {
		showAdd(initPath){
			if(initPath){
				this.tempSharePath=initPath
			}
			console.log("显示添加对话框")
			this.showAddTempShareFolder=true
		},
		onSelectPath(path) {
			this.tempSharePath = path
			this.showChooseFolder = false
		},
		addPathReq() {
			if(!this.tempSharePath){
				this.showVsNotification(this.$t('pleaseSelectFolder'))
				return 
			}
			this.api.post('/api/file/tempShare', {
				operationType: "add",
				path: axios.encodePath(this.tempSharePath),
				password: this.tempSharePassword,
				days: this.tempShareDays
			}).then((res) => {
				if (!res.code) {
					
					this.showVsNotification(this.$t('common.operationSuccess'))
					this.$emit("onAddFinish")

					this.showAddTempShareFolder=false

					if(this.showAfterAdd){
						this.$refs.qrCodeShowing.showQrCodeDialog(res.token)
					}
				}
			}).catch((error) => { })
		},
	}
}
</script>

<style lang="scss" scoped>
.add-temp-root {
	display: flex;
	width: 100%;
	flex-direction: column
}

.add-item-root {
	margin-top: 10px;
	p {
		width: 100%;
		text-align: left;
		margin-bottom: 5px;
	}
}
</style>
