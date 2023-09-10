<template>
	<div class="setting-root-wrapper">
		<b>{{ $t("shareDomainSetting") }}</b>
		<p class="text-grey" style="text-align:left">{{$t("shareDomainAlert")}}</p>
		<Input v-model="shareUrl" style="margin-top:10px;max-width:600px" @on-search="saveShareUrl" search :enter-button="$t('common.save')" placeholder="xxxxxx.nas-cab.com:80" >
			<template #prepend>
				<Select v-model="shareProtocol" style="width: 80px">
					<Option value="http://">http://</Option>
					<Option value="https://">https://</Option>
				</Select>
			  </template>
		</Input>
		<div style="margin-top: 10px;">
		</div>
		<Divider></Divider>
		<b>{{ $t("whatModelWillYouUse") }}</b>
		<div style="margin-top: 10px;">
			<CheckboxGroup @on-change="onMenuChange" v-model="showMenuList" class="option-root">
				<Checkbox class="ckItem" label="photoManage" border>{{ $t("home.photoManage") }}</Checkbox>
				<Checkbox class="ckItem" label="movieManage" border>{{ $t("home.movieManage") }}</Checkbox>
				<Checkbox class="ckItem" label="filesBrower" border>{{ $t("home.fileBrower") }}</Checkbox>
				<Checkbox class="ckItem" label="backup" border>{{ $t("home.backup") }}</Checkbox>
				<Checkbox class="ckItem" label="sharing" border>{{ $t("home.sharing") }}</Checkbox>
				<Checkbox class="ckItem" label="privateSpace" border>{{ $t("photo.privateSpace") }}</Checkbox>
				<Checkbox class="ckItem" label="security" border>{{ $t("home.securityCenter") }}</Checkbox>
			</CheckboxGroup>
		</div>


	</div>
</template>
<script>
export default {
	mounted() {
		this.getAllConfig()
	},
	components: {

	},
	data() {
		return {
			shareUrl:"",
			shareProtocol:"http://",
			showMenuList: ["photoManage", "movieManage", "filesBrower", "backup", "sharing", "privateSpace", "security"],
		}
	},
	computed: {

	},
	methods: {
		onMenuChange(menuArr) {
			console.log(menuArr)
			this.saveConfig(menuArr)
		},
		saveShareUrl(){
			if(!this.shareUrl){
				return this.showVsNotification(this.$t('cannotBeEmpty',{content:"URL"}))
			}
			this.saveConfig(null,this.shareProtocol+this.shareUrl)
		},
		saveConfig(menuArr,customShareUrl) {
			let params = {}
			if(customShareUrl){
				params.customShareUrl=customShareUrl
			}
			if(menuArr){
				params.showMenuArr=menuArr
			}
			this.api.post('/api/commonApi/saveConfig', params).then((res) => {
				this.showVsNotification(this.$t('setting.saveSuccess'))
			}).catch((error) => { })
		},
		getAllConfig() {
			this.api.post('/api/commonApi/getAllConfig', {
				keys: "('showMenuArr','customShareUrl')"
			}).then((res) => {
				for (let i = 0; i < res.data.allConfig.length; i++) {
					let configItem = res.data.allConfig[i]
					if (configItem.title == 'showMenuArr') {
						this.showMenuList = JSON.parse(configItem.value)
					}else if(configItem.title == 'customShareUrl'){
						if(configItem.value.indexOf("http://")!=-1){
							this.shareProtocol="http://"
						}else{
							this.shareProtocol="https://"
						}
						this.shareUrl=configItem.value.replace("http://","").replace("https://","")
					}
				}
			}).catch((error) => { })
		}
	}
}
</script>
<style lang="scss" scoped>
.option-root {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
}

::v-deep .ivu-checkbox {
	margin-right: 10px;
}

.ckItem {
	margin-top: 10px;
	display: flex;
	align-items: center;
}

.setting-root-wrapper {
	display: flex;
	flex-direction: column;
	border-top-left-radius: 20px;
	border-top-right-radius: 20px;
	background-color: white;
	width: 100%;
	height: 100%;
	padding: 30px;
	align-items: flex-start;
}
</style>
