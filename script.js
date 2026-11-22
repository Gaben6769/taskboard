"use strict";

const STORAGE_KEY = "taskboard.tasks";
const PRIORITY_LABELS = { low: "Низький", medium: "Середній", high: "Високий" };

const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#title");
const priorityInput = document.querySelector("#priority");
const deadlineInput = document.querySelector("#deadline");
const descriptionInput = document.querySelector("#description");
const message = document.querySelector("#form-message");
const list = document.querySelector("#task-list");
const counter = document.querySelector("#counter");

let tasks = loadTasks();

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Задачі залишаються доступними до закриття або оновлення сторінки.
  }
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.classList.add("task", `priority-${task.priority}`);
  item.classList.toggle("done", task.done);
  item.dataset.id = String(task.id);

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "toggle";
  checkbox.checked = task.done;
  checkbox.setAttribute("aria-label", `Виконано: ${task.title}`);

  const body = document.createElement("div");
  body.className = "task-body";
  const title = document.createElement("p");
  title.className = "task-title";
  title.textContent = task.title;
  const metadata = document.createElement("p");
  metadata.className = "task-meta";
  const details = [`Пріоритет: ${PRIORITY_LABELS[task.priority]}`];
  if (task.deadline) {
    details.push(`Термін: ${task.deadline}`);
  }
  metadata.textContent = details.join(" · ");
  body.append(title, metadata);

  if (task.description) {
    const description = document.createElement("p");
    description.className = "task-desc";
    description.textContent = task.description;
    body.append(description);
  }

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "delete";
  remove.textContent = "×";
  remove.setAttribute("aria-label", `Видалити задачу: ${task.title}`);
  item.append(checkbox, body, remove);
  return item;
}

function render() {
  list.replaceChildren(...tasks.map(createTaskElement));
  const completed = tasks.filter((task) => task.done).length;
  counter.textContent = tasks.length
    ? `Усього: ${tasks.length}, виконано: ${completed}`
    : "Задач немає";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) {
    message.textContent = "Введи назву задачі.";
    titleInput.focus();
    return;
  }

  tasks.push({
    id: tasks.reduce((maxId, task) => Math.max(maxId, task.id), 0) + 1,
    title,
    priority: priorityInput.value,
    deadline: deadlineInput.value,
    description: descriptionInput.value.trim(),
    done: false,
  });
  form.reset();
  message.textContent = "";
  saveTasks();
  render();
  titleInput.focus();
});

titleInput.addEventListener("input", () => {
  message.textContent = "";
});

list.addEventListener("click", (event) => {
  const control = event.target.closest(".toggle, .delete");
  if (!control) {
    return;
  }

  const id = Number(control.closest(".task").dataset.id);
  const index = tasks.findIndex((task) => task.id === id);
  const isToggle = control.matches(".toggle");
  if (isToggle) {
    tasks[index].done = control.checked;
  } else {
    tasks.splice(index, 1);
  }

  saveTasks();
  render();
  const nextItem = list.children[Math.min(index, tasks.length - 1)];
  const nextControl = nextItem?.querySelector(isToggle ? ".toggle" : ".delete");
  (nextControl ?? titleInput).focus();
});

render();
