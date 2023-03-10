<template >
	<div class="my-sidebar-root">

		<!-- 回到首页 app内部不显示-->
		<my-btn-icon v-if="!isFromApp" type="grey" class="nas-mobile-show" style="position:fixed;bottom:135px;left:15px;" iIcon="md-home" @click="goPath('/home')"></my-btn-icon>
		<!-- 切换边栏 -->
		<my-btn-icon type="grey" class="nas-mobile-show" style="position:fixed;bottom:65px;left:15px;" iIcon="md-reorder" @click="(activeSidebar = !activeSidebar)"></my-btn-icon>

		<vs-sidebar absolute v-model="selectedIndex" :open.sync="activeSidebar">

			<template #logo>
				<img src="@/static/common/naslogo.png" class="logo" />
			</template>

			<vs-sidebar-item :id="index + ''" v-for="(option, index) in optionList">
				<template #icon>
					<span :class="option.font" v-if="index == selectedIndex" style="font-size: 26px;"
						class="item-icon"></span>
					<span :class="option.font" v-else style="font-size: 22px;" class="item-icon-normal"></span>
				</template>
				<div class="item-title" :style="{ color: index == selectedIndex ? '#386DF2' : '#99AABF' }">
					{{ option.title }}
				</div>
			</vs-sidebar-item>

			<template #footer>
				<vs-button border
					style="position:fixed;bottom:15px;left:15px;width:120px;border-radius:20px;margin-bottom:50px"
					@click="activeSidebar = !activeSidebar">
					{{ $t('common.close') }}
				</vs-button>
			</template>
		</vs-sidebar>
	</div>
</template>

<script>
export default {
	props: {
		initIndex:{
			default: 0,
			type: Number
		},
		optionList: {
			default: [],
			type: Array
		}
	},
	components: {},
	watch: {
		selectedIndex: function (newVal) {
			this.itemClick(newVal)
		}
	},
	data() {
		return {
			activeSidebar: false,
			selectedIndex: this.initIndex
		};
	},
	created() {

	},
	methods: {

		itemClick(index) {
			console.log('itemClick', index)
			this.selectedIndex = index
			this.activeSidebar = false
			this.$emit('onItemClick', this.optionList[index])

		},
		setIndex(index) {
			this.selectedIndex = index
		},
		setSelectById(optionId) {
			if (optionId) {
				for (let i = 0; i < this.optionList.length; i++) {
					if (this.optionList[i].id == optionId) {
						this.selectedIndex = i
					}
				}
			}
		}
	}
}
</script>

<style lang="scss" scoped>
::v-deep .vs-sidebar-content {
	width: 180px;
}

.logo {
	object-fit: contain;
	height: 25px;
}
</style>
