<template>
	<div class="root">
		<p v-for="letter in letterList" @click="onLetterClick(letter)" :style="{'color':currentLetter==letter?'#c5c8ce':'#515a6e'}">{{ letter }}</p>
	</div>

</template>

<script>
	export default {
		data() {
			return {
				currentLetter:null,
				letterList:['#','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
			}
		},
		mounted() {
			
		},
		methods: {
			onLetterClick(letter){
				if(this.currentLetter==letter){
					this.currentLetter=""
				}else{
					this.currentLetter=letter
				}
				this.$emit("onLetterClick",this.currentLetter)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.root {
		min-height:500px;
		width:20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		p{
			height: 18px;
			cursor: pointer;
			color: $nas-grey;
			font-weight: bold;
		}
	}
</style>
