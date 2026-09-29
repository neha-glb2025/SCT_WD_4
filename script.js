
const taskInput =
    document.getElementById("taskInput");

const taskDate =
    document.getElementById("taskDate");

const taskTime =
    document.getElementById("taskTime");

const taskPriority =
    document.getElementById("taskPriority");

const taskCategory =
    document.getElementById("taskCategory");

const addTaskBtn =
    document.getElementById("addTaskBtn");

const taskList =
    document.getElementById("taskList");

const emptyMessage =
    document.getElementById("emptyMessage");

const searchInput =
    document.getElementById("searchInput");

const themeBtn =
    document.getElementById("themeBtn");




const totalCount =
    document.getElementById("totalCount");

const pendingCount =
    document.getElementById("pendingCount");

const completedCount =
    document.getElementById("completedCount");

const overdueCount =
    document.getElementById("overdueCount");


const filterButtons =
    document.querySelectorAll(".filter-btn");


const editModal =
    document.getElementById("editModal");

const editTaskInput =
    document.getElementById("editTaskInput");

const editTaskDate =
    document.getElementById("editTaskDate");

const editTaskTime =
    document.getElementById("editTaskTime");

const editTaskPriority =
    document.getElementById("editTaskPriority");

const editTaskCategory =
    document.getElementById("editTaskCategory");

const closeModal =
    document.getElementById("closeModal");

const cancelEdit =
    document.getElementById("cancelEdit");

const saveEdit =
    document.getElementById("saveEdit");

let tasks =
    JSON.parse(
        localStorage.getItem("taskFlowTasks")
    ) || [];


let currentFilter = "all";

let editingTaskId = null;


loadTheme();

displayTasks();

addTaskBtn.addEventListener(
    "click",
    addTask
);


taskInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            addTask();

        }

    }
);


function addTask() {

    const name =
        taskInput.value.trim();


    if (name === "") {

        alert("Please enter a task.");

        taskInput.focus();

        return;

    }


    const task = {

        id: Date.now(),

        name: name,

        date: taskDate.value,

        time: taskTime.value,

        priority: taskPriority.value,

        category: taskCategory.value,

        completed: false

    };


    tasks.push(task);


    saveTasks();


    displayTasks();


    taskInput.value = "";

    taskDate.value = "";

    taskTime.value = "";

    taskPriority.value = "medium";

    taskCategory.value = "Study";


    taskInput.focus();

}

function displayTasks() {

    taskList.innerHTML = "";


    const searchText =
        searchInput.value
            .trim()
            .toLowerCase();


    let filteredTasks =
        tasks.filter(function(task) {

            const matchesSearch =
                task.name
                    .toLowerCase()
                    .includes(searchText);


            let matchesFilter = true;


            if (currentFilter === "active") {

                matchesFilter =
                    !task.completed;

            }


            if (currentFilter === "completed") {

                matchesFilter =
                    task.completed;

            }


            return (
                matchesSearch &&
                matchesFilter
            );

        });


    filteredTasks.sort(
        function(a, b) {

            if (
                a.completed !==
                b.completed
            ) {

                return a.completed ? 1 : -1;

            }


            return b.id - a.id;

        }
    );


    if (filteredTasks.length === 0) {

        emptyMessage.style.display =
            "block";

    } else {

        emptyMessage.style.display =
            "none";

    }


    filteredTasks.forEach(
        function(task) {

            createTaskElement(task);

        }
    );


    updateStatistics();

}

function createTaskElement(task) {

    const li =
        document.createElement("li");


    li.className = "task-item";


    if (task.completed) {

        li.classList.add("completed");

    }


    const info =
        document.createElement("div");

    info.className =
        "task-info";

    const name =
        document.createElement("div");

    name.className =
        "task-name";

    name.textContent =
        task.name;

    const meta =
        document.createElement("div");

    meta.className =
        "task-meta";

    const category =
        document.createElement("span");

    category.className =
        "badge category-badge";

    category.textContent =
        task.category;


    const priority =
        document.createElement("span");

    priority.className =
        "badge priority-" +
        task.priority;


    priority.textContent =
        capitalize(task.priority);


    const dateInfo =
        document.createElement("span");

    dateInfo.className =
        "date-info";


    dateInfo.textContent =
        getDateTimeText(task);


    if (
        isOverdue(task) &&
        !task.completed
    ) {

        dateInfo.classList.add(
            "overdue"
        );

    }


    meta.appendChild(category);

    meta.appendChild(priority);

    meta.appendChild(dateInfo);


    info.appendChild(name);

    info.appendChild(meta);

    const buttons =
        document.createElement("div");

    buttons.className =
        "task-buttons";


    const doneBtn =
        document.createElement("button");

    doneBtn.className =
        "done-btn";

    doneBtn.textContent =
        task.completed
            ? "Undo"
            : "Done";


    doneBtn.addEventListener(
        "click",
        function() {

            toggleTask(task.id);

        }
    );

    const editBtn =
        document.createElement("button");

    editBtn.className =
        "edit-btn";

    editBtn.textContent =
        "Edit";


    editBtn.addEventListener(
        "click",
        function() {

            openEditModal(task.id);

        }
    );

    const deleteBtn =
        document.createElement("button");

    deleteBtn.className =
        "delete-btn";

    deleteBtn.textContent =
        "Delete";


    deleteBtn.addEventListener(
        "click",
        function() {

            deleteTask(task.id);

        }
    );


    buttons.appendChild(doneBtn);

    buttons.appendChild(editBtn);

    buttons.appendChild(deleteBtn);


    li.appendChild(info);

    li.appendChild(buttons);


    taskList.appendChild(li);

}

