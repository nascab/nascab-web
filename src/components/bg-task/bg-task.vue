<template>
	<div :class="{ 'bgtask-root-mobile': mobileLayout, 'bgtask-root': !mobileLayout }">
		<div style="width: 100%;display: flex;justify-content: center;margin-top: 15px;">
			<div style="width: 100%;font-weight: bold;text-align: left;">{{ $t('home.bgTask') }}</div>
		</div>

		<div v-for="item in taskList">
			<div style="display: flex;align-items:center;margin-top: 10px;">
				<div class="blue-point"></div>
				<div class="task-type">{{ item.taskTypeStr }}
					<Icon v-if="item.taskTypeStrAlert" @click="showVsAlertDialog($t('common.alert'), item.taskTypeStrAlert)"
						style="cursor: pointer;margin-left: 5px;" size="16" type="ios-help-circle-outline" />
				</div>
			</div>
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
		<vs-button v-if="!mobileLayout" @click="$emit('setBgTaskShow', false)" icon class="closs-btn">
			<Icon type="md-close-circle" color="#386DF2" size="25" />
		</vs-button>
	</div>
</template>

<script>


export default {
	props: {
		mobileLayout: {//是否使用手机布局
			default: false,
			type: Boolean,
		}
	},
	components: {

	},
	computed: {

	},
	data() {
		return {
			timer: null,
			taskList: [],
			loading: false,
			popedTaskIdList: [],//已经弹出过得运行中任务就不再弹出了
		};
	},
	mounted() {
		if (this.timer == null) {
			this.timer = setInterval(this.getBgTaskList, 8000)
		}
		this.getBgTaskList()
	},

	beforeDestroy() {
		if (this.timer) {
			clearInterval(this.timer)
			this.timer = null
		}
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
								this.getBgTaskList()
							}
						})
				})
		},
		getBgTaskList(taskState) {
			if (!this.isInHome()) {
				return
			}
			if (!taskState) {
				taskState = 1
			}
			
			if (this.loading) {
				return
			}
			if (!this.$store.state.token) {
				return
			}
			this.loading = true
			let params =
			{
				taskState: taskState,
				count: 10,
				offset: 0,
				hideLoading: true
			}

			//获取正在执行的背景任务
			this.api.post('/api/commonApi/getBgTask', params).then((res) => {
				this.loading = false
				
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
						} else if (this.taskList[i].task_type == "FILE_OPERATION") {
							//复制或者剪切
							this.taskList[i].showDelete = true
							let taskParams = JSON.parse(this.taskList[i].task_json)
							console.log('taskParams', taskParams)
							if (taskParams.type == 'copy') {
								this.taskList[i].taskTypeStr = this.$t('file.copy') + " " + taskParams.sourcePath
								this.taskList[i].sizeStr = this.utils.getSizeStr(item.size_current) + this.$t('backup.copied') + "..."
							} else if (taskParams.type == 'cut') {
								this.taskList[i].taskTypeStr = this.$t('file.cut') + " " + taskParams.sourcePath
								this.taskList[i].sizeStr = this.utils.getSizeStr(item.size_current) + this.$t('file.cuttedSize') + "..."
							} else if (taskParams.type == 'zip') {
								this.taskList[i].taskTypeStr = this.$t('file.zip') + " " + taskParams.sourcePath
								this.taskList[i].sizeStr = this.utils.getSizeStr(item.size_current) + this.$t('file.ziped') + "..."
							} else if (taskParams.type == 'unzip') {
								this.taskList[i].taskTypeStr = this.$t('file.unzip') + " " + taskParams.sourcePath
								this.taskList[i].sizeStr = this.utils.getSizeStr(item.size_current) + "..."
							}
						} else if (this.taskList[i].task_type == "PACKAGE_UPDATE") {
							//安装包更新
							this.taskList[i].taskTypeStr = this.$t('setting.downloadPackage')
							if (item.progress_current && item.progress_current > 95) {
								this.taskList[i].taskTypeStr = this.$t('setting.downloadPackage')
							}
						} else if (this.taskList[i].task_type == 'GEN_TINY_IMAGE') {
							//生成缩略图
							this.taskList[i].taskTypeStr = this.$t('photo.genningTinyImage')
						} else if (this.taskList[i].task_type == 'AI_FACES') {
							//人脸识别
							this.taskList[i].taskTypeStr = this.$t('photo.doingAiFaces')
						} else if (this.taskList[i].task_type == 'AI_CLASSES') {
							//物体识别
							this.taskList[i].taskTypeStr = this.$t('photo.doingAiClasses')
						} else if (this.taskList[i].task_type == 'AI_PHASH') {
							//扫描重复照片
							this.taskList[i].taskTypeStr = this.$t('photo.doingPhash')
						} else if (this.taskList[i].task_type == 'SUBTITLE_PRE_GEN') {
							//字幕预提取
							this.taskList[i].taskTypeStr = this.$t('movie.subtitlePreGen') + "..."
							this.taskList[i].taskTypeStrAlert = this.$t('movie.subtitlePreGenAlert') + "[" + this.$t('movie.subtitlePrenGenClose') + "]"
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
					}
					//有新任务会自动弹出列表 弹出过得id就不弹了 只有首页弹
					if (this.taskList.length > 0 && window.location.href.includes("/home") && !this.mobileLayout && !this.isFromApp) {
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
			}).catch((err) => {
				this.loading = false
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
	box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.1);
}

.bgtask-root-mobile {
	border-radius: 10px !important;
	@extend .bgtask-root;
}

.blue-point {
	margin-right: 10px;
	background-color: $nas-main;
	width: 8px;
	height: 8px;
	border-radius: 50%;
}

.task-type {
	text-align: left;
	width: 100%;
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
	margin-top: 10px;
	margin-bottom: 10px;
	color: $nas-grey;
}

.task-icon {
	margin-left: 5px;
	color: $nas-grey;
	cursor: pointer;
}</style>
