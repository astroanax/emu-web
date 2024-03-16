var nostalgist;
var rom = "pokemonred.gba";
const launch = async function(core) {
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
            return `/gba/${file}`
        },

        // Specify where to load the BIOS files
        // resolveBios(bios) {
        //     return `/bios/${bios}`
        // },
    })
}
launch("mgba")
const exit = async function(){
    await nostalgist.exit();
}
const saveState = async function(slot_index){
    await new Promise(resolve => setTimeout(resolve, 5000))
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
    await new Promise(resolve => setTimeout(resolve, 15000))
    let request = window.indexedDB.open("statesdb", 3);
    var got_saved_slot = false;
    var state_blob;
    request.onerror = (event) => {
        alert("Error saving game!!!");
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
            objectStoreRequest.onsuccess = (event) => {
               state_blob = event.target.result;
               got_saved_slot = true;
            }
        } catch {
            alert("No saved slots");
        }
    };
    if(got_saved_slot){
       await nostalgist.loadState(state_blob['state']);
    }
}