<template>
	<div class="setting-root-wrapper">
		<b style="margin-top: 20px;">要在首页显示哪些模块?</b>
		<div style="margin-top: 10px;">
			<CheckboxGroup @on-change="onMenuChange" v-model="showMenuList" style="display: flex;flex-direction: column;">
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
			showMenuList: ["photoManage","movieManage","filesBrower","backup","sharing","privateSpace","security"],
		}
	},
	computed: {

	},
	methods: {
		onMenuChange(menuArr){
			console.log(menuArr)
			this.saveConfig(menuArr)
		},
		saveConfig(menuArr) {
			let params = {
				showMenuArr:menuArr
			}
			this.api.post('/api/commonApi/saveConfig', params).then((res) => {
				this.showVsNotification(this.$t('setting.saveSuccess'))
			}).catch((error) => { })
		},
		getAllConfig() {
			this.api.post('/api/commonApi/getAllConfig', {
				keys:"('showMenuArr')"
			}).then((res) => {
				for (let i = 0; i < res.data.allConfig.length; i++) {
					let configItem = res.data.allConfig[i]
					if (configItem.title == 'showMenuArr') {
						this.showMenuList = JSON.parse(configItem.value)
					} 
				}
			}).catch((error) => { })
		}
	}
}
</script>
<style lang="scss" scoped>
::v-deep .ivu-checkbox{
	margin-right: 10px;
}
.ckItem{
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
