<template>
	<div style="height:100%;">
		<div class="user-list" ref="listWrapper">
			<div class="user-item" :style="{ 'margin': itemMargin + 'px', 'width': itemWidth + 'px' }"
				v-for="(item, index) in userList" :key="item.id">
				<div style="position: relative;">
					<span class="item-avatar nasIcons icon-avatar"></span>
					<!-- 管理员标志 -->
					<div :style="{ 'right': itemWidth / 10 + 'px' }" v-if="item.is_admin == 1" class="item-admin-bg">
						<span class=" nasIcons icon-bg-admin" style="font-size: 20px;"></span>
						<span
							style="font-size:12px ;position: absolute;left: 8px;color: white;top: 5px;">{{ $t('user.admin')
							}}</span>
					</div>
				</div>
				<!-- 用户名 -->
				<div class="username" style="font-size: 18px;">
					{{ item.username }}
				</div>
				<div class="item-power" v-if="item.is_admin == 1">{{ $t('user.haveAllPower') }}</div>
				<div v-if="item.is_admin != 1"
					style="margin-top: 10px;display: flex;flex-direction: row;justify-content: space-between;width: 100%;flex-wrap: nowrap;align-items: center;">
					<a @click="powerSet(index)" style="text-decoration:underline;">{{ $t('user.powerSet') }}</a>
					<a @click="editUserFun(index)" style="text-decoration:underline;">{{ $t('common.edit') }}</a>
					<div style="height: 14px;width: 1px;background-color: #e8e8e8;"></div>
					<a @click="deleteUser(index)" style="text-decoration:underline;">{{ $t('common.delete') }}</a>
				</div>
			</div>

			<!-- 添加用户 -->
			<div @click="showAddDialog" :style="{ 'margin': itemMargin + 'px', 'width': itemWidth + 'px' }"
				style="background-color: white;border-radius: 10px;display: flex;flex-direction: column;justify-content: center;cursor: pointer;">
				<span class="nasIcons icon-add-album icon-add"></span>
				<div style="font-size: 20px;font-weight: bold;margin-bottom: 60px;">{{ $t('user.addNewUser') }}
				</div>
			</div>
		</div>

		<!-- 增加新用户的modal -->
		<vs-dialog prevent-close blur v-model="showAddUser">
			<template #header>
				<h4 style="font-size: 16px;">
					{{ editUser ? $t('user.updateUserInfo') : $t('user.addNewUser') }}
				</h4>
			</template>
			<add-user :editUser="editUser" v-if="showAddUser" @success="addUserSuccess"></add-user>
		</vs-dialog>


		<!-- 权限设置modal -->
		<vs-dialog prevent-close blur v-model="showPowerSet" scroll>
			<template #header>
				<h4 style="font-size: 16px;">
					{{ $t('user.powerSet') + ':' + selectedUser.username }}
				</h4>
			</template>
			<power-set v-if="showPowerSet" :user="selectedUser" @success="powerSetSuccess"></power-set>
		</vs-dialog>

	</div>
</template>

<script>
import addUser from "./add-user.vue"
import powerSet from "./power-set.vue"

export default {
	components: {
		addUser,
		powerSet
	},
	data() {
		return {
			itemBaseWidth: 220,
			itemWidth: 220,
			itemMargin: 10,
			editUser: null,
			btnCanUse: true,
			showAddUser: false,
			showPowerSet: false,
			userList: [],
			selectedUser: ''
		}
	},
	mounted() {
		this.getAllUser()
		window.addEventListener("resize", this.calImageWidth);
	},
	beforeDestroy() {
		window.removeEventListener("resize", this.calImageWidth);
	},
	methods: {
		//计算item宽度
		calImageWidth() {
			// if (this.userList.length < 2) {
			// 	return
			// }
			let wrapper = this.$refs.listWrapper.getBoundingClientRect();
			let itemWidth = this.utils.calItemWidth(wrapper, this.itemBaseWidth, this.itemMargin)
			if (itemWidth) this.itemWidth = itemWidth
		},
		showAddDialog() {
			this.editUser = null
			this.showAddUser = true
		},
		powerSetSuccess() {

		},
		powerSet(index) {
			this.selectedUser = this.userList[index]
			this.showPowerSet = true
		},
		editUserFun(index) {
			this.editUser = this.userList[index]
			this.$nextTick(() => {
				this.showAddUser = true
			})
		},
		//删除用户
		deleteUser(index) {
			let uid = this.userList[index].id

			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('user.sureDeleteUser'), () => {
				this.api.post('/api/usersApi/removeUser', {
					uid: uid
				}).then((res) => {
					if (!res.code) {
						this.showVsNotification(this.$t('common.operationSuccess'))
						this.getAllUser()
					}
				}).catch((error) => {
					this.showVsNotification(this.$t('common.operationFail'))
				})
			})

		},
		addUserSuccess() {
			this.showAddUser = false
			this.getAllUser()
		},
		getAllUser() {
			this.api.post('/api/usersApi/getAllUser', {}).then((res) => {
				if (!res.code) {
					console.log(res)
					this.userList = res.userList
					this.calImageWidth()
				}
			}).catch((error) => {
				if (error.code == 102) {
					this.btnCanUse = false
				}
				console.log(error);
			});
		}
	}
}
</script>

<style lang="scss" scoped>
.item-avatar {
	font-size: 66px;
	color: $nas-main;
}

.item-power {
	margin-top: 10px;
	color: $nas-grey;
}

.user-list {
	width: 100%;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: flex-start;
	align-content: flex-start;
}

.user-item {
	padding: 20px;
	background-color: white;
	border-radius: 10px;
}

.item-card {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	border-radius: 10px;
}

.username {
	margin-top: 10px;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
	word-break: break-all;
}

.item-admin-bg {
	position: relative;
	color: #F17A33;
	position: absolute;
	top: 13px;
}

.icon-add {
	margin-top: 30px;
	margin-bottom: 20px;
	font-size: 50px;
	color: $nas-main;
}

.usertype {
	margin-left: 10px;
}
</style>
