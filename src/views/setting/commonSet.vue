<template>
	<div class="setting-root-wrapper">
		<div class="common-setting-root">
			<div style="display: flex;justify-content: left;">
				<div style="margin-right: 20px;">{{ $t('setting.language') }}:</div>
				<vs-radio v-model="settingData.language" val="zh-CN" style="margin-right: 20px;">
					中文
				</vs-radio>
				<vs-radio v-model="settingData.language" val="en-US">
					English
				</vs-radio>
			</div>

			<Divider style="margin-top: 30px;margin-bottom: 20px;">{{ $t('setting.commonSetting') }}</Divider>

			<!-- 自动启动 -->
			<div style="width: 100%;display: flex;flex-direction: column;align-items: center;">
				<div
					style="display: flex;flex-direction: row;align-items: center;margin-top: 20px;justify-content: flex-start;width: 100%;">
					<div style="margin-right: 20px;">{{ $t('setting.autoLaunch') }}</div>
					<i-switch v-model="settingData.autoLaunch" />
				</div>
			</div>
			<!-- 自动登录客户端 -->
			<div style="width: 100%;display: flex;flex-direction: column;align-items: center;">
				<div
					style="display: flex;flex-direction: row;align-items: center;margin-top: 20px;justify-content: flex-start;width: 100%;">
					<div style="margin-right: 20px;">{{ $t('setting.autoLoginClient') }}</div>
					<i-switch v-model="settingData.autoLoginClient" />
				</div>
			</div>
			<!-- 登录时显示窗口 -->
			<div style="width: 100%;display: flex;flex-direction: column;align-items: center;">
				<div
					style="display: flex;flex-direction: row;align-items: center;margin-top: 20px;justify-content: flex-start;width: 100%;">
					<div style="margin-right: 20px;">{{ $t('setting.autoShowWindow') }}</div>
					<i-switch v-model="settingData.autoShowWindow" />
				</div>
			</div>
			<Divider style="margin-top: 30px;margin-bottom: 20px;">{{ $t('setting.portSetting') }}</Divider>
			<p style="margin-bottom: 10px;">{{ $t('setting.ifPortInUserWillAdd') }}</p>
			<div style="width: 100%;display: flex;flex-direction: column;align-items: center;">
				<vs-input autocapitalize="off" autocorrect="off" type="number" class="item-input" style="margin-top: 20px;" v-model="settingData.apiPort"
					:label="$t('setting.basePort')" placeholder="256-65535">
				</vs-input>
				<vs-input autocapitalize="off" autocorrect="off" type="number" class="item-input" v-model="settingData.apiPortHttps"
					:label="$t('setting.basePortHttps')" placeholder="256-65535">
				</vs-input>

				<vs-input autocapitalize="off" autocorrect="off" type="number" class="item-input" v-model="settingData.webDavPort"
					:label="$t('setting.webDavPort')" placeholder="256-65535">
				</vs-input>
				<vs-input autocapitalize="off" autocorrect="off" type="number" class="item-input" v-model="settingData.FTPPort" :label="$t('setting.FTPPort')"
					placeholder="256-65535">
				</vs-input>
			</div>
			<!-- https证书设置 -->
			<Divider style="margin-top: 30px;margin-bottom: 20px;">HTTPS[{{ $t("setting.defaultCert") }}]</Divider>
			<div style="text-align: left;width: 100%;margin-top: 10px;margin-bottom: 10px;">{{ $t('setting.httpsCert') }}
			</div>
			<Input  autocapitalize="off" autocorrect="off" type="textarea" v-model="settingData.httpsCert" placeholder="[-----BEGIN CERTIFICATE-----]..." />
			<div style="text-align: left;width: 100%;margin-top: 10px;margin-bottom: 10px;">{{ $t('setting.httpsKey') }}
			</div>
			<Input  autocapitalize="off" autocorrect="off" type="textarea" v-model="settingData.httpsKey" :label="$t('setting.httpsKey')"
				placeholder="[-----BEGIN RSA PRIVATE KEY-----]..." />
			<Divider style="margin-top: 30px;margin-bottom: 20px;">{{ $t('setting.proSetting') }}</Divider>
			<div style="width: 100%;display: flex;flex-direction: column;align-items: center;margin-bottom: 120px;">
				<!-- 线程数量 -->
				<vs-input autocapitalize="off" autocorrect="off" type="number" class="item-input" style="margin-top: 20px;" v-model="settingData.threadCount"
					:label="$t('setting.threadCount') + '[' + $t('setting.threadCountHint') + ']'">
				</vs-input>
			</div>

			<div class="bottom-btns-root-wrapper">
				<div class="bottom-btns-root">
					<my-btn @click="resetConfig" :title="$t('common.resetDefault')" type="white"
						style="margin-right: 20px;"></my-btn>
					<my-btn @click="saveConfig" :title="$t('common.commit')"></my-btn>
				</div>
			</div>
		</div>

	</div>
</template>
<script>

import fileSelectBar from "@/components/file-select/file-select-bar.vue"
import fileSelect from "@/components/file-select/file-select.vue"

