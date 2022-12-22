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
			<Divider style="margin-top: 30px;margin-bottom: 20px;">{{ $t('setting.portSetting') }}</Divider>
			<p style="margin-bottom: 10px;">{{ $t('setting.ifPortInUserWillAdd') }}</p>
			<div style="width: 100%;display: flex;flex-direction: column;align-items: center;">
				<vs-input type="number" class="item-input" style="margin-top: 20px;" v-model="settingData.apiPort"
					:label="$t('setting.basePort')" placeholder="256-65535">
				</vs-input>
				<vs-input type="number" class="item-input" v-model="settingData.webDavPort"
					:label="$t('setting.webDavPort')" placeholder="256-65535">
				</vs-input>
				<vs-input type="number" class="item-input" v-model="settingData.FTPPort" :label="$t('setting.FTPPort')"
					placeholder="256-65535">
				</vs-input>
			</div>
			<!-- 转码设置 -->
			<Divider style="margin-top: 30px;margin-bottom: 20px;">{{ $t('setting.videoCodecSetting') }}</Divider>

			<div style="width: 100%;display: flex;flex-direction: column;align-items: center;">
				<vs-input type="double" class="item-input" style="margin-top: 20px;" v-model="settingData.subtitleSize"
					:label="$t('setting.videoSubtitleFontSize')">
				</vs-input>
				<!-- crf -->
				<Tooltip :content="$t('setting.crfDesc')" style="width:100%" max-width="100%">
					<vs-input type="number" class="item-input" v-model="settingData.crf" :label="$t('setting.crf')">
					</vs-input>
				</Tooltip>
				<!-- 自动硬件解码 -->
				<div v-if="decoderList.length>1"
					style="display: flex;flex-direction: row;align-items: center;margin-top: 20px;justify-content: flex-start;width: 100%;">
					<div style="margin-right: 20px;">{{ $t('setting.videoDecoder') }}</div>
					<Select  v-model="settingData.transCodeDecoder" style="width:120px;">
						<Option v-for="(item, i) in decoderList" :value="item" :key="i">{{ item }}</Option>
					</Select>
				</div>
				<!-- 视频编码器选择 -->
				<div
					style="display: flex;flex-direction: row;align-items: center;margin-top: 20px;justify-content: flex-start;width: 100%;">
					<div style="margin-right: 20px;">{{ $t('setting.videoEncoder') }}</div>
					<Select @on-change="onEncoderChange" v-model="settingData.transCodeEncoder" style="width:120px;">
						<Option v-for="(item, i) in encoderList" :value="item" :key="i">{{ item }}</Option>
					</Select>
					<div style="margin-left:10px">{{ encoderDesc }}</div>
				</div>
				<!-- 转码临时文件家 -->
				<div
					style="display: flex;flex-direction: row;align-items: center;margin-top: 20px;justify-content: flex-start;width: 100%;">
					<div style="margin-right: 20px;">{{ $t('setting.transcodeTmpPath') }}</div>
					<a @click="showChooseFolder=true">{{ settingData.transcodePath?settingData.transcodePath:$t('setting.userDataFolder') }}</a>
					<Button v-if="settingData.transcodePath!=''" style="margin-left:15px" @click="settingData.transcodePath=''">{{$t('Reset')}}</Button>
				</div>


			</div>
			<!-- 照片功能设置 -->
			<Divider style="margin-top: 30px;margin-bottom: 20px;">{{ $t('setting.photoFuncsSetting') }}</Divider>

			<div style="width: 100%;display: flex;flex-direction: column;align-items: center;">
				<div
					style="display: flex;flex-direction: row;align-items: center;margin-top: 20px;justify-content: flex-start;width: 100%;">
					<div style="margin-right: 20px;">{{ $t('photo.aiClasses') }}</div>
					<i-switch v-model="settingData.aiClassesEnable" />
				</div>
			</div>

			<div style="width: 100%;display: flex;flex-direction: column;align-items: center;">
				<div
					style="display: flex;flex-direction: row;align-items: center;margin-top: 20px;justify-content: flex-start;width: 100%;">
					<div style="margin-right: 20px;">{{ $t('photo.aiFace') }}</div>
					<i-switch v-model="settingData.aiFaceEnable" />
				</div>
			</div>

			<Divider style="margin-top: 30px;margin-bottom: 20px;">{{ $t('setting.proSetting') }}</Divider>
			<div style="width: 100%;display: flex;flex-direction: column;align-items: center;margin-bottom: 120px;">
				<!-- 线程数量 -->
				<vs-input type="number" class="item-input" style="margin-top: 20px;" v-model="settingData.threadCount"
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

		<!-- 文件树 -->
		<vs-dialog v-model="showChooseFolder" prevent-close scroll  :full-screen="isMobile">
			<template #header>
				<h4 style="font-size: 16px;">
					{{ $t('file.chooseFolder') + '[' + $t('file.doubleClickFolderEnter') + ']' }}
				</h4>
			</template>
			<file-select ref="fileSelector" @cancel="showChooseFolder = false" v-if="showChooseFolder" parent="root"
				:type="2" @onSelect="onPathSelect" @onCancel="showChooseFolder = false"></file-select>
			<template #footer>
				<file-select-bar @back="$refs.fileSelector.goBack()" @select="$refs.fileSelector.onSelect()"
					@create="(newFolderName) => $refs.fileSelector.createNewFolder(newFolderName)"></file-select-bar>
			</template>
		</vs-dialog>

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
			showChooseFolder:false,
			encoderList: [],
			decoderList:[],
			returnData: null,
			encoderDesc: "",
			decoderDesc: "",
			settingData: {
				language: 'zh-CN',
				apiPort: null,
				webDavPort: null,
				FTPPort: null,
				subtitleSize: 1.5,
				crf: 23,
				transCodeEncoder: "",
				transCodeDecoder:"",
				aiClassesEnable: false,
				aiFaceEnable: false,
				transcodePath: ""
			}
		}
	},
	computed: {

	},
	methods: {
		onPathSelect(path){
			this.settingData.transcodePath=path
			this.showChooseFolder=false
		},
		//视频编码器解释
		onEncoderChange(selectEncoder) {
			if (selectEncoder.indexOf('nvenc') != -1) {
				return this.encoderDesc = 'NVIDIA GPU'
			} else if (selectEncoder.indexOf('qsv') != -1) {
				return this.encoderDesc = 'INTEL GPU'
			} else if (selectEncoder.indexOf('amf') != -1) {
				return this.encoderDesc = 'AMD GPU'
			} else {
				return this.encoderDesc = ''
			}
		},

		resetConfig() {
			if (this.returnData) {
				this.settingData.apiPort = this.returnData.defaultApiPort
				this.settingData.webDavPort = this.returnData.defaultWebDavPort
				this.settingData.FTPPort = this.returnData.defaultFTPPort
				this.settingData.crf = 23
				this.settingData.subtitleSize = 14
			}
		},
		onLanguageChange(e) {
			console.log(e)
		},
		saveConfig() {
			let params = {
				...this.settingData
			}

			params.aiClassesEnable = params.aiClassesEnable ? '1' : "0"
			params.aiFaceEnable = params.aiFaceEnable ? '1' : "0"


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
					} else if (configItem.title == 'webDavPort') {
						this.settingData.webDavPort = configItem.value
					} else if (configItem.title == 'FTPPort') {
						this.settingData.FTPPort = configItem.value
					} else if (configItem.title == 'subtitleSize') {
						this.settingData.subtitleSize = configItem.value ? configItem.value : 14
					} else if (configItem.title == 'language') {
						this.settingData.language = configItem.value
					} else if (configItem.title == 'threadCount') {
						this.settingData.threadCount = configItem.value
					} else if (configItem.title == 'crf') {
						this.settingData.crf = configItem.value
					} else if (configItem.title == 'aiClassesEnable') {
						this.settingData.aiClassesEnable = configItem.value == '1'
					} else if (configItem.title == 'aiFaceEnable') {
						this.settingData.aiFaceEnable = configItem.value == '1'
					} else if (configItem.title == 'transCodeParams-encode-list') {
						this.encoderList = JSON.parse(configItem.value)
					} else if (configItem.title == 'transCodeParams-decode-list') {
						this.decoderList = JSON.parse(configItem.value)
						this.decoderList.push('CLOSE')

					} else if (configItem.title == 'transCodeParams-encode') {
						this.settingData.transCodeEncoder = configItem.value
						this.onEncoderChange(this.settingData.transCodeEncoder)
					} else if (configItem.title == 'transCodeParams-decode') {
						this.settingData.transCodeDecoder = configItem.value
					} else if (configItem.title == 'transcodePath') {
						this.settingData.transcodePath = configItem.value
					}
					if (!this.settingData.transCodeEncoder) {
						//用户没选过编码器 用列表里面的第一个
						if (this.encoderList.length > 0) {
							this.settingData.transCodeEncoder = this.encoderList[0]
							this.onEncoderChange(this.settingData.transCodeEncoder)
						}
					}
					if (!this.settingData.transCodeDecoder) {
						//用户没选过编码器 用列表里面的第一个
						if (this.decoderList.length > 0) {
							this.settingData.transCodeDecoder = this.decoderList[0]
						}
					}
				}
				if (!this.settingData.apiPort) {
					this.settingData.apiPort = res.data.defaultApiPort
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

}
</style>
