<template>
	<div class="select-root">
		<!-- 收缩模式 只显示一个 点击后选择-->
		<div v-if="shrinkMode" style="display:flex;align-items:center"  @click="showSelectItem = true">
			<p style="color:#386DF2">{{ optionList[selectedIndex].title }}</p>
			<Icon v-if="withOrder" style="color:#386DF2"
				:type="sortType == 'desc' ? 'md-arrow-round-down' : 'md-arrow-round-up'" />
		</div>
		<!-- 正常模式 都列出来让用户选-->
		<div v-else @click="itemClick(index)" class="select-item" v-for="(option, index) in optionList">
			<p :style="{ color: selectedIndex == index ? '#386DF2' : '#99AABF' }" class="select-text">
				{{ option.title }}
			</p>
			<Icon v-if="selectedIndex == index && withOrder"
				:style="{ color: selectedIndex == index ? '#386DF2' : '#99AABF' }"
				:type="sortType == 'desc' ? 'md-arrow-round-down' : 'md-arrow-round-up'" />
		</div>


		<vs-dialog v-model="showSelectItem">
			<div style="margin-top:20px;cursor: pointer;">
				<div v-for="(option, index) in optionList">
					<Button type="dashed" @click="onItemSelect(index)" class="shrink-item">{{ option.title }}</Button>
				</div>
			</div>
		</vs-dialog>

	</div>
</template>

<script>
export default {
	props: {
		shrinkModeTh: {
			default: 550,//宽度多少一下会变为shrink模式
			type: Number
		},
		optionList: {
			default: [],
			type: Array
		},
		withOrder: {
			default: false,
			type: Boolean
		},
		initValue:{
			default:"",
			type:String
		}
	},
	components: {},
	data() {
		return {
			showSelectItem: false,
			shrinkMode: false,
			sortType: "desc",
			selectedIndex: 0
		};
	},
	created() {
		//是否启用缩水模式
		let windowScreen =document.documentElement.clientWidth|| window.screen.width
		if (!windowScreen) {
			windowScreen = screen.width
		}
		if (windowScreen && windowScreen < this.shrinkModeTh) {
			this.shrinkMode = true
		}
		if(this.initValue){
			this.setSelectedId(this.initValue)
		}
	},
	methods: {
		setSelectedId(id){
			for(let i in this.optionList){
				if(this.optionList[i].id==id){
					this.selectedIndex=i
				}
			}
		},
		setSelectedIndex(i){
			this.selectedIndex=i
		},
		onItemSelect(index) {
			this.itemClick(index)
			this.showSelectItem = false
		},
		itemClick(index) {
			if (this.selectedIndex == index){
				 this.sortType = this.sortType == 'asc' ? 'desc' : 'asc'
				 if(!this.withOrder){
					return
				 }	
			}
			this.selectedIndex = index
			this.$emit('onItemClick', this.optionList[index].id, this.sortType)
		}
	}
}
</script>

<style lang="scss" scoped>
.select-root {
	flex-shrink: 0;
	border-radius: 20px;
	background-color: white;
	display: flex;
	align-items: center;
	padding-left: 15px;
	padding-right: 15px;
	padding-top: 10px;
	padding-bottom: 10px;
}

.shrink-item {
	width: 100%;
	margin-top: 10px;
	border-radius: 20px;
	color: white;
	padding: 6px;
	background-color: $nas-main;
}

.select-item {
	height: 20px;
	cursor: pointer;
	padding-left: 10px;
	padding-right: 10px;

	@media all and (max-width:640px) {
		padding-left: 5px;
		padding-right: 5px;
	}

	transition: -webkit-transform 0.2s;
	transition: transform 0.2s;
	transition: transform 0.2s,
	-webkit-transform 0.2s;
	display: flex;
	align-items: center;
}

.select-text {
	font-size: 14px;

}

.select-text:hover {
	-webkit-transform: scale(1.15);
	transform: scale(1.15);
}
</style>
