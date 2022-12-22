<template>
	<div class="system-root" v-if="systemInfo">
		<Divider>{{ $t('system.sysUpdate') }}</Divider>
		<div class="item-root">
			<!-- 当前系统版本 -->
			<div style="flex-shrink:0">{{ $t('system.currentSystemVersion') }}:</div>
			<span style="margin-right: 20px;">V{{ currentVersion }}</span>
		</div>


		<div class="item-root" v-if="versionInfo">
			<!-- 最新系统版本 -->
			<div style="flex-shrink:0">{{ $t('system.lastestVersion') }}:</div>
			<span style="margin-right: 20px;">V{{ versionInfo.version }}</span>
			<!-- <a @click="showUpdate">{{$t('system.update')}}</a> -->
			<vs-tooltip>
				<template #tooltip>
					<p>{{ versionInfo.message }}</p>
				</template>
				<vs-button v-if="updateIsShow" @click="showUpdate" border style="height: 25px;line-height:25px">
					{{ $t('system.update') }}
				</vs-button>
			</vs-tooltip>
		</div>

		<Divider>{{ $t('setting.cacheInfo') }}</Divider>
		<div class="item-root">
			<!-- 数据库保存路径 -->
			<div style="flex-shrink:0;margin-right: 10px;">{{ $t('setting.databasePath') }}:</div>
			<span style="word-break:break-all;text-align: left;">{{ systemInfo.databaseFolder }}</span>
		</div>
		<div class="divider"></div>
		<div class="item-root">
			<!-- 缩略图保存路径 -->
			<div style="flex-shrink:0;margin-right: 10px">{{ $t('setting.cachePath') }}:</div>
			<span style="word-break:break-all;text-align: left">{{ systemInfo.imgFolder }}</span>
		</div>
		<div class="divider"></div>
		<div class="item-root" v-if="systemInfo.cacheImageInfo">
			<!-- 缩略图大小 -->
			<div style="display:flex;flex-direction:column;align-items:flex-start;margin-right:10px">
				<span>{{ $t('setting.cacheSize') }}:{{ utils.getSizeStr(systemInfo.cacheImageInfo.totalSize) }}</span>
				<span style="margin-top:5px">{{ $t('setting.cacheCount') }}:{{ systemInfo.cacheImageInfo.count }}</span>
			</div>

			<vs-button @click="handleClickCache" border style="height: 25px;">
				{{ $t('setting.clearCache') }}
			</vs-button>
		</div>
		<div class="divider"></div>
		<!-- 系统重置 -->
		<div style="display:flex;justify-content:center">
			<vs-button @click="$refs.resetDialog.setShow(true)" border
				style="width: 200px;margin-top: 50px;border-radius: 20px;">
				{{ $t('setting.resetSystem') }}
			</vs-button>
		</div>

		<!-- 系统重置对话框 -->
		<my-dialog-input @onOkClick="resetSystemApi" :placeholder="$t('registerAdmin.placeholderPassword')"
			:showCloseBtn="true" ref="resetDialog" :content="$t('setting.resetSystemAlert')"
			:title="$t('setting.resetSystem')">
		</my-dialog-input>
	</div>
</template>
<script>
export default {
	mounted() {
		this.getSystemInfo()
		this.getVersionInfo()
	},
	components: {

	},

	data() {
		return {
			updateIsShow: false,
			versionInfo: "",
			currentVersion: "",
			systemInfo: null
		}
	},
	computed: {

	},
	methods: {
		showUpdate() {
			// if (this.runInElectron) {
			// 	this.showVsConfirmDialog(this.$t('system.updateTo') + "V" + this.versionInfo.version, this.versionInfo.message, () => {
			// 		// 调用接口更新
			// 		this.api.post('/api/commonApi/updateNewVersion', {}).then((res) => {
			// 			this.showVsAlertDialog(
			// 				this.$t('common.alert'), this.$t('system.updateSent'));
			// 			this.updateIsShow = false
			// 		}).catch((error) => { })
			// 	}, null, this.$t('system.update'))
			// } else {
			window.open("https://www.nascab.cn", '_blank');
			// }
		},
		resetSystemApi(password) {
			// 系统重置接口调用
			this.api.post('/api/usersApi/resetSystem', { password }).then((res) => {
				if (!res.code) {
					this.showVsAlertDialog(this.$t('common.alert'), this.$t('system.systemResetSuc'), () => {
						sessionStorage.removeItem('token')
						sessionStorage.removeItem('currentUser')
						this.$router.push({
							path: '/login'
						})
					})
				}
			}).catch((error) => { })
		},
		handleClickCache() {
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('setting.clearCacheAlert'), () => {
				this.doClearCache()
			}, null, this.$t('setting.clearCache'))
		},
		getVersionInfo() {
			this.api.post('/api/commonApi/getVersionInfo', {}).then((res) => {
				console.log(res)
				if (res.currentVersion) {
					this.versionInfo = res.versionInfo
					this.currentVersion = res.currentVersion
					if (this.currentVersion != this.versionInfo.version) {
						this.updateIsShow = true
					}
				}
			}).catch((error) => { })
		},
		doClearCache() {
			this.api.post('/api/commonApi/clearCache', {}).then((res) => {
				this.showVsAlertDialog(
					this.$t('common.alert'), this.$t('common.operationSuccess'));
				this.getSystemInfo()
			}).catch((error) => { })
		},
		getSystemInfo() {
			this.api.post('/api/commonApi/getSystemInfo', {}).then((res) => {
				this.systemInfo = res.data
			}).catch((error) => { })
		}

	}
}
</script>
<style lang="scss" scoped>
.system-root {
	height: 100%;
	padding: 10px;

	@media not all and (max-width:640px) {
		padding: 30px;
	}

	border-top-left-radius: 20px;
	border-top-right-radius: 20px;
	background-color: white;
	display: flex;
	flex-direction: column;
}

.item-root {
	padding: 10px;
	width: 100%;
	justify-content: flex-start;
	display: flex;
	align-items: center;
	flex-direction: row;
}

.divider {
	width: 100%;
	height: 1px;
	background-color: #eee;
}
</style>
