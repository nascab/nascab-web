<template>
	<div style="height:100%;padding: 20px;">
		<div v-for="(item,index) in userList" :key="item.id">
			<div class="user-item">
				<Avatar icon="ios-person" size="large" />
				<p style="margin-left: 10px;max-width: 150px;" class="username">{{item.username}}</p>
				<Tag style="margin-left: 10px;" class="usertype" color="geekblue" v-if="item.is_admin==1">
					{{$t('user.admin')}}</Tag>
				<Tag style="margin-left: 10px;" class="usertype" v-else color="default">{{$t('user.commonUser')}}</Tag>
				<Button @click="onSelect(index)" size="small" style="margin-left: 10px;"
					type="error">{{$t('common.select')}}</Button>
			</div>
			<Divider v-if="index!=userList.length-1"/>
		</div>
	</div>
</template>

<script>
	export default {
		components: {},
		data() {
			return {
				userList: [],
				selectedUser: ''
			}
		},
		mounted() {
			this.getAllUser()
		},
		methods: {
			onSelect(index){
				this.$emit('onSelect',this.userList[index])
			},
			getAllUser() {
				this.api.post('/api/usersApi/getAllUser', {}).then((res) => {
					if (!res.code) {
						console.log(res)
						this.userList = res.userList
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
	.list {
		width: 100%;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
	}

	.user-item {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.username {
		font-size: 16px;
		max-width: 150px;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		word-break: break-all;
	}

	.usertype {
		margin-left: 10px;
	}
</style>
