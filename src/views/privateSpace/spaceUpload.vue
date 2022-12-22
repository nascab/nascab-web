<template>
	<div class="root">
		<uploader ref="uploader" :options="options" class="uploader-example">
			<uploader-unsupport></uploader-unsupport>
			<uploader-drop>
				<p style="margin-bottom: 30px;">{{ $t('upload.dropFilesUpload') }}</p>
				<uploader-btn>{{ $t('upload.selectFile') }}</uploader-btn>
				<uploader-btn :directory="true">{{ $t('upload.selectFolder') }}</uploader-btn>
			</uploader-drop>
			<uploader-list></uploader-list>
		</uploader>
	</div>
</template>

<script>
import axios from "@/plugins/axios";

export default {
	props: {
		spaceId: {
			default: '',
			type: String
		}
	},
	data() {
		return {
			uploadSucCount: 0,
			options: {
				target: axios.privateSpaceUploadUrl,
				testChunks: false,
				chunkSize: 20 * 1024 * 1024, //块大小
				simultaneousUploads: 10, //并发数量
				query: {
					spaceId: this.spaceId,
					spaceToken: this.$store.state.privateSpace[this.spaceId]
				},
				processResponse: (response, cb,uFile) => {
					let useCb=true
					if (response == 'done') {
						this.uploadSucCount += 1
					}
					 if (response[0] == '{') {
						try {
							let res = JSON.parse(response)
							console.log(res)
							if (res.code && res.code == 1) {
								useCb=false
								this.showVsNotification(res.message)
								//出错了 删除
								this.$refs.uploader.uploader.removeFile(uFile)
							}
						} catch (e) { }
					}
					if(useCb&&cb){
						cb(null,response)
					}
				}
			},
		}
	},
	components: {},
	mounted() {
		if (!this.$store.state.privateSpace[this.spaceId]) {
			this.showVsAlertDialog(this.$t('common.alert'), this.$t('private.passwordInvalid'))
		}
	},
	methods: {

	}

}
</script>

<style lang="scss" scoped>
.root {
	min-height: 300px;
	width: 100%;
}

.date-root {
	margin-top: 30px;
}

.uploader-example {
	width: 100%;
	height: 100%;
	font-size: 12px;
}

.uploader-example .uploader-btn {
	margin-right: 4px;
}

.uploader-example .uploader-list {
	overflow: auto;
	overflow-x: hidden;
	overflow-y: auto;
}
</style>
