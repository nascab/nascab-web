<template>
	<div class="my-search-root">
		<!-- pc端显示的 -->
		<Input size="large" clearable  class="input-pc" @on-clear="doSearch()" @on-enter="doSearch()" @on-search="doSearch()" style="border-radius:20px" search enter-button :placeholder="placeholder" v-model="searchValue" />

		<!-- 手机端显示的搜索按钮 -->
		<my-btn-icon  iIcon="ios-search" class="input-mobile"  @click="showMobileSearch = true"></my-btn-icon>
		<vs-dialog v-model="showMobileSearch" >
			<template #header>
				<h4 class="not-margin">
					{{ $t('common.search') }}
				</h4>
			</template>
			<div class="input-mobile-root">
				<vs-input type="text" v-model="searchValue">
					<template #icon>
						<i class="nasIcons icon-search icon-main-color" />
					</template>
				</vs-input>
			</div>

			<template #footer>
				<div style="display:flex;justify-content:space-between">
					<vs-button style="width:45%;" border @click="clearSearch()">
						{{ $t('common.clear') }}
					</vs-button>
					<vs-button style="width:45%;" @click="doSearch()">
						{{ $t('common.search') }}
					</vs-button>
				</div>
			</template>
		</vs-dialog>
	</div>
</template>

<script>
import { Icon } from 'leaflet';

export default {
	props: {
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
		clearSearch() {
			this.searchValue = ''
			this.doSearch()
		},
		doSearch() {
			this.showMobileSearch = false
			this.$emit('onSearch', this.searchValue)
		}
	}
}
</script>

<style lang="scss" scoped>

::v-deep .ivu-input{
	font-size: 14px;
	padding-left: 20px;
	padding-right: 10px;
	border-top-left-radius: 20px;
	border-bottom-left-radius: 20px;
}
::v-deep .ivu-input-group-append{
	border-radius: 20px;
}
::v-deep .vs-input-content {
	width: calc(100%);

	.vs-input {
		width: calc(100%);
	}
}
.input-pc {
	width:260px;
	@media all and (max-width:840px) {
		display: none; //手机端不显示
	}
}

.input-mobile {
	@media not all and (max-width:840px) {
		display: none; //手机端不显示
	}
}

.my-search-root {
	display: flex;
}


</style>
