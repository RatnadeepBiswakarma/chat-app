<template>
	<div class="text-center flex flex-col justify-between h-full">
		<div class=" flex justify-center flex-col">
			<h3 class="text-2xl mt-8">
				{{ getCallHeading }}
			</h3>
			<AppIcon
				name="user"
				:attributes="profilePicAttributes"
				class="flex justify-center my-10 user-pic m-auto rounded-full"
			/>
		</div>
	</div>
</template>

<script>
import AppIcon from "@/components/Shared/AppIcon"

export default {
	components: {
		AppIcon
	},
	props: {
		callType: {
			type: String,
			required: true
		},
		initiatedByMe: {
			type: Boolean,
			required: true
		},
		targetPerson: {
			type: String,
			required: true
		},
		connected: {
			type: Boolean,
			required: true
		}
	},
	computed: {
		getCallHeading() {
			if (this.initiatedByMe) {
				if (this.connected) {
					return `Call with ${this.targetPerson.first_name}`
				}
				return `Calling ${this.targetPerson.first_name} ...`
			}
			return `Incoming call from ${this.targetPerson.first_name}`
		},
		profilePicAttributes() {
			return { width: 100, height: 100 }
		}
	}
}
</script>
