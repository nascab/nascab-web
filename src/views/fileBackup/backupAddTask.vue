<template>
	<div>
		<Form prop="taskName" ref="taskData" :model="taskData">
			<FormItem :label="$t('backup.taskName')">
				<Input autocapitalize="off" autocorrect="off"  v-model="taskData.taskName"></Input>
			</FormItem>
			<!-- 备份频率 1：一次 2:每天 3:每周 4:每月-->
			<FormItem :label="$t('backup.backupRate') + ':'">
				<RadioGroup v-model="taskData.taskType" @on-change="onChooseRate">
					<Radio label="1">{{ $t('backup.oneTime') }}</Radio>
					<Radio label="2">{{ $t('backup.everyDay') }}</Radio>
					<Radio label="3">{{ $t('backup.everyWeek') }}</Radio>
					<Radio label="4">{{ $t('backup.everyMonth') }}</Radio>
				</RadioGroup>
			</FormItem>
			<!-- 日期选择 -->
			<FormItem v-if="taskType == '1'" :label="$t('backup.backupDate') + ':'">
				<DatePicker type="date" v-model="taskData.taskDay" @on-change="onChooseDate"></DatePicker>
			</FormItem>
			<!-- 星期选择 每周备份的时候使用 -->
			<FormItem v-if="taskType == '3'" :label="$t('backup.chooseWeek') + ':'">
				<RadioGroup v-model="taskData.taskDay">
					<Radio label="1">{{ $t('common.monday') }}</Radio>
					<Radio label="2">{{ $t('common.tuesday') }}</Radio>
					<Radio label="3">{{ $t('common.wednesday') }}</Radio>
					<Radio label="4">{{ $t('common.thursday') }}</Radio>
					<Radio label="5">{{ $t('common.friday') }}</Radio>
					<Radio label="6">{{ $t('common.saturday') }}</Radio>
					<Radio label="7">{{ $t('common.sunday') }}</Radio>
				</RadioGroup>
			</FormItem>
			<!-- 日期选择 每月备份使用-->
			<FormItem v-if="taskType == '4'" :label="$t('backup.whichDayInMonth') + '?'">
				<Select v-model="taskData.taskDay">
					<Option value="1">1</Option>
					<Option value="2">2</Option>
					<Option value="3">3</Option>
					<Option value="4">4</Option>
					<Option value="5">5</Option>
					<Option value="6">6</Option>
					<Option value="7">7</Option>
					<Option value="8">8</Option>
					<Option value="9">9</Option>
					<Option value="10">10</Option>
					<Option value="11">11</Option>
					<Option value="12">12</Option>
					<Option value="13">13</Option>
					<Option value="14">14</Option>
					<Option value="15">15</Option>
					<Option value="16">16</Option>
					<Option value="17">17</Option>
					<Option value="18">18</Option>
					<Option value="19">19</Option>
					<Option value="20">20</Option>
					<Option value="21">21</Option>
					<Option value="22">22</Option>
					<Option value="23">23</Option>
					<Option value="24">24</Option>
					<Option value="25">25</Option>
					<Option value="26">26</Option>
					<Option value="27">27</Option>
					<Option value="28">28</Option>
					<Option value="29">29</Option>
					<Option value="30">30</Option>
					<Option value="31">31</Option>
				</Select>
			</FormItem>
			<FormItem :label="$t('backup.backupTime') + ':'">
				<TimePicker type="time" v-model="taskData.taskTime"></TimePicker>
			</FormItem>
			<Divider></Divider>
			<!-- 备份文件夹 -->
			<FormItem>
				<Button style="border-radius: 20px;" type="primary" @click="choosePath('source')">{{
					$t('backup.choosePathWantBakcup') }}</Button>
			</FormItem>

			<h4 v-if="taskData.sourceList.length > 0">{{ $t('backup.backupPath') }}：</h4>
			<div v-for="(path, index) in taskData.sourceList">
				<Tag @on-close="deleteSource(index)" closable style="margin-top: 5px;">
					{{ path }}
				</Tag>
			</div>
			<Divider></Divider>
			<!-- 目标文件夹 -->
			<FormItem>
				<Button style="border-radius: 20px;" type="primary" @click="choosePath('target')">{{
					$t("backup.chooseTargetPath") }}</Button>
			</FormItem>

			<h4 v-if="taskData.targetPath" style="color:red">{{ $t('backup.youFileWillBeHere') }}</h4>
			<h4 style="margin-top:10px" v-if="taskData.targetPath">{{ $t('backup.youFileWillBeHereB') }}</h4>

			<Tag v-if="taskData.targetPath && showTargetPathList.length < 1" style="margin-top: 5px;">
				{{ taskData.targetPath }}</Tag>
			<div v-else v-for="(path, index) in showTargetPathList">
				<Tag v-if="taskData.targetPath" style="margin-top: 5px;">{{ path }}</Tag>
			</div>

			<Divider></Divider>
			<!-- 排除选项 -->
			<Button style="width: 100px;border-radius: 20px;" type="primary" @click="showAddExclude = true">{{
				$t("backup.addExclude") }}</Button>
			<!-- 已经添加的排除列表 -->
			<h4 v-if="taskData.excludeList.length > 0">{{ $t('backup.excludeList') }}：</h4>
			<Tag @on-close="taskData.excludeList.splice(index, 1)" closable style="margin-top: 5px;"
				v-for="(path, index) in taskData.excludeList">
				{{ path }}
			</Tag>
			<Divider></Divider>
		</Form>

		<vs-dialog v-model="showChooseFolder" prevent-close scroll :full-screen="isMobile">
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


		<vs-dialog  v-model="showAddExclude">
			<template #header>
				<h4 style="font-size: 16px;">
					{{ $t('backup.addExclude') }}
				</h4>
			</template>
			<div style="max-width: 500px;">{{ $t('backup.excludeExample') }}</div>
			<Input  autocapitalize="off" autocorrect="off" v-if="showAddExclude" style="margin-top: 10px;margin-bottom: 10px;" v-model="excludeValue" />
			<vs-button style="margin-top: 10px;margin-bottom: 10px;width: 100%;border-radius: 20px;" @click="addExclude">
				{{ $t('common.ok') }}
			</vs-button>
		</vs-dialog>

	</div>
