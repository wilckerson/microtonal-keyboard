<template>
    <div>

        <ul>
            <li v-for="(noteGroup, index) in groups" :key="'note-group-' + index" class="note-group">
                <input type="checkbox" v-model="noteGroup.enabled" @change="onChangeEnabled" />
                {{ noteGroup.description }}
                <span class="color-label" :style="'background-color:' + noteGroup.color"></span>
                <button v-if="!showForm" class="btn-action" @click="onRemove(index)">Remove</button>
                <button v-if="!showForm" class="btn-action" @click="onEdit(index)">Edit</button>
            </li>
        </ul>
        <button @click="onAdd" v-if="!showForm">Add group</button>
        <fieldset v-if="showForm" class="note-group-form">
            <legend>{{ groupItemIndex != null ? 'Edit group:' : 'Add group:' }}</legend>
            <label>
                Description:
            </label>
            <input type="text" v-model="groupItemDescription" required />
            <label>Color:</label>
            <div>
                <select v-model="groupItemColor">
                    <option v-for="color in colors" :key="'color-' + color"
                        :style="'color: white; background-color: ' + color">{{ color }}</option>
                </select>
                <span class="color-label" :style="'background-color:' + groupItemColor"></span>
            </div>
            <label>Notes:</label>
            <note-selection-list :noteTexts="noteTexts" :noteNames="noteNames"
                :initialSelectedNotesIdx="groupItemSelectedNotesIdx" @change="onChangeSelectedNotes"
                :useScaleOptions="true" :selectedTemplate="selectedTemplate" />
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
    props: {
        noteTexts: {
            type: Array,
            required: true
        },
        noteNames: {
            type: Array,
            required: true
        },
        selectedTemplate: String,
    },
    data() {
        return {
            groups: [],
            showForm: false,
            colors: [
                "Red",
                "DarkOrange",
                "Orange",
                "Yellow",
                "Lime",
                "YellowGreen",
                "Green",
                "ForestGreen",
                "SeaGreen",
                "MediumTurquoise",
                "Turquoise",
                "SkyBlue",
                "CornflowerBlue",
                "DodgerBlue",
                "RoyalBlue",
                "MediumPurple",
                "BlueViolet",
                "Indigo",
                "Violet"
            ],
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
                alert("Please fill all fields");
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

            this.showForm = false;
            this.clearForm();
            this.$emit('change', this.groups);
        },
        onAdd() {
            this.showForm = true;
            this.groupItemDescription = 'Group ' + (this.groups.length + 1);
            this.groupItemColor = this.colors[this.groups.length % this.colors.length];
        },
        onCancelAdd() {
            this.showForm = false;
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
            this.showForm = true;
        },
        clearForm() {
            this.groupItemIndex = null;
            this.groupItemDescription = "";
            this.groupItemColor = "";
            this.groupItemSelectedNotesIdx = [];
        },
        onChangeEnabled() {
            this.$emit('change', this.groups);
        }
    }
}
</script>

<style scoped>
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
    width: 200px;
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