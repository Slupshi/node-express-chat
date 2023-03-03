const server = "http://127.0.0.1:3000";
const socket = io(server);

let conversations = [];
let connectedUser = null;
let selectedConversation = null;

(function () {
  //   socket.on("startup", (data) => {
  //     console.log("Message depuis le seveur:", data);
  //   });

  if (localStorage.getItem("token")) {
    loginFromToken(localStorage.getItem("token"));
  }
})();

function handleLogin() {
  localStorage.setItem("token", connectedUser.token);
  hideLogin();
  getConvs();
  showUserName();
}

function showUserName() {
  var accountTile = document.getElementById("my-account");
  accountTile.style.display = "block";
  var accountNameSpan = document.getElementById("accountName");
  accountNameSpan.innerText = connectedUser.name;
}

function getConvs() {
  fetch(`${server}/conversations/own`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${connectedUser.token}`,
    },
    body: JSON.stringify({
      userID: connectedUser.userId,
    }),
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      conversations = data;
      conversations.forEach((conv) => createConvTile(conv));
    });
}

async function login() {
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  connectedUser = await fetch(`${server}/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  })
    .then((res) => res.json())
    .then((data) => data);
  handleLogin();
}

async function loginFromToken(token) {
  connectedUser = await fetch(`${server}/auth/tokenLogin`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  })
    .then((res) => res.json())
    .then((data) => data);
  handleLogin();
}

function disconnect() {
  localStorage.removeItem("token");
  window.location.reload();
}

function createConvTile(conversation) {
  let list = document.getElementById("conversation-list");

  var card = document.createElement("li");

  var button = document.createElement("a");
  button.href = "#";

  var userIcon = document.createElement("i");
  userIcon.classList = "fa fa-user";

  var span = document.createElement("span");
  span.innerText = conversation.title;

  var clockIcon = document.createElement("i");
  clockIcon.classList = "fa fa-times";

  button.appendChild(userIcon);
  button.appendChild(span);
  button.appendChild(clockIcon);

  button.addEventListener("click", () => showConversation(conversation));

  card.appendChild(button);

  list.appendChild(card);
}

function showConversation(conversation) {
  selectedConversation = conversation;
  var content = document.getElementById("chat-area");
  content.innerHTML = "";

  var divTitle = document.createElement("div");
  divTitle.classList = "title";
  var title = document.createElement("b");
  title.innerText = conversation.title;
  var titleIcon = document.createElement("i");
  titleIcon.classList = "fa fa-search";

  divTitle.appendChild(title);
  divTitle.appendChild(titleIcon);

  var divChatList = document.createElement("div");
  divChatList.classList = "chat-list";
  var chatList = document.createElement("ul");

  conversation.messages.forEach((msg) => {
    var chat = document.createElement("li");

    var chatNameDiv = document.createElement("div");
    chatNameDiv.classList = "name";
    var chatNameSpan = document.createElement("span");
    chatNameSpan.innerText = msg.sender.senderName;
    chatNameDiv.appendChild(chatNameSpan);

    var chatMsgDiv = document.createElement("div");
    chatMsgDiv.classList = "message";
    var chatMsgContent = document.createElement("p");
    chatMsgContent.innerText = msg.content;
    var chatMsgTimeSpan = document.createElement("span");
    chatMsgTimeSpan.classList = "msg-time";
    var date = new Date(msg.sendAt);
    var time = `${date.getHours()}:${date.getMinutes()}`;
    chatMsgTimeSpan.innerText = time;
    chatMsgDiv.appendChild(chatMsgContent);
    chatMsgDiv.appendChild(chatMsgTimeSpan);

    if (msg.sender.senderID == connectedUser.userId) {
      chat.classList = "me";
    } else {
      chat.classList = "";
    }
    chat.appendChild(chatNameDiv);
    chat.appendChild(chatMsgDiv);

    chatList.appendChild(chat);
  });

  var inputArea = document.createElement("div");
  inputArea.classList = "input-area";
  var inputWrapper = document.createElement("div");
  inputWrapper.classList = "input-wrapper";
  var inputText = document.createElement("input");
  inputText.type = "Text";
  inputText.placeholder = "Message here";
  inputText.value = "";

  var smileIcon = document.createElement("i");
  smileIcon.classList = "fa fa-smile-o";

  inputWrapper.appendChild(inputText);
  inputWrapper.appendChild(smileIcon);

  var submit = document.createElement("input");
  submit.type = "button";
  submit.classList = "send-btn";
  submit.value = "Submit";

  inputArea.appendChild(inputWrapper);
  inputArea.appendChild(submit);

  content.appendChild(divTitle);
  content.appendChild(chatList);
  content.appendChild(inputArea);
}

function hideLogin() {
  var loginForm = document.getElementById("login-form");
  loginForm.style.display = "none";
}