</template>

<script>
import fileSelect from "@/components/file-select/file-select.vue"
import fileSelectBar from "@/components/file-select/file-select-bar.vue"

export default {
	props: {
		type: {
			type: String,
			default: "create"
		},
		taskId: {
			type: Number,
			default: null //type为update的时候传入taskId
		}
	},
	components: {
		fileSelect,
		fileSelectBar
	},
	data() {
		return {
			showTargetPathList: [],//要展示的目标文件夹列表
			taskType: "1",
			runInElectron: this.$store.state.runInElectron,
			excludeValue: '',
			showAddExclude: false,
			selectPathType: "source", //当前正在选择的路径类型
			showChooseFolder: false,
			taskList: [],
			taskData: {
				excludeList: [],
				sourceList: [],
				targetPath: '',
				taskName: '',
				taskType: "1",
				taskDay: '',
				taskTime: '00:00:00'
			}
		}
	},
	mounted() {
		if (this.type == "update") {
			this.getTaskById()
		}
		console.log('this.taskType', this.taskType)
	},
	methods: {
		addExclude() {
			this.taskData.excludeList.push(this.excludeValue)
			this.showAddExclude = false
		},
		deleteSource(index) {
			this.taskData.sourceList.splice(index, 1);
			this.setShowTargetPathList()
			if (this.taskData.sourceList.length < 1) {
				this.taskData.targetPath = ''
			}
		},
		onChooseDate(date) {
			this.taskData.taskDay = date;
		},
		onChooseRate(rate) {
			console.log("onChooseRate")
			this.taskData.taskDay = '1'
			if (rate == '1') {
				this.taskData.taskDay = ''
			}
			this.taskType = rate
		},
		add0(m) {
			return m < 10 ? '0' + m : m
		},
		getTaskById() {
			this.api
				.post("/api/backupApi/getTaskById", {
					id: this.taskId
				})
				.then((res) => {
					this.taskData.sourceList = JSON.parse(res.data.source_list)
					if (res.data.exclude_list) {
						this.taskData.excludeList = JSON.parse(res.data.exclude_list)
					}
					this.taskData.targetPath = res.data.target_path
					this.taskData.taskName = res.data.task_name
					if (parseInt(res.data.task_type) == 1) {
						this.taskData.taskDay = new Date(res.data.task_day)
					} else {
						this.taskData.taskDay = res.data.task_day
					}
					this.taskData.taskType = res.data.task_type
					this.taskType = res.data.task_type
					this.taskData.taskTime = res.data.task_time
					console.log(this.taskData)
					this.setShowTargetPathList()
				})
				.catch((error) => { });
		},
		onCreateTask() {
			console.log("点击了创建备份")

			if (!this.taskData.taskName) {
				return this.showVsNotification(this.$t('backup.pleaseInputTaskName'))
			}
			if (!this.taskData.taskDay && this.taskType != '2') {
				return this.showVsNotification(this.$t('backup.pleaseChooseBackupDate'))
			}
			if (!this.taskData.taskTime) {
				return this.showVsNotification(this.$t('backup.pleaseChooseBackupTime'))
			}
			if (this.taskData.sourceList.length < 1) {
				return this.showVsNotification(this.$t('backup.choosePathWantBakcup'))
			}
			if (!this.taskData.targetPath) {
				return this.showVsNotification(this.$t('backup.chooseTargetPath'))
			}
			for (let i = 0; i < this.taskData.sourceList.length; i++) {
				if (this.taskData.sourceList[i] == this.taskData.targetPath) {
					return this.showVsNotification(this.$t('backup.sourceAndTargetPathCantEqual'))
				}
				//linux mac
				if (this.taskData.targetPath.indexOf(this.taskData.sourceList[i] + "/") != -1) {
					return this.showVsNotification(this.$t('backup.sourceAndTargetPathCantEqual'))
				}
				//windows
				if (this.taskData.targetPath.indexOf(this.taskData.sourceList[i] + "\\") != -1) {
					return this.showVsNotification(this.$t('backup.sourceAndTargetPathCantEqual'))
				}
			}

			if (parseInt(this.taskData.taskType) == 1) {
				let dateObj = new Date(this.taskData.taskDay)
				this.taskData.taskDay = dateObj.getFullYear() + "-" + this.add0(dateObj.getMonth() + 1) + "-" + this
					.add0(dateObj.getDate())
			}

			let params = {
				type: this.type,
				...this.taskData
			}
			if (this.type == "update") {
				params.id = this.taskId
			}

			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t(
				'backup.youFileWillBeHere'), () => {
					this.api
						.post("/api/backupApi/createTask", params)
						.then((res) => {
							if (!res.code) {
								this.showVsNotification(this.$t('common.operationSuccess'))
								this.$emit('onClose')
							}
						})
						.catch((error) => { });
				},null,this.$t('common.iKnow'))
		},
		choosePath(pathType) {
			this.selectPathType = pathType
			this.showChooseFolder = true
		},
		setShowTargetPathList() {
			//设置要展示的目标文件夹列表
			this.showTargetPathList = []
			if (!this.taskData.targetPath) {
				return
			}
			for (let i in this.taskData.sourceList) {
				let sourcePath = this.taskData.sourceList[i]
				if (sourcePath.indexOf('/') != -1) {
					this.showTargetPathList.push(this.taskData.targetPath + sourcePath.substring(sourcePath.lastIndexOf('/')))
				} else if (sourcePath.indexOf('\\') != -1) {
					//windows
					this.showTargetPathList.push(this.taskData.targetPath + sourcePath.substring(sourcePath.lastIndexOf('\\')))
				}
			}
		},
		onSelectPath(path) {
			if (path.length == 3 || path.length == 4) {
				if (path.endsWith('\\')) {
					return this.showVsNotification(this.$t('backup.cannotUseRoot'))
				}
			}
			if (this.selectPathType == 'source') {
				for (let i in this.taskData.sourceList) {
					if (path == this.taskData.sourceList[i]) {
						this.showChooseFolder = false
						return
					}
				}
				this.taskData.sourceList.push(path)
				this.setShowTargetPathList()
			} else if (this.selectPathType == 'target') {
				this.taskData.targetPath = path
				this.setShowTargetPathList()
			}
			this.showChooseFolder = false
		}
	}
}
</script>

<style></style>
