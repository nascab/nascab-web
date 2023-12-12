<template>
	<div class="movie-item-root">
		<div class="cover-root" style="width:100%">
			<!-- 封面 禁用浏览器默认的事件-->
			<img class="movie-cover" v-lazy="movie.url" :style="{ height: itemWidth / 3 * 4.5 + 'px' ,width:itemWidth+'px'}" />

			<div class="hover-half-root" v-if="!movie.hover">
				
			</div>

			<div class="hover-root" v-if="movie.hover">
				<!-- 播放按钮 -->
				<Button type="text" ghost @click.stop="$emit('playClick')" style="height:40px">
					<span class="nasIcons icon-play" style="font-size:40px;line-height:40px"></span>
				</Button>
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

			<!-- 视频的时长 -->
			<p class="icon-duration" v-if="!movie.hover">{{ utils.formatSeconds(movie.duration) }}</p>

			<!-- 电影评分 -->
			<div v-if="!movie.hover && movie.movie_douban_score && movie.movie_douban_score > 0" class="movie-score-bg">
				<span class="movie-score">{{
					movie.movie_douban_score
				}}</span>
			</div>

			<!-- 喜爱 -->
			<div v-if="movie.hover" class="favorite-root">
				<span @click.stop="$emit('favoriteMovie')" class="nasIcons icon-xihuan-shi"
					:style="{ 'color': movie.favorite ? '#DE4545' : 'white' }"></span>
			</div>
		</div>
		<div v-if="movie.hover"
			style="position: absolute;left: 6px;top: 6px;height: 24px;display: flex;align-items: center;">

			<img v-if="movie.movie_douban_id"
				@click.stop="utils.checkDouban(movie.filename, parseInt(movie.movie_douban_id))"
				style="width: 24px;height: 24px;" src="@/static/social-douban.png" />

			<img v-if="movie.movie_imdb_id"
				@click.stop="utils.checkImdb(movie.filename, movie.movie_imdb_id)"
				style="border-radius: 5px; width: 24px;height: 24px;margin-left: 10px;" src="@/static/icon_imdb.png" />

		</div>
		<!-- 名称 -->
		<p class="filename max-line-two">
			{{ movie.show_name }}
		</p>
		<p class="movie-year" v-if="movie.movie_year && movie.movie_year > 1000">{{ parseInt(movie.movie_year) }}</p>

	</div>
</template>
<script>

export default {
	props: {
		itemWidth:{
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
.hover-half-root{
	background: linear-gradient(to top, #000, rgba(0, 0, 0, 0));
	position: absolute;
	width: 100%;
	height: 30px;
	bottom: 0;
	left: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	border-bottom-left-radius: 5px;
	border-bottom-right-radius: 5px;
}
.cover-root {
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}



.icon-duration {
	font-size: 12px;
	color: #eee;
	position: absolute;
	left: 6px;
	bottom: 4px;
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

.movie-list {
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	overflow-y: scroll;
	overflow-x: hidden;
	align-content: flex-start;
	scrollbar-width: none;

	@media all and (max-width:640px) {
		-webkit-overflow-scrolling: touch;
	}

}

.movie-item-root {
	position: relative;
	display: inline-flex;
	flex-direction: column;
	align-items: center;
}

.filename {
	margin-top: 5px;
	word-break: break-all;
	text-align: center;
	overflow: hidden;
}
.movie-year{
	font-size: 12px;
	color:$nas-text-grey
}


.video-type-sign {
	font-size: 12px;
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

.icon-duration-list {
	font-size: 14px;
	color: #eee;
	position: absolute;
	left: 15%;
	bottom: 5%;
	font-weight: bold;
}

.movie-cover {
	pointer-events: none; //禁止响应点击事件
	border-radius: 5px;
	background-color: #fff;
	width: 100%;
	object-fit: cover;
	box-shadow: 2px 5px 5px rgba(0, 0, 0, .2);
	// border: 1px solid #eee;
}



</style>
