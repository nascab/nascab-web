<template>
	<div>

		<div style="display:flex;flex-direction:row;margin-bottom: 10px;">
			<my-btn :title="$t('security.addOne')" @click="showAddIp = true"></my-btn>
		</div>
		<div style="width:100%;display: flex;flex-direction: column;justify-content: center;align-items: center;">
			<vs-table style="background-color: rgba(255,255,255,0.6);">
				<template #thead>
					<vs-tr>
						<vs-th>
							IP
						</vs-th>
						<vs-th>
							{{$t('security.description')}}
						</vs-th>
						<vs-th>
							{{$t('security.time')}}
						</vs-th>

						<vs-th>
							{{$t('common.action')}}
						</vs-th>
					</vs-tr>
				</template>
				<template #tbody>
					<vs-tr :key="i" v-for="(tr, i) in ipList" :data="tr">
						<vs-td style="text-align: left;">
							{{ tr.ip }}
						</vs-td>
						<vs-td style="text-align: left;">
							{{ tr.remark }}
						</vs-td>
						<vs-td style="text-align: left;">
							{{ tr.create_time }}
						</vs-td>

						<vs-td style="text-align: left;">
							<div style="display: flex;justify-content: center;">
								<my-btn @click="removeIp(i)" :title=" $t('common.delete')" type="red"></my-btn>
							</div>
						</vs-td>
					</vs-tr>
				</template>
				<template #notFound>
					<my-nodata :title="$t('common.noMore')">
					</my-nodata>
				</template>
			</vs-table>

			<div style="width: 800px;margin-top: 20px;">
				<vs-pagination :disabled="loading" v-model="currentPage" :length="pageCount" />
			</div>
		</div>


		<vs-dialog v-model="showAddIp" >
			<template #header>
				<h4 style="font-size: 16px;">
					{{$t('security.addOne') + 'IP'}}
				</h4>
			</template>
			<div>
				<Input prefix="ios-paper" v-if="showAddIp" v-model="newIp"></Input>
			</div>

			<vs-button style="width: 100%;margin-top: 30px;" @click="addIp()">{{$t('common.ok')}}</vs-button>
		</vs-dialog>


	</div>
</template>
<script>
	export default {
		mounted() {
			this.getIpList()
		},
		props: {
			type: {
				default: "black",
				type: String
			}
		},
		watch: {
			currentPage: function(newVal, oldVal) {
				this.oldPage = oldVal
				this.getIpList()
			}
		},
		data() {
			return {
				showAddIp: false,
				newIp: "",
				loading: false,
				oldPage: 1,
				currentPage: 1,
				pageCount: 1,
				ipList: [],
				pageSize: 10,
				columns: [{
						title: 'IP',
						key: 'ip',
						width: 150,
					}, {
						title: this.$t('security.description'),
						key: 'remark',
					},
					{
						width: 200,
						title: this.$t('security.time'),
						key: 'create_time'
					},
					{
						title: this.$t('common.action'),
						slot: 'action',
						align: 'center'
					}
				]
			}
		},
		computed: {

		},
		methods: {
			addIp() {
				let re =
					/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
				let ipOk = re.test(this.newIp);
				if (!ipOk) {
					return this.showVsNotification(this.$t('security.ipFromatWrong'))
				}
				this.api.post('/api/usersApi/addIpToList', {
					ip: this.newIp,
					type: this.type
				}).then((res) => {
					if (!res.code) {
						this.showVsNotification(this.$t('common.operationSuccess'))
						this.getIpList()
					}
				}).catch((error) => {

				})
			},
			removeIp(index) {
				let ipObj = this.ipList[index]
				let modalContent = this.$t('security.removeFromBlackList')
				if (this.type == 'white') {
					modalContent = this.$t('security.removeFromWhiteList')
				}
				this.showVsConfirmDialog(this.$t('common.confirm'), modalContent + ipObj.ip + "?", () => {
					this.api.post('/api/usersApi/removeIp', {
						id: ipObj.id
					}).then((res) => {
						if (!res.code) {
							this.showVsNotification(this.$t('common.operationSuccess'))
							this.getIpList()
						}
					}).catch((error) => {

					})
				})
			},
			getIpList() {
				this.loading = true
				this.api.post('/api/usersApi/getIpList', {
					page: this.currentPage,
					pageSize: this.pageSize,
					type: this.type
				}).then((res) => {
					this.ipList = res.data
					for (let i in this.ipList) {
						if (this.ipList[i].type == 'login') {
							this.ipList[i].typeStr = this.$t('security.login')
						} else if (this.ipList[i].type == 'changePassword') {
							this.ipList[i].typeStr = this.$t('security.changePwd')
						}
					}
					this.loading = false
					this.pageCount = res.pageCount
				}).catch((error) => {
					this.currentPage = this.oldPage
					this.loading = false
				})
			}
		}
	}
</script>
<style lang="scss" scoped>
	.root {
		flex-direction: column;
		display: flex;
		align-items: center;
		width: 100%;
		justify-content: center;
	}
</style>
