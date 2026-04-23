const firstNameInput = document.getElementById("fName");
const lastNameInput = document.getElementById("lName");
const assetsInput = document.getElementById("assets");
const addBtn = document.getElementById("add");
const minusBtn = document.getElementById("minus");
const clearAllBtn = document.getElementById("clearAllBtn")


// array for storage users localy 
let users = [];

// key for save to localstorage
const STORAGE_KEY = "users_data";


// ! ====================== Save Array To Local Storage
// save array to local storage
function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY , JSON.stringify(users))
}


// ! ====================== Get Array From Local Storage
// get array from local storage
function loadFromLocalStorage() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    
    if (savedData) {
        users = JSON.parse(savedData);
    } else {
        users = []; // if there is no data the array is empty
    }
}

// ! ====================== Add Function
// get data from input , check validation and add to main array and local storage
function Add() {
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const assets = assetsInput.value.trim();
    
    // input data validation
    if (firstName === "" || lastName === "" || assets === "") {
        alert("⚠️ Please, fill in the blanks");
        return;
    }

    if (isNaN(assets)) {
        alert("⚠️ Please, enter a valid number!");
        return;
    }

    // add user to users array and save to localstorage
    addUser(firstName , lastName , assets);
    
    // Empty the input values
    firstNameInput.value = "";
    lastNameInput.value = "";
    assetsInput.value = "";

    // fucus on the first input
    firstNameInput.focus();
    
}

// ! ========================= Add User Function
// Add User to main array
function addUser(firstName, lastName , assets) {
    // add user objec to array
    users.push({
        firstName : firstName,
        lastName : lastName,
        assets : assets
    })

    // save in local storage
    saveToLocalStorage();

    // Re-render the table
    renderTable();
}


// ! ====================== Render The Table
// render the table
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ''; // clear current table

    if (users.length === 0) {
        // Display empty message
        const emptyRow = document.createElement('tr');
        emptyRow.className = 'empty-row';
        emptyRow.innerHTML = '<td colspan="5">There is no data 📭 </td>';
        tableBody.appendChild(emptyRow);
    }
    else{
        users.forEach((item, index) => {
            // create a row for each item in array
            const row = createTableRow(item, index);
            tableBody.appendChild(row);
        });
    }

    // updating counter
    updateCounter();
}


// ! ====================== Create New Row For Each User
// create new row for each user
function createTableRow(person , index) {
    const row = document.createElement("tr");

    // number cell
    const numberCell = document.createElement('td');
    numberCell.textContent = index+1;

    // first name cell
    const firstNameCell = document.createElement('td');
    firstNameCell.textContent = person.firstName;

    // last name cell
    const lastNameCell = document.createElement('td');
    lastNameCell.textContent = person.lastName;

    // assets cell
    const assetsCell = document.createElement('td');
    assetsCell.textContent = person.assets;  

    // transaction cell
    const transactionCell = document.createElement('td');
    transactionCell.innerHTML = '<a href="">more...</a>';

    
    row.appendChild(numberCell);
    row.appendChild(firstNameCell);
    row.appendChild(lastNameCell);
    row.appendChild(assetsCell);
    row.appendChild(transactionCell);

    return row;
}



// ! ====================== Minus Function

function Minus(params) {
    
}


// ! ======================= Update Counter
// update records counter
function updateCounter() {
    const counterSpan = document.getElementById("rowCounter");
    counterSpan.textContent = `Record Count: ${users.length}`;
}


// ! ======================= Clear All Data
// clear all data in array and local storage
function clearAllData() {
    if (confirm("Are you sure you want to 'Delete' all data")) {
        users = [];
        saveToLocalStorage();
        renderTable();
    }
}


// ! ======================= Handle Enter Key
// handeling the enter key
function onEnterKey(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        Add();
    }
}



// ! ===================== Initialization On Page Load
// initialization on page load
function init() {
    // get array data from local storage
    loadFromLocalStorage();

    // show data in rable
    renderTable();

    // handle the enter key
    const inputs = ['fName','lName','assets'];
    inputs.forEach((id) => {
        document.getElementById(id).addEventListener('keypress' , onEnterKey);
    })
}

init();


addBtn.addEventListener("click" , Add);
minusBtn.addEventListener("click" , Minus);
clearAllBtn.addEventListener("click" , clearAllData);