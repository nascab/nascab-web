<template >
	<div class="my-sidebar-root">
		<div class="option-item" v-for="(option, index) in optionList" v-if="!option.onlyAdmin || option.onlyAdmin&&$store.state.currentUser.is_admin == 1 ">
			<div class="sign" v-if="index == selectedIndex"></div>
			<div class="item-content" @click="itemClick(index)">
				<span :class="option.font" v-if="index == selectedIndex" style="font-size: 26px;"
					class="item-icon"></span>
				<span :class="option.font" v-else style="font-size: 22px;" class="item-icon-normal"></span>

				<div class="item-title" :style="{ color: index == selectedIndex ? '#386DF2' : '#99AABF' }">
					{{ option.title }}
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		initIndex: {
			default: 0,
			type: Number
		},
		optionList: {
			default: [],
			type: Array
		}
	},
	components: {},
	data() {
		return {
			selectedIndex: this.initIndex
		};
	},
	created() {

	},
	methods: {
		itemClick(index) {
			this.selectedIndex = index
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
.my-sidebar-root {

	@media all and (max-width:900px) {
		border-top-left-radius: 0px;
		margin-left: 0px;
		margin-right: 10px;
	}

	@media not all and (max-width:900px) {
		border-top-left-radius: 20px;
		margin-left: 30px;
		margin-right: 20px;
	}

	@media all and (max-width:640px) {
		display: none;
	}

	flex-shrink: 0;
	padding-top: 30px;
	z-index: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	border-top-right-radius: 20px;
	background-color: rgba(255, 255, 255, 0.6);
	height: 100%;


}

.option-item {

	width: 100%;
	position: relative;
	margin-bottom: 22px;
	display: flex;
	align-items: center;

	// 高度过低的情况下
	@media all and (max-height:640px) {
		margin-bottom: 12px;
	}

	.item-content {

		@media all and (max-width:1200px) {
			margin-left: 26px;
			margin-right: 20px;
		}

		@media not all and (max-width:1200px) {
			margin-left: 30px;
			margin-right: 30px;
		}

		cursor: pointer;
		display: flex;
		flex-direction: row;
		align-items: center;
		transition: -webkit-transform 0.25s;
		transition: transform 0.25s;
		transition: transform 0.25s,
		-webkit-transform 0.25s;

		.item-icon {
			color: $nas-main;
			margin-right: 10px;
		}

		.item-icon-normal {
			color: $nas-grey;
			margin-right: 10px;
		}

		.item-title {
			@media all and (max-width:1200px) {
				display: none;
			}

			@media not all and (max-width:1200px) {
				display: block;
			}

			font-size: 16px;
			margin: 0;
			padding: 0;
		}
	}

	.item-content:hover {
		-webkit-transform: scale(1.1) translate(8px);
		transform: scale(1.1) translate(8px);
	}

	.sign {
		position: absolute;
		left: 0;
		height: 25px;
		width: 6px;
		border-top-right-radius: 5px;
		border-bottom-right-radius: 5px;
		background-color: $nas-main;
	}
}
</style>
