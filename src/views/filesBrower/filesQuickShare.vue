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
					<div @click="showAddShare()"
						style="width: 100%;height: 100%;display: flex;justify-content: center;align-items: center;padding-left:30px;padding-right: 30px;">
						<span class="nasIcons icon-add-album"
							style="color: #386DF2;font-size: 50px;margin-right: 20px;"></span>
						<p class="add-text">{{ $t('file.addShareTemp') }}</p>
					</div>
				</Card>

			</div>
		</div>
		<my-nodata v-if="pathList.length < 1" @onBtnClick="showAddShare()" :title="$t('file.shareTempAlert')"
			:btnTitle="$t('file.addShareFoler')" style="position: absolute;width: 100%;margin-top: 150px;">
		</my-nodata>

		
		<!-- 链接添加组件	 -->
		<files-quick-share-add ref="shareAdd"  @onAddFinish="onAddPathFinish()"/>

		<!-- 链接展示组件 -->
		<files-quick-share-showing  ref="qrCodeShowing" />
	</div>
</template>

<script>
import axios from "@/plugins/axios";
import utils from "@/plugins/utils";
import qrcode from "@/plugins/qrcode.js"
import filesQuickShareAdd from "./filesQuickShareAdd.vue"
import filesQuickShareShowing from "./filesQuickShareShowing.vue"

export default {
	props: {
		hasPadding: {
			default: false,
			type: Boolean
		}
	},
	mounted() {
		this.getShareConfig()
	},
	components: {
		filesQuickShareAdd,
		filesQuickShareShowing
	},

	data() {
		return {
			showUrl: "",
			shareServerUrl:"",
			pathList: [],
			publicUserName: "nascabPublicUser"
		}
	},
	computed: {

	},
	methods: {
		showAddShare(){
			this.$refs.shareAdd.showAdd()
		},
		getShareConfig() {
			this.api.post('/api/commonApi/getAllConfig', {
				keys: "('customShareUrl')"
			}).then((res) => {
				for (let i = 0; i < res.data.allConfig.length; i++) {
					let configItem = res.data.allConfig[i]
					if(configItem.title == 'customShareUrl'){
						this.shareServerUrl=configItem.value
					}
				}
				if(!this.shareServerUrl){
					this.shareServerUrl=`${window.location.protocol}//${window.location.host}`
				}
				this.getPathList()
			}).catch((error) => { })
		},
		showQrCodeDialog(item) {
			this.$refs.qrCodeShowing.showQrCodeDialog(item.token)
		},
		onFolderBack() {
			if (this.$refs.fileSelector) this.$refs.fileSelector.goBack()
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
						res.data[i].serverUrl = this.shareServerUrl
						res.data[i].shareLink = this.getShareLink(res.data[i].serverUrl,res.data[i].token)
					}
					this.pathList = res.data
				}
			}).catch((error) => {
				this.showVsNotification(this.$t('common.getFail'))
			})
		},
		onAddPathFinish(){
			this.getShareConfig()
		},
		deletePath(path) {
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('setting.ifDeletePath'), () => {
				//删除目录
				this.api.post('/api/file/tempShare', {
					deleteId: path.id,
					operationType: "delete",
				}).then((res) => {
					if (!res.code) {
						this.getShareConfig()
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
