<template>
	<div class="security-setting-root">

		<div style="display:flex;flex-direction:column;align-items: flex-start;padding:10px;width:100%">
			<div style="display: flex;flex-direction: row;align-items: center;justify-content: flex-start;">
				<p style="margin-right:15px;flex-shrink:0;">{{ $t('setting.security.ipBan') }}:</p>
				<div style="display:flex;flex-direction:column;align-items: flex-start;">
					<div style="margin-bottom:10px">
						<i-switch style="flex-shrink: 0;" v-model="ipBan.enable" />
					</div>
					<div>
						<!-- 登录失败 -->
						<span style="margin-right:5px;"> {{ $t('security.loginFail') }} </span>
						<Input  autocapitalize="off" autocorrect="off" style="width:30px;margin-right:5px" number class="input_item" v-model="ipBan.testCount">
						</Input>
						<span style="margin-right:5px"> {{ $t('security.timesIpBlock') }} </span>
						<Input  autocapitalize="off" autocorrect="off" style="width:30px" number class="input_item" v-model="ipBan.banTime">
						</Input>
						<span> {{ $t('security.minutes') }}</span>
					</div>
				</div>
			</div>

			<Divider />
			<!-- 黑白名单模式 -->
			<div style="display: flex;flex-direction: row;align-items: center;justify-content: flex-start;">
				<p style="margin-right:15px;flex-shrink:0;">{{ $t('common.mode') }}:</p>
				<div>
					<div style="display: flex;justify-content: left;">
						<Radio-group v-model="ipMode">
							<Radio label="black">{{ $t('common.blacklistMode') }}</Radio>
							<Radio label="white">{{ $t('common.whitelistMode') }}</Radio>
						</Radio-group>
					</div>
					<div style="display:flex;flex-direction:row">
						<p style="margin-top:10px" v-if="ipMode == 'black'">{{ $t('security.blackDesc') }}</p>
						<p style="margin-top:10px" v-if="ipMode == 'white'">{{ $t('security.whiteDesc') }}</p>
					</div>
				</div>
			</div>
			<Divider />
			<!-- 两步验证 -->
			<div style="display: flex;flex-direction: row;align-items: center;justify-content: flex-start;">
				<p style="margin-right:15px;flex-shrink:0;">{{ $t('setting.security.loginNeedAnswer') }}:</p>
				<div style="display: flex;flex-direction: row;align-items: center;justify-content: flex-start;">
					<i-switch style="flex-shrink: 0;" v-model="twoStepLogin" />
					<span style="margin-left:10px;text-align:left">{{ $t('security.twoStepsDesc') }} </span>
				</div>
			</div>
			<Divider />
			<!-- ip同源检测 -->
			<div style="display: flex;flex-direction: row;align-items: center;justify-content: flex-start;">
				<p style="margin-right:15px;flex-shrink:0;">{{ $t('security.sameIpOrigin') }}:</p>
				<div style="display: flex;flex-direction: row;align-items: center;justify-content: flex-start;">
					<i-switch style="flex-shrink: 0;" v-model="ipDetection" />
					<span style="margin-left:10px;text-align:left">{{ $t('security.sameIpAlert') }} </span>
				</div>
			</div>
			<Divider />
		</div>
		<div style="display:flex;flex-direction:row;align-items: center;margin-bottom:50px;margin-top: 20px;">
			<my-btn @click="saveConfig" :title="$t('common.commit')" style="min-width: 200px;">
			</my-btn>
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
			ipMode: 'black',
			twoStepLogin: false,
			returnData: null,
			ipDetection:false,
			ipBan: {
				enable: false,
				testCount: 3,
				banTime: 1
			}

		}
	},
	computed: {

	},
	methods: {
		onLanguageChange(e) {
			console.log(e)
		},
		saveConfig() {
			let params = {
				ipBan: JSON.stringify(this.ipBan),
				ipMode: this.ipMode
			}
			if (this.twoStepLogin) {
				params.twoStepLogin = '1'
			} else {
				params.twoStepLogin = '0'
			}
			if(this.ipDetection){
				params.ipDetection = "1"
			} else {
				params.ipDetection = '0'
			}
			this.api.post('/api/commonApi/saveConfig', params).then((res) => {
				this.showVsNotification(this.$t('setting.saveSuccess'))
			}).catch((error) => { })
		},
		getAllConfig() {
			this.api.post('/api/commonApi/getAllConfig', {}).then((res) => {
				for (let i = 0; i < res.data.allConfig.length; i++) {
					let configItem = res.data.allConfig[i]
					if (configItem.title == 'ipBan') {
						this.ipBan = JSON.parse(configItem.value)
					} else if (configItem.title == 'twoStepLogin') {
						this.twoStepLogin = configItem.value == '1'
					} else if (configItem.title == 'ipMode') {
						this.ipMode = configItem.value
					}else if (configItem.title == 'ipDetection') {
						this.ipDetection = configItem.value == '1'
					}
				}
				this.returnData = res.data
			}).catch((error) => { })
		}
	}
}
</script>
<style lang="scss" scoped>
.security-setting-root {
	height: 100%;
	padding: 5px;
	border-radius: 20px;
	@media not all and (max-width:640px) {
		padding: 20px;
	}

	display: flex;
	flex-direction: column;
	align-items: center;
	background-color: white;
}

.input_item {
	width: 100%;
}
</style>
