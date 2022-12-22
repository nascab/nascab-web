<template>
	<div style="position: fixed;width: 100%;height: 100%; ">
		<div ref="imageEditor" style="width: 100%; height: 100%" />
		<div
			style="margin-top: 20px; position: absolute;top: 0;left: 20px;z-index: 99999999;display: flex;flex-direction: row;justify-content: space-between;">
			<Button style="margin-right: 20px;margin-left: 80px;width: 100px;"
				@click="onClose">{{$t('common.return')}}</Button>
			<Button style="width: 100px;" @click="onSave">{{$t('common.save')}}</Button>
		</div>
	</div>
</template>

<script>
	import 'tui-image-editor/dist/tui-image-editor.css'
	import 'tui-color-picker/dist/tui-color-picker.css'
	import ImageEditor from 'tui-image-editor';
	
	const customTheme = {
		// image 左上角度图片
		'common.bi.image': '', // 在这里换上你喜欢的logo图片
	}
	export default {
		name: 'photoEditor',
		data() {
			return {
				serverType:null,
				exifInfo: null,
				photoIndex: null,
				imageName: '', // 保存图片时候的名称
				entity: {}, // 当前数据
				instance: null, // 编辑图片实例
				isShowEditImage: false,
			}
		},
		methods: {
			onClose() {
				this.$emit('onClose', false)
			},
			getLocalZn(){
				const localeZh = {
					
					// override default English locale to your custom
					Crop: this.$t('Crop'),
					ZoomIn: this.$t('ZoomIn'),
					ZoomOut: this.$t('ZoomOut'),
					Hand: this.$t('Hand'),
					History: this.$t('History'),
					DeleteAll: this.$t('DeleteAll'),
					Delete: this.$t('Delete'),
					Undo: this.$t('Undo'),
					Redo: this.$t('Redo'),
					Reset: this.$t('Reset'),
					Flip: this.$t('Flip'),
					Rotate: this.$t('Rotate'),
					Draw: this.$t('Draw'),
					Shape: this.$t('Shape'),
					Icon: this.$t('Icon'),
					Text: this.$t('Text'),
					Mask: this.$t('Mask'),
					Filter: this.$t('Filter'),
					Bold: this.$t('Bold'),
					Italic: this.$t('Italic'),
					Underline: this.$t('Underline'),
					Left: this.$t('Left'),
					Center: this.$t('Center'),
					Right: this.$t('Right'),
					Color: this.$t('Color'),
					'Text size': this.$t('Text size'),
					Custom: this.$t('Custom'),
					Square: this.$t('Square'),
					Apply: this.$t('Apply'),
					Cancel: this.$t('Cancel'),
					'Flip X': this.$t('Flip X'),
					'Flip Y': this.$t('Flip Y'),
					Range: this.$t('Range'),
					Stroke: this.$t('Stroke'),
					Fill: this.$t('Fill'),
					Circle: this.$t('Circle'),
					Triangle: this.$t('Triangle'),
					Rectangle: this.$t('Rectangle'),
					Free: this.$t('Free'),
					Straight: this.$t('Straight'),
					Arrow: this.$t('Arrow'),
					'Arrow-2': this.$t('Arrow-2'),
					'Arrow-3': this.$t('Arrow-3'),
					'Star-1': this.$t('Star-1'),
					'Star-2': this.$t('Star-2'),
					Polygon: this.$t('Polygon'),
					Location: this.$t('Location'),
					Heart: this.$t('Heart'),
					Bubble: this.$t('Bubble'),
					'Custom icon': this.$t('Custom icon'),
					'Load Mask Image': this.$t('Load Mask Image'),
					Grayscale: this.$t('Grayscale'),
					Blur: this.$t('Blur'),
					Sharpen: this.$t('Sharpen'),
					Emboss: this.$t('Emboss'),
					'Remove White': this.$t('Remove White'),
					Distance: this.$t('Distance'),
					Brightness: this.$t('Brightness'),
					Noise: this.$t('Noise'),
					'Color Filter': this.$t('Color Filter'),
					Sepia: this.$t('Sepia'),
					Sepia2: this.$t('Sepia2'),
					Invert: this.$t('Invert'),
					Pixelate: this.$t('Pixelate'),
					Threshold: this.$t('Threshold'),
					Tint: this.$t('Tint'),
					Multiply: this.$t('Multiply'),
					Blend: this.$t('Blend')
				}
				return localeZh
				
			},
			onSave() {
				let myImage = this.instance.toDataURL()
				this.showVsConfirmDialog(this.$t('common.confirm'),this.$t('photo.sureChangeNewPhoto'), () => {
					this.api
						.post("/api/fileApi/editImage", {
							base64: myImage,
							indexId: this.photoIndex.id,
							serverType:this.serverType
						})
						.then((res) => {
							if (res.code == 0) {
								this.showVsNotification(this.$t('photo.saveSucReturnToCheck'))
							
								this.$emit('onClose', true)
							}
						})
						.catch((error) => {});
				})
			},

			// 编辑图片
			editImage(photoIndex,serverType) {
				this.serverType=serverType
				this.photoIndex = photoIndex
				let url = photoIndex.rawUrl
				// 根据图片路径获取图片名称
				let route = url.split('?')[0]
				let name = route.split('/')
				this.imageName = name[name.length - 1]

				let windowHeight = document.documentElement.clientHeight;
				let windowWidth = document.documentElement.clientWidth;
				//动态设置画布宽高
				let cssMaxWidth = windowWidth > 1500 ? windowWidth - 500 : 1000
				let cssMaxHeight = windowHeight > 1200 ? windowHeight - 200 : 1000

				// 显示图片
				// this.isShowEditImage = true
				// 使用编辑组件
				this.instance = new ImageEditor(this.$refs.imageEditor, {
					includeUI: { // 表示使用它内置的 UI 控件
						loadImage: {
							path: url,
							name: this.imageName
						}, // 默认加载的图片
						initMenu: 'draw', // 表示编辑器加载后，第一个被选中的操作菜单功能
						menu: [
							'crop', // 裁切
							'flip', // 翻转
							'rotate', // 旋转
							'draw', // 添加绘画
							'shape', // 添加形状
							'icon', // 添加图标
							// 'text', // 添加文本
							'mask', // 添加覆盖
							'filter' // 添加滤镜
						], // 支持的菜单
						locale: this.getLocalZn(),
						theme: customTheme,
						usageStatistics: false,
						menuBarPosition: 'left' // 菜单位置栏的位置，有四个选项可选：'top', 'bottom', 'left', 'right'
					},
					cssMaxWidth: cssMaxWidth,
					cssMaxHeight: cssMaxHeight,
				})
				this.$refs.imageEditor.style.top = 0
				// 隐藏删除按钮
				document.getElementsByClassName('tie-btn-delete tui-image-editor-item help')[0].style.display = 'none'
				//隐藏logo
				document.getElementsByClassName('tui-image-editor-header-logo')[0].style.display = 'none'
				//隐藏download load
				document.getElementsByClassName('tui-image-editor-header-buttons')[0].style.display = 'none'
				document.getElementsByClassName('tui-image-editor-help-menu')[0].style.background = 'white'

				//隐藏modal的padding
				let modalBody = document.getElementsByClassName('ivu-modal-body')
				for (let i = 0; i < modalBody.length; i++) {
					if (modalBody[i] && modalBody[i].style) {
						modalBody[i].style.padding = 0
					}
				}

				// // 保存原有图片 exif信息
				// let orignBuffer = this.base64ToArrayBuffer(this.getBase64ImageUrl(photoIndex.rawUrl));
				// console.log(orignBuffer)
				// let segments = this.getSegments(orignBuffer); //分割片段
				// console.log(segments)
				// this.exifInfo = this.getEXIF(segments);
				// console.log(this.exifInfo.toString())
			},

		}
	}
</script>
<style lang="scss" scoped>

</style>
