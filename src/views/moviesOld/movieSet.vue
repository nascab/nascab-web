<template>
	<div class="setting-root-wrapper" :class="{ 'setting-padding': hasPadding }">
		<div class="common-setting-root">
			<div style="width: 100%;display: flex;flex-direction: column;align-items: center;">
				<vs-input autocapitalize="off" autocorrect="off"  type="double" class="item-input" style="margin-top: 20px;" v-model="settingData.subtitleSize"
					:label="$t('setting.videoSubtitleFontSize')">
				</vs-input>
				<!-- crf -->
				<Tooltip :content="$t('setting.crfDesc')" style="width:100%" max-width="100%">
					<vs-input autocapitalize="off" autocorrect="off" type="number" class="item-input" v-model="settingData.crf" :label="$t('setting.crf')">
					</vs-input>
				</Tooltip>
				<!-- 自动硬件解码 -->
				<div v-if="decoderList.length > 1"
					style="display: flex;flex-direction: row;align-items: center;margin-top: 20px;justify-content: flex-start;width: 100%;">
					<div style="margin-right: 20px;">{{ $t('setting.videoDecoder') }}</div>
					<Select @on-change="onDecoderChange" v-model="settingData.transCodeDecoder" style="width:120px;">
						<Option v-for="(item, i) in decoderList" :value="item" :key="i">{{ item }}</Option>
					</Select>
					<div style="margin-left:10px" class="text-grey">{{ decoderDesc }}</div>
				</div>
				<!-- 视频编码器选择 -->
				<div
					style="display: flex;flex-direction: row;align-items: center;margin-top: 20px;justify-content: flex-start;width: 100%;">
					<div style="margin-right: 20px;">{{ $t('setting.videoEncoder') }}</div>
					<Select @on-change="onEncoderChange" v-model="settingData.transCodeEncoder" style="width:120px;">
						<Option v-for="(item, i) in encoderList" :value="item" :key="i">{{ item }}</Option>
					</Select>
					<div style="margin-left:10px" class="text-grey">{{ encoderDesc }}</div>
				</div>
				<!-- 转码速度选择 -->
				<div
					style="display: flex;flex-direction: row;align-items: center;margin-top: 20px;justify-content: flex-start;width: 100%;">
					<div style="margin-right: 20px;">{{ $t('transcodeSpeed') }}</div>
					<Select v-model="settingData.transcodeSpeed" style="width:90px;">
						<Option v-for="(item, i) in transcodeSpeedList" :value="item.value" :key="item.value">{{ item.label }}</Option>
					</Select>
					<p style="text-align:left;margin-left:5px" class="text-grey">{{$t("transcodeSpeedAlert")}}</p>
				</div>
				<!-- 首选字幕语言 -->
				<div
					style="display: flex;flex-direction: row;align-items: center;margin-top: 20px;justify-content: flex-start;width: 100%;">
					<div style="margin-right: 20px;">{{ $t('movie.primaryLanguage') }}</div>
					<Select v-model="settingData.moviePreferLanguage" style="width:90px;">
						<Option v-for="(item, i) in languageList" :value="item.value" :key="item.value">{{ item.label }}</Option>
					</Select>
				</div>
				
				<!-- 转码临时文件家 -->
				<div
					style="display: flex;flex-direction: row;align-items: center;margin-top: 20px;justify-content: flex-start;width: 100%;">
					<div style="margin-right: 20px;">{{ $t('setting.transcodeTmpPath') }}</div>
					<a @click="showChooseFolder = true">{{
						settingData.transcodePath ? settingData.transcodePath : $t('setting.userDataFolder')
					}}</a>
					<Button v-if="settingData.transcodePath != ''" style="margin-left:15px"
						@click="settingData.transcodePath = ''">{{ $t('Reset') }}</Button>
				</div>

				<!-- 影视库显示匹配后的电影名 -->
				<div style="width: 100%;display: flex;flex-direction: column;align-items: center;">
					<div
						style="display: flex;flex-direction: row;align-items: center;margin-top: 20px;justify-content: flex-start;width: 100%;">
						<div style="margin-right: 20px;">{{ $t('movie.showMatchName') }}</div>
						<i-switch v-model="settingData.movieShowMatchName" />
					</div>
				</div>

				
				<!-- 使用同文件夹下的图片作为海报 -->
				<div style="width: 100%;display: flex;flex-direction: column;align-items: center;">
					<div
						style="display: flex;flex-direction: row;align-items: center;margin-top: 20px;justify-content: flex-start;width: 100%;">
						<div style="margin-right: 20px;">{{ $t('movie.useSameFolderPoster') }}</div>
						<i-switch v-model="settingData.useFolderPictureAsPoster" />
					</div>
				</div>
				<!-- 字幕预提取 -->
				<div style="width: 100%;display: flex;flex-direction: column;align-items: center;">
					<div
						style="display: flex;flex-direction: row;align-items: center;margin-top: 20px;justify-content: flex-start;width: 100%;">
						<div style="margin-right: 20px;">{{ $t('movie.subtitlePreGen') }}<Icon @click="showVsAlertDialog($t('common.alert'), $t('movie.subtitlePreGenAlert'))" style="cursor: pointer;margin-left: 5px;" size="16" type="ios-help-circle-outline" /></div>
						<i-switch v-model="settingData.subtitlePreGen" />
					</div>
				</div>
				
				<Divider />
				<my-btn @click="saveConfig" style="min-width:200px" :title="$t('common.commit')"></my-btn>
			</div>
		</div>

		<!-- 文件树 -->
		<vs-dialog v-model="showChooseFolder" prevent-close scroll :full-screen="isMobile">
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
	props: {
		hasPadding: {
			default: false,
			type: Boolean
		}
	},
	mounted() {
		this.getAllConfig()
	},
	components: {
		fileSelectBar,
		fileSelect
	},
	data() {
		return {
			showChooseFolder: false,
			encoderList: [],
			decoderList: [],
			returnData: null,
			encoderDesc: "",
			decoderDesc: "",
			settingData: {
				moviePreferLanguage:"chi",
				movieShowMatchName: false,
				useFolderPictureAsPoster: false,
				subtitleSize: 1.5,
				crf: 23,
				transCodeEncoder: "",
				transCodeDecoder: "",
				transcodePath: "",
				transcodeSpeed:"medium",
				subtitlePreGen:true //字幕预提取
			},
			languageList:[
				{
					value:"chi",//中文
					label:this.$t("language.chi")
				},
				{
					value:"eng",//
					label:this.$t("language.eng")
				},
				{
					value:"ger",//
					label:this.$t("language.ger")
				},
				{
					value:"spa",//
					label:this.$t("language.spa")
				},
				{
					value:"fre",//
					label:this.$t("language.fre")
				},
				{
					value:"jpn",//
					label:this.$t("language.jpn")
				},
				{
					value:"kor",//
					label:this.$t("language.kor")
				}
			],
			transcodeSpeedList:[
				{
					value:"ultrafast",
					label:this.$t("ultrafast")
				},
				// {
				// 	value:"superfast",
				// 	label:this.$t("superfast")
				// },
				// {
				// 	value:"veryfast",
				// 	label:this.$t("veryfast")
				// },
				// {
				// 	value:"faster",
				// 	label:this.$t("faster")
				// },
				{
					value:"fast",
					label:this.$t("fast")
				},
				{
					value:"medium",
					label:this.$t("medium")
				},
				{
					value:"slow",
					label:this.$t("slow")
				},
				// {
				// 	value:"slower",
				// 	label:this.$t("slower")
				// },
				// {
				// 	value:"veryslow",
				// 	label:this.$t("veryslow")
				// }
			]
		}
	},
	computed: {

	},
	methods: {
		onPathSelect(path) {
			this.settingData.transcodePath = path
			this.showChooseFolder = false
		},
		onDecoderChange(selectDecoder) {
			if(selectDecoder=="qsv"||selectDecoder=="dxva2"||selectDecoder=="d3d11va"){
				//提示用户这些解码器可能出现问题
				this.decoderDesc=this.$t("decoderErrorAlert")
			}else{
				this.decoderDesc=""
			}
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
				this.settingData.crf = 23
				this.settingData.subtitleSize = 14
			}
		},

		saveConfig() {
			let params = {
				...this.settingData
			}
			params.movieShowMatchName = params.movieShowMatchName ? '1' : "0"
			params.useFolderPictureAsPoster = params.useFolderPictureAsPoster ? "1" : "0"
			params.subtitlePreGen=params.subtitlePreGen ? '1' : "0"
			this.api.post('/api/commonApi/saveConfigMovie', params).then((res) => {
				this.showVsNotification(this.$t('setting.saveSuccessRestartValid'))
			}).catch((error) => { })
		},
		getAllConfig() {
			this.api.post('/api/commonApi/getAllConfig', {}).then((res) => {
				for (let i = 0; i < res.data.allConfig.length; i++) {
					let configItem = res.data.allConfig[i]
					if (configItem.title == 'subtitleSize') {
						this.settingData.subtitleSize = configItem.value ? configItem.value : 14
					} else if (configItem.title == 'crf') {
						this.settingData.crf = configItem.value
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
					} else if (configItem.title == 'movieShowMatchName') {
						this.settingData.movieShowMatchName = configItem.value == '1'
					} else if (configItem.title == 'useFolderPictureAsPoster') {
						this.settingData.useFolderPictureAsPoster = configItem.value == '1'
					} else if (configItem.title == 'subtitlePreGen') {
						this.settingData.subtitlePreGen = configItem.value == '1'
					} else if (configItem.title == 'transcodeSpeed') {
						this.settingData.transcodeSpeed = configItem.value
					} else if(configItem.title=="moviePreferLanguage"){
						this.settingData.moviePreferLanguage = configItem.value
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

	@media not all and (max-width:640px) {
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
	}

	width: 100%;
	height: 100%;
	justify-content: center;
}

.common-setting-root {
	width: 100%;
	padding: 20px;
	background-color: white;

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

	background-color: rgba(255, 255, 255, 0.6);

}
</style>
