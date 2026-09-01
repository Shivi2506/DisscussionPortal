let subject = document.getElementById("subject");
let question = document.getElementById("question");
let box = document.getElementById("boxEmpty");
let submit = document.getElementById("submit");
let questionForm =document.getElementById("questionForm");
let details =document.getElementById("details");
let detailSubject =document.getElementById("detailSubject");
let detailQuestion =document.getElementById("detailQuestion");
let responseName =document.getElementById("responseName");
let responseComment =document.getElementById("responseComment");
let responses =document.getElementById("responses");
let search =document.getElementById("search");
let leftPanel =document.getElementById("leftPanel");
let rightPanel =document.getElementById("rightPanel");
let welcome =document.getElementById("welcome");
let instruction =document.getElementById("instruction");
let tasks = [];
let selectedId = null;
function localstore(obj) {
localStorage.setItem("tasks",JSON.stringify(obj));
}

function getstore() {
    return JSON.parse(localStorage.getItem("tasks")) || [];
}

function timeAgo(time) {
    let seconds = Math.floor((Date.now() - time) / 1000);
    if (seconds < 10) {
       return "just now";
    }
    if (seconds < 60) {
        return seconds + (seconds == 1 ? " sec ago" : " secs ago");
    }
    let minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return minutes + (minutes == 1 ? " min ago" : " mins ago");
    }
    let hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return hours + (hours == 1 ? " hour ago" : " hours ago");
    }
    let days = Math.floor(hours / 24);
    return days + (days == 1 ? " day ago" : " days ago");
}

function highlight(text, value) {
    if (value == "") {
        return text;
    }
    let lowerText = text.toLowerCase();
    let lowerValue = value.toLowerCase();
    let index = lowerText.indexOf(lowerValue);
    if (index == -1) {
        return text;
    }
    let before = text.substring(0, index);
    let match = text.substring(index, index + value.length);
    let after = text.substring(index + value.length);
    return before +`<span class="bg-yellow-300 text-black">${match}</span>` +after;
}

function display() {
    box.innerHTML = "";
    tasks = getstore();
    for (let i = 0; i < tasks.length; i++) {
 addQue(tasks[i].subject,tasks[i].question,false,tasks[i].id);
    }
}

function addForm() {
    questionForm.style.display = "block";
    welcome.style.display = "block";
    instruction.style.display = "block";
    details.classList.add("hidden");
    subject.value = "";
    question.value = "";
    submit.value = "Submit";
    selectedId = null;
}

setInterval(function () {
    let timeBoxes = document.querySelectorAll(".time");
    timeBoxes.forEach(function (timeBox) {
        let questionBox = timeBox.closest("[data-id]");
        let id = questionBox.dataset.id;
        let task = tasks.find(obj => obj.id == id);
        if (task) {
            timeBox.innerText = timeAgo(task.createdAt);
        }
    });
}, 1000);

function addQue(sub,que,save = true,id) {
    if (sub == "" || que == "") {
        return;
    }
    let i = id || Date.now();
    if (save) {
        let obj = {id: i,subject: sub,question: que,responses: [],favorite: false,createdAt: Date.now()};
        tasks.push(obj);
        localstore(tasks);
    }
       let task = tasks.find(obj => obj.id == i);
    let output =document.createElement("div");
    output.className ="bg-blue-300 p-2 m-3";
    output.dataset.id = i;
    output.innerHTML = `
    <p class="subject-text font-bold text-2xl text-gray-700 p-2">Subject: ${sub}</p>
    <hr>
    <p class="question-text text-xl text-white p-2">Question: ${que}</p>
    <p class="time text-sm text-gray-600">${task.createdAt ? timeAgo(task.createdAt) : "just now"}</p>
    <button class="star-btn p-1" data-id="${i}"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles-icon lucide-sparkles"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg></button>
`;
    if (task &&task.favorite == true) {output.querySelector(".star-btn").classList.add("bg-yellow-300");}
    box.appendChild(output);
}

function submitQuestion() {
    let sub =subject.value.trim();
    let que =question.value.trim();
    if (sub == "" ||que == "") {
alert("Please enter Subject and Question");
        return;
    }
    addQue(sub,que,true);
    subject.value = "";
    question.value = "";
}

function showQuestion(id) {
    tasks = getstore();
    let task =tasks.find(obj => obj.id == id);
    if (!task) {
        return;
    }
    selectedId = id;
    questionForm.style.display = "none";
    welcome.style.display = "none";
    instruction.style.display = "none";
    details.classList.remove("hidden");
    detailSubject.innerText ="Subject: " + task.subject;
    detailQuestion.innerText ="Question: " + task.question;
    displayResponses(task);
}

function addResponse() {
    if (selectedId == null) {
        return;
    }
    let name =responseName.value.trim();
    let comment =responseComment.value.trim();
    if (name == "" ||comment == "") {
 alert("Please enter Name and Comment");
        return;
    }
    tasks = getstore();
    let task = tasks.find(obj => obj.id == selectedId);
    if (!task) {
        return;
    }
    if (!task.responses) {
        task.responses = [];
    }
    let response = {id: Date.now(),name: name,comment: comment,likes: 0,dislikes: 0};
    task.responses.push(response);
    localstore(tasks);
    responseName.value = "";
    responseComment.value = "";
    displayResponses(task);
}

