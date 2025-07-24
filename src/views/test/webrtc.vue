<template>
    <RtspVideo :rtspVideo="rtsp" :width="width" :height="height"/>
</template>

<script setup>
import RtspVideo from '@/components/rtspVideo/index.vue';
let rtsp = ref('rtsp://admin:Haikang12@10.21.80.72:554/Streaming/Channels/102')
let width = ref("500")
let height = ref("500")
</script>



<style scoped lang="scss">

</style>