function getDateTimeText(task) {

    if (
        !task.date &&
        !task.time
    ) {

        return "No date/time";

    }


    const parts = [];


    if (task.date) {

        const date =
            new Date(
                task.date + "T00:00:00"
            );


        parts.push(
            date.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            )
        );

    }


    if (task.time) {

        const time =
            new Date(
                "1970-01-01T" +
                task.time
            );


        parts.push(
            time.toLocaleTimeString(
                "en-IN",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )
        );

    }


    return "📅 " + parts.join(" • ");

}

function isOverdue(task) {

    if (!task.date) {

        return false;

    }


    let dateString =
        task.date;


    if (task.time) {

        dateString +=
            "T" + task.time;

    } else {

        dateString +=
            "T23:59:59";

    }


    const taskDateTime =
        new Date(dateString);


    return taskDateTime <
        new Date();

}

function toggleTask(id) {

    tasks =
        tasks.map(
            function(task) {

                if (task.id === id) {

                    task.completed =
                        !task.completed;

                }


                return task;

            }
        );


    saveTasks();

    displayTasks();

}

function deleteTask(id) {

    const task =
        tasks.find(
            function(task) {

                return task.id === id;

            }
        );


    if (!task) {

        return;

    }


    const confirmed =
        confirm(
            "Delete this task?"
        );


    if (!confirmed) {

        return;

    }


    tasks =
        tasks.filter(
            function(task) {

                return task.id !== id;

            }
        );


    saveTasks();

    displayTasks();

}

function openEditModal(id) {

    const task =
        tasks.find(
            function(task) {

                return task.id === id;

            }
        );


    if (!task) {

        return;

    }


    editingTaskId = id;


    editTaskInput.value =
        task.name;

    editTaskDate.value =
        task.date;

    editTaskTime.value =
        task.time;

    editTaskPriority.value =
        task.priority;

    editTaskCategory.value =
        task.category;


    editModal.classList.add(
        "show"
    );


    editTaskInput.focus();

}

saveEdit.addEventListener(
    "click",
    function() {

        if (
            editingTaskId === null
        ) {

            return;

        }


        const newName =
            editTaskInput.value.trim();


        if (newName === "") {

            alert(
                "Task cannot be empty."
            );

            editTaskInput.focus();

            return;

        }


        tasks =
            tasks.map(
                function(task) {

                    if (
                        task.id ===
                        editingTaskId
                    ) {

                        task.name =
                            newName;

                        task.date =
                            editTaskDate.value;

                        task.time =
                            editTaskTime.value;

                        task.priority =
                            editTaskPriority.value;

                        task.category =
                            editTaskCategory.value;

                    }


                    return task;

                }
            );


        saveTasks();

        displayTasks();

        closeEditModal();

    }
);

function closeEditModal() {

    editModal.classList.remove(
        "show"
    );

    editingTaskId = null;

}


closeModal.addEventListener(
    "click",
    closeEditModal
);


cancelEdit.addEventListener(
    "click",
    closeEditModal
);


editModal.addEventListener(
    "click",
    function(event) {

        if (
            event.target === editModal
        ) {

            closeEditModal();

        }

    }
);

searchInput.addEventListener(
    "input",
    function() {

        displayTasks();

    }
);

filterButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                filterButtons.forEach(
                    function(btn) {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                currentFilter =
                    button.dataset.filter;


                displayTasks();

            }
        );

    }
);

function updateStatistics() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            function(task) {

                return task.completed;

            }
        ).length;


    const pending =
        total - completed;


    const overdue =
        tasks.filter(
            function(task) {

                return (
                    !task.completed &&
                    isOverdue(task)
                );

            }
        ).length;


    totalCount.textContent =
        total;

    pendingCount.textContent =
        pending;

    completedCount.textContent =
        completed;

    overdueCount.textContent =
        overdue;

}

function saveTasks() {

    localStorage.setItem(
        "taskFlowTasks",
        JSON.stringify(tasks)
    );

}

themeBtn.addEventListener(
    "click",
    toggleTheme
);


function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );


    const darkMode =
        document.body.classList.contains(
            "dark"
        );


    localStorage.setItem(
        "taskFlowDarkMode",
        darkMode
    );


    themeBtn.textContent =
        darkMode
            ? "☀️"
            : "🌙";

}


function loadTheme() {

    const darkMode =
        localStorage.getItem(
            "taskFlowDarkMode"
        );


    if (darkMode === "true") {

        document.body.classList.add(
            "dark"
        );

        themeBtn.textContent =
            "☀️";

    }

}

function capitalize(text) {

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}