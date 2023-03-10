<template>
	<photo-base :initIndex="5">
		<div class="photo-ai-root">
			<div
				style="display:flex;padding: 10px; align-items:center;width:100%">
				<my-menu-select :shrinkModeTh="300" @onItemClick="onChooseAIType" :optionList="AIMenuList"></my-menu-select>
				<div style="flex:1;text-align:right;">
					<span @click="showSetting" style="font-size:25px;color:#999999;"
						class="nasIcons icon-setting-system">
					</span>
				</div>
			</div>
			<photo-faces v-if="aiTypeId == '0'"></photo-faces>
			<photo-classes v-if="aiTypeId == '1'"></photo-classes>

			<vs-dialog v-model="showSettingDialog">
				<template #header>
					<h4 class="not-margin">
						{{ $t('setting.photoFuncsSetting') }}
					</h4>
				</template>

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

						<vs-button flat border @click="resetFaceAi()"
							style="height: 25px;line-height:25px;flex-shrink:0;min-width:60px;margin-left: 10px;z-index: 0;">
							{{ $t('Reset') }}</vs-button>
					</div>
				</div>
				<template #footer>
					<div @click="saveConfig" style="width:100%;padding-top:10px;padding-bottom:10px;">
						<my-btn style="width:80%;" :title="$t('common.commit')"></my-btn>
					</div>
				</template>

			</vs-dialog>


		</div>
	</photo-base>
</template>

<script>
import photoFaces from "@/views/photos/photoPages/photoFaces";
import photoClasses from "@/views/photos/photoPages/photoClasses";
import photoBase from "@/views/photos/photoBase";

export default {
	components: {
		photoFaces,
		photoClasses,
		photoBase
	},
	data() {
		return {
			showSettingDialog: false,
			aiTypeId: "0",
			AIMenuList: [{
				title: this.$t('photo.aiFace'),
				id: "0"
			}, {
				title: this.$t('photo.aiClasses'),
				id: "1"
			}
			// , {
			// 	title: this.$t('photo.holidays'),
			// 	id: "2"
			// }
		],
			settingData: {
				aiClassesEnable: false,
				aiFaceEnable: false,
			}
		}
	},
	mounted() {

	},
	beforeDestroy() {

	},
	methods: {
		showSetting(){
			this.showSettingDialog = true
			this.getAllConfig()
		},
		onChooseAIType(id) {
			this.aiTypeId = id
			console.log("onChooseAIType", id)

		},
		resetFaceAi() {
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t(
				'setting.aiFaceResetAlert'), () => {
					this.api.post('/api/photoApi/resetFaceAi',
						{
						}).then((res) => {
							if (!res.code) {
								this.showVsNotification(this.$t('common.operationSuccess'))
							}
						})
				})
		},

		saveConfig() {
			let params = {
				...this.settingData
			}

			params.aiClassesEnable = params.aiClassesEnable ? '1' : "0"
			params.aiFaceEnable = params.aiFaceEnable ? '1' : "0"

			this.api.post('/api/commonApi/saveConfigPhoto', params).then((res) => {
				this.showVsNotification(this.$t('setting.saveSuccess'))
				this.showSettingDialog=false
			}).catch((error) => { })
		},
		getAllConfig() {
			this.api.post('/api/commonApi/getAllConfig', { keys: "('aiClassesEnable', 'aiFaceEnable')"}).then((res) => {
				for (let i = 0; i < res.data.allConfig.length; i++) {
					let configItem = res.data.allConfig[i]
					if (configItem.title == 'aiClassesEnable') {
						this.settingData.aiClassesEnable = configItem.value == '1'
					} else if (configItem.title == 'aiFaceEnable') {
						this.settingData.aiFaceEnable = configItem.value == '1'
					}

				}
			}).catch((error) => { })
		}
	}
}
</script>
<style lang="scss" scoped>
.photo-ai-root {
	position: relative;
	z-index: 1;
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	padding: 10px;

	@media not all and (max-width:640px) {
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;

	}

	background-color: rgba(255, 255, 255, 0.6);

}
</style>
