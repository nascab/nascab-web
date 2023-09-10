<template>
	<div style="width:100%;height:100%;overflow:hidden">
		<div class="security-root" @scroll="onPageScroll">

			<Card shadow :border="false" class="card-root" v-for="record in recordList">
				<div class="card-item">
					<h4>{{ $t('security.username') }}:</h4>
					<Tag style="margin-left: 10px;border-radius: 10px;background-color: white;">
						{{ record.username }}
					</Tag>
				</div>
				<div class="card-item">
					<h4>{{ $t('security.type') }}:</h4>
					<Tag style="margin-left: 10px;border-radius: 10px;background-color: white;">
						{{ record.typeStr }}
					</Tag>
				</div>
				<div class="card-item">
					<h4>IP:</h4>
					<Tag style="margin-left: 10px;border-radius: 10px;background-color: white;">
						{{ record.ip }}
					</Tag>
				</div>
				<div class="card-item">
					<h4>{{ $t('security.time') }}:</h4>
					<Tag style="margin-left: 10px;border-radius: 10px;background-color: white;">
						{{ record.create_time }}
					</Tag>
				</div>
				<div class="card-item">
					<h4>{{ $t('security.client') }}:</h4>
					<span style="border-radius: 10px;background-color: white;text-align:left">
						{{ record.remark }}
					</span>
				</div>
				
			</Card>

			<!-- 底部的loading和没有更多 -->
			<div style="display: flex;justify-content: center;width: 100%;flex-direction:column;align-items:center">
				<!-- 手动加载更多的按钮 -->
				<Button v-if="hasMore && recordList.length > 0" @click="getRecordList()" type="default"
					style="width: 250px;margin-top: 30px;height:45px;border-radius:20px">{{ $t('common.loadmore')
					}}</Button>
				<Spin v-if="loading" size="large" style="margin-top:30px"></Spin>
				<span v-if="!loading && !hasMore" style="margin-top: 30px;">{{
						$t('common.noMore')
				}}</span>
				<div style="height:80px"></div>
			</div>

		</div>
	</div>
</template>
<script>
import utils from "@/plugins/utils";

export default {
	mounted() {
		//在header的mounted中触发加载第一页数据 在onChooseRange
		this.getRecordList()
	},
	beforeDestroy() {
	},

	components: {

	},
	watch: {
		currentPage: function (newVal, oldVal) {
			this.oldPage = oldVal
			this.getRecordList()
		}
	},
	data() {
		return {
			hasMore: true,
			loading: false,
			oldPage: 1,
			currentPage: 1,
			pageCount: 1,
			recordList: [],
			pageSize: 10,
			type: ''
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
				this.getRecordList()
			}
		},
		getRecordList() {
			if (this.loading || !this.hasMore) {
				return
			}
			this.loading = true
			this.api.post('/api/usersApi/getRecordList', {
				page: this.currentPage,
				pageSize: this.pageSize,
				type: this.type
			}).then((res) => {
				this.recordList = this.recordList.concat(res.data)
				for (let i in this.recordList) {
					if (this.recordList[i].type == 'login') {
						this.recordList[i].typeStr = this.$t('security.login')
					} else if (this.recordList[i].type == 'changePassword') {
						this.recordList[i].typeStr = this.$t('security.changePwd')
					} else {
						this.recordList[i].typeStr = this.recordList[i].type
					}

					this.recordList[i].create_time = utils.formatTimeStamp(this.recordList[i].create_time)

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
.security-root {
	overflow-y: auto;
	overflow-x: hidden;
	flex-direction: column;
	display: flex;
	align-items: center;
	height: 100%;
	width: 100%;
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
