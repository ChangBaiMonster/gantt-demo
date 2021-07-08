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
  import {Gantt} from 'dhtmlx-gantt'
  // import './api'
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
      }
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
        gantt:'',
       
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
            this.gantt.clearAll()
            this.gantt.parse(_tasks)
            if(this.tasks.resource){
              this.resourcesStore.parse(_tasks.resource.resource_data)
            }
            this.gantt.render()
            this.$emit('update:loading', false);
          }
          this.initgantt = this.initgantt+1
        },
      }
    },
    created(){
      this.gantt = Gantt.getGanttInstance()
    },
    mounted: function () {
      this.gantt.config.date_format = "%Y-%m-%d %H:%i:%s";
      this.setServerList() //设置单位视图下拉列表的数据
      this.setUnitView() // 设置单位视图
      this.unitData = this.getUnitData()
      this.initColumns() // 初始化列
      this.setConfigs() // 自定义配置
      this.start()
    },
    beforeDestroy(){
      this.gantt.destructor()
      this.resourcesStore.destructor()
    },
    methods: {
      // 开始
      start(){
        let _this=this
        if(this.tasks.resource){
          var resourcesStore = this.gantt.createDatastore({
            name: _this.gantt.config.resource_store,
            type: "treeDatastore",
            initItem: function (item) {
              item.parent = item.parent || _this.gantt.config.root_id;
              item[gantt.config.resource_property] = item.parent;
              return item;
            }
          });
          resourcesStore.parse(this.tasks.resource.resource_data)
          this.resourcesStore = resourcesStore
        }
        this.gantt.init(this.$refs.gantt)
        this.gantt.init(this.$refs.gantt)
      },
      // 初始化表格列
      initColumns () {
        this.gantt.config.columns = this.tasks.columns
      },
      initGanttEvents () {
        if (this.gantt.$_eventsInitialized) {
          return;
        }
        // 监听点击事件
        this.gantt.attachEvent('onTaskClick', function (id, e) {
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
        this.gantt.config.open_split_tasks = true
        // 设置网格调整器的 DOM 元素的属性名称
        this.gantt.config.grid_resizer_attribute = 'gridresizer'
        // 设置网格每个格子最小宽度
        this.gantt.config.min_column_width = 50
        // 拖动时，甘特图自动拓展时间
        this.gantt.config.fit_tasks = true
        // 根据grid的宽度自动调整grid的列
        this.gantt.config.autofit = false
         // 不展示进度
        this.gantt.config.show_progress = false
        // 不可拖动
        // 允许用户拖动条形图来改变位置
        this.gantt.config.drag_move = false
        // 允许用户通过拖拽任务的条形图的两端来改变工期
        this.gantt.config.drag_resize = false
        // 表格区域变化时，table时候自动调整适应宽度。当达到最小宽度时自动出现滚动条
        this.gantt.config.grid_elastic_columns =true
        this.gantt.config.grid_resizer_attribute = 'gridresizer';
        // 表格区域宽度
        this.gantt.config.grid_width = 100
        // 如果有关联表格的话
        if(this.tasks.resource && this.tasks.resource.resource_data.length>0){
          // 启动资源分配解析
          this.gantt.config.process_resource_assignments = true
          this.gantt.config.work_time = true
          // 周末样式
          let _this = this
          this.gantt.templates.timeline_cell_class = function (task, date) {
            if(_this.viewUnit === 'day'){
              if (!_this.gantt.isWorkTime({date: date, task: task},_this.viewUnit)){
                return "week_end";
              }else{
                return "";
              }
            }
          };
         // resource赋值
          this.gantt.templates.resource_cell_value = function (start_date, end_date, resource, tasks) {
            return "<div>" + tasks.length + "</div>" 
          }
	        this.gantt.config.resource_store = "resource"
          this.gantt.config.resource_property = "typeId"
          this.gantt.config.order_branch = true

          let resourceConfig={
            columns:this.tasks.resource.columns
          } 
          this.gantt.config.layout = {
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
          this.gantt.config.layout = {
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
        this.initGanttEvents()
      },
      // 新建模板
      handleNew (action, id) {
        let task = this.gantt.getTask(id)
        this.formData = {
          status: task.status,
          number: task.number,
          project: task.project
        }
        this.showModal = true
      },
      // 设置基础数据源
      setServerList () {
        this.gantt.serverList('unit', [
            { label: this.gantt.locale.labels.days, value: 'day' },
            { label: this.gantt.locale.labels.weeks, value: 'week' },
            { label: this.gantt.locale.labels.months, value: 'month' },
            { label: this.gantt.locale.labels.years, value: 'year' }
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
                                    let weekNum = this.gantt.date.date_to_str('%W')(date);
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
                                    var dateToStr = this.gantt.date.date_to_str("%M");
                                    var endDate = this.gantt.date.add( this.gantt.date.add(date, 3, "month"), -1, "day");
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
            this.gantt.ext.zoom.init(zoomConfig);
            this.gantt.ext.zoom.setLevel('day');
        }
      },
      // 获取单位列表下拉数据
      getUnitData(){
        var unitList = this.gantt.serverList("unit");
        unitList.forEach((item,index) => {
            item.label = item.value
        });
        console.log(unitList)
        return unitList;
      },
      // 切换单位视图
      handleUnitViewChange (value) {
          this.gantt.ext.zoom.setLevel(value);
          // this.checkElection();
      },
      // 切换展开层级
      handleExpandAll (value) {
        this.gantt.eachTask(function(task){
            task.$open = !!value;
        });
        this.gantt.render();
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
            this.gantt.config.layout = noChartLayout
              break;
          }
          case 'default': {
            this.gantt.config.layout = defaultLayout
              break;
          }
          case 'right': {
            this.gantt.config.layout = noGridLayout
              break;
          }
        }
        this.gantt.init(this.$refs.gantt)
      },
      // 导出
      handleExport(){
        if(this.export === 'pdf'){
          this.gantt.exportToPDF({
              raw:true
            })
        }
        if(this.export === 'excel'){
          this.gantt.exportToExcel()
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
        this.gantt.eachTask(function(task){list.push(task)});
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
  
</style>
