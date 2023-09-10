<template>
	<div style="width:100%;height:100%;overflow:hidden">
		<div style="display:flex;flex-direction:row;margin-bottom: 10px;">
			<my-btn :title="$t('security.addOne')" @click="showAddIp = true"></my-btn>
		</div>
		<div style="width:100%;height:100%;overflow-y:auto;overflow-x:hidden;" @scroll="onPageScroll">
			<Card shadow :border="false" class="card-root" v-for="(ipItem, index) in ipList">
				<div class="card-item">
					<h4>IP:</h4>
					<Tag style="margin-left: 10px;border-radius: 10px;background-color: white;">
						{{ ipItem.ip }}
					</Tag>
				</div>
				<div class="card-item">
					<h4>{{ $t('security.description') }}:</h4>
					<Tag style="margin-left: 10px;border-radius: 10px;background-color: white;">
						{{ ipItem.remark }}
					</Tag>
				</div>
				<div class="card-item">
					<h4>{{ $t('security.time') }}:</h4>
					<Tag style="margin-left: 10px;border-radius: 10px;background-color: white;">
						{{ ipItem.create_time }}
					</Tag>
				</div>
				<div class="card-item">
					<my-btn @click="removeIp(index)" :title="$t('common.delete')" type="red"></my-btn>
				</div>
			</Card>

			<!-- 底部的loading和没有更多 -->
			<div style="display: flex;justify-content: center;width: 100%;flex-direction:column;align-items:center">
				<!-- 手动加载更多的按钮 -->
				<Button v-if="hasMore && ipList.length > 0" @click="getIpList()" type="default"
					style="width:250px;margin-top: 30px;height:45px;border-radius:20px">{{ $t('common.loadmore')
					}}</Button>
				<Spin v-if="loading" size="large" style="margin-top:30px"></Spin>
				<span v-if="!loading && !hasMore" style="margin-top: 30px;">{{
						$t('common.noMore')
				}}</span>
				<div style="height:80px"></div>
			</div>
		</div>
		<vs-dialog v-model="showAddIp">
			<template #header>
				<h4 style="font-size: 16px;">
					{{ $t('security.addOne') + 'IP' }}
				</h4>
			</template>
			<div>
				<Input  autocapitalize="off" autocorrect="off" prefix="ios-paper" v-if="showAddIp" v-model="newIp"></Input>
			</div>
			<vs-button style="width: 100%;margin-top: 30px;" @click="addIp()">{{ $t('common.ok') }}</vs-button>
		</vs-dialog>


	</div>
</template>
<script>
export default {
	mounted() {
		//在header的mounted中触发加载第一页数据 在onChooseRange
		this.getIpList()
	},
	beforeDestroy() {
	},
	props: {
		type: {
			default: "black",
			type: String
		}
	},
	data() {
		return {
			showAddIp: false,
			newIp: "",
			hasMore: true,
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
		//滚动回调
		onPageScroll(e) {
			let scrollTop = null;
			let scrollHeight = null;
			if (e.srcElement.scrollingElement) {
				scrollTop = e.srcElement.scrollingElement.scrollTop
				scrollHeight = e.srcElement.scrollingElement.scrollHeight
			} else if (e.srcElement) {
				scrollTop = e.srcElement.scrollTop
				scrollHeight = e.srcElement.scrollHeight
			} else if (e.target) {
				scrollTop = e.target.scrollTop
				scrollHeight = e.target.scrollHeight
			}
			let windowHeight = document.documentElement.clientHeight;
			if (!scrollHeight && e.srcElement.scrollingElement) {
				scrollHeight = e.srcElement.scrollingElement.scrollHeight;
			}
			if (scrollTop + windowHeight >= scrollHeight - 5) {
				this.currentPage += 1
				this.getIpList()
			}
		},
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
					this.showAddIp = false
					this.getIpList(true)
					this.showVsNotification(this.$t('common.operationSuccess'))
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
						this.ipList.splice(index, 1)
						this.showVsNotification(this.$t('common.operationSuccess'))
					}
				}).catch((error) => {

				})
			})
		},
		getIpList(force) {
			if ((this.loading || !this.hasMore) && !force) {
				console.log('this.loading', this.loading)
				console.log('this.hasMore', this.hasMore)
				return
			}
			this.loading = true
			this.api.post('/api/usersApi/getIpList', {
				page: this.currentPage,
				pageSize: this.pageSize,
				type: this.type
			}).then((res) => {
				this.ipList = this.ipList.concat(res.data)
				for (let i in this.ipList) {
					if (this.ipList[i].type == 'login') {
						this.ipList[i].typeStr = this.$t('security.login')
					} else if (this.ipList[i].type == 'changePassword') {
						this.ipList[i].typeStr = this.$t('security.changePwd')
					}
				}
				this.loading = false
				this.pageCount = res.pageCount
				if (res.data.length < this.pageSize) {
					this.hasMore = false
				}
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

.card-root {
	padding: 10px;
	border-radius: 10px;
	margin-bottom: 20px;
	width: 100%;
}

.card-item {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	align-items: center;
	margin-top: 10px;
	width: 100%;
}
</style>
