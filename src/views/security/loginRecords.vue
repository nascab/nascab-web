<template>
	<div class="root">
		<div style="width:100%;display: flex;flex-direction: column;justify-content: center;align-items: center;">
			<vs-table style="background-color: rgba(255,255,255,0.6);">
				<template #thead>
					<vs-tr>
						<vs-th>
							{{ $t('security.username') }}
						</vs-th>
						<vs-th>
							{{ $t('security.type') }}
						</vs-th>
						<vs-th>
							IP
						</vs-th>
						<vs-th>
							{{ $t('security.client') }}
						</vs-th>
						<vs-th>
							{{ $t('security.time') }}
						</vs-th>
					</vs-tr>
				</template>
				<template #tbody>
					<vs-tr :key="i" v-for="(tr, i) in recordList" :data="tr">
						<vs-td style="text-align: left;">
							{{ tr.username }}
						</vs-td>
						<vs-td style="text-align: left;">
							{{ tr.typeStr }}
						</vs-td>
						<vs-td style="text-align: left;">
							{{ tr.ip }}
						</vs-td>
						<vs-td style="text-align: left;">
							<vs-tooltip>
								{{ tr.remark}}
							</vs-tooltip>
						</vs-td>
						<vs-td style="text-align: left;">
							{{ tr.create_time }}
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

	</div>
</template>


<script>
import utils from "@/plugins/utils";

export default {
	mounted() {
		this.getRecordList()
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
		getRecordList() {
			this.loading = true
			this.api.post('/api/usersApi/getRecordList', {
				page: this.currentPage,
				pageSize: this.pageSize,
				type: this.type
			}).then((res) => {
				this.recordList = res.data
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
}
</style>
