<template>
  <div class="gantt gantt-mergeCell" >
    <!-- 控制条 -->
    <div class="gantt-toolbar">
      <div class="gantt-toolbar-left">
        <!-- 左侧可配置按钮 -->
        <slot name="left-buttons">
        </slot>
        <!-- 基本按钮 -->
        <Button type='primary' custom-icon="iconfont icondaochu2" @click="handleExport">Export</Button>
        <!-- 更多 -->
        <!-- <Dropdown trigger="click"  class="gantt-more-Dropdown">
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
        </Dropdown> -->
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
  import moment from  "moment";
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
      // 是否显示unit按钮
      isShowUnit:{
        type:Boolean,
        default:true 
      },
    },
    data () {
      return {
        realtasks:null,
        // 存储关联数据
        resourcesStore:null,
        // resourcesWhole:false,
        resourceResult:[0,0,0,0,0],
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
          // this.gantt.config.process_resource_assignments = true
          this.gantt.config.work_time = true
          // 周末样式
          let _this = this
          this.gantt.templates.timeline_cell_class = function (task, date) {
            if(_this.viewUnit === 'day'){
              if (!_this.gantt.isWorkTime({date: date, task: task},_this.viewUnit)){
                return "week_end";
              }else{
                return "week_normal";
              }
            }
          };
          this.gantt.templates.resource_cell_class = function(start_date, end_date, resource, tasks){
            var css = [];
            css.push("resource_marker workday_normal");
            // if (tasks.length <= 1) {
            //   css.push("workday_ok");
            // } else {
            //   css.push("workday_over");
            // }
            return css.join(" ");
          }
         // resource赋值
          this.gantt.templates.resource_cell_value = function (start_date, end_date, resource, tasks) {
            // 判断是否是该周的结尾
            let _whole = false
            tasks.forEach(function(item) {
              if(!item.typeId[0].value){return}
              item.typeId[0].value.forEach(item2=>{
                _this.resourceResult[(start_date.getDay()-1)] += item2.time === moment(start_date).format("yyyy-MM-DD")?item2.value*1:0
                if(item2.time === moment(start_date).format("yyyy-MM-DD")){
                  _whole = true 
                }else{
                  _whole = false
                }
              })
            });
            // 如果是周五的话  标识可能会有跨周的数据，就可以直接把_whole赋值为true
            if(start_date.getDay()===5) _whole = true
            // 默认cell填充值为空
            let _realDate='<div class="">'+''+'</div>'
            // 是一周的结尾的话，就把数组里面的五位数相加，填充到cell中
            if(_whole){ 
              let isFill=false;
              let days=start_date.getDay();
                if(days===5) {
                  isFill=true;
                }else if(days<5&&days>0){
                  //检查本周剩下的日期是否还有值,如果有，则不填充
                    let count=0;
                    let sDate=new Date(moment(start_date).format("yyyy-MM-DD"));
                    for(let i=0;i<5-days;i++){
                        sDate = sDate.setDate(sDate.getDate() + 1);
                        sDate=new Date(sDate);
                        let listFilter= _this.tasks.data.filter(ele=>{
                          return new Date(ele.start_date)<=sDate&&new Date(ele.end_date)>=sDate&&ele.typeId[0].resource_id==resource.id;
                        });
                      count+=listFilter.length;
                    }
                    if(count==0){
                      isFill=true;
                    }
                    else{
                      isFill=false;
                    }
                }
                if(isFill){
                  let result = 0
                  let indexNotEmpty=4;
                  _this.resourceResult.forEach((item,index)=>{
                    result += item
                    if(item>0){
                      indexNotEmpty=index;
                    }
                  })
                  let className=_this.getCellClass(result,resource.id);
                  _realDate = '<div class="hasClass"><div class="hasCircle circle'+indexNotEmpty+' '+className+'"><span>'+result+'</span><span class="circle normalCircle"></span>'+'</div></div>' 
                  // 重置
                  _this.resourceResult = [0,0,0,0,0]
                }
            }
            return _realDate

          }
	        this.gantt.config.resource_store = "resourceGantt"
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
                height:264,
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
        // 添加颜色
        this.gantt.templates.task_class =  function (start, end, task) {
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
         //给指定行加背景色
        this.gantt.templates.grid_row_class = function(start, end, task){
          if(task.isWarning&&task.isWarning==1){
            return "gantt-all-row-warning";
          }
          else{
            return "";
          }
        };
        this.initGanttEvents()
      },
      getCellClass(count,resourceId){
            let minData=0;
            let maxData=1;
          switch(resourceId){
            case 1:
              minData=2;
              maxData=3;
              break;
            case 2:
              minData=3;
              maxData=5;
              break;
            case 3:
              minData=4;
              maxData=5;
              break;
            case 4:
              minData=4;
              maxData=5;
              break;
            case 5:
              minData=8;
              maxData=10;
              break;
            case 6:
              minData=15;
              maxData=18;
              break;
          }
          let className="";
          if(count<=minData){
            className="-common";
          }
          else if(count>minData&&count<=maxData){
            className="-over";
          }
          else if(count>maxData){
            className="-over-plus";
          }
          return "resource-status"+className;
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
  // 合并单元格样式
  .gantt_task_cell.week_end {
    background-color: #e8e8e87d;
  }

  .gantt_task_row .gantt_selected .gantt_task_cell.week_end {
    background-color: #e8e8e87d !important;
  }
  .gantt_resource_marker .hasClass .hasCircle{
      position: absolute;
      right: 200%;
      width: 100%;
      
  }
  .gantt_resource_marker .hasClass .circle0{
    right: 0;
    left:200%;
  }
  .gantt_resource_marker .hasClass .circle1{
    right: 0;
    left:100%;
  }
  .gantt_resource_marker .hasClass .circle2{
    right: 0;
  }
  .gantt_resource_marker .hasClass .circle3{
    right: 100%;
  }
  .gantt_resource_marker .hasClass .circle4{
    right: 200%;
  }
 
  
  .gantt_resource_marker .hasClass .hasCircle span{
      vertical-align: middle;
      color: black;
  }
  .gantt_resource_marker .hasClass .hasCircle .circle{
      border-radius: 50%;
      display: inline-block;
      width: 20px;
      height: 20px;
      margin-left: 6px;
      // padding: 16%;
  }
  
  .gantt_resource_marker .hasClass .hasCircle .normalCircle{
      background-color: rgba(78,208,134,.75);
  }
   .gantt_resource_marker .hasClass .resource-status-common .normalCircle{
     background-color:green;
  }
  .gantt_resource_marker .hasClass .resource-status-over .normalCircle{
     background-color:yellow;
  }
  .gantt_resource_marker .hasClass .resource-status-over-plus .normalCircle{
     background-color:red;
  }
  .gantt-mergeCell .resource_marker.workday_normal div {   
    width: 100%;
    height: 100%;
	  background: white;
  }
  .gantt-mergeCell .resourceTimeline_cell .gantt_task_cell.week_normal {
    background-color: white;
    border: none;
  }
  .gantt-all-row-warning{
    background-color:#e61142;
  }
</style>
