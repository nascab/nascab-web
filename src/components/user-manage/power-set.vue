<template>
	<div class="root">
		<!-- pc端显示 -->
		<div class="nas-mobile-none">
			<Menu mode="horizontal" theme="light" active-name="photo" @on-select="changeIndex">
				<MenuItem name="photo">
				<span class="nasIcons icon-timeline" style="font-size: 14px;"></span>
				{{ $t('user.powerPhoto') }}
				</MenuItem>
				<MenuItem name="movie">
				<span class="nasIcons icon-movies-library" style="font-size: 14px;"></span>
				{{ $t('user.powerMovie') }}
				</MenuItem>
				<MenuItem name="folder">
				<span class="nasIcons icon-file-list" style="font-size: 14px;"></span>
				{{ $t('user.powerFolder') }}
				</MenuItem>
			</Menu>
		</div>
		<!-- 手机端显示 -->
		<div class="nas-mobile-show">
			<vs-select v-model="indexName" style="width:100%">
				<vs-option :label="$t('user.powerPhoto')" value="photo">
					{{ $t('user.powerPhoto') }}
				</vs-option>
				<vs-option :label="$t('user.powerMovie')" value="movie">
					{{ $t('user.powerMovie') }}
				</vs-option>
				<vs-option :label="$t('user.powerFolder')" value="folder">
					{{ $t('user.powerFolder') }}
				</vs-option>
			</vs-select>
		</div>
		<!-- 权限目录列表 -->
		<div v-for="(power, index) in userPower"
			v-if="indexName == 'photo' && power.server_type == 'photo' || indexName == 'movie' && power.server_type == 'movie' || indexName == 'folder' && power.server_type == 'folder'">
			<div class="path-item-root">
				<!-- <Icon type="ios-folder-open-outline" size="30" style="margin-right: 10px;" /> -->
				<span class="item-icon-folder nasIcons icon-img-folder"></span>

				<div class="path-item-right">
					<div class="max-line-three" style="text-align:left">{{ power.path }}</div>
					<div style="display: flex;flex-direction: row;align-items: center;margin-top: 20px;">
						<Checkbox :true-value="1" :false-value="0" v-model="power.power_get"
							@on-change="powerChange(index)">{{ $t('common.check') }}</Checkbox>
						<Checkbox v-if="indexName == 'photo'" :true-value="1" :false-value="0" v-model="power.power_add"
							@on-change="powerChange(index)">{{ $t('common.add') }}{{ $t('photo.album') }}</Checkbox>
						<Checkbox v-if="indexName == 'folder'" :true-value="1" :false-value="0"
							v-model="power.power_add" @on-change="powerChange(index)">{{ $t('common.upload') }}
						</Checkbox>
						<Checkbox v-if="indexName != 'movie'" :true-value="1" :false-value="0"
							v-model="power.power_change" @on-change="powerChange(index)">{{ $t('common.change') }}
						</Checkbox>
						<Checkbox :true-value="1" :false-value="0" v-model="power.power_delete"
							@on-change="powerChange(index)">{{ $t('common.delete') }}</Checkbox>

					</div>
					<Button @click="cancelPath(index)" style="border-radius: 10px;margin-top:20px" size="small"
						type="error">{{
								$t('user.cancelPathPower')
						}}</Button>
				</div>

			</div>
			<Divider></Divider>
		</div>
		<!-- 照片服务 -->
		<div v-if="indexName == 'photo'">
			<div class="btn-root">
				<my-btn style="width: 250px;margin-top: 30px;" :title="$t('user.addPhotoPowerPath')"
					@click="showChoosePath"></my-btn>
			</div>
		</div>
		<!-- 影音服务 -->
		<div v-if="indexName == 'movie'">
			<div class="btn-root">
				<my-btn style="width: 250px;margin-top: 30px;" :title="$t('user.addMoviePowerPath')"
					@click="showChoosePath"></my-btn>
			</div>
		</div>
		<!-- 文件浏览 -->
		<div v-if="indexName == 'folder'">
			<div class="btn-root">
				<my-btn style="width: 250px;margin-top: 30px;" :title="$t('user.addFolderPowerPath')"
					@click="showChoosePath"></my-btn>
			</div>
		</div>

		<!-- 来源路径选择 -->

		<vs-dialog blur v-model="showSourcePathSelect">
			<template #header>
				<h4 style="font-size: 16px;">
					{{ $t('user.selectImpowerPath') }}
				</h4>
			</template>
			<div v-for="(path, index) in pathList">
				<div @click="selectPath(index)" class="option-item max-line-three">{{path.path}}</div>
			</div>
			<!-- 没有来源目录 -->
			<div v-if="pathList.length < 1" style="width: 100%;display: flex;justify-content: center;">
				<my-btn type="white" style="margin-top: 30px;margin-bottom: 30px;"
					:title="$t('user.goToSetSourcePath')"></my-btn>
			</div>
		</vs-dialog>


		<!-- 真实路径选择 -->
		<vs-dialog v-model="showChooseFolder" prevent-close scroll  :full-screen="isMobile">
			<template #header>
				<h4 style="font-size: 16px;">
					{{ $t('file.chooseFolder') + '[' + $t('file.doubleClickFolderEnter') + ']' }}
				</h4>
			</template>
			<file-select ref="fileSelector" v-if="showChooseFolder" parent="root" :type="2" @onSelect='onSelectPath'
				@onCancel="showChooseFolder = false" :initPath="initPath"></file-select>
			<template #footer>
				<file-select-bar @back="$refs.fileSelector.goBack()" @select="$refs.fileSelector.onSelect()"
					@create="(newFolderName) => $refs.fileSelector.createNewFolder(newFolderName)"></file-select-bar>
			</template>
		</vs-dialog>

	</div>
