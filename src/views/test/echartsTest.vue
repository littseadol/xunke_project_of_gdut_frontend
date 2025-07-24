<template>
    <BaseEcharts :option="option"/>

</template>

<script setup lang="js">
import BaseEcharts from '@/components/BaseEcharts'
let option = ref()
option.value = {
    title: {
        text: 'Referer of a Website',
        // subtext: 'Fake Data',
        left: 'center'
    },
    tooltip: {
        trigger: 'item'
    },
    legend: {
        orient: 'vertical',
        left: 'left'
    },
    series: [
        {
            // name: '概率',
            type: 'pie',
            // radius: '50%',
            data: [
                { value: 60.85, name: '相同' },
                { value: 40, name: '不同' },
            ],
            // emphasis: {
            //     itemStyle: {
            //         shadowBlur: 10,
            //         shadowOffsetX: 0,
            //         shadowColor: 'rgba(0, 0, 0, 0.5)'
            //     }
            // }
        }
    ]
};
</script>

<style scoped lang="scss">

</style>