function displayResponses(task) {
    responses.innerHTML = "";
    if (!task.responses || task.responses.length == 0) {
        responses.innerHTML = `<p class="text-gray-500 m-2">No responses yet.</p>`;
        return;
    }
    task.responses.sort(function (a, b) {
        return b.likes - a.likes;
    });
    for (let i = 0; i < task.responses.length; i++) {
        let res = task.responses[i];
        let responseBox = document.createElement("div");
        responseBox.className = "bg-gray-200 p-3 m-2 rounded";
        let name = document.createElement("p");
        name.className = "font-bold text-xl";
        name.textContent = res.name;
        let comment = document.createElement("p");
        comment.className = "text-lg";
        comment.textContent = res.comment;
        let buttons = document.createElement("div");
        buttons.className = "mt-2";
        let likeButton = document.createElement("button");
        likeButton.className = "like-btn bg-green-400 text-white p-1 rounded";
        likeButton.dataset.id = res.id;
        likeButton.textContent = `Like (${res.likes})`;
        let dislikeButton = document.createElement("button");
        dislikeButton.className ="dislike-btn bg-red-400 text-white p-1 rounded ml-2";
        dislikeButton.dataset.id = res.id;
        dislikeButton.textContent = `Dislike (${res.dislikes})`;
        buttons.appendChild(likeButton);
        buttons.appendChild(dislikeButton);
        responseBox.appendChild(name);
        responseBox.appendChild(comment);
        responseBox.appendChild(buttons);
        responses.appendChild(responseBox);
    }
}

function likeResponse(responseId) {
    tasks = getstore();
    let task = tasks.find(obj => obj.id == selectedId);
    if (!task) {
        return;
    }
    let response =task.responses.find(res => res.id == responseId);
    if (!response) {
        return;
    }
    response.likes =response.likes + 1;
    localstore(tasks);
    displayResponses(task);
}

function dislikeResponse(responseId) {
    tasks = getstore();
    let task =tasks.find(obj => obj.id == selectedId);
    if (!task) {
        return;
    }
    let response =task.responses.find(res => res.id == responseId);
    if (!response) {
        return;
    }
    response.dislikes =response.dislikes + 1;
    localstore(tasks);
    displayResponses(task);
}

function resolveQuestion() {
    if (selectedId == null) {
        return;
    }
    tasks = getstore();
    tasks =tasks.filter(obj => obj.id != selectedId);
    localstore(tasks);
    selectedId = null;
    details.classList.add("hidden");
    questionForm.style.display = "block";
    welcome.style.display = "block";
    instruction.style.display = "block";
    subject.value = "";
    question.value = "";
    display();
}


function searchQuestion() {
    let value = search.value.trim().toLowerCase();
    box.innerHTML = "";
    tasks = getstore();
    let found = false;
    for (let i = 0; i < tasks.length; i++) {
        let task = tasks[i];
        let sub = task.subject;
        let que = task.question;
        if (sub.toLowerCase().includes(value) ||que.toLowerCase().includes(value)) {
            found = true;
            addQue(sub, que, false, task.id);
            let lastBox = box.lastElementChild;
            lastBox.querySelector(".subject-text").innerHTML ="Subject: " + highlight(sub, value);
            lastBox.querySelector(".question-text").innerHTML ="Question: " + highlight(que, value);
        }
    }
    if (!found && value != "") {
        let noQuestion = document.createElement("p");
        noQuestion.className = "no-question text-gray-500 p-3";
        noQuestion.innerText = "No questions found";
        box.appendChild(noQuestion);
    }
}

function changeColor(star, id) {
    tasks = getstore();
    let task =tasks.find(obj => obj.id == id);
    if (!task) {
        return;
    }
    task.favorite =!task.favorite;
    localstore(tasks);
    star.classList.toggle("bg-yellow-300");
}

leftPanel.addEventListener("click",function (event) {
        if (event.target.closest("#newQuestion")) {
            addForm();
           return;
        }
        let star =event.target.closest(".star-btn");
        if (star) {
            let id =star.dataset.id;
            changeColor(star, id);
            return;
        }
        let questionBox = event.target.closest("[data-id]");
        if (questionBox) {
            let id =questionBox.dataset.id;
            showQuestion(id);
           return;
        }
    }
);

rightPanel.addEventListener("click",function (event) {
        if (event.target.closest("#submit") ) {
            submitQuestion();
            return;
        }
        if (event.target.closest("#submitResponse") ) {
            addResponse()
            return;
        }
        let likeButton =event.target.closest(".like-btn");
        if (likeButton) {
            let responseId =likeButton.dataset.id;
            likeResponse(responseId);
            return;
        }
        let dislikeButton =
            event.target.closest(".dislike-btn");
        if (dislikeButton) {
            let responseId =dislikeButton.dataset.id;
            dislikeResponse(responseId);
            return;
        }
        if ( event.target.closest("#resolve") ) {
            resolveQuestion();
            return;
        }
    }
);

display();