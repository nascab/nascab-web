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
			<!-- 更新按钮 -->
			<vs-button v-if="updateIsShow" @click="showUpdate" border style="height: 25px;line-height:25px">
				{{ $t('system.update') }}
			</vs-button>
			<!-- 更新日志 -->
			<vs-button @click="showUpdateLog" border style="height: 25px;line-height:25px;margin-left: 10px;">
				{{ $t('system.updateLog') }}
			</vs-button>
		</div>

		<Divider>{{ $t('state.systemInfo') }}</Divider>
		<div class="item-root">
			<!-- 安装目录 -->
			<div style="flex-shrink:0">{{ $t('state.appRootPath') }}:</div>
			<span class=" enable-text-select" style="margin-right: 20px;" @click="copyText(systemInfo.appRootPath)">{{
				systemInfo.appRootPath }}</span>
		</div>


		<Divider>{{ $t('setting.cacheInfo') }}</Divider>
		<div class="item-root">
			<!-- 数据库保存路径 -->
			<div style="flex-shrink:0;margin-right: 10px;">{{ $t('setting.databasePath') }}:</div>
			<span class="enable-text-select" style="word-break:break-all;text-align: left;"
				@click="copyText(systemInfo.databaseFolder)">{{ systemInfo.databaseFolder }}</span>
			<vs-button @click="onVacuumDb()" border style="height: 25px;flex-shrink: 0;">
				{{ $t('setting.vacuumDb') }}
			</vs-button>
		</div>
		<div class="divider"></div>
		<div class="item-root">
			<!-- 缩略图保存路径 -->
			<div style="flex-shrink:0;margin-right: 10px">{{ $t('setting.cachePath') }}:</div>
			<span class="enable-text-select" style="word-break:break-all;text-align: left"
				@click="copyText(systemInfo.imgFolder)">{{ systemInfo.imgFolder }}</span>
			<span style="flex-shrink:0" class="icon-main-color"
				v-if="this.systemInfo.imgFolderUsable == 1">({{ $t("common.available") }})</span>
			<span style="flex-shrink:0" class="icon-red-color" v-if="this.systemInfo.imgFolderUsable != 1">({{
				$t("common.unavailable") }})</span>
			<vs-button @click="onSelectCachePath('')" border style="height: 25px;flex-shrink: 0;">
				{{ $t('Reset') }}
			</vs-button>
			<vs-button @click="showCacheChangeDialog()" border style="height: 25px;flex-shrink: 0;">
				{{ $t('common.change') }}
			</vs-button>
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

			<vs-button @click="restartNascab()" style="width: 200px;margin-top: 50px;border-radius: 20px;">
				{{ $t('setting.reLaunchNasCab') }}
			</vs-button>

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

		<!-- 显示更新日志的iframe -->
		<Modal v-model="showUpdateLogDialog" footer-hide>
			<iframe v-if="showUpdateLogDialog" :src="iframeUrl" style="width:100%;height:80vh;border:none;"></iframe>
		</Modal>

		<vs-dialog v-model="showChangeCachePath" prevent-close scroll :full-screen="isMobile">
			<template #header>
				<h4 style="font-size: 16px;">
					{{ $t('setting.changeCachePath') }}
				</h4>
			</template>
			<file-select ref="fileSelector" v-if="showChangeCachePath" parent="root" :type="2" @onSelect='onSelectCachePath'
				@onCancel="showChangeCachePath = false"></file-select>
			<template #footer>
				<file-select-bar @back="$refs.fileSelector.goBack()" @select="$refs.fileSelector.onSelect()"
					@create="(newFolderName) => $refs.fileSelector.createNewFolder(newFolderName)"></file-select-bar>
			</template>
		</vs-dialog>
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
			showChangeCachePath: false,
			updateIsShow: false,
			showUpdateLogDialog: false,
			iframeUrl: "",
			versionInfo: "",
			currentVersion: "",
			systemInfo: null
		}
	},
	computed: {

	},
	methods: {
		showCacheChangeDialog() {
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t(
				'setting.changeCachePathAlert'), () => {
					this.showChangeCachePath = true
				})
		},
		onVacuumDb() {
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t(
				'setting.vacuumDbAlert'), () => {
					this.api.post('/api/commonApi/vaccumDb', {
					}).then((res) => {
						if (!res.code) {
							this.showVsAlertDialog(
								this.$t('common.alert'), this.$t('common.operationSuccess'));
						}
					}).catch((error) => { })
				})
		},
		//更换缓存目录
		onSelectCachePath(newPath) {
			this.showChangeCachePath = false
			// 调用接口更新
			this.api.post('/api/commonApi/changeCachePath', {
				cachePath: newPath
			}).then((res) => {
				if (!res.code) {
					this.showVsAlertDialog(
						this.$t('common.alert'), this.$t('setting.saveSuccessRestart'));
				}
			}).catch((error) => { })
		},
		showUpdateLog() {
			this.iframeUrl = "https://www.nascab.cn/updateLog.html"
			this.showUpdateLogDialog = true
		},
		//重启nascab
		restartNascab() {
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t(
				'setting.reLaunchNasCabAlert'), () => {
					this.api.post('/api/commonApi/relaunch',
						{}).then((res) => {
							this.showVsAlertDialog(this.$t('common.alert'), this.$t('setting.reLaunchNasCabConfirm'))
						})
				})
		},
		showUpdate() {
			this.showVsConfirmDialog(this.$t('system.updateTo') + "V" + this.versionInfo.version, this.versionInfo.message, () => {
				// 调用接口更新
				this.api.post('/api/commonApi/updateNewVersion', {}).then((res) => {
					this.showVsAlertDialog(
						this.$t('common.alert'), this.$t('system.updateSent'));
					this.updateIsShow = false
				}).catch((error) => { })
			}, null, this.$t('system.update'))
		},
		resetSystemApi(password) {
			// 系统重置接口调用
			this.api.post('/api/usersApi/resetSystem', { password }).then((res) => {
				if (!res.code) {
					this.showVsAlertDialog(this.$t('common.alert'), this.$t('system.systemResetSuc'), () => {
						localStorage.removeItem('token')
						localStorage.removeItem('currentUser')
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
}</style>
