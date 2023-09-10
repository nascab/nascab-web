<template>
		<!-- 弹窗展示地址url -->
		<vs-dialog v-model="showUrlDialog" prevent-close>
			<template #header>
				<h4 class="not-margin">
					{{ $t('home.scanToAccess') }}
				</h4>
			</template>
		
			<div style="display:flex;align-items:center;justify-content:center">
				<Input v-model="showUrl" placeholder=""  search :enter-button="$t('refreshQrcode')" @on-search="showQrCode(showUrl, 'lanQrcode')"/>
			</div>
			<p style="width:100%;text-align:left;margin-top:10px;" class="text-grey">
				{{ $t("file.changeToRealUrl", { url: serverUrl }) }}</p>
				
			<p v-if="$store.state.currentUser.is_admin == 1" style="width:100%;text-align:left;margin-top:10px;" class="text-grey">
				{{ $t("customUrlAlertA") }}<a @click="goToSetting('custom')">{{$t("home.settingCenter")}}</a>{{ $t("customUrlAlertB") }}</p>
				
			<!-- 二维码容器 -->
			<div style="display:flex;align-items:center;justify-content:center">
				<div id="lanQrcode"></div>
			</div>
		</vs-dialog>
</template>

<script>
import qrcode from "@/plugins/qrcode.js"

export default {
	props: {
		
	},
	mounted() {
		
	},
	components: {
	},

	data() {
		return {
			serverUrl:"",
			showUrlDialog: false,
			showUrl: ""
		}
	},
	computed: {

	},
	methods: {
		getShareConfig(cb) {
			this.api.post('/api/commonApi/getAllConfig', {
				keys: "('customShareUrl')"
			}).then((res) => {
				for (let i = 0; i < res.data.allConfig.length; i++) {
					let configItem = res.data.allConfig[i]
					if(configItem.title == 'customShareUrl'){
						this.serverUrl=configItem.value
					}
				}
				if(cb)cb()
			}).catch((error) => {
				if(cb)cb()
			 })
		},
		getShareLink(shareToken){
			if(!this.serverUrl){
				this.serverUrl=`${window.location.protocol}//${window.location.host}`
			}
			 return `${this.serverUrl}/#/shareTemp?shareToken=${shareToken}`
		},
		goOnShow(shareUrl) {
			this.showUrlDialog = true
			this.showUrl = shareUrl
			this.$nextTick(() => {
				this.showQrCode(shareUrl, 'lanQrcode')
			})
		},
		showQrCodeDialog(shareToken) {
			if(!this.serverUrl){
				this.getShareConfig(()=>{
					this.goOnShow(this.getShareLink(shareToken))
				})
			}else{
				this.goOnShow(this.getShareLink(shareToken))
			}
		},
		showQrCode(qrdata, tagId) {
			var typeNumber = 0;
			var errorCorrectionLevel = 'L';
			var qr = qrcode(typeNumber, errorCorrectionLevel);
			qr.addData(qrdata);
			qr.make();
			document.getElementById(tagId).innerHTML = qr.createImgTag(3);
		}
	}
}
</script>

<style lang="scss" scoped>
</style>
