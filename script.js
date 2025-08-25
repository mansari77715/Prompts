
  let replacements = {};
  let currentVar = "";
  let popupMode = ""; // 'add' or 'edit'
  let templates = [];

  // Load templates from cookie on page load
  window.onload = function () {
    pn = window.location.pathname.split("/");
    console.log(pn)
    switch (pn) 
    {
        case "template.html":
            const template = new URLSearchParams(window.location.search).get("t");
            //document.getElementById("selectedTemplate").value = template;
            setTextarea(document.getElementById("selectedTemplate"), template);
            replacements = {};
            showVariableButtons(template);
            //document.getElementById("finalPrompt").value = template;
            setTextarea(document.getElementById("finalPrompt"), template);
            break;
        case "add.html":
            templates = JSON.parse(decodeURIComponent(document.cookie.split('; ').find(row => row.startsWith('templates=')).split('=')[1]));
            break;
        case "":
        case "index.html":
            const cookie = document.cookie.split('; ').find(row => row.startsWith('templates='));
            if (cookie) {
            try {
                templates = JSON.parse(decodeURIComponent(cookie.split('=')[1]));
                renderTemplates();
            } catch (e) {
                console.error("Error parsing templates from cookie:", e);
            }
            } else
            {
                templates=["make a picture of {object name} in {location name}", "name 10 most beautiful {object name}", "generate a simple list of most famous {object name}"]
                setCookie("templates", JSON.stringify(templates), 365);
                renderTemplates();
            }

            /*const input = document.getElementById("jsonFileInput");
            input.addEventListener("change", () => 
                {
                    console.log("loggg");
                        if (!input || !input.files || input.files.length === 0) {
                    console.warn("No file selected");
                    return;
                    }


                const file = input.files[0];
                const reader = new FileReader();

                reader.onload = function (e) {
                try {
                    const stringArray = JSON.parse(e.target.result);
                    if (Array.isArray(stringArray) && stringArray.every(item => typeof item === "string")) {
                    //callback(stringArray);
                    templates = templates.concat(stringArray);
                                    setCookie("templates", JSON.stringify(templates), 365);
                renderTemplates();
                    } else {
                    console.error("JSON is not a valid string array");
                    }
                } catch (err) {
                    console.error("Failed to parse JSON", err);
                }
                };

                reader.readAsText(file);
            });*/
            break;
    }

  };

  function addVariable() {
    popupMode = "add";
    document.getElementById("popupVarLabel").textContent = "New Variable Name";
    document.getElementById("popupVarValue").value = "";
    document.getElementById("overlay").style.display = "block";
    document.getElementById("popup").style.display = "block";
  }

    function setTextarea(el, val)
    {
    el.value = val;
      el.style.height = 'auto'; // Reset height
      el.style.height = el.scrollHeight + 'px'; // Set to scrollHeight
    }

  function saveTemplate() {
    const template = document.getElementById("templateBuilder").value.trim();
    if (template) {
      templates.push(template);
      setCookie("templates", JSON.stringify(templates), 365);
      //window.location.href = "/index.html";
      history.back();

      //renderTemplates();
      //document.getElementById("templateBuilder").value = "";
    }
  }

function renderTemplates() {
  const listTalk = document.getElementById("templateListTalk");
  if(templates.length>0)
    listTalk.innerHTML = "<h3>📋 Templates</h3>";
  else
    listTalk.innerHTML = "<h3>📋 No template created yet</h3>";
  const list = document.getElementById("templateList");
  list.innerHTML = "";
  templates.forEach((tpl, index) => {
    list.innerHTML += `
      <div class="template" style="background:var(--popup-bg); border-radius: 8px; padding: 5px">
        <button onclick="confirmDelete(${index})" style="background:var(--red-color);">🗑️</button>
        <button onclick="selectTemplate(${index})">${tpl}</button>
      </div>
    `;
  });
}

let deleteIndex = null;

function confirmDelete(index) {
  deleteIndex = index;
  document.getElementById("overlay").style.display = "block";
  document.getElementById("popupDelete").style.display = "block";
}

function submitDelete() {
  if (deleteIndex !== null) {
    templates.splice(deleteIndex, 1);
    setCookie("templates", JSON.stringify(templates), 365);
    renderTemplates();
    deleteIndex = null;
  }
  closeDelete();
}

