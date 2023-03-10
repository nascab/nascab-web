<template>
	<div
		style="padding: 15px;padding-bottom: 10px;display: flex;flex-direction: column;align-items: center;max-height: 800px;overflow-y: auto;overflow-x: hidden;">
		<!-- 搜索的文件名字 -->
		<div style="word-break:break-all;margin-bottom:10px;text-align: left;width: 100%;">{{ movieIndexObj.filename }}
		</div>
		<Input style="margin-bottom:10px" v-model="searchStr" @on-search="searchMovieInfo(false)" search
			:enter-button="$t('common.search')" :placeholder="$t('movie.inputMovieName')" />
		<!-- 搜索结果列表 -->
		<div class="search-item" v-for="(info, index) in searchResultList">
			<div>
				<img v-if="info.cover_get == 1" :src="info.cover_url" class="search-poster" />
				<img v-else src="@/static/photo/icon-album-empty.png" class="search-poster" />
				<!-- <div v-if="info.douban_score">评分:{{info.douban_score}}</div> -->
			</div>


			<div style="display: flex;flex-direction: column;margin-left: 10px;justify-content: flex-start;">
				<div class="item-movie-name">{{ info.movie_name }}</div>
				<div class="item-movie-region" v-if="info.alias">{{ $t('movie.alias') }}:{{ info.alias }}</div>
				<div class="item-movie-region">
					<span v-if="info.year">{{ '[' + info.year + ']' }}</span>
					<span v-if="info.regions">{{ '[' + info.regions + ']' }}</span>
					<span v-if="info.language">{{ '[' + info.language + ']' }}</span>
					<span v-if="info.genres">{{ '[' + info.genres + ']' }}</span>
				</div>
				<div class="item-movie-region" v-if="info.storyline">{{ $t('movie.storyline') }}:{{ info.storyline }}
				</div>
				<my-btn @click="selectMovieInfo(info)"   style="width:120px;margin-top: 5px;"
						:title="$t('common.select')"></my-btn>
	
			</div>
		</div>

		<my-btn style="width:300px" @click="searchMovieInfo(true)" type="white" v-if="hasMore && searchResultList.length > 0" :title="$t('common.loadmore')"></my-btn>
		<div v-if="!hasMore" style="margin-top:10px;margin-bottom:10px;">{{ $t('common.noMore') }}</div>
	</div>

</template>

<script>
	export default {
		props: {
			movieIndexObj: {
				default: {},
				type: Object
			}
		},
		data() {
			return {
				hasMore: true,
				searchStr: "",
				searchResultList: []
			}
		},
		mounted() {
			if(this.movieIndexObj){
				this.searchStr=this.movieIndexObj.filename
			}
		},
		methods: {
			selectMovieInfo(movieInfo) {
				this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('movie.confirmMovieInfo', {
					movieName: movieInfo.movie_name
				}), () => {
					this.api
						.post("/api/movieApi/setMovieInfo", {
							indexId: this.movieIndexObj.id,
							movieJson: JSON.stringify(movieInfo)
						})
						.then((res) => {
							if (!res.code) {
								this.$emit('onMovieInfoSelected')
							}
						})
						.catch((error) => {});
				})
			},
			searchMovieInfo(isLoadMore) {
				if (!isLoadMore) {
					this.hasMore = true
				}
				if (!this.searchStr) {
					return this.showVsNotification(this.$t('common.pleaseInputSearchContent'))
				}
				let params = {
					searchStr: this.searchStr
				}
				if (isLoadMore) {
					params.skipCount = this.searchResultList.length
				}
				this.api
					.post("/api/movieApi/searchMovieInfo", params)
					.then((res) => {
						if (!res.code) {
							if (res.data.length < 10) {
								this.hasMore = false
							}
							if (isLoadMore) {
								this.searchResultList = this.searchResultList.concat(res.data)
							} else {
								this.searchResultList = res.data
							}
							console.log("结果已经返回")

						}
					})
					.catch((error) => {});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.search-poster {
		flex-shrink: 0;
		object-fit: cover;
		width: 120px;
		height: 160px;
	}

	.search-item {
		margin-top: 10px;
		margin-bottom: 10px;
		justify-content: flex-start;
		display: flex;
		width: 100%;
	}

	.item-movie-name {
		text-align: left;
		word-break: break-all;
		font-size: 16px;
		font-weight: bold;
		color: $nas-text-title;
	}

	.item-movie-region {
		text-align: left;
		word-break: break-all;
		color: $nas-text-content;
	}
</style>