</template>

<script>
import fileSelect from "@/components/file-select/file-select.vue"
import fileSelectBar from "@/components/file-select/file-select-bar.vue"

export default {
	props: {
		user: ''
	},
	components: {
		fileSelectBar,
		fileSelect
	},
	computed:{

	},
	data() {
		return {
			initPath:"",
			showChooseFolder: false,
			indexName: "photo",
			btnCanUse: true,
			userPower: [],
			pathList: [],
			showSourcePathSelect: false
		}
	},
	mounted() {
		this.getUserPower()
	},
	methods: {
		// 文件浏览权限选择目录回调
		onSelectPath(selectedPath) {
			this.showChooseFolder = false
			this.apiSetUserPower(selectedPath)
		},
		showChoosePath() {
			if(this.indexName=="photo"){
				this.initPath = "sourceFolderPhoto"
			}else if(this.indexName=="movie"){
				this.initPath = "sourceFolderMovie"
			}else if(this.indexName=="folder"){
				this.initPath = ""
			}
			this.showChooseFolder = true
		},
		cancelPath(index) {
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('user.sureCancelPathPower'), () => {
				this.api.post('/api/usersApi/cancelUserPathPower', this.userPower[index]).then((res) => {
					if (!res.code) {
						this.getUserPower()
						this.showVsNotification(this.$t('common.operationSuccess'))
					}
				}).catch((error) => {
					this.showVsNotification(this.$t('common.operationFail'))
				})
			})
		},
		powerChange(index) {
			this.api.post('/api/usersApi/setUserPower', this.userPower[index]).then((res) => {
				if (!res.code) {
					this.userPower = res.userPower
					this.getUserPower()
					this.showVsNotification(this.$t('common.operationSuccess'))
				}
			}).catch((error) => { })
		},
		apiSetUserPower(setPath) {
			this.api.post('/api/usersApi/setUserPower', {
				username: this.user.username,
				path: setPath,
				server_type: this.indexName,
				power_get: 1
			}).then((res) => {
				if (!res.code) {
					this.userPower = res.userPower
					console.log(this.userPower)
					this.showSourcePathSelect = false
					this.getUserPower()
				}
			}).catch((error) => { })
		},
		//点击路径的事件处理
		selectPath(index) {
			let selectedPath = this.pathList[index]
			this.apiSetUserPower(selectedPath.path)
		},
		showSourcePath() {
			this.showSourcePathSelect = true
			this.getPathList(this.indexName)
		},
		getPathList(type) {
			this.pathList = []
			this.api.post('/api/sourceFolderApi/getPathByType', {
				type: type,
			}).then((res) => {
				if (!res.code) {
					this.pathList = res.data
				}
			}).catch((error) => { })
		},
		changeIndex(name) {
			this.indexName = name
		},
		getUserPower() {
			this.userPower = []
			this.api.post('/api/usersApi/getUserPower', {
				username: this.user.username
			}).then((res) => {
				if (!res.code) {
					this.userPower = res.userPower
				}
			}).catch((error) => {
				this.showVsNotification(this.$t('common.getFail'))
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.item-icon-folder {
	color: $nas-main;
	font-size: 40px;
	margin-right: 10px;
}

.root {
	min-height: 300px;
	width: 100%;
}

.btn-root {
	margin-top: 20px;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.path-item-root {
	margin-top: 20px;
	display: flex;
	flex-direction: row;
	align-items: center;

}

.option-item{
	background-color: $nas-second;
	border-radius: 20px;
	margin-top: 15px;
	padding: 10px;
	color: white;
	word-break: break-all;
}

.path-item-right {
	overflow: hidden;
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
}

.path-text {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>
