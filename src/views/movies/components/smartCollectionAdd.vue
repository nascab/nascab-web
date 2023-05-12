<template>
	<div class="root">

	<div style="display:flex;flex-direction:column;align-items:center">
				<!-- 封面 -->
				<img class="img-cover" v-if="coverPath" :src="axios.getRawFileUrl(coverPath,'cover.jpg')"/>
				<!-- 选择封面 -->
				<a style="margin-top:10px" @click="onChooseCover">{{coverPath ? $t("movie.deleteCover") :  $t("movie.addCover") }}</a>
			</div>
		<!-- 智能日期 -->
		<div class="date-root">
			<!--  例如：您的生日是1月1日，您可以选择'每年1月1日'，这样，每年1月1日拍摄的照片将位于此相册中-->
			<div style="margin-top: 10px;text-align: left;">
				<p>{{ $t('movie.smartCollectionExample') }}</p>
			</div>
			<div style="margin-top: 10px;text-align: left;">
				<p>{{ $t('movie.smartCollectionExampleB') }}</p>
			</div>
			<div style="margin-top: 10px;text-align: left;">
				<p>{{ $t('movie.smartCollectionExampleC') }}</p>
			</div>
			
			<div style="display: flex;flex-direction: column;align-items: flex-start;">
				<div style="margin-top: 30px;">
					<!-- 条件筛选 -->
					<h4 style="margin-bottom: 10px;text-align: left;">
						{{ $t('movie.conditionFilter') }}:
					</h4>
					<div>
						<!-- 条件字段 -->
						<Select v-model="conditionName" style="width:100px;" @on-change="onConditionChange">
							<Option v-for="item in conditionList" :value="item.value" :key="item.value">{{ item.label }}
							</Option>
						</Select>
						<!-- 等于大于小于 -->
						<Select v-model="filterValue" style="width:100px;margin-left: 10px;">
							<Option v-for="item in filterList" :value="item.value" :key="item.value">{{ item.label }}
							</Option>
						</Select>
						<!-- 筛选值 -->
						<Input  autocapitalize="off" autocorrect="off" maxlength="30" v-model="conditionValue" :placeholder="$t('movie.filterValue')"
							style="width: 80px;margin-left: 10px;" />
						<span style="margin-left: 5px;" v-if="conditionName=='size'">MB</span>
					</div>
				</div>
			</div>
		</div>

		<!-- 密码输入框 -->
		<vs-input autocapitalize="off" autocorrect="off" style="margin-top: 20px;" v-if="enablePwd" type="password" v-model="password"
			:placeholder="$t('movie.collectionPwdPlaceholder')">
			<template #icon>
				<Icon color="#99AABF" type="ios-key" />
			</template>
		</vs-input>

		<!-- 访问是否需要密码 -->
		<div style="display:flex;align-items: center;margin-top: 20px;">
			<p style="margin-right: 20px;">{{ $t('movie.collectionIsNeedPwd') }}</p>
			<i-switch v-model="enablePwd" />
		</div>

		<div style="margin-top:30px;">
			<!-- 影集名称 -->
			<h4 style="margin-bottom: 10px;text-align: left;">
				{{ $t('movie.addCollectionPlaceholder') }}:
			</h4>
			<div style="display: flex;align-items: center;">
				<Input  autocapitalize="off" autocorrect="off" maxlength="30" v-model="inputCollectionName" :placeholder="$t('movie.addCollectionPlaceholder')"
					style="width: 200px" />
				<!-- 创建按钮 -->
				<vs-button @click="addSmartCollection" type="primary" style="width: 150px;margin-left: 20px;">
					<Icon type="md-add-circle" style="margin-right: 10px;" />
					{{ $t('movie.addCollection') }}
				</vs-button>
			</div>
		</div>


		<!-- 封面选择对话框 -->
		<vs-dialog v-model="showChooseCover" scroll :full-screen="isMobile">
			<template #header>
				<h4 style="font-size: 16px;">
					{{ $t('movie.addCover') + '[' + $t('file.doubleClickFolderEnter') + ']' }}
				</h4>
			</template>
			<file-select ref="fileSelector" v-if="showChooseCover" parent="root" @onSelect="onSelectedCover"
				@onCancel="showChooseCover = false" :fileType="0"></file-select>
			<template #footer>
				<file-select-bar @back="$refs.fileSelector.goBack()" @select="$refs.fileSelector.onSelect()"
					@create="(newFolderName) => $refs.fileSelector.createNewFolder(newFolderName)"></file-select-bar>
			</template>
		</vs-dialog>
	</div>
