<template>
  <div ref="gantt"></div>
</template>

<script>
import 'dhtmlx-gantt'

export default {
  name: 'gantt',
  props: {
    tasks: {
      type: Object,
      default () {
        return {data: [], links: []}
      }
    }
  },

  methods: {
    $_initGanttEvents: function () {
      if(gantt.$_eventsInitialized)
        return;
      gantt.attachEvent('onTaskSelected', (id) => {
        let task = gantt.getTask(id)
        this.$emit('task-selected', task)
      })

      gantt.attachEvent('onAfterTaskAdd', (id, task) => {
        this.$emit('task-updated', id, 'inserted', task)
        task.progress = task.progress || 0
        if(gantt.getSelectedId() == id) {
          this.$emit('task-selected', task)
        }
      })

      gantt.attachEvent('onAfterTaskUpdate', (id, task) => {
        this.$emit('task-updated', id, 'updated', task)
      })

      gantt.attachEvent('onAfterTaskDelete', (id) => {
        this.$emit('task-updated', id, 'deleted')
        if(!gantt.getSelectedId()) {
          this.$emit('task-selected', null)
        }
      })

      gantt.attachEvent('onAfterLinkAdd', (id, link) => {
        this.$emit('link-updated', id, 'inserted', link)
      })

      gantt.attachEvent('onAfterLinkUpdate', (id, link) => {
        this.$emit('link-updated', id, 'updated', link)
      })

      gantt.attachEvent('onAfterLinkDelete', (id, link) => {
        this.$emit('link-updated', id, 'deleted')
      })
      gantt.$_eventsInitialized = true;
    }
  },
    
  mounted () {
    this.$_initGanttEvents();


    gantt.config.columns = [
        {name: "text", tree: true, width: 200, resize: true},
        {name: "start_date", align: "center", width: 80, resize: true},
        {name: "owner", align: "center", width: 75, label: "Owner", template: function (task) {
            if(task.type == gantt.config.types.project){
                return "";
            }

            var store = gantt.getDatastore("resource");
            var owner = store.getItem(task.owner_id);
            if (owner) {
                return owner.text;
            } else {
                return "Unassigned";
            }}, resize: true
        },
        {name: "duration", width: 60, align: "center"},
        {name: "add", width: 44}
    ];

    var resourceConfig = {
        columns: [
            {
                name: "name", label: "Name", tree:true, template: function (resource) {
                    return resource.text;
                }
            },
            {
                name: "workload", label: "Workload", template: function (resource) {
                    var tasks;
                    var store = gantt.getDatastore(gantt.config.resource_store),
                        field = gantt.config.resource_property;

                    if(store.hasChild(resource.id)){
                        tasks = gantt.getTaskBy(field, store.getChildren(resource.id));
                    }else{
                        tasks = gantt.getTaskBy(field, resource.id);
                    }

                    var totalDuration = 0;
                    for (var i = 0; i < tasks.length; i++) {
                        totalDuration += tasks[i].duration;
                    }

                    return (totalDuration || 0) * 8 + "h";
                }
            }
        ]
    };

    gantt.templates.resource_cell_class = function(start_date, end_date, resource, tasks){
        var css = [];
        css.push("resource_marker");
        if (tasks.length <= 1) {
            css.push("workday_ok");
        } else {
            css.push("workday_over");
        }
        return css.join(" ");
    };

    gantt.templates.resource_cell_value = function(start_date, end_date, resource, tasks){
        return "<div>" + tasks.length * 8 + "</div>";
    };

    gantt.locale.labels.section_owner = "Owner";
    gantt.config.lightbox.sections = [
        {name: "description", height: 38, map_to: "text", type: "textarea", focus: true},
        {name: "owner", height: 22, map_to: "owner_id", type: "select", options: gantt.serverList("people")},
        {name: "time", type: "duration", map_to: "auto"}
    ];

    gantt.config.resource_store = "resource";
    gantt.config.resource_property = "owner_id";
    gantt.config.order_branch = true;
    gantt.config.open_tree_initially = true;
    gantt.config.layout = {
        css: "gantt_container",
        rows: [
            {
                cols: [
                    {view: "grid", group:"grids", scrollY: "scrollVer"},
                    {resizer: true, width: 1},
                    {view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer"},
                    {view: "scrollbar", id: "scrollVer", group:"vertical"}
                ],
                gravity:2
            },
            {resizer: true, width: 1},
            {
                config: resourceConfig,
                cols: [
                    {view: "resourceGrid", group:"grids", width: 435, scrollY: "resourceVScroll" },
                    {resizer: true, width: 1},
                    {view: "resourceTimeline", scrollX: "scrollHor", scrollY: "resourceVScroll"},
                    {view: "scrollbar", id: "resourceVScroll", group:"vertical"}
                ],
                gravity:1
            },
            {view: "scrollbar", id: "scrollHor"}
        ]
    };

    var resourcesStore = gantt.createDatastore({
        name: gantt.config.resource_store,
        type: "treeDatastore",
        initItem: function (item) {
            item.parent = item.parent || gantt.config.root_id;
            item[gantt.config.resource_property] = item.parent;
            item.open = true;
            return item;
        }
    });


    resourcesStore.attachEvent("onParse", function(){
        var people = [];
        resourcesStore.eachItem(function(res){
            if(!resourcesStore.hasChild(res.id)){
                var copy = gantt.copy(res);
                copy.key = res.id;
                copy.label = res.text;
                people.push(copy);
            }
        });
        gantt.updateCollection("people", people);
    });

    resourcesStore.parse([
        {id: 1, text: "QA", parent:null},
        {id: 2, text: "Development", parent:null},
        {id: 3, text: "Sales", parent:null},
        {id: 4, text: "Other", parent:null},
        {id: 5, text: "Unassigned", parent:4},
        {id: 6, text: "John", parent:1},
        {id: 7, text: "Mike", parent:2},
        {id: 8, text: "Anna", parent:2},
        {id: 9, text: "Bill", parent:3},
        {id: 10, text: "Floe", parent:3}
    ]);





    gantt.init(this.$refs.gantt)
    gantt.parse(this.$props.tasks)
  }
}
</script>

<style>
  @import "~dhtmlx-gantt/codebase/dhtmlxgantt.css";
</style>