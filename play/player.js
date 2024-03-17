var nostalgist;
var rom = "none";
const customLaunch = async function(core) {
    let loading = document.getElementById("loading");
    console.log(loading);
    loading.style.display = "block";
    console.log(rom);
    nostalgist = await Nostalgist.launch({
        // Will load https://example.com/core/fbneo_libretro.js and https://example.com/core/fbneo_libretro.wasm as the launching core
        // Because of the custom `resolveCoreJs` and `resolveCoreWasm` options
        core: core,

        // Will load https://example.com/roms/mslug.zip as the ROM
        // Because of the custom `resolveRom` option
        rom: rom,
        // Will load https://example.com/roms/mslug.zip as the ROM
        // Because of the custom `resolveRom` option
        // bios: ['gba_bios.bin'],

        // Custom configuration for RetroArch
        retroarchConfig: {
            rewind_enable: true,
            savestate_thumbnail_enable: true,
        },

        style: {
            position: 'fixed',
            top: '10%',
            left: '10%',
            width: '80%',
            height: '90%',
            backgroundColor: 'black',
            zIndex: '1',
        },


    // Specify where to load the core files
         resolveCoreJs(core) {
             return `/data/${core}_libretro.js`
         },
         resolveCoreWasm(core) {
             return `/data/${core}_libretro.wasm`
         },

        // Specify where to load the ROM files
        resolveRom(file) {
            return `/rom/${file}`
        },

        // Specify where to load the BIOS files
        // resolveBios(bios) {
        //     return `/bios/${bios}`
        // },
    })
}
const launch = async function(core) {
    let loading = document.getElementById("loading");
    console.log(loading);
    loading.style.display = "block";
    console.log(rom);
    nostalgist = await Nostalgist.launch({
        // Will load https://example.com/core/fbneo_libretro.js and https://example.com/core/fbneo_libretro.wasm as the launching core
        // Because of the custom `resolveCoreJs` and `resolveCoreWasm` options
        core: core,

        // Will load https://example.com/roms/mslug.zip as the ROM
        // Because of the custom `resolveRom` option
        rom: rom,
        // Will load https://example.com/roms/mslug.zip as the ROM
        // Because of the custom `resolveRom` option
        // bios: ['gba_bios.bin'],

        // Custom configuration for RetroArch
        retroarchConfig: {
            rewind_enable: true,
            savestate_thumbnail_enable: true,
        },

        style: {
            position: 'fixed',
            top: '10%',
            left: '10%',
            width: '80%',
            height: '90%',
            backgroundColor: 'black',
            zIndex: '1',
        },


    // Specify where to load the core files
        // resolveCoreJs(core) {
        //     return `/data/${core}_libretro.js`
        // },
        // resolveCoreWasm(core) {
        //     return `/data/${core}_libretro.wasm`
        // },

        // Specify where to load the ROM files
        resolveRom(file) {
            return `/rom/${file}`
        },

        // Specify where to load the BIOS files
        // resolveBios(bios) {
        //     return `/bios/${bios}`
        // },
    })
}
//launch("mgba")
const exit = async function(){
    await nostalgist.exit();
    document.getElementById("loading").style.display = "none";
    document.getElementsByClassName("slots-container")[0].style.display = "none";
}
const saveState = async function(slot_index){
    const state_blob = await nostalgist.saveState();
    let request = window.indexedDB.open("statesdb", 3);
    request.onerror = (event) => {
        alert("Error saving game!!!");
    };
    request.onupgradeneeded = (event)=>{
        let db = event.target.result;
        const objectStore = db.createObjectStore(rom);
        // objectStore.createIndex("saved_slots", "slotIndex");
    }
    request.onsuccess = (event) => {
        let db = event.target.result;
        let objectStore;
        let transaction = db.transaction(rom, "readwrite");
        objectStore = transaction.objectStore(rom);
        objectStore.add(state_blob, slot_index);
        console.log("added blob", state_blob, " to index ", slot_index);
    };
}
const loadState = async function(slot_index){
    let request = window.indexedDB.open("statesdb", 3);
    var got_saved_slot = false;
    var state_blob;
    request.onerror = (event) => {
        alert("Error loading game!!!");
    };
    request.onsuccess = (event) => {
        let db = event.target.result;
        try{
            let transaction = db.transaction(rom, "readwrite");
            let objectStore = transaction.objectStore(rom);
            let objectStoreRequest = objectStore.get(slot_index)
            objectStoreRequest.onerror = (event) => {
                console.log("error retreiving state from objectStore")
            }
            objectStoreRequest.onsuccess = async (event) => {
               state_blob = event.target.result;
               await nostalgist.loadState(state_blob['state']);
               got_saved_slot = true;
            }
        } catch {
            alert("No saved slots");
        }
    };
}

