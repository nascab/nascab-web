<template>
	<div class="list-root">
		<div style="width: 100%;height: 100%;">
			<div class="top-root" v-if="shareList.length >0">
				<!-- 添加按钮 -->
				<my-btn @click="createShare()" :title="$t('share.addShareFold')+serverType"></my-btn>
			</div>

			<!-- 无数据提示 -->
			<my-nodata v-if="!loading && shareList.length < 1" @onBtnClick="createShare" :title=" $t('share.shareDesc')"
				:btnTitle="$t('share.addShareFold')" style="position: absolute;width: 100%;margin-top: 150px;">
			</my-nodata>

			<div style="width:100%;height: 100%;display:flex;flex-direction:row;overflow: hidden;padding-top: 80px;">
				<div class="card-list" ref="listWrapper">
					<Card shadow :border="false" class="card-root" v-for="share in shareList">
						<!-- 备份文件夹 -->
						<div v-if="serverType=='WebDav'" class="card-item">
							<h4>{{ $t('share.shareFold') }}:</h4>
							<Tag style="margin-left: 10px;border-radius: 10px;background-color: white;">
								{{ share.path }}
							</Tag>
						</div>
						<!-- FTP根目录 -->
						<div v-if="serverType=='FTP'" class="card-item">
							<h4>{{ $t('share.ftpRootPath') }}:</h4>
							<Tag style="margin-left: 10px;border-radius: 10px;background-color: white;">
								{{ share.path }}
							</Tag>
						</div>
						<!-- 共享标识符 -->
						<div v-if="serverType=='WebDav'" class="card-item">
							<h4>{{ $t('share.pathSign') }}:</h4>
							<Tag style="margin-left: 10px;border-radius: 10px;background-color: white;">
								{{ share.path_sign }}
							</Tag>
						</div>
						<!-- 完整访问路径 -->
						<div v-if="serverType=='WebDav'" class="card-item">
							<h4>{{ $t('share.fullWebDavUrl') }}:</h4>
							<Tag style="margin-left: 10px;border-radius: 10px;background-color: white;">
								{{ webDavUrl ? webDavUrl + "/" : webDavUrl }}{{ share.path_sign }}
							</Tag>
						</div>
						<div v-if="serverType=='FTP'" class="card-item">
							<h4>{{ $t('share.fullWebDavUrl') }}:</h4>
							<Tag style="margin-left: 10px;border-radius: 10px;background-color: white;">
								{{ ftpUrl}}
							</Tag>
						</div>
						<!-- 已授权用户 -->
						<div class="card-item" v-if="share.users.length > 0">
							<h4>{{ $t('share.selectedUserList') }}:</h4>
							<Tag style="margin-left: 10px;border-radius: 10px;background-color: white;"
								v-for="user in share.users">
								{{ user.username }}
							</Tag>
						</div>

						<div style="margin-top: 20px;display: flex;align-items: center;justify-content: center;">
							<my-btn style="min-width: 150px;margin-right: 20px;" @click="editShare(share)"
								:title="$t('common.edit')"></my-btn>
							<my-btn style="min-width: 150px;" type="white" @click="deleteShare(share)"
								:title="$t('common.delete')"></my-btn>
						</div>
					</Card>
				</div>
			</div>
		</div>
		<!-- 添加对话框 -->

		<vs-dialog  v-model="showAdd">
			<template #header>
				<h4 style="font-size: 16px;">
					{{operationType == 'create' ? $t('share.addShareFold') : $t('share.updateShareFold')}}
				</h4>
			</template>
			<!-- webdav添加 -->
			<share-add-web-dav v-if="showAdd && serverType == 'WebDav'" :type="operationType" :shareId="selectId"
				ref="addShare" @onClose="onAddFinish" :serverType="serverType">
			</share-add-web-dav>
			<!-- ftp添加 -->
			<share-add-ftp v-if="showAdd && serverType == 'FTP'" :type="operationType" :shareId="selectId"
				ref="addShare" @onClose="onAddFinish" :serverType="serverType">
			</share-add-ftp>
			<my-btn :title="operationType == 'create' ? $t('share.addShareFold') : $t('share.updateShareFold')"
				@click="onCreateShare" style="width: 100%;"></my-btn>
		</vs-dialog>

	</div>
</template>

<script>
	import myHeader from "@/components/my-header/my-header.vue"
	import shareAddFtp from "@/views/fileShare/shareAddFtp.vue"
	import shareAddWebDav from "@/views/fileShare/shareAddWebDav.vue"

	export default {

		components: {
			myHeader,
			shareAddWebDav,
			shareAddFtp,
			shareAddWebDav
		},
		props: {
			serverType: {
				default: "WebDav",
				type: String
			}
		},
		data() {
			return {
				ftpUrl:'',
				webDavUrl: '',
				selectId: null,
				operationType: "create",
				showAdd: false,
				shareList: [],
				loading: false
			}
		},
		mounted() {
			this.getAll()
			console.log(localStorage.ftpUrl)
			this.ftpUrl=localStorage.ftpUrl
			this.webDavUrl=localStorage.webDavUrl
		},
		methods: {
			onAddFinish() {
				this.showAdd = false
				this.getAll()
			},
			editShare(share) {
				this.operationType = "update"
				this.selectId = share.id
				this.showAdd = true
			},
			//点击创建任务按钮回调
			createShare() {
				this.operationType = "create"
				this.showAdd = true
			},
			onCreateShare() {
				this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('share.restartFileShareAlert'), () => {
					this.$refs.addShare.onCreateShare('create')
				})
			},
			getAll() {
				this.loading = true
				this.api
					.post("/api/fileShareApi/getAll", {
						serverType: this.serverType
					})
					.then((res) => {
						if (!res.code) {
							console.log(res.data)
							this.shareList = res.data
							//数据处理
							for (let i = 0; i < this.shareList.length; i++) {
								if (this.shareList[i].users && this.shareList[i].users.length > 0) {
									this.shareList[i].users = JSON.parse(this.shareList[i].users)
								}
							}
						}
						this.loading = false
					})
					.catch((error) => {
						this.loading = false
					});
			},
			deleteShare(share) {
				this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('common.delete') + this.$t('share.shareFold') +
					"[" + share.path + "]," + this
					.$t(
						'share.restartFileShareAlert'), () => {
						this.api
							.post("/api/fileShareApi/delete", {
								id: share.id
							})
							.then((res) => {
								this.showVsNotification(this.$t('common.operationSuccess'))
								for (let i = 0; i < this.shareList.length; i++) {
									if (this.shareList[i].id == share.id) {
										this.shareList.splice(i, 1)
									}
								}
							})
							.catch((error) => {
								console.log(error)
								this.showVsNotification(this.$t('common.operationFail'))
							});
					})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.top-root {
		padding-left: 30px;
		@media all and (max-width:640px) {
			padding-left: 10px;
		}
		z-index: 2;
		width: 100%;
		display: flex;
		align-items: center;
		height: 80px;
		left: 0;
		position: absolute;
	}

	.list-root {
		height: 100%;
		width: 100%;
	}

	.card-root {
		padding: 20px;
		border-radius: 10px;
		margin-bottom: 20px;

	}

	.card-item {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: center;
		margin-top: 10px;
	}

	.card-list {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
		overflow: scroll;
		@media all and (max-width:640px) {
			padding-left: 10px;
			padding-right: 10px;
		}
	}
</style>
