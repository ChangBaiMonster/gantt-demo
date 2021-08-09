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
  import Gantt from '@/components/ganttMergeCells.vue'
  import moment from "moment";
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
            {
              name: "buttons",
              label: "操作",
              align: "center",
              width: "*",
              template: function (obj) {
                return '<i style="margin-left: 5px;cursor:pointer" data-action="detail">查看详情</i>';
              },
            },
            { name: "productCode",label: "项目编号",width: "*",align: "center",min_width: 150},
            { name: "projectStage", label: "项目阶段", align: "center" },
            { name: "needType", label: "工序", align: "center" },
            { name: "testPurpose", label: "试验用途", align: "center" },
            { name: "prototypeCode",label: "样件编号",align: "center",min_width: 150},
          ],
          // 底部关联table数据
          resource:{
            columns:[
              {
                name: "name", label: "试制负荷提示",align:'center', template: function (resource) {
                  return resource.text;
                }
              },
            ],
            resource_data:[
              {id: 1, text:'特殊加工',parent:null},
              {id: 2, text:'测量',parent:null},
              {id: 3, text:'拆解',parent:null},
              {id: 4, text:'改装',parent:null},
              {id: 5, text:'热试',parent:null},
              {id: 6, text:'装机',parent:null},
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
         let _list=[
              { id: 1, itemid: '001', sort: 1, productCode: 'AS01',prototypeId:"YJ000001", prototypeCode: '15S4CSGXXXXD031',projectStage:'PT01',needType:'特殊加工',testPurpose:'台架耐久试验',startDate:'2021-05-08',endDate:'2021-05-14',progress: 0,typeId:[{"resource_id":"1", value:[{time:"2021-05-14",value:'1'}]}]},
              { id: 2, itemid: '002', sort: 2, productCode: 'AS01',prototypeId:"YJ000001", prototypeCode: '15S4CSGXXXXD032',projectStage:'PT01',needType:'特殊加工', testPurpose:'台架标定试验',startDate:'2021-05-08',endDate:'2021-05-14',progress: 0,typeId:[{"resource_id":"1", value:[{time:"2021-05-14",value:'1'}]}]},
              { id: 3, itemid: '003', sort: 3, productCode: 'AS01', prototypeId:"YJ000001", prototypeCode: '15S4CSGXXXXD031',projectStage:'PT01',needType:'测量',testPurpose:'台架耐久试验',startDate:'2021-05-15',endDate:'2021-05-28',progress: 0 ,typeId:[{"resource_id":"2", value:[{time:"2021-05-21",value:'1'},{time:"2021-05-28",value:'1'}]}]},
              { id: 4, itemid: '004', sort: 4, productCode: 'AS01', prototypeId:"YJ000001",prototypeCode: '15S4CSGXXXXD032',projectStage:'PT01', needType:'测量', testPurpose:'台架标定试验',startDate:'2021-05-15',endDate:'2021-05-21',progress: 0,typeId:[{"resource_id":"2", value:[{time:"2021-05-21",value:'1'}]}]},
              { id: 5, itemid: '005', sort: 5, productCode: 'AS02', prototypeId:"YJ000002",prototypeCode: '15S4CSGXXXXD033',projectStage:'PT01', needType:'特殊加工',testPurpose:'台架耐久试验',startDate:'2021-05-15',endDate:'2021-05-21',progress: 0,typeId:[{"resource_id":"1", value:[{time:"2021-05-21",value:'1'}]}]},
              { id: 6, itemid: '006', sort: 6, productCode: 'AS03', prototypeId:"YJ000003",prototypeCode: '15S4CSGXXXXD035',projectStage:'PT01', needType:'特殊加工', testPurpose:'台架标定试验',startDate:'2021-05-15',endDate:'2021-05-21',progress: 0,typeId:[{"resource_id":"1", value:[{time:"2021-05-21",value:'1'}]}]},
              { id: 7, itemid: '007', sort: 7, productCode: 'AS01',prototypeId:"YJ000001", prototypeCode: '15S4CSGXXXXD032',projectStage:'PT01', needType:'装机', testPurpose:'台架耐久试验',startDate:'2021-05-22',endDate:'2021-05-25',progress: 0,typeId:[{"resource_id":"6", value:[{time:"2021-05-25",value:'1'}]}]},
              { id: 8, itemid: '008', sort: 8, productCode: 'AS02',prototypeId:"YJ000002", prototypeCode: '15S4CSGXXXXD033',projectStage:'PT01', needType:'测量',testPurpose:'台架标定试验',startDate:'2021-05-22',endDate:'2021-06-04',progress: 0,typeId:[{"resource_id":"2", value:[{time:"2021-05-28",value:'1'},{time:"2021-06-04",value:'1'}]}]},
              { id: 9, itemid: '009', sort: 9, productCode: 'AS03', prototypeId:"YJ000003",prototypeCode: '15S4CSGXXXXD035',projectStage:'PT01', needType:'测量',testPurpose:'台架耐久试验',startDate:'2021-05-22',endDate:'2021-06-04',progress: 0,typeId:[{"resource_id":"2", value:[{time:"2021-05-28",value:'1'},{time:"2021-06-04",value:'1'}]}]},
              { id: 10, itemid: '010', sort: 10, productCode: 'AS01',prototypeId:"YJ000001", prototypeCode: '15S4CSGXXXXD032',projectStage:'PT01',needType:'热试', testPurpose:'台架标定试验',startDate:'2021-05-26',endDate:'2021-05-26',progress: 0,typeId:[{"resource_id":"5", value:[{time:"2021-05-26",value:'1'}]}]},
              { id: 11, itemid: '011', sort: 11, productCode: 'AS01', prototypeId:"YJ000001",prototypeCode: '15S4CSGXXXXD032',projectStage:'PT01',needType:'改装',testPurpose:'台架耐久试验',startDate:'2021-05-27',endDate:'2021-06-02',progress: 0 ,typeId:[{"resource_id":"4", value:[{time:"2021-05-28",value:'1'},{time:"2021-06-02",value:'1'},{time:"2021-06-03",value:'0'},{time:"2021-06-04",value:'0'}]}]},
              { id: 12, itemid: '012', sort: 12, productCode: 'AS01',prototypeId:"YJ000001",  prototypeCode: '15S4CSGXXXXD031',projectStage:'PT01', needType:'装机', testPurpose:'台架标定试验',startDate:'2021-05-29',endDate:'2021-06-01',progress: 0,typeId:[{"resource_id":"6", value:[{time:"2021-06-01",value:'1'}]}]},
              { id: 13, itemid: '013', sort: 13, productCode: 'AS02', prototypeId:"YJ000002",prototypeCode: '15S4CSGXXXXD034',projectStage:'PT01', needType:'特殊加工',testPurpose:'台架耐久试验',startDate:'2021-05-29',endDate:'2021-06-04',progress: 0,typeId:[{"resource_id":"1", value:[{time:"2021-06-01",value:'1'}]}]},
              { id: 14, itemid: '014', sort: 14, productCode: 'AS03', prototypeId:"YJ000003",prototypeCode: '15S4CSGXXXXD036',projectStage:'PT01', needType:'特殊加工', testPurpose:'台架标定试验',startDate:'2021-05-29',endDate:'2021-06-04',progress: 0,typeId:[{"resource_id":"1", value:[{time:"2021-06-04",value:'1'}]}]},
              { id: 15, itemid: '015', sort: 15, productCode: 'AS01',prototypeId:"YJ000001",  prototypeCode: '15S4CSGXXXXD031',projectStage:'PT01',needType:'热试',testPurpose:'台架耐久试验',startDate:'2021-06-02',endDate:'2021-06-02',progress: 0,typeId:[{"resource_id":"5", value:[{time:"2021-06-02",value:'1'}]}]},
              { id: 16, itemid: '016', sort: 16, productCode: 'AS01',prototypeId:"YJ000001",  prototypeCode: '15S4CSGXXXXD031',projectStage:'PT01',needType:'改装', testPurpose:'台架标定试验',startDate:'2021-06-03',endDate:'2021-06-09',progress: 0,typeId:[{"resource_id":"4", value:[{time:"2021-06-04",value:'1'},{time:"2021-06-09",value:'1'}]}]},
              { id: 17, itemid: '017', sort: 17, productCode: 'AS01', prototypeId:"YJ000001",prototypeCode: '15S4CSGXXXXD032',projectStage:'PT01',needType:'拆解',testPurpose:'台架耐久试验',startDate:'2021-06-03',endDate:'2021-06-04',progress: 0 ,typeId:[{"resource_id":"3", value:[{time:"2021-06-04",value:'1'}]}]},
              { id: 18, itemid: '018', sort: 18, productCode: 'AS02', prototypeId:"YJ000002",prototypeCode: '15S4CSGXXXXD033',projectStage:'PT01', needType:'装机', testPurpose:'台架标定试验',startDate:'2021-06-05',endDate:'2021-06-08',progress: 0,typeId:[{"resource_id":"6", value:[{time:"2021-06-08",value:'1'}]}]},
              { id: 19, itemid: '019', sort: 19, productCode: 'AS02',prototypeId:"YJ000002", prototypeCode: '15S4CSGXXXXD034',projectStage:'PT01', needType:'测量',testPurpose:'台架耐久试验',startDate:'2021-06-05',endDate:'2021-06-21',progress: 0,typeId:[{"resource_id":"2", value:[{time:"2021-06-11",value:'1'},{time:"2021-06-18",value:'1'},{time:"2021-06-21",value:'1'}]}]},
              { id: 20, itemid: '020', sort: 20, productCode: 'AS03', prototypeId:"YJ000003",prototypeCode: '15S4CSGXXXXD035',projectStage:'PT01', needType:'装机', testPurpose:'台架标定试验',startDate:'2021-06-05',endDate:'2021-06-08',progress: 0,typeId:[{"resource_id":"6", value:[{time:"2021-06-08",value:'1'}]}]},
              { id: 21, itemid: '021', sort: 21, productCode: 'AS03',prototypeId:"YJ000003", prototypeCode: '15S4CSGXXXXD036',projectStage:'PT01', needType:'测量', testPurpose:'台架耐久试验',startDate:'2021-06-05',endDate:'2021-06-11',progress: 0,typeId:[{"resource_id":"2", value:[{time:"2021-06-11",value:'1'}]}]},
              { id: 22, itemid: '022', sort: 22, productCode: 'AS02',prototypeId:"YJ000002", prototypeCode: '15S4CSGXXXXD033',projectStage:'PT01', needType:'热试',testPurpose:'台架标定试验',startDate:'2021-06-09',endDate:'2021-06-09',progress: 0,typeId:[{"resource_id":"5", value:[{time:"2021-06-09",value:'1'}]}]},
              { id: 23, itemid: '023', sort: 23, productCode: 'AS03', prototypeId:"YJ000003",prototypeCode: '15S4CSGXXXXD035',projectStage:'PT01', needType:'热试',testPurpose:'台架耐久试验',startDate:'2021-06-09',endDate:'2021-06-09',progress: 0,typeId:[{"resource_id":"5", value:[{time:"2021-06-09",value:'1'}]}]},
              { id: 24, itemid: '024', sort: 24, productCode: 'AS01',prototypeId:"YJ000001",  prototypeCode: '15S4CSGXXXXD031',projectStage:'PT01',needType:'拆解',testPurpose:'台架标定试验',startDate:'2021-06-10',endDate:'2021-06-11',progress: 0,typeId:[{"resource_id":"3", value:[{time:"2021-06-11",value:'1'}]}]},
              { id: 25, itemid: '025', sort: 25, productCode: 'AS02',prototypeId:"YJ000002", prototypeCode: '15S4CSGXXXXD033',projectStage:'PT01',needType:'改装', testPurpose:'台架耐久试验',startDate:'2021-06-10',endDate:'2021-06-16',progress: 0,typeId:[{"resource_id":"4", value:[{time:"2021-06-11",value:'1'},{time:"2021-06-16",value:'1'}]}]},
              { id: 26, itemid: '026', sort: 26, productCode: 'AS03',prototypeId:"YJ000003", prototypeCode: '15S4CSGXXXXD035',projectStage:'PT01',needType:'改装',testPurpose:'台架标定试验',startDate:'2021-06-10',endDate:'2021-06-16',progress: 0 ,typeId:[{"resource_id":"4", value:[{time:"2021-06-11",value:'1'},{time:"2021-06-16",value:'1'}]}]},
              { id: 27, itemid: '027', sort: 27, productCode: 'AS02',prototypeId:"YJ000002", prototypeCode: '15S4CSGXXXXD034',projectStage:'PT01', needType:'装机', testPurpose:'台架耐久试验',startDate:'2021-06-12',endDate:'2021-06-15',progress: 0,typeId:[{"resource_id":"6", value:[{time:"2021-06-15",value:'1'}]}]},
              { id: 28, itemid: '028', sort: 28, productCode: 'AS03',prototypeId:"YJ000003", prototypeCode: '15S4CSGXXXXD036',projectStage:'PT01', needType:'装机',testPurpose:'台架标定试验',startDate:'2021-06-12',endDate:'2021-06-15',progress: 0,typeId:[{"resource_id":"6", value:[{time:"2021-06-15",value:'1'}]}]},
              { id: 29, itemid: '029', sort: 29, productCode: 'AS02',prototypeId:"YJ000002", prototypeCode: '15S4CSGXXXXD034',projectStage:'PT01', needType:'热试', testPurpose:'台架耐久试验',startDate:'2021-06-16',endDate:'2021-06-16',progress: 0,typeId:[{"resource_id":"5", value:[{time:"2021-06-16",value:'1'}]}]},
              { id: 30, itemid: '030', sort: 30, productCode: 'AS03',prototypeId:"YJ000003", prototypeCode: '15S4CSGXXXXD036',projectStage:'PT01', needType:'热试', testPurpose:'台架标定试验',startDate:'2021-06-16',endDate:'2021-06-26',progress: 0,typeId:[{"resource_id":"5", value:[{time:"2021-06-18",value:'1'},{time:"2021-06-25",value:'1'}]}]},
              { id: 31, itemid: '031', sort: 31, productCode: 'AS02', prototypeId:"YJ000002",prototypeCode: '15S4CSGXXXXD033',projectStage:'PT01', needType:'拆解',testPurpose:'台架耐久试验',startDate:'2021-06-17',endDate:'2021-06-18',progress: 0,typeId:[{"resource_id":"3", value:[{time:"2021-06-18",value:'1'}]}]},
              { id: 32, itemid: '032', sort: 32, productCode: 'AS03',prototypeId:"YJ000002", prototypeCode: '15S4CSGXXXXD034',projectStage:'PT01', needType:'改装',testPurpose:'台架标定试验',startDate:'2021-06-17',endDate:'2021-06-23',progress: 0,typeId:[{"resource_id":"4", value:[{time:"2021-06-18",value:'1'},{time:"2021-06-23",value:'1'}]}]},
              { id: 33, itemid: '033', sort: 33, productCode: 'AS03', prototypeId:"YJ000003",prototypeCode: '15S4CSGXXXXD035',projectStage:'PT01', needType:'拆解',testPurpose:'台架耐久试验',startDate:'2021-06-17',endDate:'2021-06-18',progress: 0,typeId:[{"resource_id":"3", value:[{time:"2021-06-18",value:'1'}]}]},
              { id: 34, itemid: '034', sort: 34, productCode: 'AS03', prototypeId:"YJ000003",prototypeCode: '15S4CSGXXXXD036',projectStage:'PT01',needType:'改装',testPurpose:'台架标定试验',startDate:'2021-06-17',endDate:'2021-06-23',progress: 0,typeId:[{"resource_id":"4", value:[{time:"2021-06-18",value:'1'},{time:"2021-06-23",value:'1'}]}]},
              { id: 35, itemid: '035', sort: 35, productCode: 'AS02', prototypeId:"YJ000002",prototypeCode: '15S4CSGXXXXD034',projectStage:'PT01',needType:'拆解', testPurpose:'台架耐久试验',startDate:'2021-06-24',endDate:'2021-06-25',progress: 0,typeId:[{"resource_id":"3", value:[{time:"2021-06-25",value:'1'}]}]},
              { id: 36, itemid: '036', sort: 36, productCode: 'AS03', prototypeId:"YJ000003",prototypeCode: '15S4CSGXXXXD036',projectStage:'PT01',needType:'拆解',testPurpose:'台架标定试验',startDate:'2021-05-15',endDate:'2021-05-28',progress: 0 ,typeId:[{"resource_id":"3", value:[{time:"2021-05-21",value:'1'},{time:"2021-05-28",value:'1'}]}]},
              { id: 37, itemid: '037', sort: 37, productCode: 'AS04', prototypeId:"YJ000001",prototypeCode: '15S4CSGXXXXD032',projectStage:'PT01', needType:'特殊加工', testPurpose:'台架耐久试验',startDate:'2021-05-15',endDate:'2021-05-21',progress: 0,typeId:[{"resource_id":"1", value:[{time:"2021-05-21",value:'1'}]}]},
              { id: 38, itemid: '038', sort: 38, productCode: 'AS04',prototypeId:"YJ000001",  prototypeCode: '15S4CSGXXXXD031',projectStage:'PT01', needType:'测量',testPurpose:'台架标定试验',startDate:'2021-05-15',endDate:'2021-05-21',progress: 0,typeId:[{"resource_id":"2", value:[{time:"2021-05-21",value:'1'}]}]},
              { id: 39, itemid: '039', sort: 39, productCode: 'AS04', prototypeId:"YJ000001",prototypeCode: '15S4CSGXXXXD032',projectStage:'PT01', needType:'测量', testPurpose:'台架耐久试验',startDate:'2021-05-15',endDate:'2021-05-21',progress: 0,typeId:[{"resource_id":"2", value:[{time:"2021-05-21",value:'1'}]}]},
              { id: 40, itemid: '040', sort: 40, productCode: 'AS05', prototypeId:"YJ000002",prototypeCode: '15S4CSGXXXXD033',projectStage:'PT01', needType:'特殊加工', testPurpose:'台架标定试验',startDate:'2021-05-22',endDate:'2021-05-25',progress: 0,typeId:[{"resource_id":"1", value:[{time:"2021-05-25",value:'1'}]}]},
              { id: 41, itemid: '041', sort: 41, productCode: 'AS06', prototypeId:"YJ000003",prototypeCode: '15S4CSGXXXXD035',projectStage:'PT01', needType:'特殊加工',testPurpose:'台架耐久试验',startDate:'2021-05-15',endDate:'2021-05-21',progress: 0,typeId:[{"resource_id":"1", value:[{time:"2021-05-21",value:'1'}]}]},
              { id: 42, itemid: '042', sort: 42, productCode: 'AS04', prototypeId:"YJ000001",prototypeCode: '15S4CSGXXXXD032',projectStage:'PT01', needType:'装机',testPurpose:'台架标定试验',startDate:'2021-05-22',endDate:'2021-05-25',progress: 0,typeId:[{"resource_id":"6", value:[{time:"2021-05-25",value:'1'}]}]},
              { id: 43, itemid: '043', sort: 43, productCode: 'AS05', prototypeId:"YJ000002",prototypeCode: '15S4CSGXXXXD033',projectStage:'PT01', needType:'测量',testPurpose:'台架耐久试验',startDate:'2021-05-22',endDate:'2021-06-04',progress: 0,typeId:[{"resource_id":"2", value:[{time:"2021-05-28",value:'1'},{time:"2021-06-04",value:'1'}]}]},
              { id: 44, itemid: '044', sort: 44, productCode: 'AS06', prototypeId:"YJ000003",prototypeCode: '15S4CSGXXXXD035',projectStage:'PT01',needType:'测量',testPurpose:'台架标定试验',startDate:'2021-05-22',endDate:'2021-06-04',progress: 0,typeId:[{"resource_id":"2", value:[{time:"2021-05-28",value:'1'},{time:"2021-06-04",value:'1'}]}]},
              { id: 45, itemid: '045', sort: 45, productCode: 'AS04', prototypeId:"YJ000001",prototypeCode: '15S4CSGXXXXD032',projectStage:'PT01',needType:'热试', testPurpose:'台架耐久试验',startDate:'2021-05-27',endDate:'2021-05-27',progress: 0,typeId:[{"resource_id":"5", value:[{time:"2021-05-27",value:'1'}]}]},
              { id: 46, itemid: '046', sort: 46, productCode: 'AS04', prototypeId:"YJ000001",prototypeCode: '15S4CSGXXXXD032',projectStage:'PT01',needType:'改装',testPurpose:'台架标定试验',startDate:'2021-05-27',endDate:'2021-06-02',progress: 0 ,typeId:[{"resource_id":"4", value:[{time:"2021-05-28",value:'1'},{time:"2021-06-02",value:'1'}]}]},
              { id: 47, itemid: '047', sort: 47, productCode: 'AS04',prototypeId:"YJ000001",  prototypeCode: '15S4CSGXXXXD031',projectStage:'PT01', needType:'装机', testPurpose:'台架耐久试验',startDate:'2021-05-29',endDate:'2021-06-01',progress: 0,typeId:[{"resource_id":"6", value:[{time:"2021-06-01",value:'1'}]}]},
              { id: 48, itemid: '048', sort: 48, productCode: 'AS05',prototypeId:"YJ000002", prototypeCode: '15S4CSGXXXXD034',projectStage:'PT01', needType:'特殊加工',testPurpose:'台架标定试验',startDate:'2021-05-29',endDate:'2021-06-04',progress: 0,typeId:[{"resource_id":"1", value:[{time:"2021-06-04",value:'1'}]}]},
              { id: 49, itemid: '049', sort: 49, productCode: 'AS06',prototypeId:"YJ000003", prototypeCode: '15S4CSGXXXXD036',projectStage:'PT01', needType:'特殊加工', testPurpose:'台架耐久试验',startDate:'2021-05-29',endDate:'2021-06-04',progress: 0,typeId:[{"resource_id":"1", value:[{time:"2021-06-04",value:'1'}]}]},
              { id: 50, itemid: '050', sort: 50, productCode: 'AS04',prototypeId:"YJ000001",  prototypeCode: '15S4CSGXXXXD031',projectStage:'PT01', needType:'热试', testPurpose:'台架标定试验',startDate:'2021-06-02',endDate:'2021-06-05',progress: 0,typeId:[{"resource_id":"5", value:[{time:"2021-06-04",value:'1'}]}]},
              { id: 51, itemid: '051', sort: 51, productCode: 'AS04',prototypeId:"YJ000001",  prototypeCode: '15S4CSGXXXXD031',projectStage:'PT01', needType:'改装',testPurpose:'台架耐久试验',startDate:'2021-06-03',endDate:'2021-06-09',progress: 0,typeId:[{"resource_id":"4", value:[{time:"2021-06-04",value:'1'},{time:"2021-06-09",value:'1'}]}]},
              { id: 52, itemid: '052', sort: 52, productCode: 'AS04', prototypeId:"YJ000001",prototypeCode: '15S4CSGXXXXD032',projectStage:'PT01', needType:'拆解',testPurpose:'台架标定试验',startDate:'2021-06-03',endDate:'2021-06-04',progress: 0,typeId:[{"resource_id":"3", value:[{time:"2021-06-04",value:'1'}]}]},
              { id: 53, itemid: '053', sort: 53, productCode: 'AS05',prototypeId:"YJ000002", prototypeCode: '15S4CSGXXXXD033',projectStage:'PT01', needType:'装机',testPurpose:'台架耐久试验',startDate:'2021-06-05',endDate:'2021-06-08',progress: 0,typeId:[{"resource_id":"6", value:[{time:"2021-06-08",value:'1'}]}]},
              { id: 54, itemid: '054', sort: 54, productCode: 'AS05',prototypeId:"YJ000002", prototypeCode: '15S4CSGXXXXD034',projectStage:'PT01',needType:'测量',testPurpose:'台架标定试验',startDate:'2021-06-05',endDate:'2021-06-11',progress: 0,typeId:[{"resource_id":"2", value:[{time:"2021-06-11",value:'1'}]}]},
              { id: 55, itemid: '055', sort: 55, productCode: 'AS06',prototypeId:"YJ000003", prototypeCode: '15S4CSGXXXXD035',projectStage:'PT01',needType:'装机', testPurpose:'台架耐久试验',startDate:'2021-06-05',endDate:'2021-06-08',progress: 0,typeId:[{"resource_id":"6", value:[{time:"2021-06-08",value:'1'}]}]},
              { id: 56, itemid: '056', sort: 56, productCode: 'AS06', prototypeId:"YJ000003",prototypeCode: '15S4CSGXXXXD036',projectStage:'PT01',needType:'测量',testPurpose:'台架标定试验',startDate:'2021-06-05',endDate:'2021-06-11',progress: 0 ,typeId:[{"resource_id":"2", value:[{time:"2021-06-11",value:'1'}]}]},
              { id: 57, itemid: '057', sort: 57, productCode: 'AS05', prototypeId:"YJ000002",prototypeCode: '15S4CSGXXXXD033',projectStage:'PT01', needType:'热试', testPurpose:'台架耐久试验',startDate:'2021-06-09',endDate:'2021-06-09',progress: 0,typeId:[{"resource_id":"5", value:[{time:"2021-06-09",value:'1'}]}]},
              { id: 58, itemid: '058', sort: 58, productCode: 'AS06',prototypeId:"YJ000003", prototypeCode: '15S4CSGXXXXD035',projectStage:'PT01', needType:'热试',testPurpose:'台架标定试验',startDate:'2021-06-09',endDate:'2021-06-09',progress: 0,typeId:[{"resource_id":"5", value:[{time:"2021-06-09",value:'1'}]}]},
              { id: 59, itemid: '059', sort: 59, productCode: 'AS04',prototypeId:"YJ000001",  prototypeCode: '15S4CSGXXXXD031',projectStage:'PT01', needType:'拆解', testPurpose:'台架耐久试验',startDate:'2021-06-10',endDate:'2021-06-11',progress: 0,typeId:[{"resource_id":"3", value:[{time:"2021-06-11",value:'1'}]}]},
              { id: 60, itemid: '060', sort: 60, productCode: 'AS05', prototypeId:"YJ000002",prototypeCode: '15S4CSGXXXXD033',projectStage:'PT01', needType:'改装', testPurpose:'台架标定试验',startDate:'2021-06-10',endDate:'2021-06-16',progress: 0,typeId:[{"resource_id":"4", value:[{time:"2021-06-11",value:'1'},{time:"2021-06-16",value:'1'}]}]},
              { id: 61, itemid: '061', sort: 61, productCode: 'AS04',prototypeId:"YJ000003", prototypeCode: '15S4CSGXXXXD035',projectStage:'PT01', needType:'改装',testPurpose:'台架耐久试验',startDate:'2021-06-10',endDate:'2021-06-16',progress: 0,typeId:[{"resource_id":"4", value:[{time:"2021-06-11",value:'1'},{time:"2021-06-16",value:'1'}]}]},
              { id: 62, itemid: '062', sort: 62, productCode: 'AS04',prototypeId:"YJ000002", prototypeCode: '15S4CSGXXXXD034',projectStage:'PT01', needType:'装机',testPurpose:'台架标定试验',startDate:'2021-06-12',endDate:'2021-06-15',progress: 0,typeId:[{"resource_id":"6", value:[{time:"2021-06-15",value:'1'}]}]},
              { id: 63, itemid: '063', sort: 63, productCode: 'AS05', prototypeId:"YJ000003",prototypeCode: '15S4CSGXXXXD036',projectStage:'PT01', needType:'装机',testPurpose:'台架耐久试验',startDate:'2021-06-12',endDate:'2021-06-15',progress: 0,typeId:[{"resource_id":"6", value:[{time:"2021-06-15",value:'1'}]}]},
              { id: 64, itemid: '064', sort: 64, productCode: 'AS05', prototypeId:"YJ000002",prototypeCode: '15S4CSGXXXXD034',projectStage:'PT01',needType:'热试',testPurpose:'台架标定试验',startDate:'2021-06-16',endDate:'2021-06-16',progress: 0,typeId:[{"resource_id":"5", value:[{time:"2021-06-16",value:'1'}]}]},
              { id: 65, itemid: '065', sort: 65, productCode: 'AS06',prototypeId:"YJ000003", prototypeCode: '15S4CSGXXXXD036',projectStage:'PT01',needType:'拆解', testPurpose:'台架耐久试验',startDate:'2021-06-16',endDate:'2021-06-16',progress: 0,typeId:[{"resource_id":"3", value:[{time:"2021-06-16",value:'1'}]}]},
              { id: 66, itemid: '066', sort: 66, productCode: 'AS06',prototypeId:"YJ000002", prototypeCode: '15S4CSGXXXXD033',projectStage:'PT01',needType:'测量',testPurpose:'台架标定试验',startDate:'2021-06-17',endDate:'2021-06-18',progress: 0 ,typeId:[{"resource_id":"2", value:[{time:"2021-06-18",value:'1'}]}]},
              { id: 67, itemid: '067', sort: 67, productCode: 'AS05',prototypeId:"YJ000002", prototypeCode: '15S4CSGXXXXD034',projectStage:'PT01', needType:'改装', testPurpose:'台架耐久试验',startDate:'2021-06-17',endDate:'2021-06-23',progress: 0,typeId:[{"resource_id":"4", value:[{time:"2021-06-18",value:'1'},{time:"2021-06-23",value:'1'}]}]},
              { id: 68, itemid: '068', sort: 68, productCode: 'AS06', prototypeId:"YJ000003",prototypeCode: '15S4CSGXXXXD035',projectStage:'PT01', needType:'拆解',testPurpose:'台架标定试验',startDate:'2021-06-17',endDate:'2021-06-18',progress: 0,typeId:[{"resource_id":"3", value:[{time:"2021-06-18",value:'1'}]}]},
              { id: 69, itemid: '069', sort: 69, productCode: 'AS04',prototypeId:"YJ000003", prototypeCode: '15S4CSGXXXXD036',projectStage:'PT01', needType:'改装', testPurpose:'台架耐久试验',startDate:'2021-06-17',endDate:'2021-06-23',progress: 0,typeId:[{"resource_id":"4", value:[{time:"2021-06-18",value:'1'},{time:"2021-06-23",value:'1'}]}]},
              { id: 70, itemid: '070', sort: 70, productCode: 'AS05',prototypeId:"YJ000002", prototypeCode: '15S4CSGXXXXD034',projectStage:'PT01', needType:'拆解', testPurpose:'台架标定试验',startDate:'2021-06-24',endDate:'2021-06-25',progress: 0,typeId:[{"resource_id":"3", value:[{time:"2021-06-25",value:'1'}]}]},
              { id: 71, itemid: '071', sort: 71, productCode: 'AS04',prototypeId:"YJ000003", prototypeCode: '15S4CSGXXXXD036',projectStage:'PT01', needType:'拆解',testPurpose:'台架耐久试验',startDate:'2021-06-24',endDate:'2021-06-25',progress: 0,typeId:[{"resource_id":"3", value:[{time:"2021-06-25",value:'1'}]}]},

          ]
          let list= this.formatGantt(_list);
          this.tasks.data =list;
        }, 2000);
       
      },
      formatGantt(list){
        let ganttList=[];
        list.forEach(ele => {
          if(ele.startDate)  ele.start_date=ele.startDate;
          if(ele.endDate)  ele.end_date = moment(ele.endDate).endOf("day").format("yyyy-MM-DD HH:mm");
          ele.text=ele.needType;
          ganttList.push(ele);
        });
        return ganttList;
      },
    }
  }
</script>
<style lang="less">
.list-wrapper{
  height:600px
}
</style>
