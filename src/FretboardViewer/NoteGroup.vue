<template>
    <div>
        <label>Note groups: </label>
        <ul>
            <li v-for="(noteGroup, index) in groups" :key="'note-group-' + index" class="note-group">
                <input type="checkbox" v-model="noteGroup.enabled" />
                {{ noteGroup.description }}
                <span class="color-label" :style="'background-color:' + noteGroup.color"></span>
                <button class="btn-action" @click="onRemove(index)">Remove</button>
                <button class="btn-action" @click="onEdit(index)">Edit</button>
            </li>
        </ul>
        <button @click="onAdd" v-if="!displayAdd">Add group</button>
        <fieldset v-if="displayAdd">
            <legend>{{ groupItemIndex != null ? 'Edit group:' : 'Add group:' }}</legend>
            <label>
                Description:
            </label>
            <input type="text" v-model="groupItemDescription" required />
            <label>Color:</label>
            <ul class="group-colors">
                <li v-for="color in colors" :key="'color-' + color">
                    <label>
                        <input type="radio" name="group-color" :value="color" v-model="groupItemColor">
                        <span class="color-label" :style="'background-color:' + color"></span>
                        {{ color }}
                    </label>
                </li>
            </ul>
            <label>Notes:</label>
            <note-selection-list :noteTexts="['C', 'D', 'E', 'F', 'G', 'A', 'B']"
                :initialSelectedNotesIdx="groupItemSelectedNotesIdx" @change="onChangeSelectedNotes" />
            <br />
            <button @click="onSaveGroup">Save</button>
            <button class="btn-cancel" @click="onCancelAdd">Cancel</button>
        </fieldset>
    </div>
</template>

<script>
import NoteSelectionList from "./NoteSelectionList.vue"
export default {
    components: { NoteSelectionList },
    data() {
        return {
            groups: [],
            displayAdd: false,
            colors: ["red", "orange", "yellow", "green", "blue", "purple", "magenta"],
            groupItemIndex: null,
            groupItemDescription: "",
            groupItemColor: "",
            groupItemSelectedNotesIdx: []
        }
    },
    methods: {
        onSaveGroup() {
            //Validate
            if (!this.groupItemDescription || !this.groupItemColor || this.groupItemSelectedNotesIdx.length === 0) {
                return;
            }

            if (this.groupItemIndex != null) {
                //Edit
                const groupItem = this.groups[this.groupItemIndex];
                groupItem.description = this.groupItemDescription;
                groupItem.color = this.groupItemColor;
                groupItem.selectedNotesIdx = this.groupItemSelectedNotesIdx;
                this.groups[this.groupItemIndex] = groupItem;
            } else {
                //Add
                const groupItem = {
                    enabled: true,
                    description: this.groupItemDescription,
                    color: this.groupItemColor,
                    selectedNotesIdx: this.groupItemSelectedNotesIdx
                }
                this.groups.push(groupItem);
            }

            this.displayAdd = false;
            this.clearForm();
        },
        onAdd() {
            this.displayAdd = true;
        },
        onCancelAdd() {
            this.displayAdd = false;
            this.clearForm();
        },
        onChangeSelectedNotes(_, selectedNotesIdx) {
            this.groupItemSelectedNotesIdx = selectedNotesIdx;
        },
        onRemove(index) {
            this.groups.splice(index, 1);
        },
        onEdit(index) {
            const selectedGroup = this.groups[index];
            this.groupItemIndex = index;
            this.groupItemDescription = selectedGroup.description;
            this.groupItemColor = selectedGroup.color;
            this.groupItemSelectedNotesIdx = selectedGroup.selectedNotesIdx;
            this.displayAdd = true;
        },
        clearForm() {
            this.groupItemIndex = null;
            this.groupItemDescription = "";
            this.groupItemColor = "";
            this.groupItemSelectedNotesIdx = [];
        }
    }
}
</script>

<style>
.btn-action {
    margin-left: 6px;
    float: right;
}

.color-label {
    margin-left: 6px;
    border-radius: 50%;
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 1px solid gray;
}

.note-group {
    display: block;
    clear: both;
    margin-top: 6px;
}

.group-colors {
    margin-top: 0;
}

.group-colors li {
    margin-left: 0;
}

.group-colors label {
    margin-top: 0;
    font-weight: normal;
}

.btn-cancel {
    float: right;
    background: transparent;
    border: 0;
}
</style>