export default {
	mounted() {
		this.getAllConfig()
	},
	components: {
		fileSelectBar,
		fileSelect
	},
	data() {
		return {
			returnData: null,
			settingData: {
				httpsCert: "",
				httpsKey: "",
				autoLoginClient: true,
				language: 'zh-CN',
				autoLaunch: false,
				autoShowWindow: true,
				apiPort: null,
				apiPortHttps: null,
				webDavPort: null,
				FTPPort: null
			}
		}
	},
	computed: {

	},
	methods: {

		resetConfig() {
			if (this.returnData) {
				this.settingData.apiPort = this.returnData.defaultApiPort
				this.settingData.apiPortHttps = this.returnData.defaultApiPortHttps
				this.settingData.webDavPort = this.returnData.defaultWebDavPort
				this.settingData.FTPPort = this.returnData.defaultFTPPort
				this.settingData.autoLaunch = false
				this.settingData.autoLoginClient = true
				this.settingData.autoShowWindow = true
			}
		},
		onLanguageChange(e) {
		},
		saveConfig() {
			let params = {
				...this.settingData
			}
			params.autoLaunch = params.autoLaunch ? "1" : "0"
			params.autoLoginClient = params.autoLoginClient ? "1" : "0"
			params.autoShowWindow = params.autoShowWindow ? "1" : "0"

			this.api.post('/api/commonApi/saveConfig', params).then((res) => {
				this.showVsNotification(this.$t('setting.saveSuccessRestartValid'))
				this.$i18n.locale = this.settingData.language
				this.$store.state.language = this.settingData.language

			}).catch((error) => { })
		},
		getAllConfig() {
			this.api.post('/api/commonApi/getAllConfig', {}).then((res) => {
				for (let i = 0; i < res.data.allConfig.length; i++) {
					let configItem = res.data.allConfig[i]
					if (configItem.title == 'apiPort') {
						this.settingData.apiPort = configItem.value
					} else if (configItem.title == 'apiPortHttps') {
						this.settingData.apiPortHttps = configItem.value
					} else if (configItem.title == 'webDavPort') {
						this.settingData.webDavPort = configItem.value
					} else if (configItem.title == 'FTPPort') {
						this.settingData.FTPPort = configItem.value
					} else if (configItem.title == 'language') {
						this.settingData.language = configItem.value
					} else if (configItem.title == 'threadCount') {
						this.settingData.threadCount = configItem.value
					} else if (configItem.title == 'autoLaunch') {
						this.settingData.autoLaunch = configItem.value == '1'
					} else if (configItem.title == 'autoLoginClient') {
						this.settingData.autoLoginClient = configItem.value == '1'
					} else if (configItem.title == 'autoShowWindow') {
						this.settingData.autoShowWindow = configItem.value == '1'
					} else if (configItem.title == 'httpsCert') {
						this.settingData.httpsCert = configItem.value
					} else if (configItem.title == 'httpsKey') {
						this.settingData.httpsKey = configItem.value
					}

				}
				if (!this.settingData.apiPort) {
					this.settingData.apiPort = res.data.defaultApiPort
				}
				if (!this.settingData.apiPortHttps) {
					this.settingData.apiPortHttps = res.data.defaultApiPortHttps
				}
				if (!this.settingData.webDavPort) {
					this.settingData.webDavPort = res.data.defaultWebDavPort
				}
				if (!this.settingData.FTPPort) {
					this.settingData.FTPPort = res.data.defaultFTPPort
				}
				if (!this.settingData.threadCount) {
					this.settingData.threadCount = res.data.defaultThreadCount
				}
				console.log(this.settingData)
				this.returnData = res.data

			}).catch((error) => { })
		}
	}
}
</script>
<style lang="scss" scoped>
::v-deep .vs-input-parent {
	width: 100%;
}

::v-deep .vs-input {
	width: 100%;
}

.item-input {
	margin-top: 40px;
}

.setting-root-wrapper {
	display: flex;
	border-top-left-radius: 20px;
	border-top-right-radius: 20px;
	background-color: white;
	width: 100%;
	height: 100%;
	justify-content: center;
}

.common-setting-root {
	max-width: 800px;
	width: 100%;
	padding: 20px;


	@media not all and (max-width:640px) {
		padding: 50px;
	}

	margin-bottom: 50px;
	border-top-left-radius: 20px;
	border-top-right-radius: 20px;
	display: flex;
	justify-content: flex-start;
	flex-direction: column;
	align-items: center;
	height: 100%;
	overflow: auto;
}

.input_item {
	width: 450px;
}

.bottom-btns-root-wrapper {
	position: absolute;
	bottom: 0;
	padding-left: 20px;
	padding-right: 20px;

	@media all and (max-width:640px) {
		padding-left: 10px;
		padding-right: 10px;
	}

	width: 100%;
}

.bottom-btns-root {
	border-top: 1px solid $nas-second;
	background-color: white;
	height: 60px;
	justify-content: center;
	display: flex;
	flex-direction: row;
	align-items: center;
	flex-wrap: wrap;

}</style>
