<template>
	<div class="my-search-root">
		<!-- pc端显示的 -->
		<Input v-if="!isMobile&&!keepSmall" autocapitalize="off" autocorrect="off" size="large" clearable  @on-clear="doSearch()"
			@on-search="doSearch()" style="border-radius:20px;" search enter-button :placeholder="placeholder"
			v-model="searchValue" />

		<!-- 手机端显示的搜索按钮 -->
		<my-btn-icon :type="btnType" v-if="isMobile||keepSmall" iIcon="ios-search"  @click="showMobileSearch = true"></my-btn-icon>
		<vs-dialog v-model="showMobileSearch">
			<template #header>
				<h4 class="not-margin">
					{{ $t('common.search') }}
				</h4>
			</template>
			<div class="input-mobile-root">
				<vs-input  autocapitalize="off" autocorrect="off" type="text" v-model="searchValue">
					<template #icon>
						<i class="nasIcons icon-search icon-main-color" />
					</template>
				</vs-input>
			</div>

			<template #footer>
				<div style="display:flex;justify-content:space-between">
					<Button style="width:48%;border-radius:20px" border @click="clearSearch()">
						{{ $t('common.clear') }}
					</Button>
					<Button style="width:48%;border-radius:20px" type="primary" @click="doSearch()">
						{{ $t('common.search') }}
					</Button>
				</div>
			</template>
		</vs-dialog>
	</div>
</template>

<script>
import { Icon } from 'leaflet';

export default {
	props: {
		btnType:{
			default:"primary",
			type:String
		},
		keepSmall:{
			default:false,
			type:Boolean
		},
		placeholder: {
			default: "",
			type: String
		}
	},
	components: { Icon },
	data() {
		return {
			showMobileSearch: false,
			searchValue: ""
		};
	},
	created() {

	},
	methods: {
		clearSearchValue(){
			this.searchValue = ''
		},
		clearSearch() {
			this.searchValue = ''
			this.doSearch()
		},
		doSearch() {
			console.log("doSearch doSearch")
			this.showMobileSearch = false
			this.$emit('onSearch', this.searchValue)
		}
	}
}
</script>

<style lang="scss" scoped>
::v-deep .ivu-input {
	font-size: 14px;
	padding-left: 20px;
	padding-right: 10px;
	border-top-left-radius: 20px;
	border-bottom-left-radius: 20px;
}

::v-deep .ivu-input-group-append {
	border-radius: 18px;
	height: 36px;
}
::v-deep .ivu-input{
	height: 36px;
}

::v-deep .vs-input-content {
	width: calc(100%);

	.vs-input {
		width: calc(100%);
	}
}


.my-search-root {
	display: flex;
}</style>
