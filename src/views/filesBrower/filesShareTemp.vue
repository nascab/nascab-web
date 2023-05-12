<template>
	<div class="source-setting-root" :class="{ 'setting-padding': hasPadding }">
		<div class="content-root">
			<div class="flex-row" style="justify-content: right;flex-wrap: wrap;">
				<!-- 顶部文字提示 -->
				<p class="add-title">{{ $t('file.shareTempAlert') }}</p>
			</div>
			<Divider></Divider>
			<div v-if="pathList.length > 0" style="width: 100%;overflow: auto;height: 100%;">
				<Card style="margin-bottom: 20px; width: 100%;border-radius: 10px;" v-for="(item, index) in pathList">
					<!-- 当前路径 -->
					<div class="item-title">
						<span class="item-label">{{ $t('file.sharePath') }} : </span>{{ item.path }}
					</div>
					<!-- 有效期 -->
					<div class="item-title">
						<span class="item-label">{{ $t('file.endDate') }} : </span>{{
							utils.formatTimeStamp(item.end_timestamp) }}
					</div>
					<!-- 密码 -->
					<div class="item-title">
						<span class="item-label">{{ $t('file.accessPwd') }} : </span>{{
							item.password ? item.password : $t("file.noNeedPwd") }}
					</div>
					<!-- 链接 -->
					<div class="item-title enable-text-select" @click="showQrCodeDialog(item)">
						<span class="item-label">{{ $t('file.shareLink') }} : </span>{{ item.shareLink }}
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
						<p class="add-text">{{ $t('file.addShareTemp') }}</p>
					</div>
				</Card>

			</div>
		</div>
		<my-nodata v-if="pathList.length < 1" @onBtnClick="selectPath" :title="$t('file.shareTempAlert')"
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
				:fileType="0" @onSelect='onSelectPath' @onCancel="showChooseFolder = false"></file-select>
			<template #footer>
				<file-select-bar @back="$refs.fileSelector.goBack()" @select="$refs.fileSelector.onSelect()"
					@create="(newFolderName) => $refs.fileSelector.createNewFolder(newFolderName)"></file-select-bar>
			</template>
		</vs-dialog>


		<vs-dialog v-model="showAddTempShareFolder" prevent-close scroll :full-screen="isMobile">
			<template #header>
				<h4 style="font-size: 16px;">
					{{ $t('file.addShareTemp') }}
				</h4>
			</template>
			<div class="add-temp-root">
				<!-- 临时共享路径 -->
				<p style="width:100%;text-align:left">{{ $t("file.sharePath") }}:{{ tempSharePath }}</p>
				<!-- 访问密码 -->
				<div class="add-item-root">
					<p>{{ $t("file.accessPwd") }}</p>
					<Input autocapitalize="off" autocorrect="off" type="text" v-model="tempSharePassword"
						:placeholder="$t('file.shareTempPwdPh')">
					<template #icon>
						<Icon color="#99AABF" type="ios-key" />
					</template>
					</Input>
				</div>
				<div class="add-item-root">
					<p>{{ $t("file.validity") }}</p>
					<!-- 有效期 -->
					<Input autocapitalize="off" autocorrect="off" type="number" v-model="tempShareDays"
						:placeholder="$t('file.shareTempPwdPh')">
					<template #icon>
						<Icon color="#99AABF" type="ios-key" />
					</template>
					</Input>
				</div>
				<my-btn style="margin-top:20px" @click="addPathReq()" :title="$t('file.addShareTemp')"></my-btn>
			</div>
		</vs-dialog>

		<!-- 弹窗展示地址url -->
		<vs-dialog v-model="showUrlDialog" prevent-close>
			<template #header>
				<h4 class="not-margin">
					{{ $t('home.scanToAccess') }}
				</h4>
			</template>
		
			<div style="display:flex;align-items:center;justify-content:center">
				<Input v-model="showUrl" placeholder="" style="width: 300px" search :enter-button="$t('refreshQrcode')" @on-search="showQrCode(showUrl, 'lanQrcode')"/>
			</div>
			<p style="width:100%;text-align:left;margin-top:10px;" class="text-grey">
				{{ $t("file.changeToRealUrl", { url: selectedItem.serverUrl }) }}</p>
			<!-- 二维码容器 -->
			<div style="display:flex;align-items:center;justify-content:center">
				<div id="lanQrcode"></div>
			</div>
		</vs-dialog>
	</div>
</template>

<script>
import fileSelectBar from "@/components/file-select/file-select-bar.vue"
import fileSelect from "@/components/file-select/file-select.vue"
import axios from "@/plugins/axios";
import utils from "@/plugins/utils";
import qrcode from "@/plugins/qrcode.js"

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
			showUrlDialog: false,
			showUrl: "",
			showAddTempShareFolder: false,
			canAddPath: true, //在electron内选文件夹会短时间内回调两次 弄个标记做一下防重
			showChooseFolder: false,
			runInElectron: this.$store.state.runInElectron,
			pathList: [],
			selectedItem: {},
			publicUserName: "nascabPublicUser",
			tempSharePassword: "", //临时共享密码
			tempShareDays: 30, //临时共享期限
			tempSharePath: "" //临时共享路径
		}
	},
	computed: {

	},
	methods: {
		showQrCodeDialog(item) {
			this.selectedItem=item 
			this.showUrlDialog = true
			this.showUrl = item.shareLink
			this.$nextTick(() => {
				this.showQrCode(item.shareLink, 'lanQrcode')
			})
		},

		showQrCode(qrdata, tagId) {
			var typeNumber = 0;
			var errorCorrectionLevel = 'L';
			var qr = qrcode(typeNumber, errorCorrectionLevel);
			qr.addData(qrdata);
			qr.make();
			document.getElementById(tagId).innerHTML = qr.createImgTag(3);
		},

		onFolderBack() {
			if (this.$refs.fileSelector) this.$refs.fileSelector.goBack()
		},
		onSelectPath(path) {
			this.tempSharePath = path
			this.showAddTempShareFolder = true
			this.showChooseFolder = false
		},
		getShareLink(serverUrl,shareToken){
			 return `${serverUrl}/#/shareTemp?shareToken=${shareToken}`
		},
		getPathList() {
			this.api.post('/api/file/getTempShare', {
				username: this.publicUserName
			}).then((res) => {
				if (!res.code) {
					for (let i in res.data) {
						res.data[i].serverUrl = `${window.location.protocol}//${window.location.host}`
						res.data[i].shareLink = this.getShareLink(res.data[i].serverUrl,res.data[i].token)
					}
					this.pathList = res.data
				}
			}).catch((error) => {
				this.showVsNotification(this.$t('common.getFail'))
			})
		},
		selectPath() {
			console.log("this.runInElectron", this.runInElectron)
			this.showChooseFolder = true
		},
		addPathReq() {
			this.api.post('/api/file/tempShare', {
				operationType: "add",
				path: axios.encodePath(this.tempSharePath),
				password: this.tempSharePassword,
				days: this.tempShareDays
			}).then((res) => {
				if (!res.code) {
					this.showVsNotification(this.$t('common.operationSuccess'))
					this.showAddTempShareFolder = false
					this.getPathList()
				}
			}).catch((error) => { })
		},
		deletePath(path) {
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('setting.ifDeletePath'), () => {
				//删除目录
				this.api.post('/api/file/tempShare', {
					deleteId: path.id,
					operationType: "delete",
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
		flex-shrink: 0;
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


}</style>
