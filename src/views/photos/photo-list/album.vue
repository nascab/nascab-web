<template>
	<div class="album-root-wrapper">

		<vs-navbar square center-collapsed v-model="active" class="navbar">
			<vs-navbar-item :active="active == 'aiAlbum'" id="aiAlbum">
				<div style="display: flex;align-items: center;">
					<span :style="{ color: active == 'aiAlbum' ? '#386DF2' : '#99AABF' }"
						class="nasIcons icon-ai-album icon-title"></span>
					<p :style="{ color: active == 'aiAlbum' ? '#386DF2' : '#99AABF' }" style="font-size: 16px;">
						{{ $t('photo.aiAlbum') }}</p>
				</div>
			</vs-navbar-item>
			<vs-navbar-item :active="active == 'ordinaryAlbum'" id="ordinaryAlbum">
				<div style="display: flex;align-items: center;">
					<span :style="{ color: active == 'ordinaryAlbum' ? '#386DF2' : '#99AABF' }"
						class="nasIcons icon-normal-album icon-title"></span>
					<p :style="{ color: active == 'ordinaryAlbum' ? '#386DF2' : '#99AABF' }" style="font-size: 16px;">
						{{ $t('photo.ordinaryAlbum') }}</p>
				</div>
			</vs-navbar-item>
		</vs-navbar>
		<div style="height: 100%;width: 100%;padding-top: 64px;">
			<ai-album v-if="active == 'aiAlbum'"></ai-album>
			<ordinary-album v-if="active == 'ordinaryAlbum'"></ordinary-album>
		</div>
	</div>
</template>

<script>
import axios from "@/plugins/axios";
import aiAlbum from "@/views/photos/photo-list/aiAlbum.vue"
import ordinaryAlbum from "@/views/photos/photo-list/ordinaryAlbum.vue"

export default {
	components: {
		aiAlbum,
		ordinaryAlbum
	},
	data() {
		return {
			active: "aiAlbum"
		}
	},
	mounted() {

	},
	beforeDestroy() { },
	methods: {

	}
}
</script>
<style lang="scss" scoped>
::v-deep .vs-navbar__line {
	background: $nas-main !important;
}

.icon-title {
	font-size: 16px;
	margin-right: 5px;
}

.navbar {
	@media not all and (max-width:640px) {
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
	}
	background-color: rgba(255, 255, 255, 0.6);
	height: 64px;
	padding-top: 10px;
}

.album-root-wrapper {
	position: relative;
	z-index: 1;
	width: 100%;
	height: 100%;

	@media not all and (max-width:640px) {
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
		padding: 10px;

	}

	background-color: rgba(255, 255, 255, 0.6);
}
</style>
