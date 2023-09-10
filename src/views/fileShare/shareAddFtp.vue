<template>
	<div>
		<Form prop="taskName" ref="shareData" :model="shareData">

			<!-- 选择ftp根目录 -->
			<FormItem>
				<Button style="border-radius: 20px;" type="primary" @click="choosePath()">{{ $t('share.chooseFtpRootPath')
					}}</Button>
			</FormItem>
			<h4 v-if="shareData.path">{{ $t('share.shareFold') }}：</h4>
			<Tag v-if="shareData.path" style="margin-top: 5px;border-radius: 10px;">
				{{ shareData.path }}
			</Tag>
			<Divider></Divider>

			<FormItem>
				<Button style="border-radius: 20px;" type="primary" @click="showChooseUser = true">{{ $t('share.choosePowerUser')
					}}</Button>
			</FormItem>
			<h4 v-if="shareData.users.length > 0">{{ $t('share.selectedUserList') }}：</h4>
			<Tag v-if="shareData.users.length > 0" v-for="(user, index) in shareData.users"
				@on-close="shareData.users.splice(index, 1)" closable
				style="margin-bottom: 20px;margin-top: 5px;border-radius: 10px;">
				{{ user.username }}
			</Tag>
			<Divider></Divider>
		</Form>


		<vs-dialog v-model="showChooseFolder" prevent-close scroll  :full-screen="isMobile">
			<template #header>
				<h4 style="font-size: 16px;">
					{{ $t('file.chooseFolder') + '[' + $t('file.doubleClickFolderEnter') + ']' }}
				</h4>
			</template>
			<file-select ref="fileSelector" v-if="showChooseFolder" parent="root" :type="2" @onSelect='onSelectPath'
				@onCancel="showChooseFolder = false"></file-select>
			<template #footer>
				<file-select-bar @back="$refs.fileSelector.goBack()" @select="$refs.fileSelector.onSelect()"
					@create="(newFolderName) => $refs.fileSelector.createNewFolder(newFolderName)"></file-select-bar>
			</template>
		</vs-dialog>


	
		
		<vs-dialog  v-model="showChooseUser" >
			<template #header>
				<h4 style="font-size: 16px;">
					{{$t('common.chooseUser')}}
				</h4>
			</template>
			<user-select v-if="showChooseUser" parent="root" :type="2" @onSelect='onSelectUser'></user-select>
		</vs-dialog>
	</div>
</template>

<script>
	import fileSelect from "@/components/file-select/file-select.vue"
	import userSelect from "@/components/user-select/user-select.vue"
	import fileSelectBar from "@/components/file-select/file-select-bar.vue"

	export default {
		props: {
			type: {
				type: String,
				default: "create"
			},
			shareId: {
				type: Number,
				default: null //type为update的时候传入shareId
			}
		},
		components: {
			fileSelect,
			userSelect,
			fileSelectBar
		},
		data() {
			return {
				runInElectron: this.$store.state.runInElectron,

				showChooseUser: false,
				showChooseFolder: false,
				shareData: {
					path: '',
					pathSign: '',
					users: [],
				}
			}
		},
		mounted() {
			if (this.type == "update") {
				this.getById()
			}
		},
		methods: {
			onSelectUser(user) {
				for (let i = 0; i < this.shareData.users.length; i++) {
					if (this.shareData.users[i].id == user.id) {
						this.showVsNotification(this.$t('share.userAlreadyInList'))
						return
					}
				}
				this.shareData.users.push(user)
				this.showChooseUser = false
			},
			onSelectPath(path) {
				this.shareData.path = path
				this.showChooseFolder = false
			},
			getById() {
				this.api
					.post("/api/fileShareApi/getById", {
						id: this.shareId
					})
					.then((res) => {
						this.shareData = res.data
						this.shareData.users = JSON.parse(res.data.users)
					})
					.catch((error) => {});
			},
			onCreateShare() {
				if (this.shareData.users.length < 1) {
					return this.showVsNotification(this.$t('share.atLeastChooseOneUser'))
				}
				if (!this.shareData.path) {
					return this.showVsNotification(this.$t('share.noChooseShareFolder'))
				}
				let params = {
					type: this.type,
					...this.shareData
				}
				if (this.type == "update") {
					params.id = this.shareId
				}
				params.serverType = 'FTP'
				this.api
					.post("/api/fileShareApi/create", params)
					.then((res) => {
						if (!res.code) {
							this.showVsNotification(this.$t('common.operationSuccess'))
							this.$emit('onClose')
						}
					})
					.catch((error) => {});
			},
			choosePath() {
				this.showChooseFolder = true
			},
		}
	}
</script>

<style>
</style>
