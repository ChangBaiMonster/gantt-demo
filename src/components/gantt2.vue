<template>
  <div class="gantt" >
    <!-- 控制条 -->
    <div class="gantt-toolbar">
      <div class="gantt-toolbar-left">
        <!-- 左侧可配置按钮 -->
        <slot name="left-buttons">
        </slot>
        <!-- 基本按钮 -->
        <Button type='primary' custom-icon="iconfont icondaochu2" @click="handleExport">导出</Button>
        <!-- 更多 -->
        <Dropdown trigger="click"  class="gantt-more-Dropdown">
          <Button>操作<Icon type="ios-arrow-down"></Icon></Button>
          <DropdownMenu slot="list" class="gantt-more-menu">
            <slot name="more-buttons">
              <DropdownItem>
                <Button type='text' icon='md-trash' @click='handleDelete()' >删除</Button>
              </DropdownItem>
              <DropdownItem>
                <Button type='text' icon='md-trash' @click='handleDelete()' >日历</Button>
              </DropdownItem>
            </slot>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div class="gantt-toolbar-right">
        <!--不同单位视图切换-->
        <span class='ivu-ml-8 plan-center-gantt-unit-view'>
            单位：
            <Select v-model='viewUnit' placeholder='' style='width: 80px' @on-change='handleUnitViewChange'>
                <Option v-for='(item, index) in unitData' :key='index' :value='item.value' :label='item.label'></Option>
            </Select>
        </span>
        <!-- 树形折叠 -->
        <span   class="plan-center-gantt-expand-all">
          <Switch size="large" class='ivu-ml-8' v-model='isExpandAll' @on-change='handleExpandAll'>
              <span slot="open">expand</span>
              <span slot="close">collapse</span>
          </Switch>
        </span>
        <slot name='suffix-buttons'>
          <RadioGroup class='ivu-ml-8' v-model='layoutView' type='button' size='small' @on-change='handleLayoutChange'>
            <Radio label='left' :border='false'>
                <span>left</span>
            </Radio>
            <Radio label='default' :border='false'>
                <span>default</span>
            </Radio>
            <Radio label='right' :border='false'>
                <span>right</span>
            </Radio>
          </RadioGroup>
        </slot>
      </div>

    </div>
    <!-- 甘特图 -->
    <div ref="gantt" class="gantt-div" name='gantt'></div>
    <!--加载进度-->
    <Spin size='large' fix v-if='loading'>
        <slot name='loading'></slot>
    </Spin>
  </div>
</template>