const saveGame = function(){
    let slots_container = document.getElementsByClassName("slots-container")[0];
    let slots_container_title = document.getElementById("slots-container-title");
    if(slots_container_title.textContent.includes("Load") || slots_container_title.textContent ==""){
        slots_container_title.textContent = "Save";
    } else {
        if (slots_container.style.display == "block")
            slots_container.style.display = "none";
        else
            slots_container.style.display = "block";
    }

    let request = window.indexedDB.open("statesdb", 3);
    var got_saved_slot = false;
    var state_blob;
    request.onerror = (event) => {
        //alert("Error loading game!!!");
    };
    var saved_states = [];
    request.onsuccess = (event) => {
        let db = event.target.result;
        try{
            let transaction = db.transaction(rom, "readwrite");
            let objectStore = transaction.objectStore(rom);
            for(let slot_index = 1; slot_index<4; slot_index++){
                let objectStoreRequest = objectStore.get(slot_index)
                objectStoreRequest.onerror = (event) => {
                    console.log("error retreiving state from objectStore")
                }
                objectStoreRequest.onsuccess = async (event) => {
                    state_blob = event.target.result;
                    console.log(state_blob);
                    let old_ele = document.getElementById("slot"+slot_index);
                    let ele = old_ele.cloneNode(true);
                    old_ele.parentNode.replaceChild(ele, old_ele);
                    ele.addEventListener("click", function(){
                        saveState(slot_index);
                        alert("Saved to slot " + slot_index);
                    })
                    if(typeof state_blob != 'undefined'){
                        if(!ele.hasChildNodes())
                            ele.insertAdjacentHTML("afterbegin", `<img class="thumb" id='slot${slot_index}img'>`)
                        let img = document.getElementById("slot"+slot_index+"img");
                        let url = URL.createObjectURL(state_blob['thumbnail']);
                        img.src = url;
                    }
                }
            }
        } catch {
            //alert("No saved slots");
        }
    };
}
const loadGame = function(){
    let slots_container = document.getElementsByClassName("slots-container")[0];
    let slots_container_title = document.getElementById("slots-container-title");
    if(slots_container_title.textContent.includes("Save") || slots_container_title.textContent ==""){
        slots_container_title.textContent = "Load";
    } else {
        if (slots_container.style.display == "block")
            slots_container.style.display = "none";
        else
            slots_container.style.display = "block";
    }

    let request = window.indexedDB.open("statesdb", 3);
    var got_saved_slot = false;
    var state_blob;
    request.onerror = (event) => {
        //alert("Error loading game!!!");
    };
    var saved_states = [];
    request.onsuccess = (event) => {
        let db = event.target.result;
        try{
            let transaction = db.transaction(rom, "readwrite");
            let objectStore = transaction.objectStore(rom);
            for(let slot_index = 1; slot_index<4; slot_index++){
                let objectStoreRequest = objectStore.get(slot_index)
                objectStoreRequest.onerror = (event) => {
                    console.log("error retreiving state from objectStore")
                }
                objectStoreRequest.onsuccess = async (event) => {
                    state_blob = event.target.result;
                    console.log(state_blob);
                    let old_ele = document.getElementById("slot"+slot_index);
                    let ele = old_ele.cloneNode(true);
                    old_ele.parentNode.replaceChild(ele, old_ele);
                    if(typeof state_blob != 'undefined'){
                        ele.addEventListener("click", function(){
                            loadState(slot_index);
                            alert("Loaded from slot " + slot_index);
                        })
                        if(!ele.hasChildNodes()){
                            ele.insertAdjacentHTML("afterbegin", `<img class="thumb" id='slot${slot_index}img'>`)
                        }
                        let img = document.getElementById("slot"+slot_index+"img");
                        let url = URL.createObjectURL(state_blob['thumbnail']);
                        img.src = url;
                    }
                }
            }
        } catch {
            //alert("No saved slots");
        }
    };
}
