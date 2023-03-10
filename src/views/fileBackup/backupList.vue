<template>
	<div class="root-wraper">
		<!-- 无数据提示 -->
		<my-nodata v-if="!loading && taskList.length < 1" @onBtnClick="createTask" :title="$t('backup.backupDesc')"
			:btnTitle="$t('backup.createTask')" style="position: absolute;width: 100%;margin-top: 150px;">
		</my-nodata>

		<div class="top-root" v-if="taskList.length > 0">
			<my-btn style="margin-right: 20px;" @click="createTask()" :title="$t('backup.createTask')"></my-btn>
			<my-btn type="white" @click="getAllTask()" :title="$t('backup.refreshStatus')"></my-btn>
		</div>

		<div style="width:100%;height: 100%;display:flex;flex-direction:row;overflow: hidden;padding-top: 80px;">
			<div class="task-list" ref="listWrapper">
				<Card shadow :border="false" class="card-root" v-for="task in taskList">
					<div style="display: flex;flex-direction: row;align-items: center;justify-content: space-between;">
						<!-- 任务名称 -->
						<div class="card-item">
							<h4>{{ $t('backup.taskName') }}:</h4>
							<h4 style="margin-left: 10px;">{{ task.task_name }}</h4>
						</div>
						<!-- 编辑和删除 -->
						<div style="flex-shrink: 0;">
							<a @click="showRecordsModal(task)" style="margin-right: 10px;">{{ $t('backup.records')
							}}</a>
							<a @click="editTask(task)" style="margin-right: 10px;">{{ $t('common.edit') }}</a>
							<a @click="deleteTask(task)">{{ $t('common.delete') }}</a>
						</div>
					</div>
					<div style="width: 100%;height: 100%;display: flex;flex-direction: column;align-items: flex-start;">
						<!-- 当前状态 -->
						<div class="card-item">
							<h4>{{ $t('backup.currentStat') }} </h4>
							<p class="item-content" v-if="task.lastRecord && task.lastRecord.status == 'running'">:
								{{ $t('backup.running') }}
							</p>
							<!-- 已复制的量 -->
							<div
								v-if="task.lastRecord && task.lastRecord.status == 'running' && task.lastRecord.copy_size">
								<!-- 小于1m显示kb -->
								<span class="item-content" v-if="task.lastRecord.copy_size / 1024 <= 1024">{{
										parseInt(task.lastRecord.copy_size
											/ 1024)
								}}KB</span>
								<!-- 小于1g显示mb -->
								<span class="item-content"
									v-else-if="task.lastRecord.copy_size / 1024 / 1024 <= 1024">{{
											parseInt(task.lastRecord.copy_size / 1024
												/ 1024)
									}}MB</span>
								<!-- 大于1g显示gb -->
								<span class="item-content" v-else-if="task.lastRecord.copy_size / 1024 / 1024 > 1024">
									{{ parseFloat(parseInt(task.lastRecord.copy_size / 1024 / 1024 / 1024 * 100) / 100)
									}}GB
								</span>
								{{ $t('backup.copied') }}
							</div>

							<p class="item-content" v-if="task.lastRecord && task.lastRecord.status == 'stop'">:
								{{ $t('backup.paused') }}
							</p>
							<p class="item-content" v-if="task.lastRecord && task.lastRecord.status == 'waiting'">:
								{{ $t('backup.waiting') }}
							</p>
							<p class="item-content" v-if="!task.lastRecord || task.lastRecord.status == 'done'">:
								{{ $t('backup.noRunning') }}
							</p>
							<Icon @click="exeTask(task.id, 'stop')" type="ios-pause" size="24"
								v-if="task.lastRecord && task.lastRecord.status == 'running'"></Icon>
							<Icon @click="exeTask(task.id, 'start')"
								v-if="!task.lastRecord || task.lastRecord.status == 'done' || task.lastRecord.status == 'stop'"
								type="ios-play" size="24">
							</Icon>
						</div>
						<!-- 备份频率 -->
						<div class="card-item">
							<h4 style="margin-right: 10px;">{{ $t('backup.backupRate') }}:</h4>
							<span class="item-content">{{ task.task_type_str }}</span>
							<p class="item-content" v-if="task.task_type == '1'">: {{ task.task_day }}
								{{ task.task_time }}
							</p>
							<p class="item-content" v-if="task.task_type == '2'">: {{ task.task_time }}</p>
							<p class="item-content" v-if="task.task_type == '3'"> : {{ task.task_day_str }}
								{{ task.task_time }}
							</p>
							<p class="item-content" v-if="task.task_type == '4'">
								{{ task.task_day }}{{ $t('common.day') }} :
								{{ task.task_time }}
							</p>
						</div>
						<!-- 备份文件夹 -->
						<div class="card-item">
							<h4>{{ $t('backup.backupPath') }}:</h4>
							<div v-for="(path, index) in task.source_list">
								<Tag class="item-content" style="margin-left: 10px;background-color: white;">
									{{ path }}
								</Tag>
							</div>
						</div>
						<!-- 目标文件夹 -->
						<div class="card-item">
							<h4 style="margin-right: 10px;">{{ $t('backup.targetPath') }}:</h4>
							<Tag class="item-content" style="background-color: white;">{{ task.target_path }}</Tag>
						</div>
						<!-- 排除文件夹 -->
						<div class="card-item" v-if="task.exclude_list && task.exclude_list.length > 0">
							<h4>{{ $t('backup.excludeList') }}:</h4>
							<div v-for="(path, index) in task.exclude_list">
								<Tag class="item-content" style="margin-left: 10px;background-color: white;">
									{{ path }}
								</Tag>
							</div>
						</div>
						<!-- 上次备份状态-->
						<div class="card-item" v-if="task.lastRecord && task.lastRecord.status == 'done'">
							<h4 style="margin-right: 10px;">{{ $t('backup.lastBackupStat') }}:</h4>
							<span style="margin-right:10px;" class="icon-main-color"
								v-if="task.lastRecord.fail_count == 0">{{ $t('backup.backupSuccess') }}</span>
							<p class="item-content">
								{{ $t('backup.failCount') }}:{{ task.lastRecord.fail_count }}
							</p>
						</div>
						<!-- 上次备份时间 -->
						<div class="card-item" v-if="task.lastRecord && task.lastRecord.status == 'done'">
							<h4 style="margin-right: 10px;">{{ $t('backup.lastBackupTime') }}:</h4>
							<p class="item-content">
								{{ task.lastRecord && task.lastRecord.end_time ? task.lastRecord.end_time : '/' }}
							</p>
						</div>
					</div>
				</Card>
			</div>
		</div>
		<!-- 添加任务对话框 -->
		<Modal blur v-model="showAdd" footer-hide>
			<template #header>
				<h4 style="font-size: 16px;">
					{{ operationType == 'update' ? $t('backup.updateTask') : $t('backup.createTask') }}
				</h4>
			</template>
			<add-task v-if="showAdd" :type="operationType" :taskId="selectId" ref="addTask" @onClose="onAddFinish">
			</add-task>
			<vs-button style="margin-top: 10px;margin-bottom: 10px;width: 100%;border-radius: 20px;" @click="onCreateTask">
				{{ operationType == 'update' ? $t('backup.updateTask') : $t('backup.createTask') }}
			</vs-button>
		</Modal>

		<!-- 展示备份记录的对话框 -->
		<Modal v-model="showRecords" footer-hide>
			<template #header>
				<h4 style="font-size: 16px;">
					{{ selectedTask ? selectedTask.task_name + ' ' + $t('backup.records') : $t('backup.records') }}
				</h4>
			</template>
			<backup-records v-if="showRecords" :taskObj="selectedTask" ref="taskRecord">
			</backup-records>
		</Modal>
	</div>
