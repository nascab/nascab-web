<template>
	<div class="movie-item-root">
		<!-- 封面 -->
		<div class="movie-item-root-list">

			<div :style="{ 'margin-left': itemMargin + 'px' }" class="cover-root">
				<!-- 封面 -->
				<img class="movie-cover-list" v-lazy="movie.url" :style="{ height: itemWidth / 3 * 4.5 + 'px' ,width:itemWidth+'px'}"/>
				<div class="hover-root" v-if="movie.hover">
					<!-- 播放按钮 -->
					<Button type="text" ghost @click.stop="$emit('playClick')" style="height:40px">
						<span class="nasIcons icon-play" style="font-size:40px;line-height:40px"></span>
					</Button>
				</div>

				<!-- 电影评分 -->
				<div v-if="!movie.hover && movie.movie_douban_score && movie.movie_douban_score > 0"
					class="movie-score-bg">
					<span class="movie-score">{{
						movie.movie_douban_score
					}}</span>
				</div>
				<!-- 电影电视剧标记 -->
				<div v-if="!movie.hover && movie.is_tvplay" class="video-type-sign"
					style="background:#386DF2">
					<span>{{ $t('sign.tv') }}</span>
				</div>
				<div v-if="!movie.hover && !movie.is_tvplay" class="video-type-sign"
					style="background:#DE4545">
					<span>{{ $t('sign.movie') }}</span>
				</div>

				<!-- 喜爱 -->
				<div v-if="movie.hover" class="favorite-root">
					<span @click.stop="$emit('favoriteMovie')" class="nasIcons icon-xihuan-shi"
						:style="{ 'color': movie.favorite ? '#DE4545' : 'white' }"></span>
				</div>
			</div>

			<div v-if="movie.hover"
				style="position: absolute;left: 12px;top: 6px;height: 24px;display: flex;align-items: center;">
				<img v-if="movie.movie_douban_id"
					@click.stop="utils.checkDouban(movie.filename, parseInt(movie.movie_douban_id))"
					style="width: 24px;height: 24px;" src="@/static/social-douban.png" />
				<img v-if="movie.movie_imdb_id"
					@click.stop="utils.checkImdb(movie.filename, movie.movie_imdb_id)"
					style="border-radius: 5px; width: 24px;height: 24px;margin-left: 10px;"
					src="@/static/icon_imdb.png" />
			</div>
			<!-- 名称 -->
			<div style="display:flex;flex-direction:column;height: 100%;">
				<p class="filename max-line-three">
					{{ movie.show_name }}
					<span v-if="movie.movie_year">[{{ parseInt(movie.movie_year) }}]</span>
				</p>

				<div class="list-item-line">
					<span class="item-title">{{ $t("common.folder") }}:</span>
					<span class="item-content">{{ movie.path }}</span>
				</div>
				<p class="list-item-line">
					<span class="item-title">{{ $t("movie.filename") }}:</span>
					<span class="item-content">{{ movie.filename }}</span>
				</p>
				<!-- 视频的时长 -->
				<p class="list-item-line">
					<span class="item-title">{{ $t("video.duration") }}:</span>
					<span class="item-content">{{ utils.formatSeconds(movie.duration) }}
						<span style="margin-left:5px">[{{ movie.sizeStr }}]</span>
					</span>
				</p>
			</div>
		</div>
		<div style="width: 100%;height: 1px;background-color: #eee;margin-top: 10px;margin-bottom: 10px;"> </div>
	</div>
</template>
<script>

export default {
	props: {
		itemWidth:{
			default:0,
			type:Number
		},
		itemMargin:{
			default:0,
			type:Number
		},
		movie: {
			default: "",
			type: Object
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
	
	},
	data() {
		return {
		
		};
	},
	methods: {
		
	}
}
</script>
<style lang="scss" scoped>

.dialog-filter-title {
	width: 100%;
	text-align: left;
	font-weight: bold;
	margin-bottom: 5px
}

.hover-root {
	background-color: rgba(0, 0, 0, 0.6);
	position: absolute;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 5px;

}

.cover-root {
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}



.icon-duration {
	font-size: 14px;
	color: #eee;
	position: absolute;
	left: 6px;
	bottom: 6px;
	font-weight: bold;
}

.movie-list-root {
	position: relative;
	width: 100%;
	height: 100%;

	background-color: rgba(255, 255, 255, 0.6);
	padding-left: 10px;

	@media not all and (max-width:640px) {
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
		padding-left: 20px;
	}
}

::v-deep .ivu-icon-md-play {
	font-size: 30px;
	margin-left: 5px;
}


.movie-item-root-list {
	width: 100%;
	position: relative;
	text-align: center;
	align-self: center;
	display: inline-flex;
	flex-direction: row;
	align-items: flex-start;

	.movie-cover-list {
		pointer-events: none;
		border-radius: 6px;
		background-color: #999;
		width: 120px;
		height: 160px;
		object-fit: cover;
		box-shadow: 5px 5px 10px rgba(0, 0, 0, .2);
	}

	.list-item-line {
		font-size: 14px;
		margin-right: 20px;
		text-align: left;
		margin-left: 20px;
		word-break: break-all;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-top: 10px;

		.item-title {
			font-weight: bold;
			margin-right: 5px;
		}

	}

	.filename {
		font-size: 16px;
		font-weight: bold;
		margin-right: 20px;
		text-align: left;
		margin-left: 20px;
		word-break: break-all;
		overflow: hidden;
		text-overflow: ellipsis;
	}
}

.video-type-sign {
	font-size: 14px;
	position: absolute;
	right: 6px;
	top: 6px;
	padding: 2px 4px;
	border-radius: 6px;

	span {
		color: white;
		font-weight: bold;
	}
}


.favorite-root {
	position: absolute;
	right: 6px;
	bottom: 6px;

	span {
		line-height: 25px;
		font-size: 25px;
	}
}

.movie-score-bg {
	position: absolute;
	right: 6px;
	bottom: 6px;
	width: 24px;
	height: 24px;
	background: white;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);


	.movie-score {
		padding-top: 2px;
		color: #ff9900;
		font-size: 12px;
		font-weight: bold;
		text-align: center;
	}

}


.movie-cover {
	pointer-events: none; //禁止响应点击事件
	border-radius: 5px;
	background-color: black;
	width: 100%;
	object-fit: cover;
	box-shadow: 2px 5px 5px rgba(0, 0, 0, .2);
	// border: 1px solid #eee;
}


</style>
