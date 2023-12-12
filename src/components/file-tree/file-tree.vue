<template>
	<div style="padding-bottom: 30px;">
		<Tree :data="fileTree" :render="renderContent" class="demo-tree-render" @on-select-change="clickTree"></Tree>
		<!-- 选择 -->
		<Button style="width: 30%;float: right;height: 30px;" type="primary"
			@click="onSelect">{{$t('common.select')}}</Button>
		<!-- 取消 -->
		<Button style="width: 30%;float: right;height: 30px;margin-right: 10px;"
			@click="onCancel">{{$t('common.cancel')}}</Button>
	</div>
</template>

<script>
	export default {
		props: {
			type: {
				type: Number,
				default: 2
			}, //0为全部 1为获取文件 2为文件夹
			pathList: [],
		},
		data() {
			return {
				parent: "root",
				pathSep: '/',
				fileTree: [],
				selectedPath: "",
			}
		},
		mounted() {
			this.getFileTree(this.parent)
		},
		methods: {
			onSelect() {
				if (!this.selectedPath) {
					this.showVsNotification(this.$t('file.noSelectAnything'))
				} else {
					this.showVsConfirmDialog(this.$t('common.confirm'), this.$t(
						'file.sureSelectPath') + this.selectedPath, () => {
						this.$emit('onSelect', this.selectedPath)
					})
				}
			},
			onCancel() {
				this.$emit('onCancel')
			},
			getNodeRender(h, data, iconName) {
				return h('span', {
					style: {
						display: 'inline-block',
						width: '100%'
					}
				}, [
					h('span', [
						h('Icon', {
							props: {
								type: iconName
							},
							style: {
								marginRight: '8px'
							}
						}),
						h('span', data.title)
					]),
					h('span', {
						style: {
							display: 'inline-block',
							float: 'right',
							marginRight: '32px'
						}
					})
				])
			},
			renderContent(h, {
				root,
				node,
				data
			}) {
				if (data.type == 2) {
					return this.getNodeRender(h, data, 'ios-folder');
				} else if (data.type == 1) {
					return this.getNodeRender(h, data, 'ios-document-outline');
				} else if (data.type == -1) {
					return this.getNodeRender(h, data, 'md-return-left');
				}
			},
			//目录点击事件
			clickTree(node, data) {
				if (data.type == -1) {
					//点击了返回上一级
					console.log("点击了返回上一级")
					let lastSepIndex = this.parent.lastIndexOf(this.pathSep) > 0 ? this.parent.lastIndexOf(this.pathSep) :
						1
					let lastPath = this.parent.substring(0, lastSepIndex)
					console.log("lastPath:" + lastPath)

					this.getFileTree(lastPath)
				} else if (data.type == 2 && data.selected) {
					// 初次选中文件夹
					console.log("初次选中文件夹")
					this.selectedPath = data.title
				} else if (data.type == 2 && !data.selected) {
					// 第二次点击文件夹 进入文件夹
					console.log("第二次点击文件夹")
					this.selectedPath = data.title
					this.getFileTree(this.selectedPath)
				}
			},
			getFileTree(parentPath) {
				this.api
					.post("/api/file/getPathTree", {
						parent: parentPath,
						type: this.type
					})
					.then((res) => {
						console.log(res)
						if (!res.code) {
							this.pathSep = res.data.sep
							this.parent = res.data.parent
							let parent = res.data.parent
							let children = res.data.children
							this.fileTree = []
							// 顶部添加返回上级按钮
							this.fileTree.push({
								title: this.$t('file.returnLastPath') + " " + this.$t('file.currentPath') +
									":" + parent,
								expand: false,
								type: -1
							})
							for (let i = 0; i < children.length; i++) {
								let addSep = parent == this.pathSep ? "" : this.pathSep
								this.fileTree.push({
									title: parent + addSep + children[i].name,
									expand: true,
									type: children[i].type
								})
							}
						}
					})
					.catch((error) => {
						if (error.code == 2) {
							this.showVsNotification(this.$t('common.noAccess'))
						}
					});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.root {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>
