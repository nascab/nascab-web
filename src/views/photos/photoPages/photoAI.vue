<template>
	<photo-base :initIndex="6">
		<div class="photo-ai-root">
			<div style="display:flex; align-items:center;width:100%;padding: 10px 20px;height:70px;">
				<my-menu-select :shrinkModeTh="300" @onItemClick="onChooseAIType" :optionList="AIMenuList"></my-menu-select>
				
				<Select v-if="aiTypeId == '2'" v-model="similarPageSize" style="width:100px;margin-left:10px" @on-change="onSimilarPageSizeChange">
					<Option  :value="5" :key="5">{{$t("pageCount",{count:"5"})}}</Option>
					<Option  :value="10" :key="10">{{$t("pageCount",{count:"10"})}}</Option>
					<Option  :value="20" :key="20">{{$t("pageCount",{count:"20"})}}</Option>
					<Option  :value="50" :key="50">{{$t("pageCount",{count:"50"})}}</Option>
					<Option  :value="100" :key="100">{{$t("pageCount",{count:"100"})}}</Option>
				</Select>
					
				<div style="flex:1;text-align:right;">
					<span @click="showSetting" style="font-size:25px;color:#999999;" class="nasIcons icon-setting-system">
					</span>
				</div>
			</div>
			<photo-faces v-if="aiTypeId == '0'"></photo-faces>
			<photo-classes v-if="aiTypeId == '1'"></photo-classes>
			<photo-similar ref="photoSimilar" :pageSize="similarPageSize" v-if="aiTypeId == '2'"></photo-similar>

			<vs-dialog v-model="showSettingDialog">
				<template #header>
					<h4 class="not-margin">
						{{ $t('setting.photoFuncsSetting') }}
					</h4>
				</template>

				<!-- 智能分类开关 -->
				<div style="width: 100%;display: flex;flex-direction: column;align-items: center;">
					<div
						style="display: flex;flex-direction: row;align-items: center;margin-top: 20px;justify-content: flex-start;width: 100%;">
						<div style="margin-right: 20px;">{{ $t('photo.aiClasses') }}</div>
						<i-switch v-model="settingData.aiClassesEnable" />
					</div>
				</div>
				<!-- 人脸识别开关 -->
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
				<!-- 照片数量最低多少不显示人物 -->
				<div style="width: 100%;display: flex;flex-direction: column;align-items: center;">
					<div
						style="display: flex;flex-direction: row;align-items: center;margin-top: 20px;justify-content: flex-start;width: 100%;">
						<div style="margin-right: 20px;">{{ $t('photo.aiFaceMinPhotoCount') }}</div>
						<Input v-model="settingData.aiFaceMinPhotoCount" type="number" clearable style="width: 50px" />

					</div>

				</div>
				<!-- 重复照片扫描开关 -->
				<div style="width: 100%;display: flex;flex-direction: column;align-items: center;">
					<div
						style="display: flex;flex-direction: row;align-items: center;margin-top: 20px;justify-content: flex-start;width: 100%;">
						<div style="margin-right: 20px;">{{ $t('photo.aiSimilarPhoto') }}</div>
						<i-switch v-model="settingData.aiSimilarPhotoEnable" />
						<vs-button flat border @click="resetSimilarPhotoAi()"
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
import photoSimilar from "@/views/photos/photoPages/photoSimilar";

export default {
	components: {
		photoFaces,
		photoClasses,
		photoSimilar,
		photoBase
	},
	data() {
		return {
			similarPageSize:5,
			showSettingDialog: false,
			aiTypeId: "0",
			AIMenuList: [{
				title: this.$t('photo.aiFace'),
				id: "0"
			}, {
				title: this.$t('photo.aiClasses'),
				id: "1"
			}, {
				title: this.$t('photo.aiSimilarPhoto'),
				id: "2"
			}
			],
			settingData: {
				aiFaceMinPhotoCount:5,
				aiSimilarPhotoEnable: false,
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
		onSimilarPageSizeChange(pageSize){
			this.similarPageSize=pageSize
			this.$nextTick(function(){
				this.$refs.photoSimilar.getDealList()
			})
		},
		showSetting() {
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
		resetSimilarPhotoAi() {
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t(
				'setting.similarPhotoResetAlert'), () => {
					this.api.post('/api/photoApi/resetSimilarPhotoAi',
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
			params.aiSimilarPhotoEnable = params.aiSimilarPhotoEnable ? '1' : "0"

			this.api.post('/api/commonApi/saveConfigPhoto', params).then((res) => {
				this.showVsNotification(this.$t('setting.saveSuccess'))
				this.showSettingDialog = false
			}).catch((error) => { })
		},
		getAllConfig() {
			this.api.post('/api/commonApi/getAllConfig', { keys: "('aiClassesEnable', 'aiFaceEnable','aiSimilarPhotoEnable')" }).then((res) => {
				for (let i = 0; i < res.data.allConfig.length; i++) {
					let configItem = res.data.allConfig[i]
					if (configItem.title == 'aiClassesEnable') {
						this.settingData.aiClassesEnable = configItem.value == '1'
					} else if (configItem.title == 'aiFaceEnable') {
						this.settingData.aiFaceEnable = configItem.value == '1'
					} else if (configItem.title == 'aiSimilarPhotoEnable') {
						this.settingData.aiSimilarPhotoEnable = configItem.value == '1'
					} else if (configItem.title == 'aiFaceMinPhotoCount') {
						this.settingData.aiFaceMinPhotoCount = configItem.value
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

	@media not all and (max-width:640px) {
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;

	}

	background-color: rgba(255, 255, 255, 0.6);

}
</style>