<script>
  import gantt from 'dhtmlx-gantt'
  import './api'
  export default {
    name: 'gantt',
    props: {
      // 加载遮罩层
      loading: {
        type: Boolean,
        default: false
      },
      // gantt数据
      tasks: {
        type: Object,
        default () {
          return { data: [], links: [], columns: [],resource:{columns:[],resource_data:[]} }
        }
      },
      // 导出形式
      export:{
        type:String,
        default:'pdf'
      },
    },
    data () {
      return {
        // 存储关联数据
        resourcesStore:null,
        // 判断tasks是否是第一次被watch
        initgantt:0,
        // 是否全部展开层级,默认不展开
        isExpandAll: false,
        // 单位视图--切换数据
        viewUnit: 'day',
        // 单数视图-- 下拉数据
        unitData:[],
        // 切换视图
        layoutView:'default',
        // 初始化gantt
        // gantt:'',
       
      }
    },
    computed: {

    },
    watch:{
      // 监控父值tasks对象中的data，否则无法实时更新
      'tasks.data':{
        immediate:true,
        handler(newVal,oldVal){
          let _tasks = this.tasks
          if(this.initgantt!== 0){
            // 关联数据
            gantt.clearAll()
            gantt.parse(_tasks)
            if(this.tasks.resource){
              this.resourcesStore.parse(_tasks.resource.resource_data)
            }
            gantt.render()
            this.$emit('update:loading', false);
          }
          this.initgantt = this.initgantt+1
        },
      }
    },
    created(){
      // this.gantt = Gantt.getGanttInstance()
    },
    mounted: function () {
      gantt.config.date_format = "%Y-%m-%d %H:%i:%s";
      this.setServerList() //设置单位视图下拉列表的数据
      this.setUnitView() // 设置单位视图
      this.unitData = this.getUnitData()
      this.initColumns() // 初始化列
      this.setConfigs() // 自定义配置
      this.start()
    },
    beforeDestroy(){
      gantt.destructor()
      this.resourcesStore.destructor()
    },
    methods: {
      // 开始
      start(){
        let _this=this
        if(this.tasks.resource){
          var resourcesStore = gantt.createDatastore({
            name: gantt.config.resource_store,
            type: "treeDatastore",
            initItem: function (item) {
              item.parent = item.parent || gantt.config.root_id;
              item[gantt.config.resource_property] = item.parent;
              return item;
            }
          });
          resourcesStore.parse(this.tasks.resource.resource_data)
          this.resourcesStore = resourcesStore
        }
        gantt.init(this.$refs.gantt)
        gantt.init(this.$refs.gantt)
      },
      // 初始化表格列
      initColumns () {
        gantt.config.columns = this.tasks.columns
      },
      initGanttEvents () {
        if (gantt.$_eventsInitialized) {
          return;
        }
        // 监听点击事件
        gantt.attachEvent('onTaskClick', function (id, e) {
          var button = e.target.closest('[data-action]')
          if (button) {
            var action = button.getAttribute('data-action');
            switch (action) {
            case 'edit':
              self.handleNew('edit', id)
              break;
            case 'add':
              self.handleNew('new', id)
              break;
            default:
              self.$emit("action-event",action,id);
              break;
            }
            return false;
          }
          return true;
        })
       
      },
      // 甘特图配置
      setConfigs () {
        // render:"split" 时，需要配置一下这个
        gantt.config.open_split_tasks = true
        // 设置网格调整器的 DOM 元素的属性名称
        gantt.config.grid_resizer_attribute = 'gridresizer'
        // 设置网格每个格子最小宽度
        gantt.config.min_column_width = 50
        // 拖动时，甘特图自动拓展时间
        gantt.config.fit_tasks = true
        // 根据grid的宽度自动调整grid的列
        gantt.config.autofit = false
         // 不展示进度
        gantt.config.show_progress = false
        // 不可拖动
        // 允许用户拖动条形图来改变位置
        gantt.config.drag_move = false
        // 允许用户通过拖拽任务的条形图的两端来改变工期
        gantt.config.drag_resize = true
        // 表格区域变化时，table时候自动调整适应宽度。当达到最小宽度时自动出现滚动条
        gantt.config.grid_elastic_columns =true
        gantt.config.grid_resizer_attribute = 'gridresizer';
        // 表格区域宽度
        gantt.config.grid_width = 100
        // 如果有关联表格的话
        if(this.tasks.resource && this.tasks.resource.resource_data.length>0){
          // 启动资源分配解析
          gantt.config.process_resource_assignments = true
          gantt.config.work_time = true
          // 周末样式
          let _this = this
          gantt.templates.timeline_cell_class = function (task, date) {
            if(_this.viewUnit === 'day'){
              if (!gantt.isWorkTime({date: date, task: task},_this.viewUnit)){
                return "week_end";
              }else{
                return "";
              }
            }
          };
         // resource赋值
          gantt.templates.resource_cell_value = function (start_date, end_date, resource, tasks) {
            return "<div>" + tasks.length + "</div>" 
          }
	        gantt.config.resource_store = "resource"
          gantt.config.resource_property = "typeId"
          gantt.config.order_branch = true

          let resourceConfig={
            columns:this.tasks.resource.columns
          } 
          gantt.config.layout = {
            css: "gantt_container",
            rows: [
              {
                cols: [
                  {view: "resourceGrid",config: resourceConfig, group:"grids",scrollY: "resourceVScroll" },
                  {resizer: true, width: 1},
                  {view: "resourceTimeline", gravity:3,scrollX: "scrollHor", scrollY: "resourceVScroll"},
                  {view: "scrollbar", id: "resourceVScroll", group:"vertical"}
                ],
                 height:122,
                gravity:1
              },
              {resizer: true, width: 1},
              {
                cols: [
                  {view: "grid", scrollable: true,group:"grids",scrollY: "scrollVer",gravity:1},
                  {resizer: true, width: 1},
                  {view: "timeline",gravity:3, scrollX: "scrollHor", scrollY: "scrollVer"},
                  {view: "scrollbar", id: "scrollVer", group:"vertical"}
                ],
                gravity:2
              },
              {view: "scrollbar", id: "scrollHor"}
            ]
          }

        }else{
          // 设置滚动条在进度区域内
          gantt.config.layout = {
            css: 'gantt_container',
            cols: [
              {
                // width:gantt.config.grid_width,
                min_width: 200,
                gravity:1, //各站页面宽度比重
                // adding horizontal scrollbar to the grid via the scrollX attribute
                rows:[
                  {view: "grid", scrollX: "gridScroll", scrollable: true, scrollY: "scrollVer"},
                  {view: "scrollbar", id: "gridScroll",group:"horizontal"}
                ]
              },
              {resizer: true, width: 1},
              {
                gravity:2, //各站页面宽度比重 1:1就是各50%
                rows:[
                  {view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer"},
                  {view: "scrollbar", id: "scrollHor",group:"horizontal"}
                ]
              },
              {view: "scrollbar", id: "scrollVer"}
            ]
          }
        }
        // 添加颜色
        gantt.templates.task_class =  function (start, end, task) {
          if(task.needType){
            switch (task.needType) {
              case "特殊加工":
                return "projectRed";
                break;
              case "测量":
                return "projectOrange";
                break;
              case "拆解":
                return "projectGreen";
                break;
              case "改装":
                return "projectYellow";
                break;
              case "热试":
                return "projectCyan";
                break;
              case "装机":
                return "projectBlue";
                break;
              case "signoff":
                return "projectPurple";
                break;
              case "测量":
                return "projectCe";
                break;
              case "超声波":
                return "projectChao";
                break;
              case "Margin":
                return "projectMargin";
                break;
              case "雨淋涉水":
                return "projectRain";
                break;
            }
          }
	      }
        this.initGanttEvents()
      },
      // 新建模板
      handleNew (action, id) {
        let task = gantt.getTask(id)
        this.formData = {
          status: task.status,
          number: task.number,
          project: task.project
        }
        this.showModal = true
      },
      // 设置基础数据源
      setServerList () {
        gantt.serverList('unit', [
            { label: gantt.locale.labels.days, value: 'day' },
            { label: gantt.locale.labels.weeks, value: 'week' },
            { label: gantt.locale.labels.months, value: 'month' },
            { label: gantt.locale.labels.years, value: 'year' }
        ]);
      },
      // 设置单位视图
      setUnitView () {
        if (this.isShowUnit) {
            let zoomConfig = {
                levels: [
                    {
                        name: 'day',
                        scale_height: 50,
                        min_column_width: 50,
                        scales: [
                            {unit: 'month', step: 1, format: '%Y  %M'},
                            {unit: 'day', step: 1, format: '%d'}
                        ]
                    },
                    {
                        name: 'week',
                        scale_height: 50,
                        min_column_width: 50,
                        scales: [
                            {unit: 'month', format: '%Y %F'},
                            {
                                unit: 'week',
                                step: 1,
                                format: function (date) {
                                    let weekNum = gantt.date.date_to_str('%W')(date);
                                    return weekNum;
                                }
                            }
                        ]
                    },
                    {
                        name: 'month',
                        scale_height: 50,
                        min_column_width: 40,
                        scales: [
                            {unit: 'year', step: 1, format: '%Y '},
                            {unit: 'month', format: '%F'}
                        ]
                    },
                    {
                        name: 'quarter',
                        height: 50,
                        min_column_width: 90,
                        scales: [
                            {unit: 'month', step: 1, format: '%M'},
                            {
                                unit: 'quarter',
                                step: 1,
                                format: function (date) {
                                    var dateToStr = gantt.date.date_to_str("%M");
                                    var endDate = gantt.date.add( gantt.date.add(date, 3, "month"), -1, "day");
                                    return dateToStr(date) + " - " + dateToStr(endDate);
                                }
                            }
                        ]
                    },
                    {
                        name: 'year',
                        scale_height: 27,
                        min_column_width: 30,
                        scales: [
                            {unit: 'year', step: 1, format: '%Y '}
                        ]
                    }
                ]
            };
            gantt.ext.zoom.init(zoomConfig);
            gantt.ext.zoom.setLevel('day');
        }
      },
      // 获取单位列表下拉数据
      getUnitData(){
        var unitList = gantt.serverList("unit");
        unitList.forEach((item,index) => {
            item.label = item.value
        });
        console.log(unitList)
        return unitList;
      },
      // 切换单位视图
      handleUnitViewChange (value) {
          gantt.ext.zoom.setLevel(value);
          // this.checkElection();
      },
      // 切换展开层级
      handleExpandAll (value) {
        gantt.eachTask(function(task){
            task.$open = !!value;
        });
        gantt.render();
        // this.checkElection()
        this.$emit('on-expand-all', value);
      },
      // 切换布局
      handleLayoutChange (value) {
        let defaultLayout =  {
          css: 'gantt_container',
          cols: [
            {
              // width:_gantt.config.grid_width,
              min_width: 200,
              gravity:1, //各站页面宽度比重
              // adding horizontal scrollbar to the grid via the scrollX attribute
              rows:[
                {view: "grid", scrollX: "gridScroll", scrollable: true, scrollY: "scrollVer"},
                {view: "scrollbar", id: "gridScroll",group:"horizontal"}
              ]
            },
            {resizer: true, width: 1},
            {
              gravity:2, //各站页面宽度比重 1:1就是各50%
              rows:[
                {view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer"},
                {view: "scrollbar", id: "scrollHor",group:"horizontal"}
              ]
            },
            {view: "scrollbar", id: "scrollVer"}
          ]
        }
        let noChartLayout = {
          css: 'gantt_container',
          cols: [
            {
              min_width: 200,
              // gravity:1,
              rows:[
                {view: "grid", scrollX: "gridScroll", scrollable: true,scrollY: "scrollVer"},
                {view: "scrollbar", id: "gridScroll",group:"horizontal"}
              ]
            },
            {resizer: true, width: 1},
            {view: "scrollbar", id: "scrollVer"}
          ]
        }
        var noGridLayout = {
          css: "gantt_container",
          cols: [
            {
              rows:[
                {view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer"},
                {view: "scrollbar", id: "scrollHor", group:"horizontal"}
              ]
            },

            {view: "scrollbar", id: "scrollVer"}
          ]
        }

        switch (value) {
          case 'left': {
            gantt.config.layout = noChartLayout
              break;
          }
          case 'default': {
            gantt.config.layout = defaultLayout
              break;
          }
          case 'right': {
            gantt.config.layout = noGridLayout
              break;
          }
        }
        gantt.init(this.$refs.gantt)
      },
      // 导出
      handleExport(){
        if(this.export === 'pdf'){
          gantt.exportToPDF({
              raw:true
            })
        }
        if(this.export === 'excel'){
          gantt.exportToExcel()
        }

      },
      // 弹出框保存事件
      submitEvent () {
        this.showModal = false
        this.$XModal.message({ content: '保存成功', status: 'success' })
        Object.assign(this.selectRow, this.formData)
      },
      getData(){
        let list=[];
        gantt.eachTask(function(task){list.push(task)});
        return list;
      },
    }
  }
</script>
<style lang="less">
  @import "./dhtmlxgantt.css";
  .gantt{
    height: 100%;
    position: relative;
    // .gantt_grid{
    //   overflow-x: scroll;
    // }
  }
  .gantt-toolbar{
    padding: 8px;
    // background: rgba(0,119,200,.15);
    display: flex;
    align-items: center;
    &-left{
      flex:1;
      display: flex;
      justify-content:flex-start;
      flex-direction: row;
      align-items: center;
      >button{
        margin-right: 5px;
      }
      .gantt-more-menu{
        .ivu-btn-text{
          background-color: transparent
        }
      }
    }
    &-right{
      flex:1;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-end;
    }
  }
  .gantt-div{
    height: calc(~'100% - 60px');
  }
  .projectRed {
      border:2px solid #d84d36;
      color:#6ba8e3;
      background: #f85a40
  }
  .projectRed .gantt_task_progress{
      background:#d04b35
  }
  .projectOrange {
      border:2px solid #d57820;
      color:#6ba8e3;
      background: #f48924
  }
  .projectOrange .gantt_task_progress{
      background:#e47c48
  }
  .projectYellow {
      border:2px solid #e2b13d;
      color:#6ba8e3;
      background: #ffc845
  }
  .projectYellow .gantt_task_progress{
      background:#ebb73d
  }
  .projectGreen {
      border:2px solid #01a25d;
      color:#6ba8e3;
      background: #00c16e
  }
  .projectGreen .gantt_task_progress{
      background:#00b165
  }
  .projectCyan {
      border:2px solid  #1135ad;
      color:#6ba8e3;
      background: #3f62d7
  }
  .projectCyan .gantt_task_progress{
      background:#1135ad
  }
  .projectBlue {
      border:2px solid #0276e4;
      color:#6ba8e3;
      background: #037ef3
  }
  .projectBlue .gantt_task_progress{
      background:#026dd4
  }
  .projectPurple {
      border:2px solid #6445af;
      color:#6ba8e3;
      background: #7552cc
  }
  .projectPurple .gantt_task_progress{
      background:#6c4cbb
  }
  .projectCe {
      border:2px solid #ec651a;
      color:#6ba8e3;
      background: #e73d02
  }
  .projectCe .gantt_task_progress{
      background:#6c4cbb
  }
  .projectChao {
      border:2px solid #04a688;
      color:#6ba8e3;
      background: #1ac4a5
  }
  .projectChao .gantt_task_progress{
      background:#6c4cbb
  }
  .projectMargin {
      border:2px solid #1b9cdf;
      color:#6ba8e3;
      background: #5dc5fb
  }
  .projectMargin .gantt_task_progress{
      background:#6c4cbb
  }
  .projectRain {
      border:2px solid #61b028;
      color:#6ba8e3;
      background: #8bc561
  }
  .projectRain .gantt_task_progress{
      background:#61b028
  }
</style>