function closeDelete() {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("popupDelete").style.display = "none";
}

  function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + expires + "; path=/";
  }

  function selectTemplate(index) {
    const template = templates[index];
    window.location.href = `template.html?t=${template}`;
  }
  
  function addTemplate() {
    window.location.href = "add.html";
  }

  function showVariableButtons(template) {
    const varContainer = document.getElementById("varButtons");
    varContainer.innerHTML = "";
    const vars = [...new Set(template.match(/{(.*?)}/g))];
    if (vars) {
      vars.forEach(v => {
        const varName = v.replace(/[{}]/g, "");
        const btn = document.createElement("button");
        btn.textContent = varName;
        btn.onclick = () => openPopup(varName, replacements[varName] || "", "edit");
        varContainer.appendChild(btn);
      });
    }
  }

  function openPopup(varName, currentValue = "", mode = "edit") {
    currentVar = varName;
    popupMode = mode;
    document.getElementById("popupVarLabel").textContent = varName;
    document.getElementById("popupVarValue").value = currentValue;
    document.getElementById("overlay").style.display = "block";
    document.getElementById("popup").style.display = "block";
  }

  function closePopup() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("popup").style.display = "none";
  }

  function submitPopup() {
    const value = document.getElementById("popupVarValue").value.trim();
    if (popupMode === "add" && value) {
      const textarea = document.getElementById("templateBuilder");
      const cursorPos = textarea.selectionStart;
      const textBefore = textarea.value.substring(0, cursorPos);
      const textAfter = textarea.value.substring(cursorPos);
      textarea.value = textBefore + `{${value}}` + textAfter;
      textarea.focus();
      textarea.selectionEnd = cursorPos + value.length + 2;
    } else if (popupMode === "edit" && currentVar) {
      replacements[currentVar] = value;
      updateFinalPrompt();
    } else if (popupMode === "setPrompts" && value) {
                            const stringArray = JSON.parse(value);
                            if (Array.isArray(stringArray) && stringArray.every(item => typeof item === "string")) {
                            //callback(stringArray);
                            templates = templates.concat(stringArray);
                            setCookie("templates", JSON.stringify(templates), 365);
                        renderTemplates();
                        }
    }
    closePopup();
  }

  function updateFinalPrompt() {
    let result = document.getElementById("selectedTemplate").value;
    for (const key in replacements) {
      const regex = new RegExp(`{${key}}`, "g");
      result = result.replace(regex, replacements[key]);
    }
    setTextarea(document.getElementById("finalPrompt"), result);
  }

  function copyFinalPrompt() {
    const finalPrompt = document.getElementById("finalPrompt").value;
    navigator.clipboard.writeText(finalPrompt).then(() => {
      const msg = document.getElementById("copyMessage");
      msg.style.display = "block";
      setTimeout(() => msg.style.display = "none", 1500);
    }).catch(err => {
      alert("Failed to copy: " + err);
    });
  }
  
  function exportTemplateAsJson() {
//const json = JSON.stringify(templates, null, 2); // Pretty format
navigator.clipboard.writeText(JSON.stringify(templates, null, 2));
/*
const blob = new Blob([json], { type: "application/json" });
const url = URL.createObjectURL(blob);

const a = document.createElement("a");
a.href = url;
a.download = "data.json";
document.body.appendChild(a);
a.click(); // 👈 This triggers the download immediately
document.body.removeChild(a);

URL.revokeObjectURL(url); // Clean up
*/

  }

    async function importTemplateByJson() {
        popupMode = "setPrompts";
        document.getElementById("popupVarLabel").textContent = "Paste from clipboard and hit insert";
        document.getElementById("popupVarValue").value = "";
        document.getElementById("overlay").style.display = "block";
        document.getElementById("popup").style.display = "block";
    /*const input = document.getElementById("jsonFileInput");
    input.click()
    ;
    const c = await navigator.clipboard.readText();
                        const stringArray = JSON.parse(c);
                        if (Array.isArray(stringArray) && stringArray.every(item => typeof item === "string")) {
                        //callback(stringArray);
                        templates = templates.concat(stringArray);
                                        setCookie("templates", JSON.stringify(templates), 365);
                    renderTemplates();
                    }
    */


  }
