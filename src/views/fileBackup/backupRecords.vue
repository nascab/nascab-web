<template>
	<div>
		<p v-if="recordList.length < 1 && !loading">{{ $t('bakcup.noRecords') }}</p>
		<div class="root">
			<Card shadow :border="false" class="card-root" v-for="(record, index) in recordList">
				<div style="width: 100%;height: 100%;display: flex;flex-direction: column;align-items: flex-start;">
					<div class="card-item">
						<h4>{{ $t('backup.startTime') }}: {{ record.start_time }}</h4>
					</div>
					<div class="card-item">
						<h4>{{ $t('backup.endTime') }}: {{ record.end_time }}</h4>
					</div>
					<div class="card-item">
						<h4>{{ $t('backup.copySize') }}:
							<!-- 小于1m显示kb -->
							<span v-if="record.copy_size / 1024 <= 1024">{{ parseInt(record.copy_size / 1024) }}KB</span>
							<!-- 小于1g显示mb -->
							<span
								v-else-if="record.copy_size / 1024 / 1024 <= 1024">{{ parseInt(record.copy_size / 1024 / 1024) }}MB</span>
							<!-- 大于1g显示gb -->
							<span v-else-if="record.copy_size / 1024 / 1024 > 1024">
								{{ parseFloat(parseInt(record.copy_size / 1024 / 1024 / 1024 * 100) / 100) }}GB
							</span>
						</h4>
					</div>
					<!-- 拷贝数量 -->
					<div class="card-item">
						<h4>{{ $t('backup.copyCount') }}: {{ record.copy_count }}</h4>
					</div>
					<!-- 排除数量 -->
					<div class="card-item">
						<h4>{{ $t('backup.excludeCount') }}: {{ record.exclude_count }}</h4>
					</div>
					<!-- 错误数量 -->
					<div class="card-item" @click="getRecordMsg(record, index)">
						<h4 v-if="!record.fail_count">{{ $t('backup.failCount') }}: {{ record.fail_count }}</h4>
						<a v-else style="color: red;">{{ $t('backup.failCount') }}: {{ record.fail_count }}</a>
					</div>
					<!-- 错误列表 -->
					<div class="card-item" style="width: 100%;" v-if="record.errorList && record.errorList.length > 0"
						v-for="error in record.errorList">
						<div style="width: 100%;height: 1px;background-color: #d8d8d8;"></div>
						<p style="color: red;word-break: break-all;margin-top: 5px;margin-bottom: 5px;">
							{{ error.content }}
						</p>
					</div>
				</div>
			</Card>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		taskObj: {
			default: null,
			type: Object
		}
	},
	computed: {

	},
	components: {

	},
	data() {
		return {
			loading: false,
			showMsg: false,
			recordList: []
		}
	},
	mounted() {
		this.getAllTaskRecords()
	},
	methods: {
		getRecordMsg(record, index) {
			this.api
				.post("/api/backupApi/getTaskRecordMsg", {
					recordId: record.id
				})
				.then((res) => {
					this.recordList[index].errorList = res.data
					this.$forceUpdate()
				})
				.catch((error) => { });
		},
		getAllTaskRecords() {
			this.loading = true
			this.api
				.post("/api/backupApi/getTaskRecords", {
					id: this.taskObj.id
				})
				.then((res) => {
					this.recordList = res.data
					this.loading = false
				})
				.catch((error) => { this.loading = false });
		},
	}
}
</script>

<style lang="scss" scoped>
.root {
	height: 100%;
}

.top-root {
	display: flex;
	align-items: center;
	height: 60px;
	position: fixed;
	top: 60px;
	left: 150px;
	border-bottom: #eee 1px solid;
}

.card-root {
	margin: 10px;
}

.card-item {

	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	align-items: center;
	margin-top: 5px;

}
</style>
