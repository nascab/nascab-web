<template>
	<div @click="$emit('movieClick', movieIndex)" @mouseenter="mouseEnterImg(movieIndex)"
		@mouseleave="mouseLeaveImg(movieIndex)" @contextmenu="showRightMenu($event, $root, movie, movieIndex)"
		@touchstart="touchstart($event, movie, movieIndex)" @touchend="touchend()">
		<div style="padding-bottom: 10px;cursor: pointer;" :style="{ 'margin': itemMargin + 'px', width: itemWidth + 'px' }"
			class="movie-item-root" v-if="showType == 'grid'">
			<movie-list-item-grid @playClick="$emit('playClick', movieIndex) " @favoriteMovie="$emit('favoriteMovie', movieIndex)" :movie="movie"
				:itemWidth="itemWidth"></movie-list-item-grid>
		</div>
		<div v-if="showType == 'list'" style="display: flex;flex-direction: column;width: 100%;cursor: pointer;">
			<movie-list-item-list @playClick="$emit('playClick', movieIndex) " @favoriteMovie="$emit('favoriteMovie', movieIndex)" :movie="movie"
			:itemWidth="itemWidth" :itemMargin="itemMargin"></movie-list-item-list>
		</div>
	</div>
</template>
<script>
import movieListItemGrid from "@/views/movies/components/movieListItemGrid.vue";
import movieListItemList from "@/views/movies/components/movieListItemList.vue";
export default {
	props: {
		
		itemWidth: {
			default: 120,
			type: Number
		},
		itemMargin: {
			default: 6,
			type: Number
		},
		showType: {
			default: "grid",
			type: String
		},
		movie: {
			default: "",
			type: Object
		},
		movieIndex: {
			default: 0,
			type: Number
		}
	},
	created() {
	},
	mounted() {

	},
	beforeDestroy() {

	},
	computed: {

	},
	components: {
		movieListItemList,
		movieListItemGrid
	},
	data() {
		return {

		};
	},
	methods: {
		mouseEnterImg(index) {
			this.$emit('mouseEnterImg', index)
		},
		mouseLeaveImg(index) {
			this.$emit('mouseLeaveImg', index)
		},
		showRightMenu(event, root, file, index) {
			console.log("item showRightMenu", index)

			this.$emit('showRightMenu', event, root, file, index)
		},
		touchstart(event, item, index) {
			this.$emit('touchstart', event, item, index)
		},
		touchend() {
			this.$emit('touchend')
		},
	}
}
</script>
<style lang="scss" scoped>
.movie-item-root {
	position: relative;
	display: inline-flex;
	flex-direction: column;
	align-items: center;
}
</style>
