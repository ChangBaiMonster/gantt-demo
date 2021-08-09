<template>
  <div class="list-wrapper">
    <Gantt class="left-container"
          :tasks="tasks"
          :isShowToolbar='true'
          :loading.sync='ganttLoading'
          >
    </Gantt>
  </div>
</template>
<script>
  import Gantt from '@/components/gantt.vue'
  export default {
    name: 'list-gantt',
    components: {
      Gantt,
    },
    created () {
      this.getGantt()
    },
    
    data () {
      return {
        // 遮罩层
        ganttLoading:false,
        // gantt图数据
        tasks: {
          data: [],
          links: [],
          columns: [
            { name: 'car', label: 'Car', tree: true, width: '*', min_width: 150 },
            { name: 'duration', label: 'Duration', align: 'center' },
            { name: 'start_date', label: 'StartDate', align: 'center', min_width: 150 },
            { name: 'end_date', label: 'EndDate', align: 'center', min_width: 150 },
          ],
          // 底部关联table数据
          resource:{
            columns:[
              {
                name: "name", label: "Name1", tree:true, template: function (resource) {
                  return resource.text;
                }
              },
            ],
            resource_data:[
              {id: 1, text:'text1',parent:null},
              {id: 2, text:'text2',parent:null},
            ]
          },
        },
        
      }
    },
    methods: {
      // 自动排程--获取甘特图
      getGantt(){
        this.ganttLoading = true
        setTimeout(() => {
          this.tasks.data=[
            { id: 1, itemid: '001',text: 'Project 1',car: 'E18HOV901', start_date: '2020-01-17', end_date: '2020-01-19',"typeId":[{"resource_id":"1","value":1}]},
            { id: 2, itemid: '002',  text: 'Project 2', car: 'E18HOV902', start_date: '2020-01-18', end_date: '2020-01-24', render: 'split', type: 'project',"typeId":[{"resource_id":"1","value":1}]},
            { id: 3, itemid: '003', text: 'Task 2-1', needType:'特殊加工', start_date: '2020-01-18', end_date: '2020-01-20', parent: 2,"typeId":[{"resource_id":"2","value":1}]},
            { id: 4, itemid: '004',text: 'Task 2-2', needType:'测量', start_date: '2020-01-20', end_date: '2020-01-21', parent: 2,"typeId":[{"resource_id":"2","value":1}]},
            { id: 11, itemid: '011',text: 'Task 2-3', needType:'拆解', start_date: '2020-01-21', end_date: '2020-01-24',parent: 2,"typeId":[{"resource_id":"2","value":1}]},
            { id: 5, itemid: '005',text: 'Project 3', car: 'E18HOV904', start_date: '2020-01-20', end_date: '2020-01-28',"typeId":[{"resource_id":"1","value":1}]},
            { id: 6, itemid: '006', text: 'Task 3-1',  start_date: '2020-01-20', end_date: '2020-01-21', parent: 5,"typeId":[{"resource_id":"2","value":1}]},
            { id: 7, itemid: '007',text: 'Task 3-2', start_date: '2020-01-21', end_date: '2020-01-23', parent: 5,"typeId":[{"resource_id":"2","value":1}]},
            { id: 8, itemid: '008', text: 'Task 3-3', start_date: '2020-01-23', end_date: '2020-01-24', parent: 5,"typeId":[{"resource_id":"2","value":1}]},
            { id: 9, itemid: '009',  text: 'Task 3-4', start_date: '2020-01-24', end_date: '2020-01-28', parent: 5,"typeId":[{"resource_id":"2","value":1}] },
            { id: 10, itemid: '0010', text: 'Project 4', car: 'E18HOV908', start_date: '2020-01-20',"typeId":[{"resource_id":"1","value":1}]},
          ]
        }, 2000);
       
      }
    }
  }
</script>
<style lang="less">
.list-wrapper{
  height:600px
}
</style>