</template>
<script>
export default {
	data() {
		return {
			showChooseCover:false,
			coverPath:"",
			password: "",
			enablePwd: false,
			inputCollectionName: "",
			filterValue: "", //条件符号 
			conditionName: "", //要筛选的字段名
			conditionValue: "",//要筛选的字段值
			conditionList: [
				{ //固定日期数据源 符号 等于 大于 小于
					value: 'filename',
					label: this.$t('movie.filename')
				},
				{
					value: 'path',
					label: this.$t('common.filepath')
				},
				{
					value: 'size',
					label: this.$t('file.size')
				},
				{
					value: 'movie_regions',
					label: this.$t('movie.regions')
				},
				{
					value: 'movie_language',
					label: this.$t('movie.language')
				},
				{
					value: 'movie_genres',
					label: this.$t('movie.genres')
				},
				{
					value: 'movie_year',
					label: this.$t('movie.year')
				},
				{
					value: 'movie_director',
					label: this.$t('movie.director')
				},
				{
					value: 'movie_actor',
					label: this.$t('movie.actors')
				}
			],
			filterNumber: [
				{
					value: '>',
					label: this.$t('common.gt')
				},
				{
					value: '=',
					label: this.$t('common.eq')
				},

				{
					value: '<',
					label: this.$t('common.lt')
				}
			],
			fiterStr: [
				{
					value: 'like',
					label: this.$t('common.contain')
				}
			],
			filterList: []
		}
	},

	mounted() {
	},
	methods: {
		onChooseCover(){
			if(this.coverPath){
				this.coverPath=""
			}else{
			this.showChooseCover=true 
			}
		},
		//选择封面的回调
		onSelectedCover(filePath){
			if (!filePath.endsWith('.jpg') 
			&& !filePath.endsWith('.jpeg')
			&& !filePath.endsWith('.JPG')
			&& !filePath.endsWith('.JPEG')
			&& !filePath.endsWith('.png')
			&& !filePath.endsWith('.PNG')) {
				this.showVsAlertDialog(this.$t('common.alert'), this.$t('movie.coverFileNoSupport'));
			} else {
				this.showChooseCover = false
				//调用修改接口
				this.coverPath=filePath
			}
		},
		onConditionChange(conditionItem) {
			if (conditionItem == "size" || conditionItem == "movie_year") {
				this.filterList = this.filterNumber
			} else {
				this.filterList = this.fiterStr
			}
			this.filterValue = this.filterList[0].value
		},

		addSmartCollection(){
			if(!this.inputCollectionName){
				return this.showVsNotification(this.$t('movie.pleaseInputCollectionName'))
			}

			if(!this.filterValue||!this.conditionName||!this.conditionValue){
				return this.showVsNotification(this.$t('movie.pleaseCompleteFilterInfo'))
			}
			let searchValue=` ${this.conditionName} ${this.filterValue} `
			if(this.filterValue=="like"){
				searchValue+=` '%${this.conditionValue}%' `
			}else{
				if(this.conditionName=="movie_year"){
					searchValue+=` ${parseInt(this.conditionValue)}`
				}else if(this.conditionName=="size"){
					searchValue+=` ${parseInt(this.conditionValue)*1024*1024}`
				}
			}
			if(this.conditionName=="movie_year"){
				console.log("Number.isNaN(this.conditionValue)",Number.isNaN(parseInt(this.conditionValue)))
				if(Number.isNaN(parseInt(this.conditionValue))||this.conditionValue<1800||this.conditionValue>2200){
					return this.showVsNotification(this.$t('movie.yearLimit'))
				}
			}
			this.api.post('/api/movieApi/addCollection', {
				type:"smart",
				title: this.inputCollectionName,
				enablePwd: this.enablePwd ? "1" : "0",
				pwd: this.password,
				data:{
					searchField:this.conditionName,
					searchValue:searchValue
				},
				coverPath:this.coverPath

			}).then((res) => {
				if (!res.code) {
					this.showAddDialog = false
					this.$emit("onAdd")
					this.showVsNotification(this.$t('common.operationSuccess'))
					
				}
			}).catch((error) => { })
			
		}

	}
}
</script>

<style lang="scss" scoped>
.root {
	padding: 10px;
	min-height: 350px;
	width: 100%;
}
.img-cover{
	width:100px;
	height:100px;
	border-radius:10px;
	object-fit:cover;

}

</style>
