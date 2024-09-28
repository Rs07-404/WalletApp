itemList = document.getElementById("users");
itemForm = document.getElementById("addUser");
searchBar = document.getElementById("search");

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function fetchdata(){
    const token = getCookie("token");
    if(token){
        let req = new XMLHttpRequest();
        req.onreadystatechange = function(){
            if(this.readyState == 4 && this.status == 200){
                loaddata(JSON.parse(this.responseText));
            }
        };
        req.open("GET","http://localhost:5000/users/");
        req.setRequestHeader('Authorization', `Bearer ${token}`);
        req.send();
    }
}

function fetchuser(id){
    const token = getCookie("token");
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(this.status == 200){
            const data = JSON.parse(this.responseText);
            if(data.length === 0){
                fetchdata();
            }else{
                loaddata(data);
            }
        }else{
            fetchdata();
        }
    };
    req.open("GET",`http://localhost:5000/users/${id}`);
    req.setRequestHeader('Authorization', `Bearer ${token}`);
    req.send();
}

searchBar.addEventListener("input",()=>{
    const id = searchBar.value;
    fetchitem(parseInt(id));
})

function logout(){
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href="http://localhost:5000/";
}

function loaddata(data){
    itemList.style.display = "flex";
    itemForm.style.display = "none";
    const table = document.getElementById("table");
    table.innerHTML = `<div class="th">
    <div>#</div>
    <div>user Id</div>
    <div>Name</div>
    <div>Username</div>
    <div>email</div>
    <div>phone</div>
    <div>Delete</div>
</div>`
    for(let user in data){
        let new_row = document.createElement("div");
        new_row.classList.add("tr");
        new_row.innerHTML = `<div>${parseInt(user)+1}</div>
        <div>${data[user]['user_id']}</div>
        <div>${data[user]['name']}</div>
        <div>${data[user]['username']}</div>
        <div>${data[user]['email']}</div>
        <div>${data[user]['phone']}</div>
        <div><button class="delete_btn btn" onclick="delete_popup(${data[user]['user_id']})">Delete</button></div>`
        table.appendChild(new_row);
    }
}

document.getElementById("add").addEventListener("click",()=>{
    itemList.style.display = "none";
    itemForm.style.display = "flex";
    document.getElementById('signupName').value = '';
    document.getElementById('signupPhone').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupUsername').value = '';
    document.getElementById('signupPassword').value = '';
});

itemForm.addEventListener("submit",async (event)=>{
    event.preventDefault();
    await add_user();
    fetchdata();
});

itemForm.addEventListener("keypress",async (event)=>{
    if(event.key === "Enter"){
        await add_item();
        fetchdata();
    }
});

async function add_user(event){
    const token = getCookie("token");
    let name = document.getElementById('signupName').value;
    let phone = document.getElementById('signupPhone').value;
    let email = document.getElementById('signupEmail').value;
    let username = document.getElementById('signupUsername').value;
    let password = document.getElementById('signupPassword').value;

    let new_user = JSON.stringify({
        name : name,
        phone : phone,
        email : email,
        username : username,
        password : password
    });

    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            fetchdata();
        }
    };
    req.open("POST","http://localhost:5000/users");
    req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader('Authorization', `Bearer ${token}`);
    await req.send(new_user);
    await fetchdata();
    fetchdata();
};


function cancel_add(){
    itemList.style.display = "flex";
    itemForm.style.display = "none";
}

function delete_popup(user_id){
    let new_popup = document.createElement('div');
    new_popup.classList.add('popup_area')
    new_popup.setAttribute("id","popup");
    new_popup.innerHTML = `
    <div class="popup"><div class="pop_top"><P>Confirm the User ID</P><div class="cross"><svg onclick="remove_popup();" xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="16" height="16"><path d="M23.707.293h0a1,1,0,0,0-1.414,0L12,10.586,1.707.293a1,1,0,0,0-1.414,0h0a1,1,0,0,0,0,1.414L10.586,12,.293,22.293a1,1,0,0,0,0,1.414h0a1,1,0,0,0,1.414,0L12,13.414,22.293,23.707a1,1,0,0,0,1.414,0h0a1,1,0,0,0,0-1.414L13.414,12,23.707,1.707A1,1,0,0,0,23.707.293Z"/></svg></div></div>
    <div class="que">Deleting user with user id ${user_id}?
    <div class="button"><button onclick="delete_user(${user_id})" class="btn delete_btn">Delete</button><button onclick="remove_popup();" class="btn cancel_btn">Cancel</button</div>
    </div>`
    document.body.appendChild(new_popup);
    new_popup.style.top = `${window.scrollY}px`;
    console.log(window.scrollY)
    document.addEventListener("scroll",()=>{
        new_popup.style.top = `${window.scrollY}px`;
        console.log(window.scrollY)
    })
}

function remove_popup(){
    let popup = document.getElementById('popup');
    document.body.removeChild(popup);
}

function delete_user(id){
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            remove_popup();
            fetchdata();
        }
    };
    req.open("DELETE",`http://localhost:5000/users/${id}`);
    req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader('Authorization', `Bearer ${getCookie("token")}`);
    req.send();
}


window.onload = fetchdata();