export const ganttStyle=`.projectRed {
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
}`