</template>

<script>
import myHeader from "@/components/my-header/my-header.vue"
import addTask from "@/views/fileBackup/backupAddTask.vue"
import backupRecords from "@/views/fileBackup/backupRecords.vue"

export default {
	props: {
		taskType: {
			default: "",
			type: String
		}
	},
	computed: {

	},
	components: {
		myHeader,
		addTask,
		backupRecords
	},
	data() {
		return {
			intervalGetRunningTask: null,
			loading: false,
			selectedTask: null,
			showRecords: false,
			getListInterval: null,
			selectId: null,
			operationType: "create",
			showAdd: false,
			taskList: [],
		}
	},
	created() {
		this.intervalGetRunningTask = setInterval(() => {
			this.getRunningTaskList()
		}, 5000)
	},
	beforeDestroy() {
		if (this.intervalGetRunningTask) {
			clearInterval(this.intervalGetRunningTask)
		}
	},
	mounted() {
		console.log(this.taskType)
		this.getAllTask()


	},
	unmounted() { },
	methods: {
		showRecordsModal(task) {
			this.selectedTask = task
			this.showRecords = true
		},
		exeTask(id, type) {
			let alertContent = this.$t('backup.ifRunTask')
			if (type == "stop") {
				alertContent = this.$t('backup.ifStopTask')
			}

			this.showVsConfirmDialog(this.$t('common.confirm'), alertContent, () => {
				this.api
					.post("/api/backupApi/operationTask", {
						type: type,
						taskId: id
					})
					.then((res) => {
						console.log(res)
						this.showVsNotification(this.$t('backup.orderSent'))
						this.getAllTask()
					})
					.catch((error) => {
						this.showVsNotification(this.$t('common.operationFail'))
					});
			})
		},
		onAddFinish() {
			this.showAdd = false
			this.getAllTask()
		},
		editTask(task) {
			console.log(task)
			this.operationType = "update"
			this.selectId = task.id
			this.showAdd = true
		},
		//点击创建任务按钮回调
		createTask() {
			this.operationType = "create"
			this.showAdd = true
		},
		onCreateTask() {
			this.$refs.addTask.onCreateTask('create')
		},
		dealTaskList() {
			for (let i = 0; i < this.taskList.length; i++) {
				this.taskList[i].source_list = JSON.parse(this.taskList[i].source_list)
				this.taskList[i].exclude_list = JSON.parse(this.taskList[i].exclude_list)
				if (parseInt(this.taskList[i].task_type) == 1) {
					this.taskList[i].task_type_str = this.$t('backup.oneTime')
				} else if (parseInt(this.taskList[i].task_type) == 2) {
					this.taskList[i].task_type_str = this.$t('backup.everyDay')
				} else if (parseInt(this.taskList[i].task_type) == 3) {
					this.taskList[i].task_type_str = this.$t('backup.everyWeek')
					if (this.taskList[i].task_day == '1') {
						this.taskList[i].task_day_str = this.$t('common.monday')
					} else if (this.taskList[i].task_day == '2') {
						this.taskList[i].task_day_str = this.$t('common.tuesday')
					} else if (this.taskList[i].task_day == '3') {
						this.taskList[i].task_day_str = this.$t('common.wednesday')
					} else if (this.taskList[i].task_day == '4') {
						this.taskList[i].task_day_str = this.$t('common.thursday')
					} else if (this.taskList[i].task_day == '5') {
						this.taskList[i].task_day_str = this.$t('common.friday')
					} else if (this.taskList[i].task_day == '6') {
						this.taskList[i].task_day_str = this.$t('common.saturday')
					} else if (this.taskList[i].task_day == '7') {
						this.taskList[i].task_day_str = this.$t('common.sunday')
					}
				} else if (parseInt(this.taskList[i].task_type) == 4) {
					this.taskList[i].task_type_str = this.$t('backup.everyMonth')
				}
			}
		},
		getRunningTaskList() {
			//获取正在运行的任务
			this.api
				.post("/api/backupApi/getRunningTaskList", {
					hideLoading: true
				})
				.then((res) => {
					let runningList = res.data
					if (!this.taskList) {
						return
					}
					for (let i in this.taskList) {
						for (let j in runningList) {
							if (runningList[j].task_id == this.taskList[i].id) {
								this.taskList[i].lastRecord = runningList[j]
							}
						}
					}
					if (runningList.length < 1) {
						//没有正在运行的任务了
						for (let i in this.taskList) {
							if (this.taskList[i].lastRecord.status == 'running' || this.taskList[i].lastRecord
								.status == 'waiting') {
								this.getAllTask()
								return
							}
						}
					}
				})
				.catch((error) => { });
		},
		getAllTask() {
			this.loading = true
			this.api
				.post("/api/backupApi/getAllTask", {
					taskType: this.taskType
				})
				.then((res) => {
					console.log(res)
					this.taskList = res.data
					this.dealTaskList()
					this.loading = false
				})
				.catch((error) => {
					this.loading = false
				});
		},
		deleteTask(task) {
			this.showVsConfirmDialog(this.$t('common.confirm'), "[" + task.task_name + "]" + this.$t(
				'common.deleteSure'), () => {
					this.api
						.post("/api/backupApi/deleteTask", {
							id: task.id
						})
						.then((res) => {
							this.showVsNotification(this.$t('common.operationSuccess'))
							for (let i = 0; i < this.taskList.length; i++) {
								if (this.taskList[i].id == task.id) {
									this.taskList.splice(i, 1)
								}
							}
						})
						.catch((error) => {
							this.showVsNotification(this.$t('common.operationFail'))
						});
				})
		}
	}
}
</script>

<style lang="scss" scoped>
.top-root {
	padding-left: 20px;
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

.root-wraper {
	width: 100%;
	height: 100%;
}

.task-list {
	@media all and (max-width:640px) {
		padding-left: 10px;
		padding-right: 10px;
	}
	height: 100%;
	width: 100%;
	overflow: scroll;
	align-content: flex-start;
}

.card-root {
	padding: 20px;
	border-radius: 10px;
	margin-bottom: 20px;
}

.card-item {
	width: 100%;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	align-items: center;
	margin-top: 10px;
}

.item-content {
	color: $nas-grey;
}
</style>
