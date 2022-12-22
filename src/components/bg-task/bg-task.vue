<template>
	<div class="bgtask-root">
		<div style="width: 100%;display: flex;justify-content: center;">
			<div style="font-weight: bold;">{{ $t('home.bgTask') }}</div>
		</div>

		<div v-for="item in taskList">
			<div class="task-type">{{ item.taskTypeStr }}</div>
			<div style="display:flex;align-items: center;">
				<div v-if="item.sizeStr" class="size-str">{{ item.sizeStr }}</div>
				<Progress v-if="item.percent" :percent="item.percent" :stroke-width="20" status="active" text-inside />
				<div @click="deleteTask(item)" v-if="item.showDelete">
					<Icon type="md-close" class="task-icon" size="20" />
				</div>
			</div>
		</div>
		<!-- 没有正在执行的任务 -->
		<div class="no-task-text" v-if="taskList.length < 1">
			{{ $t('home.haveNoRunningTasks') }}
		</div>

		<!-- 关闭按钮 -->
		<vs-button @click="$emit('setBgTaskShow', false)" icon class="closs-btn">
			<Icon type="md-close-circle" color="#386DF2" size="25" />
		</vs-button>
	</div>
</template>

<script>


export default {
	props: {

	},
	components: {

	},
	computed: {

	},
	data() {
		return {
			taskList: [],
			popedTaskIdList: [],//已经弹出过得运行中任务就不再弹出了
		};
	},
	mounted() {
		// 每隔一段时间获取一次背景任务状态
		setInterval(() => {
			if (this.$store.state.token) this.getBgTaskList(1)
		}, 10000);
		if (this.$store.state.token) this.getBgTaskList(1)
	},
	destroyed() {

	},
	methods: {
		//删除任务的接口
		deleteTask(item) {
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t(
				'home.sureDeleteBgTask'), () => {
					this.api.post('/api/commonApi/deleteBgTask',
						{
							taskId: item.id
						}).then((res) => {
							if (!res.code) {
								this.getBgTaskList(1)
							}
						})
				})
		},
		getBgTaskList(taskState) {
			let params =
			{
				taskState: taskState,
				count: 10,
				offset: 0,
				hideLoading: true
			}
			let playerCount = sessionStorage.getItem('player-count')
			if (!playerCount||playerCount<1) {
				//如果当前没有在执行播放 那么查看下是否有残留的 停止失败的playid 有的话一起发送给服务器 让服务区停止转码
				let playIdList = sessionStorage.getItem('play-id-list')
				console.log('bgtask 取出保存的playIdList', playIdList)
				if (playIdList) {
					try {
						playIdList = JSON.parse(playIdList)
						params.playIdList = playIdList
					} catch (err) { }
				}
			}
			//获取正在执行的背景任务
			this.api.post('/api/commonApi/getBgTask', params).then((res) => {
				if (!res.code) {
					if (params.playIdList && params.playIdList.length > 0) {
						sessionStorage.setItem('play-id-list', [])
					}
					this.taskList = res.data
					for (let i in this.taskList) {
						let item = this.taskList[i]
						// 转换任务类型的显示名称
						if (this.taskList[i].task_type == "EXPORT_PRIVATE_SPACE") {
							this.taskList[i].taskTypeStr = this.$t('private.exportSpaceData')
							this.taskList[i].showDelete = true
						} else if (this.taskList[i].task_type == "BACKUP") {
							this.taskList[i].taskTypeStr = this.$t('home.backup') + " " + this.taskList[i].task_name
						}
						// 设置任务执行百分比
						if (item.size_current && item.size_all && item.size_current > 0) {
							this.taskList[i].percent = parseInt(Math.ceil(parseFloat(item.size_current) / parseFloat(item.size_all) * 100))
							console.log('有size', item.size_current, item.size_all)
						} else if (item.progress_current && item.progress_all && item.progress_current > 0) {
							this.taskList[i].percent = parseInt(Math.ceil(parseFloat(item.progress_current) / parseFloat(item.progress_all) * 100))
							console.log('有progress', item.progress_current, item.progress_all)
						} else if (item.size_current && item.size_current > 0) {
							if (item.task_type == "BACKUP") {
								this.taskList[i].sizeStr = this.utils.getSizeStr(item.size_current) + this.$t('backup.copied') + "..."
							}
						}
						console.log(item)
						console.log(this.taskList[i].percent)
					}
					//有新任务会自动弹出列表 弹出过得id就不弹了
					if (this.taskList.length > 0) {
						let shoulePopBgTask = false
						for (let i in this.taskList) {
							if (!this.popedTaskIdList.includes(this.taskList[i].id)) {
								shoulePopBgTask = true
							}
							this.popedTaskIdList.push(this.taskList[i].id)
						}
						if (shoulePopBgTask) {
							this.$emit('setBgTaskShow', true)
						}
					} else {
						this.popedTaskIdList = []
					}
				}
			})
		},
	}
}
</script>

<style lang="scss" scoped>
.bgtask-root {
	border: solid 1px $nas-grey;
	width: 100%;
	background-color: rgba(255, 255, 255, 1);
	border-radius: 20px;
	padding: 20px;
	box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.3);
}

.task-type {
	text-align: left;
	width: 100%;
	margin-bottom: 10px;
	margin-top: 10px;
}

.size-str {
	color: $nas-grey;
}

.closs-btn {
	border: solid 1px $nas-grey;
	position: absolute;
	left: -12px;
	top: -12px;
	background-color: white;
}

.no-task-text {
	margin-top: 20px;
	margin-bottom: 20px;
	color: $nas-grey;
}

.task-icon {
	margin-left: 5px;
	color: $nas-grey;
	cursor: pointer;
}
</style>
