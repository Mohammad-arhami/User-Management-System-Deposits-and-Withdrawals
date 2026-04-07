const fName = document.getElementById("fName").value;
const lName = document.getElementById("lName").value;
const assets = document.getElementById("assets").value;



const users = [
    {fName:"mmd" , lName: "arhami", assets : 0 },
    {fName:"" , lName: "", assets : 0 }
]


// ! ====================== Add Function

function Add() {
    users.forEach((obj) => {
        if (obj.fName !== fName || obj.lName !== lName) {
            users.push({
                fName : fName,
                lName : lName ,
                assets : assets
            })
        }
    })
    console.log(users);
}



// ! ====================== Minus Function

function Minus(params) {
    
}



const add = document.getElementById("add");
const minus = document.getElementById("minus");

add.addEventListener("click" , Add());
minus.addEventListener("click" , Minus());





