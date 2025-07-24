<template>
    <div ref="chartRef" style="width: 100%;height: 100%;"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
    option: Object,
    width: { type: String, default: '100%' },
    height: { type: String, default: '400px' }
})

const chartRef = ref(null)
let chartInstance = null

const initChart = () => {
    chartInstance = echarts.init(chartRef.value)
    chartInstance.setOption(props.option)
}

watch(() => props.option, (newVal) => {
    chartInstance?.setOption(newVal)
}, { deep: true })

onMounted(initChart)
onBeforeUnmount(() => {
    chartInstance?.dispose()
})
</script>
